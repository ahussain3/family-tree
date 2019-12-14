window.onload = function() {
    let pw = 100
    let ph = 200

    var xhttp = new XMLHttpRequest();
    var people = Object.values(data).filter(item => item.__typename == 'Person').map(item => item.id)
    var visible = new Set(["P_ZEa2Sugqm-OU"])  // This breaks because of caching.
    var focusedId = null

    let cc = new ControlCenter(data, visible)

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

    let createShowLink = function(id, name, func) {
        let link = createLink(id, name, async () => {
            let result = await func(id)
            await result.reduce(
                (p, id) => p.then(() => showPerson(id).then(() => render())),
                Promise.resolve(null)
            );
        })
        return link
    }

    let createHideLink = function(id, name, func) {
        let link = createLink(id, name, () => {
            func(id)
            render()
        })
        return link
    }

    const toTitleCase = s => s.substr(0, 1).toUpperCase() + s.substr(1).toLowerCase();

    let renderPerson = function(id, x, y) {
        let person = data[id]
        var container = document.createElement("div")
        container.className = focusedId == id ? "person focused" : "person"
        container.id = id
        container.innerHTML = "<h3>" + person.name + "</h3>"

        Object.values(RelativeType).forEach(type => {
            if (cc.hasHiddenRelatives(id, type)) {
                let label = toTitleCase(type)
                container.append(createShowLink(id, label, cc.fetchHiddenRelatives(type)))
            }
        })

        let link = createLink(id, "Details", () => {
            showEditModal(id)
        })
        container.append(link)

        container.append(createHideLink(id, "Hide", (id) => hidePerson(id)))

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
        let yClearance = ph / 2 + 20
        renderLine(x1, y1, x1, y1 + yClearance)
        renderLine(x1, y1 + yClearance, x2, y1 + yClearance)
        renderLine(x2, y1 + yClearance, x2, y2)
    }

    let renderMarriageLine = function(marriageNode) {
        let partnerLeft = marriageNode.partners[0]
        let partnerRight = marriageNode.partners[1]

        renderLine(partnerLeft.x + pw / 2, partnerLeft.y, partnerRight.x - pw / 2, partnerRight.y)
    }

    let renderChildLine = function(marriageNode, childNode) {
        renderLine(marriageNode.x, marriageNode.y, childNode.x, childNode.y - ph / 2)
    }

    let preprocessVisible = function(visible) {
        // if a single parent and a child are on screen. The other parent should
        // also be visible.
        // TODO(Awais) Make this code less ugly and more comprehensible
        visible.forEach(id => {
            let person = data[id]
            if (person.marriages) {
                person.marriages.forEach(marriageId => {
                    let marriage = data[marriageId]
                    if (_.some(marriage.children, item => visible.has(item))) {
                        marriage.partners.forEach(partnerId => {
                            if (!visible.has(partnerId)) {
                                visible.add(partnerId)
                            }
                        })
                    }
                })
            }
        })

        return visible
    }

    let renderTree = function () {
        let renderer = new Renderer(data, preprocessVisible(visible))
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
        console.log("APP")
        console.log(visible)
        console.log(data)
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
        await Promise.all([...visible].map(id => fetchPerson(id)))
        render()
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
    let showPerson = async function(id) {
        // calculate shortest path from this person to another node that is already visible
        await shortestPath(id, visible).then(result => {
            result.concat(id).forEach(item => {
                visible.add(item)
            })
        })

    }

    let hidePerson = function(id) {
        visible.delete(id)
        if (focusedId == id) {
            changeFocus(_.sample(Array.from(visible)))
        }
        render()
    }

    let reset = function(event, value) {
        visible = new Set()
        focusedId = null
        render()
    }

    let handleChangeFocus = function(event, value) {
        changeFocus(_.sample(Array.from(visible)))
    }

    let handleRandomPerson = function(event, value) {
        let id = _.sample(_.difference(people, Array.from(visible)))
        console.log(id)
        if (id == null) { return }

        showPerson(id).then(() => render()).then(() => changeFocus(id))
    }

    let changeFocus = function(id) {
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

    let handleCreatePerson = () => {
        showModal(null)
    }

    let setParents = async function(event, marriage) {
        debugger
        // how do I get a self id if the person hasn't been created yet?
        // alternatively, how I can enforce that an id exists by this point?
        // I can pass a marriage id in to the create user function
        // Then I will have a fresh problem when I get to marriages and children
        // addChildren(marriage.id, )
    }

        let showModal = async function(id) {
        let modal = $('#detailModal')
        if (id == null) {
            modal.modal()
            return
        }

        let person = await fetchPerson(id)
        let birthString = person.birthYear + "-" + (person.deathYear ? person.deathYear : "")

        // name, residence, birth/death year, bio
        modal.find(".modal-title").text(person.name)
        modal.find(".modal-residence").text(person.residence)
        modal.find(".modal-birth").text(birthString)
        modal.find(".modal-bio").text(person.biography)
        modal.find(".modal-header").css("background-image", `url('${person.photoUrl}')`)

        modal.modal()
    }

    let setDefaultOption = function(element, id, text) {
        if (element.find("option[value='" + id + "']").length) {
            element.val(id).trigger('change');
        } else {
            var newOption = new Option(text, id, true, true);
            element.append(newOption).trigger('change');
        }
    }

    let showEditModal = async function(id) {
        let modal = $('#editModal')

        if (id == null) {
            modal.modal()
            return
        }

        let person = await fetchPerson(id)

        modal.find('#id').val(id)
        modal.find('#name').val(person.name)
        modal.find('#residence').val(person.residence)
        modal.find('#gender').val(person.gender)
        modal.find('#birth-year').val(person.birthYear)
        modal.find('#death-year').val(person.deathYear)
        modal.find('#biography').val(person.biography)

        let marriageText = await getMarriageDescription(person.parents)
        setDefaultOption(modal.find('.parents-typeahead'), person.parents, marriageText)

        person.marriages.forEach(async m => {
            $("#partners-table > tbody").empty()
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

        // let child = await fetchPerson(person.)
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
        console.log("add row")
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

    let submitEditPerson = async () => {
        console.log("submitCreatePerson() called")
        let form = document.querySelector("#edit-person-form")
        let id = form["id"].value
        let name = form["name"].value
        let gender = form["gender"].value
        let birthYear = form["birth-year"].value
        let deathYear = form["death-year"].value
        let residence = form["residence"].value
        let biography = form["biography"].value
        let parents = form["parents"].value

        marriages = []
        $('#partners-table tbody tr').each((i, row) => {
            partner = $(row).find(".partner-typeahead").select2("data")[0]
            children = $(row).find(".children-typeahead").select2("data")
            marriages.push({partnerAId: id, partnerBId: partner.id, children: children.map(c => c.id)})
        })

        upsertPerson(
            id, name, gender, birthYear, deathYear, residence, biography, parents, marriages
        )
    }


    // let submitCreatePerson = async () => {
    //     console.log("submitCreatePerson() called")
    //     let form = document.querySelector("#create-person-form")
    //     debugger
    //     result = await upsertPerson(
    //         form["name"].value,
    //         form["gender"].value,
    //         form["birth-year"].value,
    //         form["death-year"].value,
    //         form["residence"].value,
    //         form["biography"].value,
    //     )
    // }

    document.querySelector("#tick-btn").addEventListener("click", handleRandomPerson)
    document.querySelector("#focus-btn").addEventListener("click", handleChangeFocus)
    document.querySelector('#reset-btn').addEventListener("click", reset)
    document.querySelector('#create-person').addEventListener("click", handleCreatePerson)
    document.querySelector("#edit-person-form").addEventListener("submit", submitEditPerson)
};