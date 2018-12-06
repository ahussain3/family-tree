/**
 * @flow
 * @relayHash 3ba900cb794b03a2f0a6cab627731107
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
    +partners: ?$ReadOnlyArray<?{|
      +$fragmentRefs: Person_person$ref
    |}>,
    +$fragmentRefs: Person_person$ref,
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
    partners {
      ...Person_person
      id
    }
    id
  }
}

fragment Person_person on Person {
  id
  name
  gender
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
],
v2 = {
  "kind": "FragmentSpread",
  "name": "Person_person",
  "args": null
},
v3 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
},
v4 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "name",
  "args": null,
  "storageKey": null
},
v5 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "gender",
  "args": null,
  "storageKey": null
},
v6 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "residence",
  "args": null,
  "storageKey": null
},
v7 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "birthYear",
  "args": null,
  "storageKey": null
},
v8 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "deathYear",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "TreeViewRootQuery",
  "id": null,
  "text": "query TreeViewRootQuery(\n  $id: ID!\n) {\n  person(id: $id) {\n    ...Person_person\n    partners {\n      ...Person_person\n      id\n    }\n    id\n  }\n}\n\nfragment Person_person on Person {\n  id\n  name\n  gender\n  residence\n  birthYear\n  deathYear\n}\n",
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
          v2,
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "partners",
            "storageKey": null,
            "args": null,
            "concreteType": "Person",
            "plural": true,
            "selections": [
              v2
            ]
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
          v3,
          v4,
          v5,
          v6,
          v7,
          v8,
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "partners",
            "storageKey": null,
            "args": null,
            "concreteType": "Person",
            "plural": true,
            "selections": [
              v3,
              v4,
              v5,
              v6,
              v7,
              v8
            ]
          }
        ]
      }
    ]
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '5053cb385fef78c7dd2c69e9358af2c7';
module.exports = node;
