import React from 'react';
import {PropTypes} from 'prop-types';
import {QueryRenderer, graphql} from 'react-relay';
import environment from '../relay.js';
import Person from './Person.js';
import MarriageLayout from './MarriageLayout.js'

const query = graphql`
    query TreeViewRootQuery($id: ID!) {
        person(id: $id) {
            ...Person_person
            partners {
                ...Person_person
            }
        }
    }
`

export class TreeView extends React.Component {
    innerRender = (readyState) => {
        let {_, props} = readyState
        if (props == null || !props.person) { return <div></div> }
        if (props.person.partners.length == 0) {
            return <Person person={props.person || null}></Person>
        }
        const MarriageLayoutCpt = MarriageLayout(props.person, props.person.partners[0])
        return <MarriageLayoutCpt />
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