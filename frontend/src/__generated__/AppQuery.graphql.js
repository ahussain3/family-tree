/**
 * @flow
 * @relayHash 5d7ea2dbad9ee1e3def708b43a9108f7
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type AppQueryVariables = {||};
export type AppQueryResponse = {|
  +searchPersons: ?{|
    +persons: $ReadOnlyArray<?{|
      +name: string
    |}>
  |}
|};
export type AppQuery = {|
  variables: AppQueryVariables,
  response: AppQueryResponse,
|};
*/


/*
query AppQuery {
  searchPersons(name: "Zahid") {
    persons {
      name
      id
    }
  }
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "name",
    "value": "Zahid",
    "type": "String"
  }
],
v1 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "name",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "AppQuery",
  "id": null,
  "text": "query AppQuery {\n  searchPersons(name: \"Zahid\") {\n    persons {\n      name\n      id\n    }\n  }\n}\n",
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "AppQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": [],
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "searchPersons",
        "storageKey": "searchPersons(name:\"Zahid\")",
        "args": v0,
        "concreteType": "Persons",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "persons",
            "storageKey": null,
            "args": null,
            "concreteType": "Person",
            "plural": true,
            "selections": [
              v1
            ]
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "AppQuery",
    "argumentDefinitions": [],
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "searchPersons",
        "storageKey": "searchPersons(name:\"Zahid\")",
        "args": v0,
        "concreteType": "Persons",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "persons",
            "storageKey": null,
            "args": null,
            "concreteType": "Person",
            "plural": true,
            "selections": [
              v1,
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
    ]
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '91ed6e483e5cee022e541bfa324ebb2b';
module.exports = node;
