import React from 'react';
import {createRefetchContainer, graphql} from 'react-relay';
import {AsyncTypeahead} from 'react-bootstrap-typeahead';

class SearchBarComponent extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.handleChange = this.handleChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);

        this.state = {
          searchText: '',
          selected: null
        };
    }

    handleChange(selected) {
        this.setState({selected})
        // this.setState({ value: e.target.value });
    }

    handleSearch(query) {
        this.props.relay.refetch(
            {name: query},
            null,
            () => {console.log("Research completed")},
            {}
        )
    }

    render() {
        return <AsyncTypeahead
            minLength={3}
            onSearch={this.handleSearch}
            placeholder="Search for a person..."
        />
    }
}

export const SearchBar = createRefetchContainer(SearchBarComponent, graphql`
    fragment SearchBar_person on Person {
        id
        name
        residence
        birthYear
        deathYear
    }`, graphql `
    query SearchBarQuery($name: String!) {
        searchPersons(name: $name) {
            ...SearchBar_person
        }
    }
    `
)