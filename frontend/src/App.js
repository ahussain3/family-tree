import React, { Component } from 'react';
import './App.css';
import {SearchBar} from './components/SearchBar.js';
import { Container, Row, Col, FormGroup } from 'reactstrap';
import { TreeLayout } from './TreeLayout.js';

class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      rootPerson: '',
    };
  }

  setRootPerson = (id) => {
    this.setState({rootPerson: id})
  }

  render() {
    return (
      <Container>
        <Row>
          <Col>
            <FormGroup>
              <SearchBar
                setRootPerson={this.setRootPerson}
              ></SearchBar>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <TreeLayout id={this.state.rootPerson}></TreeLayout>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
