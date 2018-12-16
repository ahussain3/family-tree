import React from 'react';
import {PropTypes} from 'prop-types';
import Person from './Person.js';
import {MarriageLayout} from './MarriageLayout.js'
import SideBySide from './SideBySide.js';
import { TreeLayout } from '../TreeLayout.js';
import { Container, Row, Col, FormGroup } from 'reactstrap';

export class TreeView extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            shouldShowChildren: false
        }
    }

    showChildren = () => {
        this.setState({shouldShowChildren: true})
    }

    showHandleForChildren = () => {
        return this.props.partner != null
    }

    render() {
        const person = this.props.person
        const partner = this.props.partner
        const children = this.props.children

        if (this.state.shouldShowChildren) {
            return <>
                <Row>
                    <MarriageLayout
                        person={person}
                        partner={partner}
                    ></MarriageLayout>
                </Row>
                <Row>
                    <SideBySide>
                        {children.map((child, i) => <TreeLayout
                            id={child.__id}
                            key={i}/>)}
                    </SideBySide>
                </Row>
            </>
        }

        return <Person
            person={this.props.person || null}
            showHandleForChildren={this.showHandleForChildren()}
            showChildren={this.showChildren}
            >
        </Person>
    }
}

TreeView.propTypes = {
    person: Person
};