import React from 'react';
import {createFragmentContainer, graphql} from 'react-relay';
import {Button} from 'reactstrap';

class Person extends React.Component {
    handleShowChildren = () => {
        if (this.props.childrenAreVisible) {
            this.props.hideChildren(this.props.person.id)
        } else {
            this.props.showChildren(this.props.person.id)
        }
    }

    handleShowParents = () => {
        if (this.props.parentsAreVisible) {
            this.props.hideParents(this.props.person.id)
        } else {
            this.props.showParents(this.props.person.id)
        }
    }

    render () {
        if (this.props.person == null) {
            return <div></div>
        }

        let lifespan = ""
        if (this.props.person.birthYear) {
            lifespan = this.props.person.birthYear + "-" + (this.props.person.deathYear || "")
        }

        return <div className={"person " + this.props.className} >
            <h1>{this.props.person.name}</h1>
            <h2>{this.props.person.residence || ""}</h2>
            <p>{lifespan}</p>

            {this.props.hasParents && !this.props.parentsAreVisible && <Button size="sm" color="link" onClick={this.handleShowParents}>Parents</Button>}
            {this.props.hasParents && this.props.parentsAreVisible && <Button size="sm" color="link" onClick={this.handleShowParents}>Hide Parents</Button>}

            {this.props.hasChildren && !this.props.childrenAreVisible && <Button size="sm" color="link" onClick={this.handleShowChildren}>Children</Button>}
            {this.props.hasChildren && this.props.childrenAreVisible && <Button size="sm" color="link" onClick={this.handleShowChildren}>Hide Children</Button>}
        </div>
    }
}

export default createFragmentContainer(Person,
    graphql`
        fragment Person_person on Person {
            id
            name
            gender
            residence
            birthYear
            deathYear
        }
    `);