import React from 'react';
import Person from './Person.js'
import SideBySide from './SideBySide.js'

export default function MarriageLayout(personA, personB) {
    return class extends React.Component {
        render() {
            return <SideBySide>
                <Person person={personA} />
                <Person person={personB} />
            </SideBySide>
        }
    }
}
