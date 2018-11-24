import React, { Component } from 'react';
import './App.css';
import {SearchBar} from './components/SearchBar.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <SearchBar></SearchBar>
      </div>
    );
  }
}

export default App;
