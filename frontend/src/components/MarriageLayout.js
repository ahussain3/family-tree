import React from 'react';
import Person from './Person.js'
import SideBySide from './SideBySide.js'

export class MarriageLayout extends React.Component {
    // Frustrating that I can't inspect the data here for personA and personB
    // so I can't do things like render men on the left and women on the right.
    render() {
        return <SideBySide>
            <Person person={this.props.person} />
            <Person person={this.props.partner} />
        </SideBySide>
    }
}
