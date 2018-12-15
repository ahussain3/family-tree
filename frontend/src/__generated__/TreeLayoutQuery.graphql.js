/**
 * @flow
 * @relayHash a19f89541303ff5b1ffb649f31f1aae1
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type Person_person$ref = any;
export type TreeLayoutQueryVariables = {|
  id: string
|};
export type TreeLayoutQueryResponse = {|
  +person: ?{|
    +partners: ?$ReadOnlyArray<?{|
      +$fragmentRefs: Person_person$ref
    |}>,
    +children: ?$ReadOnlyArray<?{|
      +$fragmentRefs: Person_person$ref
    |}>,
    +$fragmentRefs: Person_person$ref,
  |}
|};
export type TreeLayoutQuery = {|
  variables: TreeLayoutQueryVariables,
  response: TreeLayoutQueryResponse,
|};
*/


/*
query TreeLayoutQuery(
  $id: ID!
) {
  person(id: $id) {
    ...Person_person
    partners {
      ...Person_person
      id
    }
    children {
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
v3 = [
  v2
],
v4 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
},
v5 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "name",
  "args": null,
  "storageKey": null
},
v6 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "gender",
  "args": null,
  "storageKey": null
},
v7 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "residence",
  "args": null,
  "storageKey": null
},
v8 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "birthYear",
  "args": null,
  "storageKey": null
},
v9 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "deathYear",
  "args": null,
  "storageKey": null
},
v10 = [
  v4,
  v5,
  v6,
  v7,
  v8,
  v9
];
return {
  "kind": "Request",
  "operationKind": "query",
  "name": "TreeLayoutQuery",
  "id": null,
  "text": "query TreeLayoutQuery(\n  $id: ID!\n) {\n  person(id: $id) {\n    ...Person_person\n    partners {\n      ...Person_person\n      id\n    }\n    children {\n      ...Person_person\n      id\n    }\n    id\n  }\n}\n\nfragment Person_person on Person {\n  id\n  name\n  gender\n  residence\n  birthYear\n  deathYear\n}\n",
  "metadata": {},
  "fragment": {
    "kind": "Fragment",
    "name": "TreeLayoutQuery",
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
            "selections": v3
          },
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "children",
            "storageKey": null,
            "args": null,
            "concreteType": "Person",
            "plural": true,
            "selections": v3
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "TreeLayoutQuery",
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
          v4,
          v5,
          v6,
          v7,
          v8,
          v9,
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "partners",
            "storageKey": null,
            "args": null,
            "concreteType": "Person",
            "plural": true,
            "selections": v10
          },
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "children",
            "storageKey": null,
            "args": null,
            "concreteType": "Person",
            "plural": true,
            "selections": v10
          }
        ]
      }
    ]
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = '3c3b61f341fbf1a8c0e9c76f8f067b96';
module.exports = node;
