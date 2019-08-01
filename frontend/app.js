window.onload = function() {
    let pw = 100
    let ph = 200

    // Object.prototype.keys = function() { return Object.keys(this) }
    // Object.prototype.values = function() { return Object.values(this) }
    // Object.prototype.items = function() { return _.zip(Object.keys(this), Object.values(this)) }

    var xhttp = new XMLHttpRequest();
    // var data = {}  // keyed by id.
    var people = Object.values(data).filter(item => item.__typename == 'Person').map(item => item.id)
    var visible = new Set([])
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

    let createLink = function(id, name) {
        let link = document.createElement("a")
        link.innerHTML = name
        link.href = "#"
        return link
    }

    let createShowLink = function(id, name, func) {
        let p = document.createElement("p")
        let link = createLink(id, name)
        link.onclick = async () => {
            let result = await func(id)
            result.forEach(id => addPerson(id))
            render()
        }
        p.append(link)
        return p
    }

    let createHideLink = function(id, name, func) {
        let p = document.createElement("p")
        let link = createLink(id, name)
        link.onclick = () => {
            func(id)
            render()
        }
        p.append(link)
        return p
    }

    let renderPerson = function(id, x, y) {
        let person = data[id]
        var container = document.createElement("div")
        container.className = focusedId == id ? "person focused" : "person"
        container.id = id
        container.innerHTML = "<h3>" + person.name + "</h3>"

        if (cc.hasHiddenParents(id)) {
            container.append(createShowLink(id, "Parents", cc.fetchHiddenParents))
        }

        if (cc.hasHiddenPartners(id)) {
            container.append(createShowLink(id, "Partners", cc.fetchHiddenPartners))
        }

        if (cc.hasHiddenSiblings(id)) {
            container.append(createShowLink(id, "Siblings", cc.fetchHiddenSiblings))
        }

        if (cc.hasHiddenChildren(id)) {
            container.append(createShowLink(id, "Children", cc.fetchHiddenChildren))
        }

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

    let main = function() {
        render()
    }

    main()

    // Find the shortest path from the node identified by 'source' and any visible node
    // If there are multiple shortests paths of the same length, it arbitrarily
    // returns one of the shortest paths
    // Returns: list of ids of all nodes that are on a shortest path, including
    // the already visible node, but not including the source node.
    // TODO(Awais) This function probably shouldn't live in this file
    let shortestPath = function(source, visible) {
        marked = {}
        queue = [source]
        edgeTo = {}
        found = null

        marked[source] = true

        while (queue.length > 0) {
            let person = data[queue.shift()]
            if (person == undefined) {
                continue
            }

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
    let addPerson = function(id) {
        // calculate shortest path from this person to another node that is already visible
        shortestPath(id, visible).concat(id).forEach(item => {
            visible.add(item)
        })
    }

    let hidePerson = function(id) {
        visible.delete(id)
        if (focusedId == id) { focusedId = null }
        render()
    }

    let reset = function(event, value) {
        visible = new Set()
        focusedId = null
        render()
    }

    let changeFocus = function(event, value) {
        focusedId = _.sample(Array.from(visible))
        console.log(focusedId)
        render()

        let focused = document.getElementById(focusedId)
        pannableContainer.panToPosition(focused, 0, 0)
    }

    let handleClick = function(event, value) {
        let id = _.sample(_.difference(people, Array.from(visible)))
        console.log(id)
        if (id == null) { return }

        addPerson(id)
        render()
    }

    $('#search-bar input.typeahead').typeahead({
        hint: true,
        highlight: true, /* Enable substring highlighting */
        minLength: 1 /* Specify minimum characters required for showing result */
    },
    {
        name: 'searchPersons',
        source: searchPersons,
        display: "name",
    });

    let selectPerson = function(event, person) {
      fetchPerson(person.id, (result) => {
        addPerson(result.id)
        render()
      })
    }

    $('#search-bar input.typeahead.tt-input').bind('typeahead:select', selectPerson);


    document.querySelector("#tick-btn").addEventListener("click", handleClick)
    document.querySelector("#focus-btn").addEventListener("click", changeFocus)
    document.querySelector('#reset-btn').addEventListener("click", reset)
};