import React from 'react';
import {createFragmentContainer, graphql} from 'react-relay';
import {Button} from 'reactstrap';

class Person extends React.Component {
    handleClick = () => {
        this.props.showChildren(this.props.person.id)
    }

    render () {
        if (this.props.person == null) {
            return <div></div>
        }

        let lifespan = ""
        if (this.props.person.birthYear) {
            lifespan = this.props.person.birthYear + "-" + (this.props.person.deathYear || "")
        }

        return <div className="person">
            <h1>{this.props.person.name}</h1>
            <h2>{this.props.person.residence || ""}</h2>
            <p>{lifespan}</p>
            {this.props.showHandleForChildren && <Button size="sm" onClick={this.handleClick}>Show Children</Button>}
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