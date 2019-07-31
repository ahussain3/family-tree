// let url = "http://localhost:5000/graphql"
// var graph = graphql(url, {
//   method: "POST", // POST by default.
//   headers: {},
//   fragments: {}
// })

// let query = `query blah {
//   searchPersons(name: "Zahid")  {
//     id
//     name
//   }
// }`

// let variables = {}

// graph(query)().then(function (response) {
//   // response is originally response.data of query result
//   console.log(response)
// }).catch(function (error) {
//   // response is originally response.errors of query result
//   console.log(error)
// })
$(document).ready(function(){
    var cars = ['Audi', 'BMW', 'Bugatti', 'Ferrari', 'Ford', 'Lamborghini', 'Mercedes Benz', 'Porsche', 'Rolls-Royce', 'Volkswagen'];

    // Constructing the suggestion engine
    var cars = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.whitespace,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: cars
    });

    // Initializing the typeahead
    $('.typeahead').typeahead({
        hint: true,
        highlight: true, /* Enable substring highlighting */
        minLength: 1 /* Specify minimum characters required for showing result */
    },
    {
        name: 'cars',
        source: cars
    });
});