import React from 'react';
import {FormControl} from 'react-bootstrap';

export class SearchBar extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleChange = this.handleChange.bind(this);

        this.state = {
          value: ''
        };
    }

    handleChange(e) {
        this.setState({ value: e.target.value });
    }

    render() {
        return <FormControl
            type="text"
            value={this.state.value}
            placeholder="Enter text"
            onChange={this.handleChange}
        />
    }
}