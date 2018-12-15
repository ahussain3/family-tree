import React from 'react';
import {PropTypes} from 'prop-types';
import {QueryRenderer, graphql} from 'react-relay';
import environment from '../relay.js';
import Person from './Person.js';
import {MarriageLayout} from './MarriageLayout.js'

export class TreeView extends React.Component {
    constructor(props, context) {
        super(props, context)
    }

    componentWillReceiveProps = (nextProps) => {
    }

    render() {
        const person = this.props.person
        const partner = this.props.partner
        if (partner) {
            return <MarriageLayout
                person={person}
                partner={partner}
            ></MarriageLayout>
        }

        return <Person
            person={this.props.person || null}
            // showHandleForChildren={showHandleForChildren}
            // showChildren={this.showChildren}
            >
        </Person>
    }
}

TreeView.propTypes = {
    person: Person
};