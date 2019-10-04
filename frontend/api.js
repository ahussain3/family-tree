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
    biography
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

  person.marriages.forEach(marriage => addMarriageToDataset(marriage))
  if (person.parents) {
    addMarriageToDataset(person.parents)
  }

  data[person.id] = clone
  return clone
}

let addMarriageToDataset = function(marriage) {
  var clone = Object.assign({}, marriage)
  clone.children = marriage.children.map(child => child.id)
  clone.partners = marriage.partners.map(partner => partner.id)
  data[marriage.id] = clone
}

let _fetchPerson = async function (id) {
  let variables = {"id": id}
  return graph(personQuery)(variables).then((response) => {
    let result = response["person"]
    return addPersonToDataset(result)
  }).catch(function (error) {
    console.log(error)
  })
}

let fetchPerson = async (id) => {
    if (!Object.keys(this.data).includes(id)) {
        await _fetchPerson(id)
        return this.data[id]
    }
    return this.data[id]
}

// TODO(Awais): I should really have fragments or something here
let upsertPersonMutation = `mutation upsertPersonMutation(
  $id: ID,
  $name: String!,
  $gender: Gender!,
  $birthYear: Int,
  $deathYear: Int,
  $residence: String,
  $biography: String,
) {
  upsertPerson(
    id: $id,
    name: $name,
    gender: $gender,
    birthYear: $birthYear,
    deathYear: $deathYear,
    residence: $residence,
    biography: $biography,
  ) {
    person {
      __typename
      id
      name
      gender
      photoUrl
      residence
      birthYear
      deathYear
      biography
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
  }
}`

let upsertPerson = async function(name, gender, birthYear, deathYear, residence, biography) {
  let variables = {
    "name": name,
    "gender": gender,
    "birthYear": birthYear || null,
    "deathYear": deathYear || null,
    "residence": residence || null,
    "biography": biography || null,
  }
  return graph(upsertPersonMutation)(variables).then((response) => {
    let result = response["upsertPerson"]["person"]
    return addPersonToDataset(result)
  }).catch(function (error) {
    console.log(error)
  })
}
