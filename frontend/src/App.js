import React, { Component } from 'react';
import './App.css';
import {SearchBar} from './components/SearchBar.js';
import environment from './relay.js';
import {QueryRenderer, graphql} from 'react-relay';

const AppQuery = graphql`
  query AppQuery {
    searchPersons(name:"Zahid") {
      name
    }
  }
`
class App extends Component {
  render() {
    return (
      <QueryRenderer
      environment={environment}
      query={AppQuery}
      render={({error, props}) => {
        return <div className="App">
          <SearchBar></SearchBar>
        </div>
      }}
      />
    );
  }
}

export default App;
