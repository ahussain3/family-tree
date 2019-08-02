// The control center is responsible for knowing exactly who is on screen and
// who else could be on screen. You can ask it questions like "Does this person
// have any siblings who are not currently on screen"

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

    hasHiddenParents = (id) => {
        return this.getHiddenParents(id).length > 0
    }

    hasHiddenPartners = (id) => {
        return this.getHiddenPartners(id).length > 0
    }

    hasHiddenSiblings = (id) => {
        return this.getHiddenSiblings(id).length > 0
    }

    hasHiddenChildren = (id) => {
        return this.getHiddenChildren(id).length > 0
    }

    getHiddenParents = (id) => {
        let person = this.data[id]
        if (!person.parents) { return []}

        let parents = this.data[person.parents].partners
        return _.difference(parents, Array.from(this.visible))
    }

    getHiddenPartners = (id) => {
        let person = this.data[id]
        if (person.marriages.length < 1) { return [] }

        let partners = _.flatten(person.marriages.map(marriageId => {
            let marriage = this.data[marriageId]
            return marriage.partners.filter(partnerId => partnerId != id)
        }))

        return _.difference(partners, Array.from(this.visible))
    }

    getHiddenSiblings = (id) => {
        let person = this.data[id]
        let parents = this.data[person.parents]
        if (!parents) { return [] }

        let siblings = parents.children.filter(child => child != id)
        return _.difference(siblings, Array.from(this.visible))
    }

    getHiddenChildren = (id) => {
        let person = this.data[id]
        if (person.marriages.length < 1) { return [] }

        let children = _.flatten(person.marriages.map(marriageId => {
            let marriage = this.data[marriageId]
            return marriage.children.filter(childId => childId != id)
        }))

        return _.difference(children, Array.from(this.visible))
    }

    fetchHiddenParents = async (id) => {
        let persons = this.getHiddenParents(id)
        return Promise.all(persons.map(async (personId) => {
            await fetchPerson(personId)
            return personId
        }))
    }

    fetchHiddenPartners = async (id) => {
        let persons = this.getHiddenPartners(id)
        return Promise.all(persons.map(async (personId) => {
            await fetchPerson(personId)
            return personId
        }))
    }

    fetchHiddenSiblings = async (id) => {
        let persons = this.getHiddenSiblings(id)
        return Promise.all(persons.map(async (personId) => {
            await fetchPerson(personId)
            return personId
        }))
    }

    fetchHiddenChildren = async (id) => {
        let persons = this.getHiddenChildren(id)
        return Promise.all(persons.map(async (personId) => {
            await fetchPerson(personId)
            return personId
        }))
    }
}
