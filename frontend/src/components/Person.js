import React from 'react';
import {createFragmentContainer, graphql} from 'react-relay';

class Person extends React.Component {
    render () {
        debugger
        return <h1>{this.props.person.name}</h1>
    }
}

export default createFragmentContainer(Person,
    graphql`
        fragment Person_person on Person {
            id
            name
            residence
        }
    `);