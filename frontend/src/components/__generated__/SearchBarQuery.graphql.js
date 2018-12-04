/**
 * @flow
 * @relayHash 5fda8efe98a70fe1623ef30604351e95
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type SearchBarQueryVariables = {|
  name: string
|};
export type SearchBarQueryResponse = {|
  +searchPersons: ?$ReadOnlyArray<?{|
    +id: string,
    +name: string,
    +residence: ?string,
    +birthYear: ?number,
    +deathYear: ?number,
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
    id
    name
    residence
    birthYear
    deathYear
  }
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
    "kind": "LinkedField",
    "alias": null,
    "name": "searchPersons",
    "storageKey": null,
    "args": [
      {
        "kind": "Variable",
        "name": "name",
        "variableName": "name",
        "type": "String"
      }
    ],
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
];
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "SearchBarQuery",
  "id": null,
  "text": "query SearchBarQuery(\n  $name: String!\n) {\n  searchPersons(name: $name) {\n    id\n    name\n    residence\n    birthYear\n    deathYear\n  }\n}\n",
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "SearchBarQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": v1
  },
  "operation": {
    "kind": "Operation",
    "name": "SearchBarQuery",
    "argumentDefinitions": v0,
    "selections": v1
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'a609bf98d8a0418aea0139ddb197374b';
module.exports = node;