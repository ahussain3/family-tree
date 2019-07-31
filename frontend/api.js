let url = "http://localhost:5000/graphql"
var graph = graphql(url, {
  method: "POST", // POST by default.
  headers: {},
  fragments: {}
})

let searchPersonsQuery = `query searchPersons($name: String) {
  searchPersons(name: $name)  {
    id
    name
  }
}`

graph(query)().then(function (response) {
  // response is originally response.data of query result
  console.log(response)
}).catch(function (error) {
  // response is originally response.errors of query result
  console.log(error)
})



let searchForPerson = function(name) {

}