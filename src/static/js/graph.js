function assert(condition, message) {
    if (!condition) {
        console.trace()
        throw message || "Assertion failed";
    }
}

const gender = {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
}

class Node {
    constructor(id) {
        this.id = id
        this.rank = null
        this.file = null
        this.width = 1
        this.x = 0
        this.y = 0
        this.mod = 0
    }
}

class Person extends Node {
    constructor(id, name, gender, birth_year) {
        super(id)
        this.name = name
        this.parents = null
        this.marriages = []
        this.gender = gender
        this.birthYear = parseInt(birth_year)
    }

    addMarriage(node) {
        assert(node instanceof Marriage)
        if (this.marriages.includes(node)) {
            return
        }
        this.marriages.push(node)
    }

    setParents(node) {
        assert(node instanceof Marriage)
        this.parents = node
    }

    isMale() {
        return this.gender == gender.MALE
    }
}

class Marriage extends Node {
    constructor(id) {
        super(id)
        this.partners = []
        this.children = []
    }

    setPartners(node1, node2) {
        assert(node1 instanceof Person)
        assert(node2 instanceof Person)

        // render men on the left and women on the right, where poss
        if (node2.isMale() && !node1.isMale()) {
            this.partners = [node2, node1]
        } else {
            this.partners = [node1, node2]
        }
    }

    addChild(node) {
        assert(node instanceof Person)
        if(this.children.includes(node)) {
            return
        }
        this.children.push(node)
    }
}

class Graph {
    constructor() {
        this.nodes = []
    }

    get(id) {
        let result = _.find(this.nodes, node => node.id == id)
        assert(result != undefined)
        return result
    }

    exists(id) {
        return this.nodes.map(node => node.id).includes(id)
    }

    addNode(node) {
        if (this.exists(node.id)) {
            return this.get(node.id)
        } else {
            this.nodes.push(node)
            return node
        }
    }

    print() {
        var nodes = this.nodes.slice()
        nodes.sort((a, b) => a.file < b.file ? -1 : 1).sort((a, b) => a.rank < b.rank ? -1 : 1)
        console.log(nodes.map(n => `${n.name ? n.name.padEnd(15) : "marriage node".padEnd(15)}\trank:${n.rank != null ? n.rank.toFixed(1) : null}\tfile:${n.file != null ? n.file.toFixed(1) : null}\tx:${n.x}\t\ty:${n.y}`).join("\n"))
    }
}