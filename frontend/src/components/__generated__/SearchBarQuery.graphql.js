/**
 * @flow
 * @relayHash 6995dcd3af2194ea46841e8a38f07c07
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
    name
    residence
    birthYear
    deathYear
    id
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
    "kind": "Variable",
    "name": "name",
    "variableName": "name",
    "type": "String"
  }
],
v2 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "name",
  "args": null,
  "storageKey": null
},
v3 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "residence",
  "args": null,
  "storageKey": null
},
v4 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "birthYear",
  "args": null,
  "storageKey": null
},
v5 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "deathYear",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "SearchBarQuery",
  "id": null,
  "text": "query SearchBarQuery(\n  $name: String!\n) {\n  searchPersons(name: $name) {\n    name\n    residence\n    birthYear\n    deathYear\n    id\n  }\n}\n",
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
          v2,
          v3,
          v4,
          v5
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
          v2,
          v3,
          v4,
          v5,
          {
            "kind": "ScalarField",
            "alias": null,
            "name": "id",
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
(node/*: any*/).hash = '584085741e3624542482b5be3f79ad74';
module.exports = node;
