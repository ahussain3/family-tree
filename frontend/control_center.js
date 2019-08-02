// The control center is responsible for knowing exactly who is on screen and
// who else could be on screen. You can ask it questions like "Does this person
// have any siblings who are not currently on screen"

const RelativeType = {
    PARENTS: "PARENTS",
    PARTNERS: "PARTNERS",
    SIBLINGS: "SIBLINGS",
    CHILDREN: "CHILDREN"
}

class ControlCenter {
    constructor(data, visible) {
        this.data = data
        this.visible = visible
    }

    update(data, visible) {
        this.data = data
        this.visible = visible
    }

    isVisible = (id) => {
        return this.visible.has(id)
    }

    hasHiddenRelatives = (id, type) => {
        return this.getHiddenRelatives(id, type).length > 0
    }

    getHiddenRelatives = (id, type) => {
        switch(type) {
            case RelativeType.PARENTS:
                return this._getHiddenParents(id)
            case RelativeType.PARTNERS:
                return this._getHiddenPartners(id)
            case RelativeType.SIBLINGS:
                return this._getHiddenSiblings(id)
            case RelativeType.CHILDREN:
                return this._getHiddenChildren(id)
        }
    }

    fetchHiddenRelatives = (type) => {
        return async (id) => {
            let persons = this.getHiddenRelatives(id, type)
            return Promise.all(persons.map(async (personId) => {
                await fetchPerson(personId)
                return personId
            }))
        }
    }

    _getHiddenParents = (id) => {
        let person = this.data[id]
        if (!person.parents) { return []}

        let parents = this.data[person.parents].partners
        return _.difference(parents, Array.from(this.visible))
    }

    _getHiddenPartners = (id) => {
        let person = this.data[id]
        if (person.marriages.length < 1) { return [] }

        let partners = _.flatten(person.marriages.map(marriageId => {
            let marriage = this.data[marriageId]
            return marriage.partners.filter(partnerId => partnerId != id)
        }))

        return _.difference(partners, Array.from(this.visible))
    }

    _getHiddenSiblings = (id) => {
        let person = this.data[id]
        let parents = this.data[person.parents]
        if (!parents) { return [] }

        let siblings = parents.children.filter(child => child != id)
        return _.difference(siblings, Array.from(this.visible))
    }

    _getHiddenChildren = (id) => {
        let person = this.data[id]
        if (person.marriages.length < 1) { return [] }

        let children = _.flatten(person.marriages.map(marriageId => {
            let marriage = this.data[marriageId]
            return marriage.children.filter(childId => childId != id)
        }))

        return _.difference(children, Array.from(this.visible))
    }
}
