window.onload = function() {
    let pw = 100
    let ph = 230

    var xhttp = new XMLHttpRequest();
    var people = Object.values(data).filter(item => item.__typename == 'Person').map(item => item.id)

    const urlParams = new URLSearchParams(window.location.search);
    var visible = new Set(urlParams.get("v") ? urlParams.get("v").split(" ") : null)
    var focusedId = null

    let cc = new ControlCenter(data, visible)

    // Initialize tooltips
    $('[data-toggle="tooltip"]').tooltip()

    // RENDERER
    // Takes a set of nodes and renders them to screen.
    let mainContainer = document.querySelector("div#container")
    let canvas = document.querySelector("div#canvas")

    let pannableContainer =  new PannableContainer(mainContainer, canvas)

    let positionElement = function(element, x, y) {
        let canW = canvas.offsetWidth
        let canH = canvas.offsetHeight
        let ew = element.offsetWidth
        let eh = element.offsetHeight
        element.style.left = (canW / 2 - ew / 2 + x).toString() + "px"
        element.style.top = (canH / 2 - eh / 2 + y).toString() + "px"
        return element
    }

    let positionLine = function(element, x1, y1, x2, y2) {
        let canW = canvas.offsetWidth
        let canH = canvas.offsetHeight
        element.style.left = (canW / 2 + _.min([x1, x2])).toString() + "px"
        element.style.top = (canH / 2 + _.min([y1, y2])).toString() + "px"
        element.style.width = Math.abs(x2 - x1).toString() + "px"
        element.style.height = Math.abs(y2 - y1).toString() + "px"
        return element
    }

    let createLink = function(id, name, onclick) {
        let p = document.createElement("p")
        let link = document.createElement("a")
        link.innerHTML = name
        link.href = "#"
        link.onclick = onclick
        p.append(link)
        return p
    }

    let ICONS = {
        "PARENTS": "/static/img/icons8-parenting-50.png",
        "PARTNERS": "/static/img/icons8-heart-50.png",
        "SIBLINGS": "/static/img/icons8-flow-chart-50.png",
        "CHILDREN": "/static/img/icons8-baby-50.png",
    }

    let createShowLink = function(id, relativeType, func) {
        let label = toTitleCase(relativeType)
        let div = document.createElement("div")
        div.setAttribute('data-toggle', 'tooltip')
        div.setAttribute('data-placement', 'bottom')
        div.setAttribute('title', label)
        div.className = "control"
        div.innerHTML = `<img src='${ICONS[relativeType]}' alt=${label}></img>`
        div.onclick = async (e) => {
            e.stopPropagation()
            let result = await func(id)
            await result.reduce(
                (p, id) => p.then(() => showPerson(id).then(() => render())),
                Promise.resolve(null)
            );
        }
        return div
    }

    let createHideLink = function(id, type, func) {
        let link = createLink(id, name, () => {
            func(id)
            render()
        })
        return link
    }

    const toTitleCase = s => s.substr(0, 1).toUpperCase() + s.substr(1).toLowerCase();

    let renderPerson = function(id, x, y) {
        let birthDeathString = function(birth, death) {
            if (birth == null && death == null) {
                return ""
            }
            if (death == null) {
                return `${birth}-`
            }
            return `${birth}-${death}`
        }

        let person = data[id]
        let profilePhoto = person.profilePhoto || "test.png"
        let profilePhotoUrl = getPhotoUrl(profilePhoto)

        var container = document.createElement("div")
        container.className = focusedId == id ? "person focused" : "person"
        container.id = id
        container.onclick = () => showModal(id)

        container.innerHTML = `
            <div class="profile-pic" style="background-image: url(${profilePhotoUrl});"></div>
            <div class="gender-line ${person.gender.toLowerCase()}"></div>
            <div class="content">
                <h3>${person.name}</h3>
                <p>${birthDeathString(person.birthYear, person.deathYear)}</p>
                <p>${person.residence || ""}</p>
            </div>
        `

        let hidePersonIcon = document.createElement("div")
        hidePersonIcon.className = "hide-person"
        hidePersonIcon.innerHTML = "<img src='/static/img/icons8-hide-50.png' alt='hide'></img>"
        hidePersonIcon.onclick = (e) => {
            e.stopPropagation()
            hidePerson(id)
        }
        container.prepend(hidePersonIcon)

        var controls = document.createElement("div")
        controls.className = "controls"

        relativeTypes = Object.values(RelativeType).filter(type => cc.hasHiddenRelatives(id, type))
        let numLinks = relativeTypes.length

        relativeTypes.forEach(type => {
            let link = createShowLink(id, type, cc.fetchHiddenRelatives(type))
            link.className += ` spread-${numLinks}`
            controls.append(link)
        })
        container.append(controls)

        canvas.append(container)

        // NOTE: It is important to make sure the element is on screen
        // before attempting to position it!
        positionElement(container, x, y)
    }

    let renderMarriage = function(id, x, y) {
        let marriage = data[id]
        var container = document.createElement("div")
        container.className = "marriage"
        canvas.append(container)

        positionElement(container, x, y)
    }

    let renderLine = function(x1, y1, x2, y2) {
        if (x1 == x2 || y1 == y2) {
            // horizontal or vertical line
            var line = document.createElement("div")
            line.className = "line"
            canvas.append(line)
            positionLine(line, x1, y1, x2, y2)
            return
        }

        // render elbowed line
        let yClearance = ph - 30
        renderLine(x1, y1, x1, y1 + yClearance)
        renderLine(x1, y1 + yClearance, x2, y1 + yClearance)
        renderLine(x2, y1 + yClearance, x2, y2)
    }

    let renderMarriageLine = function(marriageNode) {
        let partnerLeft = marriageNode.partners[0]
        let partnerRight = marriageNode.partners[1]

        renderLine(partnerLeft.x + pw / 2, partnerLeft.y - ph / 4, partnerRight.x - pw / 2, partnerRight.y - ph / 4)
    }

    let renderChildLine = function(marriageNode, childNode) {
        renderLine(marriageNode.x, marriageNode.y - ph / 4, childNode.x, childNode.y - ph / 2)
    }

    let preprocessVisible = function(visible) {
        // if a single parent and a child are on screen. The other parent should
        // also be visible.
        // TODO(Awais) Make this code less ugly and more comprehensible
        var makeVisible = new Set([])
        visible.forEach(id => {
            let person = data[id]
            if (person.marriages) {
                person.marriages.forEach(marriageId => {
                    let marriage = data[marriageId]
                    if (_.some(marriage.children, item => visible.has(item))) {
                        marriage.partners.forEach(partnerId => {
                            if (!visible.has(partnerId)) {
                                makeVisible.add(partnerId)
                            }
                        })
                    }
                })
            }
        })

        return new Set([...visible, ...makeVisible])
    }

    let renderTree = function () {
        let renderer = new Renderer(data, visible)
        renderer.render().forEach(item => {
            if (item instanceof Person) {
                renderPerson(item.id, item.x, item.y)
            }
            if (item instanceof Marriage) {
                renderMarriage(item.id, item.x, item.y)
                renderMarriageLine(item)
                item.children.forEach(child => {
                    renderChildLine(item, child)
                })
            }
        })
    }

    let clearCanvas = function() {
        while(canvas.firstChild) {
            canvas.removeChild(canvas.firstChild)
        }
    }

    let render = function() {
        let pl = visible.size > 0 ? "You can keep searching for more people..." : "Start here by searching for a person..."
        $("#search-bar").attr("placeholder", pl)

        cc.update(data, visible)

        let x = null
        let y = null
        if (focusedId != null) {
            let focused = document.getElementById(focusedId)
            let position = pannableContainer.getElementPosition(focused)
            x = position[0]
            y = position[1]
        }

        clearCanvas()
        renderTree()

        if (focusedId != null) {
            let focused = document.getElementById(focusedId)
            pannableContainer.panToPosition(focused, x, y)
        }
    }

    let main = async function() {
        // This is bad. We shouldn't need to run the same line of code twice.
        // There must be a neater way to handle the preprocess case.
        await Promise.all([...visible].map(id => fetchPerson(id)))
        visible = preprocessVisible(visible)
        await Promise.all([...visible].map(id => fetchPerson(id)))
        render()

        // Todo(Awais): Right now we have to render at least once before changing focus. It seems strange to not be able to initialize with a focused value.
        if (visible.size > 0) {
           changeFocus(visible.values().next().value)
        }
    }

    main()

    // Find the shortest path from the node identified by 'source' and any visible node
    // If there are multiple shortest paths of the same length, it arbitrarily
    // returns one of the shortest paths
    // Returns: list of ids of all nodes that are on a shortest path, including
    // the already visible node, but not including the source node.
    // TODO(Awais) This function probably shouldn't live in this file
    let shortestPath = async function(source, visible) {
        marked = {}
        queue = [source]
        edgeTo = {}
        found = null

        if (visible.size == 0) {
            return []
        }

        marked[source] = true

        while (queue.length > 0) {
            let id = queue.shift()
            let person = await fetchPerson(id)

            if (visible.has(person.id)) {
                found = person.id
                // break as soon as we find another node that is already visible
                break
            }

            adjacentNodes = []
            if (person.marriages.length != 0) {
                person.marriages.forEach(marriage => {
                    data[marriage].partners.forEach(partnerId => adjacentNodes.push(partnerId))
                    data[marriage].children.forEach(childId => adjacentNodes.push(childId))
                })
            }

            if (person.parents) {
                data[person.parents].partners.forEach(partnerId => adjacentNodes.push(partnerId))
            }

            adjacentNodes.filter(id => !marked[id]).forEach(id => {
                edgeTo[id] = person.id
                marked[id] = true
                queue.push(id)
            })
        }

        if (found == null) {
            return []
        }

        result = []
        for (var id = found; id != source; id = edgeTo[id]) {
            result.push(id)
        }

        return result
    }

    // INTERACTION
    let updateUrlParams = function() {
        urlParams.set("v", Array(...visible).join(" "))
        history.pushState(null, '', window.location.pathname + '?' + urlParams.toString());
    }

    let showPerson = async function(id) {
        // calculate shortest path from this person to another node that is already visible
        await shortestPath(id, visible).then(result => {
            result.concat(id).forEach(item => {
                visible.add(item)
                visible = preprocessVisible(visible)
            })
        })
        updateUrlParams()
        render()
    }

    let hidePerson = function(id) {
        visible.delete(id)
        if (focusedId == id) {
            changeFocus(_.sample(Array.from(visible)))
        }
        updateUrlParams()
        render()
    }

    let reset = function(event, value) {
        visible = new Set()
        focusedId = null
        updateUrlParams()
        render()
    }

    let changeFocus = function(id) {
        if (focusedId == id) {
            return
        }
        focusedId = id
        render()
        let focused = document.getElementById(focusedId)
        pannableContainer.panToPosition(focused, 0, 0)
    }

    let selectPerson = function(event, person) {
      fetchPerson(person.id).then(result => {
        showPerson(result.id).then(() => render()).then(() => changeFocus(result.id))
        setTimeout(() => $('#search-bar-typeahead input.typeahead.tt-input').val(""), 10)
      })
    }

    let handleCreatePerson = async () => {
        const id = await generateId()
        showEditModal(id)
    }

    let showModal = async function(id) {
        let modal = $('#detailModal')
        if (id == null) {
            return
        }

        changeFocus(id)
        let person = await fetchPerson(id)
        let birthString = (person.birthYear ? person.birthYear : "") + "-" + (person.deathYear ? person.deathYear : "")

        let profilePhoto = person.profilePhoto || "test.png"
        let profilePhotoUrl = getPhotoUrl(profilePhoto)

        // name, residence, birth/death year, bio
        modal.find("#id").text(id)
        modal.find(".modal-title").text(person.name)
        modal.find(".modal-residence").text(person.residence)
        modal.find(".modal-birth").text(birthString)
        modal.find(".modal-bio").text(person.biography || "No bio has been provided yet for this person.")
        modal.find(".modal-header").css("background-image", `url('${profilePhotoUrl}')`)

        modal.modal()
    }

    let setDefaultOption = function(element, id, text) {
        if (element.find("option[value='" + id + "']").length) {
            element.val(id).trigger('change');
        } else if (text != null) {
            var newOption = new Option(text, id, true, true);
            element.append(newOption).trigger('change');
        }
    }

    let handleEditPerson = function() {
        let id = $('#detailModal').find("#id").text()
        showEditModal(id)
    }

    let showEditModal = async function(id) {
        let modal = $('#editModal')

        let form = document.querySelector("#edit-person-form")
        form.reset()
        form.classList.remove('was-validated')
        $("#partners-table > tbody").empty()

        modal.find('#id').val(id)
        modal.find('#id-profile-photo').val(id)

        let person = await fetchPerson(id)
        if (person == null) {
            modal.modal()
            return
        }

        modal.find('#name').val(person.name)
        modal.find('#residence').val(person.residence)
        modal.find('#gender').val(person.gender)
        modal.find('#birth-year').val(person.birthYear)
        modal.find('#death-year').val(person.deathYear)
        modal.find('#biography').val(person.biography)

        let marriageText = await getMarriageDescription(person.parents)
        setDefaultOption(modal.find('.parents-typeahead'), person.parents, marriageText)

        person.marriages.forEach(async m => {
            let element = addPartnerRow()
            marriage = getMarriage(m)
            partner = await fetchPerson(marriage.partners.filter(p => p != person.id)[0])
            children = await Promise.all(marriage.children.map(c => fetchPerson(c)))

            setDefaultOption(element.find('.partner-typeahead'), partner.id, partner.name)
            children.forEach(child => {
                setDefaultOption(element.find('.children-typeahead'), child.id, child.name)
            })
        })

        make_person_typeahead($(".partner-typeahead"))
        make_person_typeahead($(".children-typeahead"))

        modal.modal()
    }

    let initTypeahead = function(id, source, handler, display) {
        $(id + ' input.typeahead').typeahead({
                hint: true,
                highlight: true, /* Enable substring highlighting */
                minLength: 1 /* Specify minimum characters required for showing result */
            },
            {
                name: 'searchPersons',
                source: source,
                display: display || "name",
            });

        $(id + ' input.typeahead.tt-input').bind('typeahead:select', handler);
    }

    initTypeahead("#search-bar-typeahead", searchPersons, selectPerson, "name")


// Modal pop up (I really need this to be its own component

    let make_person_typeahead = function(element) {
        element.select2({
          minimumInputLength: 2,
          ajax: {
            method: "POST",
            url: url,
            headers: {},
            contentType: "application/json",
            data: function(params) {
                return JSON.stringify({
                    query: searchPersonsQuery,
                    variables: {"name": params.term}
                })
            },
            processResults: function (data) {
                if (data === undefined) {
                    return null
                }
                return {
                    "results": data["data"]["searchPersons"].map(p => {
                        return {"id": p.id, "text": p.name}
                    })
                }
            }
          }
        });
    }

    make_marriage_typeahead = function(element) {
        element.select2({
            minimumInputLength: 2,
            allowClear: true,
            placeholder: "Find people...",
            ajax: {
                method: "POST",
                url: url,
                headers: {},
                contentType: "application/json",
                data: function(params) {
                    return JSON.stringify({
                        query: searchMarriagesQuery,
                        variables: {"name": params.term}
                    })
                },
                processResults: function(data) {
                    return {
                        "results": data["data"]["searchMarriages"].map(m => {
                            return {"id": m.id, "text": m.partners.map((p) => p.name).join(" and ")}
                        })
                    }
                }
            }
        })
    }

    make_marriage_typeahead($(".parents-typeahead"))
    make_person_typeahead($(".partner-typeahead"))
    make_person_typeahead($(".children-typeahead"))

    let addPartnerRow = function() {
        newRow=`<tr>
        <td><select class="partner-typeahead" id="partner" style="width: 100%"></select></td>
        <td><select class="children-typeahead" id="children" multiple="multiple" style="width: 120%"></select></td>
        <td><input type="button" class="ibtnDel btn btn-md btn-danger "value="X"></td>
        </tr>`
        element = $(newRow)
        $("#partners-table > tbody").append(element)
        make_person_typeahead($(".partner-typeahead"))
        make_person_typeahead($(".children-typeahead"))
        return element
    }

    $("#addrow").on("click", addPartnerRow)

    $("table.order-list").on("click", ".ibtnDel", function (event) {
        $(this).closest("tr").remove();
    });

    let submitEditPerson = async (event) => {
        let form = document.querySelector("#edit-person-form")

        if (form.checkValidity() === false) {
            event.preventDefault()
            event.stopPropagation()
            form.classList.add('was-validated')
            return
        }

        // Submit profile photo
        let profilePhotoForm = document.querySelector("#profile-photo-form")
        var photoName = null

        if (profilePhotoForm["profile_photo"].value) {
            formData = new FormData($('#profile-photo-form')[0])
            photoName = await $.ajax({
                url: BASE_URL + 'photo_upload',
                type:'POST',
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                cache: false,
                data: formData
            });
        }

        // Submit upsertPerson mutation
        let id = form["id"].value || null
        let name = form["name"].value
        let gender = form["gender"].value
        let birthYear = form["birth-year"].value
        let deathYear = form["death-year"].value
        let residence = form["residence"].value
        let biography = form["biography"].value
        let profilePhoto = photoName
        let parents = form["parents"].value

        marriages = []
        $('#partners-table tbody tr').each((i, row) => {
            partner = $(row).find(".partner-typeahead").select2("data")[0]
            children = $(row).find(".children-typeahead").select2("data")
            marriages.push({partnerBId: partner.id, children: children.map(c => c.id)})
        })

        let result = await upsertPerson(
            id, name, gender, birthYear, deathYear, residence, biography, profilePhoto, parents, marriages
        )

        await showPerson(result['id'])
        render()
    }

    document.querySelector('#reset-btn').addEventListener("click", reset)
    document.querySelector('#create-person').addEventListener("click", handleCreatePerson)
    document.querySelector("#submit-edit-form-btn").addEventListener("click", submitEditPerson)
    document.querySelector('#show-edit-modal').addEventListener("click", handleEditPerson)
};