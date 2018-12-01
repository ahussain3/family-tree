import React from 'react';
import {QueryRenderer, graphql} from 'react-relay';
import {AsyncTypeahead} from 'react-bootstrap-typeahead';
import environment from '../relay.js';

const query = graphql`
    query SearchBarQuery($name: String!) {
        searchPersons(name: $name) {
            id
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

    renderMenu = (results, menuProps) => {
        return results.map(
            (person) => {return person.name}
        )
    }

    onSelected = (selection) => {
        if (selection === undefined || selection.length === 0) {
            this.props.setRootPerson(null)
            return
        }
        this.props.setRootPerson(selection[0].id)
    }

    innerRender = (readyState) => {
        let {error, props} = readyState
        let isLoading = (error == null && props == null);

        return <AsyncTypeahead
            minLength={3}
            onSearch={(query) => {this.setState({searchText: query})}}
            onChange={(selected) => {this.onSelected(selected)}}
            placeholder="Search for a person..."
            isLoading={isLoading}
            options={props && props.searchPersons ? props.searchPersons : []}
            filterBy={['name']}
            labelKey={'name'}
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