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


    orderWithinRank(rank) {
        let nodes = this.g.nodes.filter(node => node.rank == rank)
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
            let a = n1 instanceof Marriage ? this.getHost(n1) : n1
            let b = n2 instanceof Marriage ? this.getHost(n2) : n2

            let aParents = a.parents ? a.parents.file : undefined
            let bParents = b.parents ? b.parents.file : undefined

            if (!aParents || !bParents) {
                return 0
            }

            return aParents < bParents ? -1 : 1
        })

        // group people so that married people stay close together
        let marriages = nodes.filter(node => node instanceof Marriage)
        let partners = _.flatten(marriages.map(marriage => marriage.partners))

        // remove any persons who are in a marriage.
        nodes = nodes.filter(node => !partners.includes(node))

        // add back in any persons in a marriage (in the correct place)
        marriages.forEach(marriage => {
            let partners = marriage.partners.sort(p => p.isMale() ? -1 : 1)
            nodes.insertBefore(partners[0], marriage)
            nodes.insertAfter(partners[1], marriage)
        })

        for (var i = 0; i < nodes.length; i++) {
            nodes[i].file = counter

            if (nodes[i] instanceof Marriage || nodes[i + 1] instanceof Marriage) {
                counter = counter + 0.7
            } else {
                counter++
            }
        }
    }

    siblingGroup(person) {
        // returns a list of nodes for people who are in the "sibling group"
        // for this person, namely that they are siblings, or are married to // their siblings.
        let siblings = this.g.nodes.filter(node => {
            return person.parents != null &&
            node.parents != null &&
            node != person &&
            node.parents.id == person.parents.id
        })

        let partners = [person, ...siblings].flatMap(p => p.marriages.flatMap(m => [m, ...m.partners]))

        return _.uniq([person, ...siblings, ...partners])
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

    centerChildren(rank) {
        let nodes = _.sortBy(this.g.nodes.filter(node => node.rank == rank), node => node.file)

        // go through the rank, left to right, and identify any sibling groups.
        // Only hosts of marriages are in the sibling group someone who
        // doesn't have parents is in their own sibling group
        let groups = this.groupBy(nodes, node => {
            var votingNode = null
            if (node instanceof Marriage) {
                votingNode = this.getHost(node)
            } else if (node.isMarried()) {
                votingNode = this.getHost(node.marriages[0])
            } else {
                votingNode = node
            }

            if (votingNode.parents == null) { return `noparents_${votingNode.id}` }
            return votingNode.parents.id
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

            // center the sibling group over the parents, while avoiding
            // overlaps.
            group.forEach(node => node.file = node.file + offset + mod)
            mod += offset
        }
    }

    centerOverChildren(rank) {
        let nodes = _.sortBy(this.g.nodes.filter(node => node.rank == rank), node => node.file)
        let marriages = nodes.filter(node => node instanceof Marriage)

        // find the marriage node and center it over its children
        marriages.forEach(marriage => {
            if (marriage.children.length != 0) {
                let siblingGroup = this.siblingGroup(marriage.children[0])
                let leftMost = safeMin(siblingGroup.map(child => child.file))
                let rightMost = safeMax(siblingGroup.map(child => child.file))
                let offset = marriage.file - average([leftMost, rightMost])

                this.siblingGroup(this.getHost(marriage)).forEach(node => {
                    node.file = node.file - offset
                })
            }
        })
    }

    eliminateOverlaps(rank) {
        // For each rank goes left to right and "pushes" nodes to the right
        // in order to remove overlaps.
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

        ranks.forEach(rank => this.eliminateOverlaps(rank))
        this.debug("Eliminate Overlaps")

        this.setXPositions()
        this.debug("Set X Positions")

        this.setYPositions()
        this.debug("Set Y Positions")

        return this.g.nodes
    }
}