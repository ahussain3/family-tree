import React from 'react';
import {PropTypes} from 'prop-types';
import {QueryRenderer, graphql} from 'react-relay';
import environment from './relay.js';
import {TreeView} from './components/TreeView.js'


const query = graphql`
    query TreeLayoutQuery($id: ID!) {
        person(id: $id) {
            ...Person_person
            partners {
                ...Person_person
            }
            children {
                ...Person_person
            }
        }
    }
`

export class TreeLayout extends React.Component {
    showChildren = (id) => {
        const person = this.people[id]
    }

    innerRender = (readyState) => {
        let {_, props} = readyState
        if (props == null || !props.person) { return <div></div> }
        var showHandleForChildren = false
        const person = props.person
        if (person.partners.length !== 0 || person.children.length !== 0 ) {
            showHandleForChildren = true
        }
        return <TreeView
            person={person||null}
            partner={person.partners[0]||null}
            children={person.children}
        ></TreeView>
    }

    render() {
        return <QueryRenderer
            environment={environment}
            render={this.innerRender}
            query={this.props.id ? query : ''}
            variables={{id: this.props.id}}
        />
    }
}

TreeView.propTypes = {
    id: PropTypes.string
};