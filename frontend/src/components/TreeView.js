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

    hideChildren = () => {
        this.setState({shouldShowChildren: false})
    }

    hasChildren = () => {
        return this.props.partner != null
    }

    render() {
        const person = this.props.person
        const partner = this.props.partner
        const children = this.props.children

        if (this.state.shouldShowChildren) {
            return <>
                <Row className={"justify-content-center"}>
                    <MarriageLayout>
                        <Person person={person}
                            hasChildren={this.hasChildren()}
                            childrenAreVisible={true}
                            showChildren={this.showChildren}
                            hideChildren={this.hideChildren}
                        />
                        <Person person={partner}
                            hasChildren={false} // TODO: Better way to deal with this
                            childrenAreVisible={false}
                            showChildren={this.showChildren}
                            hideChildren={this.hideChildren}
                        />
                    </MarriageLayout>
                </Row>
                <Row className={"justify-content-center"}>
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
            hasChildren={this.hasChildren()}
            childrenAreVisible={false}
            showChildren={this.showChildren}
            hideChildren={this.hideChildren}
            >
        </Person>
    }
}

TreeView.propTypes = {
    person: Person
};