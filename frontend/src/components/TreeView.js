import React from 'react';
import {PropTypes} from 'prop-types';
import Person from './Person.js';
import {MarriageLayout} from './MarriageLayout.js'
import SideBySide from './SideBySide.js';
import { TreeLayout } from '../TreeLayout.js';
import { Row } from 'reactstrap';

export class TreeView extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.state = {
            shouldShowChildren: false,
            shouldShowParents: false
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

    hasParents = () => {
        return this.props.parents == null || this.props.parents.length > 0
    }

    showParents = () => {
        this.setState({shouldShowParents: true})
    }

    hideParents = () => {
        this.setState({shouldShowParents: false})
    }

    render() {
        const person = this.props.person
        const partner = this.props.partner
        const children = this.props.children
        const parents = this.props.parents

        if (this.state.shouldShowParents) {
            return <TreeLayout id={parents[0].__id}></TreeLayout>
        }

        if (this.state.shouldShowChildren) {
            return <>
                <Row className={"justify-content-center"}>
                    <MarriageLayout>
                        <Person person={person}
                            className={"dad"}
                            hasChildren={this.hasChildren()}
                            childrenAreVisible={true}
                            showChildren={this.showChildren}
                            hideChildren={this.hideChildren}
                            hasParents={this.hasParents()}
                            parentsAreVisible={false}
                        />
                        <Person person={partner}
                            className={"mom"}
                            hasChildren={false} // TODO: Better way to deal with this
                            childrenAreVisible={false}
                            showChildren={this.showChildren}
                            hideChildren={this.hideChildren}
                            hasParents={this.hasParents()}
                            parentsAreVisible={false}
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

        return <Row className={"justify-content-center"}>
            <Person
                person={this.props.person || null}
                className={"child"}
                hasChildren={this.hasChildren()}
                childrenAreVisible={false}
                showChildren={this.showChildren}
                hideChildren={this.hideChildren}
                hasParents={this.hasParents()}
                parentsAreVisible={false}
                showParents={this.showParents}
                hideParents={this.hideParents}
                >
            </Person>
        </Row>
    }
}

TreeView.propTypes = {
    person: Person
};