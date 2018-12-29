import React from 'react';
import {PropTypes} from 'prop-types';
import {QueryRenderer, graphql} from 'react-relay';
import environment from './relay.js';
import {TreeView} from './components/TreeView.js'
import { Container, Row, Col, FormGroup } from 'reactstrap';


// Responsible for going to the server and retrieving in depth information for a particular
// person from the id of that person alone.

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
            parents {
                ...Person_person
            }
        }
    }
`

export class TreeLayout extends React.Component {
    innerRender = (readyState) => {
        let {_, props} = readyState
        if (props == null || !props.person) { return <div></div> }
        const person = props.person
        return <Container>
            <TreeView
                person={person||null}
                partner={person.partners[0]||null}
                children={person.children}
                parents={person.parents}
            ></TreeView>
        </Container>
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