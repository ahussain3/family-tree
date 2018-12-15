import React from 'react';
import {PropTypes} from 'prop-types';
import {QueryRenderer, graphql} from 'react-relay';
import environment from '../relay.js';
import Person from './Person.js';
import {MarriageLayout} from './MarriageLayout.js'
import SideBySide from './SideBySide.js';

export class TreeView extends React.Component {
    constructor(props, context) {
        super(props, context)
    }

    componentWillReceiveProps = (nextProps) => {
    }

    render() {
        const person = this.props.person
        const partner = this.props.partner
        const children = this.props.children

        if (partner) {
            return <>
                <MarriageLayout
                    person={person}
                    partner={partner}
                ></MarriageLayout>
                <SideBySide>
                    {children.map((child, i) => <Person person={child} key={i}/>)}
                </SideBySide>
            </>
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