/**
 * @flow
 * @relayHash 7af618aca7362f81e460eef4ec6f325b
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type SearchBar_person$ref = any;
export type SearchBarQueryVariables = {|
  name: string
|};
export type SearchBarQueryResponse = {|
  +searchPersons: ?$ReadOnlyArray<?{|
    +$fragmentRefs: SearchBar_person$ref
  |}>
|};
export type SearchBarQuery = {|
  variables: SearchBarQueryVariables,
  response: SearchBarQueryResponse,
|};
*/


/*
query SearchBarQuery(
  $name: String!
) {
  searchPersons(name: $name) {
    ...SearchBar_person
    id
  }
}

fragment SearchBar_person on Person {
  id
  name
  residence
  birthYear
  deathYear
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "name",
    "type": "String!",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "name",
    "variableName": "name",
    "type": "String"
  }
];
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "SearchBarQuery",
  "id": null,
  "text": "query SearchBarQuery(\n  $name: String!\n) {\n  searchPersons(name: $name) {\n    ...SearchBar_person\n    id\n  }\n}\n\nfragment SearchBar_person on Person {\n  id\n  name\n  residence\n  birthYear\n  deathYear\n}\n",
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "SearchBarQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "searchPersons",
        "storageKey": null,
        "args": v1,
        "concreteType": "Person",
        "plural": true,
        "selections": [
          {
            "kind": "FragmentSpread",
            "name": "SearchBar_person",
            "args": null
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "SearchBarQuery",
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "searchPersons",
        "storageKey": null,
        "args": v1,
        "concreteType": "Person",
        "plural": true,
        "selections": [
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "id",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "name",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "residence",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "birthYear",
            "args": null,
            "storageKey": null
          },
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "deathYear",
            "args": null,
            "storageKey": null
          }
        ]
      }
    ]
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '82d6001a7adaf09fb61c78bdeb7613f0';
module.exports = node;
