let url = "http://localhost:5000/graphql"
var graph = graphql(url, {
  method: "POST", // POST by default.
  headers: {},
  fragments: {}
})

let searchPersonsQuery = `query searchPersonsQuery($name: String) {
  searchPersons(name: $name)  {
    id
    name
  }
}`

let searchPersons = function(query, sync, async) {
  let variables = {"name": query}
  graph(searchPersonsQuery)(variables).then(function (response) {
    let result = response["searchPersons"]
    async(result)
  }).catch(function (error) {
    console.log(error)
  })
}

let personQuery = `query personQuery($id: ID) {
  person(id: $id) {
    __typename
    id
    name
    gender
    photoUrl
    residence
    birthYear
    deathYear
    parents {
      __typename
      id
      startYear
      endYear
      partners { id }
      children { id }
    }
    marriages {
      __typename
      id
      startYear
      endYear
      partners { id }
      children { id }
    }
  }
}`

var data = {}

let addPersonToDataset = function(person) {
  var clone = Object.assign({}, person)
  clone.marriages = person.marriages.map(marriage => marriage.id)
  clone.parents = person.parents != null ? person.parents.id : null
  data[person.id] = clone
}

let addMarriageToDataset = function(marriage) {
  var clone = Object.assign({}, marriage)
  clone.children = marriage.children.map(child => child.id)
  clone.partners = marriage.partners.map(partner => partner.id)
  data[marriage.id] = clone
}

let _fetchPerson = async function (id, cb) {
  let variables = {"id": id}
  return graph(personQuery)(variables).then((response) => {
    let result = response["person"]
    addPersonToDataset(result)
    result.marriages.forEach(marriage => addMarriageToDataset(marriage))
    if (result.parents) {
      addMarriageToDataset(result.parents)
    }
    cb(result)
  }).catch(function (error) {
    console.log(error)
  })
}

let fetchPerson = async (id) => {
    if (!Object.keys(this.data).includes(id)) {
        await _fetchPerson(id, () => {})
        return this.data[id]
    }
    return this.data[id]
}
