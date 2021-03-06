Array.prototype.insertBefore = function(item, lookup) {
    this.splice(this.indexOf(lookup), 0, item)
}

Array.prototype.insertAfter = function(item, lookup) {
    this.splice(this.indexOf(lookup) + 1, 0, item)
}

average = function(arr) {
    return arr.reduce((a,b) => a + b, 0) / arr.length
}

// So annoying that I have to do this!
safeMin = function(arr) {
    if (arr == []) { return 0 }
    return _.min(arr)
}

safeMax = function(arr) {
    if (arr == []) { return 0 }
    return _.max(arr)
}


DEBUG = false


class Renderer {
    constructor(data, visible) {
        this.g = this.makeGraph(data, visible)
        this.data = data
        this.visible = visible
    }

    makeGraph(data, visible) {
        let g = new Graph()

        // Create a graph containing all the visible people
        visible.forEach(id => {
            let person = data[id]
            let personNode = g.addNode(new Person(id, person.name, person.gender, person.birthYear))

            if (person.marriages.length != 0) {
                person.marriages.forEach(id => {
                    let marriage = data[id]
                    let partnerId = marriage.partners.filter(id => id != person.id)[0]
                    if (visible.has(partnerId)) {
                        let marriageNode = g.addNode(new Marriage(id))
                        let partner = data[partnerId]
                        let partnerNode = g.addNode(new Person(partnerId, partner.name, partner.gender, partner.birthYear))

                        marriageNode.setPartners(personNode, partnerNode)
                        personNode.addMarriage(marriageNode)
                        partnerNode.addMarriage(marriageNode)

                        marriage.children.forEach(childId => {
                            if (visible.has(childId)) {
                                let child = data[childId]
                                let childNode = g.addNode(new Person(childId, child.name, child.gender, child.birthYear))
                                marriageNode.addChild(childNode)
                                childNode.setParents(marriageNode)
                            }
                        })
                    }
                })
            }

            if (person.parents && _.some(person.parents, item => visible.has(item))) {
                let marriageNode = g.addNode(new Marriage(person.parents))
                marriageNode.addChild(personNode)
                personNode.setParents(marriageNode)
            }
        })

        return g
    }

    setRank(node, rank) {
        node.rank = rank
        return node
    }

    hasRank(node) {
        return node.rank != null
    }

    getHost(marriage) {
        // The male determines where the marriage gets rendered, except if the // male's parents not on screen, in which case the female determines
        // where the marriage is rendered. I don't make the rules. :shrugs:
        assert(marriage.partners.length == 2)
        let a = marriage.partners[0]
        let b = marriage.partners[1]

        let aParentsAreVisible = a.parents && this.visible.has(a.parents.partners[0].id)
        let bParentsAreVisible = b.parents && this.visible.has(b.parents.partners[0].id)

        if (aParentsAreVisible == bParentsAreVisible) {
            return a.isMale() ? a : b
        }

        return aParentsAreVisible ? a : b
    }

    // Recursively go through and calculate the rank of this person, and any
    // children, parents, or partners they might have.
    computeRank(node, rank) {
        if (this.hasRank(node)) {
            return
        }

        this.setRank(node, rank)

        if (node instanceof Person) {
            // set rank for marriages
            node.marriages.forEach(marriage => {
                if (this.getHost(marriage) == node) {
                    this.computeRank(marriage, rank)}
                })

            // set rank for parents
            if (node.parents) { this.computeRank(node.parents, rank - 1)}
        }

        if (node instanceof Marriage) {
            // set rank for partners
            node.partners.forEach(partner => this.computeRank(partner, rank))
            // set rank for children
            node.children.forEach(child => this.computeRank(child, rank + 1))
        }
    }

    normalizeRanks() {
        let min = safeMin(this.g.nodes.map(node => node.rank))
        this.g.nodes.forEach(node => {
            node.rank = node.rank - min
        })
    }

    getVotingNode(node) {
        // The voting node is the person themselves if they are not married,
        // or the "host" of the marriage if they are.
        var votingNode = null
        if (node instanceof Marriage) {
            votingNode = this.getHost(node)
        } else if (node.isMarried()) {
            votingNode = this.getHost(node.marriages[0])
        } else {
            votingNode = node
        }
        return votingNode
    }

    getParents(node) {
        // return the parents of either the person themselves if they are not
        // married, or the parents_id of the host of the marriage if they are.
        // returns null if the person has no parents
        return this.getVotingNode(node).parents
    }

    getParentsId(node) {
        let votingNode = this.getVotingNode(node)
        let parents = this.getParents(node)
        return parents ? parents.id : `noparents_${votingNode.id}`
    }

    printNodeOrder(nodes) {
        console.log(nodes.map(n=>n.name || "marriage").join(", "))
    }

    orderWithinRank(rank) {
        // remove all nodes except hosts of marriages
        let nodes = this.g.nodes.filter(node => node.rank == rank && this.getVotingNode(node) == node)
        let counter = 0

        // show the oldest person on the left
        nodes.sort((n1, n2) => {
            let a = n1 instanceof Marriage ? this.getHost(n1) : n1
            let b = n2 instanceof Marriage ? this.getHost(n2) : n2

            return (a.birthYear || 0) < (b.birthYear || 0) ? -1 : 1
        })

        // minimize line crossings by positioning groups of direct siblings
        // close to their counterparts on different levels
        nodes.sort((n1, n2) => {
            let aParents = this.getParents(n1)
            let bParents = this.getParents(n2)

            if (!aParents || !bParents) {
                return 0
            }

            return aParents.file < bParents.file ? -1 : 1
        })

        // add back in partners and marriage nodes
        let reconstructed_nodes = []
        nodes.forEach(node => {
            reconstructed_nodes.push(node)
            if (node instanceof Person && node.isMarried()) {
                let before = !node.isMale()
                node.marriages.forEach(marriage => {
                    let partner = marriage.otherPartner(node)
                    if (before) {
                        reconstructed_nodes.insertBefore(partner, node)
                        reconstructed_nodes.insertBefore(marriage, node)
                    } else {
                        reconstructed_nodes.insertAfter(partner, node)
                        reconstructed_nodes.insertAfter(marriage, node)
                    }
                    before = !before
                })
            }
        })
        nodes = reconstructed_nodes

        for (var i = 0; i < nodes.length; i++) {
            nodes[i].file = counter

            if (nodes[i] instanceof Marriage || nodes[i + 1] instanceof Marriage) {
                counter = counter + 0.7
            } else {
                counter++
            }
        }
    }

    groupBy(list, iteratee) {
        const map = new Map();
        list.forEach((item) => {
             const key = iteratee(item);
             const collection = map.get(key);
             if (!collection) {
                 map.set(key, [item]);
             } else {
                 collection.push(item);
             }
        });
        return map;
    }

    siblingGroup(person) {
        // returns a list of nodes for people who are in the "sibling group"
        // for this person, namely that they are siblings, or are married to // their siblings.
        let parentsId = this.getParentsId(person)
        let group = this.g.nodes.filter(node => {
            return this.getParentsId(node) == parentsId
        })
        return group
    }

    centerChildren(rank) {
        let nodes = _.sortBy(this.g.nodes.filter(node => node.rank == rank), node => node.file)

        // go through the rank, left to right, and identify any sibling groups.
        // Only hosts of marriages are in the sibling group someone who
        // doesn't have parents is in their own sibling group
        let groups = this.groupBy(nodes, node => {
            let parents = this.getParents(node)
            if (parents == null) { return `noparents_${votingNode.id}` }
            return parents.id
        })

        // for each sibling group, identify who the parents are
        let mod = 0
        for (let [parents_id, group] of groups) {
            if (parents_id.startsWith("noparents")) {
                group.forEach(node => node.file = node.file + mod)
            }
            let parents = this.g.get(parents_id)
            let leftMost = safeMin(group.map(child => child.file))
            let rightMost = safeMax(group.map(child => child.file))
            let offset = _.max([0, parents.file - average([leftMost, rightMost])])

            group.forEach(node => node.file = node.file + mod + offset)
            mod += offset
        }
    }

    centerOverChildren(rank) {
        let nodes = _.sortBy(this.g.nodes.filter(node => node.rank == rank), node => node.file)
        let marriages = nodes.filter(node => node instanceof Marriage)

        // find the marriage node and center it over its children
        // don't move marriage nodes which have already been positioned
        let alreadyPositioned = []
        marriages.forEach(marriage => {
            if (marriage.children.length != 0) {
                let childrenGroup = this.siblingGroup(marriage.children[0])
                let leftMost = safeMin(childrenGroup.map(child => child.file))
                let rightMost = safeMax(childrenGroup.map(child => child.file))
                let offset = average([leftMost, rightMost]) - marriage.file

                let siblingGroup = this.siblingGroup(this.getHost(marriage))
                siblingGroup.forEach(node => {
                    if (!alreadyPositioned.includes(node)) {
                        node.file = node.file + offset
                    }
                })

                marriage.partners.concat(marriage).forEach(node => {
                    alreadyPositioned.push(node)
                })
            }
        })
    }

    eliminateOverlaps(rank) {
        // For each rank goes left to right and "pushes" nodes to the right
        // in order to remove overlaps. This is mostly just an extra failsafe.
        let nodes = _.sortBy(this.g.nodes.filter(node => node instanceof Person && node.rank == rank), node => node.file)
        for (var i = 1; i < nodes.length; i++) {
            if (nodes[i].file <= nodes[i-1].file + 0.8) {
                // we have an overlap
                let mod = nodes[i-1].file - nodes[i].file + 1
                nodes.slice(i, nodes.length).forEach(node => node.mod += mod)
            }
        }
    }

    normalizeFiles() {
        // adds the same value to every node so that none have a negative file.
        let min = safeMin(this.g.nodes.map(node => node.file))
        this.g.nodes.forEach(node => {
            node.file = node.file - min
        })
    }

    setYPositions() {
        let yWidth = 290
        let yOffset = 210

        this.g.nodes.forEach(node => node.y = Math.round(node.rank * yWidth - yOffset))
    }

    setXPositions() {
        let xWidth = 120
        let xOffset = 240

        this.g.nodes.forEach(node => node.x = Math.round((node.file + node.mod) * xWidth - xOffset))
    }

    debug(title) {
        if (DEBUG) {
            console.log(title)
            this.g.print()
        }
    }

    findWidestRank() {
        var result = 0
        var maxWidth = 0
        let ranks = _.uniq(this.g.nodes.map(node => node.rank)).sort()
        ranks.forEach(rank => {
            let nodes = this.g.nodes.filter(node => node.rank == rank)
            let max = safeMax(nodes.map(node => node.file))
            let min = safeMin(nodes.map(node => node.file))
            let width = max - min
            if (width > maxWidth) {
                maxWidth = width
                result = rank
            }
        })
        return result
    }

    render() {
        if (this.g.nodes.length == 0) {
            return []
        }

        // It is not strictly necessary to compute the ranks of marriage nodes
        // first, but this increases the deterministic nature of the rendering
        // engine, and reduces scope for bugs elsewhere.
        this.g.nodes.filter(node => node instanceof Marriage).forEach(node => this.computeRank(node, 0))
        this.g.nodes.filter(node => node instanceof Person).forEach(node => this.computeRank(node, 0))
        this.debug("Compute Ranks")

        this.normalizeRanks()
        this.debug("Normalized Ranks")

        let ranks = _.uniq(this.g.nodes.map(node => node.rank)).sort()
        ranks.forEach(rank => this.orderWithinRank(rank))
        this.debug("Order Within Ranks")

        let widestRank = this.findWidestRank()
        console.log("widestRank", widestRank)
        ranks.filter(rank => rank > widestRank).forEach(rank => this.centerChildren(rank))
        this.debug("Center Children")
        ranks.filter(rank => rank < widestRank).reverse().forEach(rank => this.centerOverChildren(rank))
        this.debug("Center Over Children")

        this.normalizeFiles()
        this.debug("Normalize Files")

        // ranks.forEach(rank => this.eliminateOverlaps(rank))
        // this.debug("Eliminate Overlaps")

        this.setXPositions()
        this.debug("Set X Positions")

        this.setYPositions()
        this.debug("Set Y Positions")

        return this.g.nodes
    }
}