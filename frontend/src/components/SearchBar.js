import React from 'react';
import {QueryRenderer, graphql} from 'react-relay';
import {AsyncTypeahead} from 'react-bootstrap-typeahead';
import environment from '../relay.js';

const query = graphql`
    query SearchBarQuery($name: String!) {
        searchPersons(name: $name) {
            name
            residence
            birthYear
            deathYear
        }
    }
`
export class SearchBar extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
          searchText: '',
        };
    }

    renderResults = (persons) => {
        return persons.map(
            (person) => {return person.name}
        )
    }

    innerRender = (readyState) => {
        let {error, props} = readyState
        let isLoading = (error == null && props == null);

        return <AsyncTypeahead
            minLength={3}
            onSearch={(query) => {this.setState({searchText: query})}}
            onChange={(selected) => {this.props.setRootPerson(selected[0] || null)}}
            placeholder="Search for a person..."
            isLoading={isLoading}
            options={this.renderResults(props && props.searchPersons ? props.searchPersons : [])}
        />
    }

    render() {
        return <QueryRenderer
            environment={environment}
            render={this.innerRender}
            query={this.state.searchText.length > 0 ? query : null}
            variables={{name: this.state.searchText}}
        />
    }
}