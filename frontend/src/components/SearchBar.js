import React from 'react';
import {FormControl} from 'react-bootstrap';
import {
    createFragmentContainer,
    graphql
  } from 'react-relay';
import {Typeahead} from 'react-bootstrap-typeahead';

export class SearchBar extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleChange = this.handleChange.bind(this);

        this.state = {
          value: ''
        };
    }

    handleChange(selected) {
        this.setState({selected})
        // this.setState({ value: e.target.value });
    }

    render() {
        return <Typeahead
            onChange={this.handleChange}
            options={["Andy", "James", "Zahid"]}
            selected={this.state.selected}
        />
        // return <FormControl
        //     type="text"
        //     value={this.state.value}
        //     placeholder="Enter text"
        //     onChange={this.handleChange}
        // />
    }
}
