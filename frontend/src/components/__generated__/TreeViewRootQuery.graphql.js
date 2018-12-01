/**
 * @flow
 * @relayHash 146ef8e0b76f072fd6d6030a9d4c3df5
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type Person_person$ref = any;
export type TreeViewRootQueryVariables = {|
  id: string
|};
export type TreeViewRootQueryResponse = {|
  +person: ?{|
    +$fragmentRefs: Person_person$ref
  |}
|};
export type TreeViewRootQuery = {|
  variables: TreeViewRootQueryVariables,
  response: TreeViewRootQueryResponse,
|};
*/


/*
query TreeViewRootQuery(
  $id: ID!
) {
  person(id: $id) {
    ...Person_person
    id
  }
}

fragment Person_person on Person {
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
    "name": "id",
    "type": "ID!",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id",
    "type": "ID"
  }
];
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "TreeViewRootQuery",
  "id": null,
  "text": "query TreeViewRootQuery(\n  $id: ID!\n) {\n  person(id: $id) {\n    ...Person_person\n    id\n  }\n}\n\nfragment Person_person on Person {\n  id\n  name\n  residence\n  birthYear\n  deathYear\n}\n",
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "TreeViewRootQuery",
    "type": "Query",
    "metadata": null,
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "person",
        "storageKey": null,
        "args": v1,
        "concreteType": "Person",
        "plural": false,
        "selections": [
          {
            "kind": "FragmentSpread",
            "name": "Person_person",
            "args": null
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "TreeViewRootQuery",
    "argumentDefinitions": v0,
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "person",
        "storageKey": null,
        "args": v1,
        "concreteType": "Person",
        "plural": false,
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
(node/*: any*/).hash = 'de5965eace58d5093bb978bf4c23d41c';
module.exports = node;
