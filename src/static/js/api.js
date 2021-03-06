// let BASE_URL = "http://localhost:5008/" // local
let BASE_URL ="http://35.214.43.16/"  // prod
let url = BASE_URL + "graphql"


var graph = graphql(url, {
  method: "POST", // POST by default.
  headers: {},
  fragments: {}
})

let searchPersonsQuery = `query searchPersonsQuery($name: String) {
  searchPersons(name: $name) {
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

let personQuery = `query personQuery($id: ID!) {
  person(id: $id) {
    __typename
    id
    name
    gender
    residence
    birthYear
    deathYear
    profilePhoto
    biography
    parents {
      __typename
      id
      partners { id }
      children { id }
    }
    marriages {
      __typename
      id
      partners { id }
      children { id }
    }
  }
}`

var data = {}

let clearData = function() {
  data = {}
}

let generateIdQuery = `query generateIdQuery {
  generateId {
    id
  }
}
`

let generateId = async function() {
  return graph(generateIdQuery)({}).then(function(response) {
    let result = response['generateId']['id']
    return result
  }).catch(function(error) {
    console.log(error)
  })
}

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

let getMarriage = (id) => {
    marriage = data[id]
    if (marriage == undefined) {
      return null
    }
    return marriage
}


let getMarriageDescription = async (id) => {
    marriage = data[id]
    if (marriage == undefined) {
      return null
    }
    const partners = await Promise.all(marriage.partners.map(p => fetchPerson(p)))
    return partners.map(p => p.name).join(" and ")
}

// TODO(Awais): I should really have fragments or something here
let upsertPersonMutation = `mutation upsertPersonMutation(
  $id: ID!,
  $name: String,
  $gender: Gender!,
  $birthYear: Int,
  $deathYear: Int,
  $residence: String,
  $biography: String,
  $profilePhoto: String,
  $parents: String,
  $marriages: [MarriageInput],
) {
  upsertPerson(
    id: $id,
    name: $name,
    gender: $gender,
    birthYear: $birthYear,
    deathYear: $deathYear,
    residence: $residence,
    biography: $biography,
    profilePhoto: $profilePhoto,
    parents: $parents,
    marriages: $marriages
  ) {
    person {
      __typename
      id
      name
      gender
      residence
      birthYear
      deathYear
      biography
      profilePhoto
      parents {
        __typename
        id
        partners { id }
        children { id }
      }
      marriages {
        __typename
        id
        partners { id }
        children { id }
      }
    }
  }
}`

let upsertPerson = async function(id, name, gender, birthYear, deathYear, residence, biography, profilePhoto, parents, marriages) {
  let variables = {
    "id": id,
    "name": name,
    "gender": gender,
    "birthYear": birthYear || null,
    "deathYear": deathYear || null,
    "residence": residence || null,
    "biography": biography || null,
    "profilePhoto": profilePhoto || null,
    "parents": parents || null,
    "marriages": marriages || null,
  }
  return graph(upsertPersonMutation)(variables).then((response) => {
    let result = response["upsertPerson"]["person"]
    return addPersonToDataset(result)
  }).catch(function (error) {
    console.log(error)
  })
}

let searchMarriagesQuery = `query searchMarriagesQuery($name: String) {
  searchMarriages(name: $name)  {
    id
    partners {
      id
      name
    }
  }
}`

let searchMarriages = function(query, sync, async) {
  let variables = {"name": query}
  graph(searchMarriagesQuery)(variables).then(function (response) {
    let result = response["searchMarriages"]
    result.forEach((marriage) => {
      marriage["partnerNames"] = marriage.partners.map((partner) => partner.name).join(" and ")
    })
    async(result)
  }).catch(function (error) {
    console.log(error)
  })
}

let getPhotoUrl = function(photoName) {
  return BASE_URL + "photo/" + photoName
}