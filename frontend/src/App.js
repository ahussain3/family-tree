import React, { Component } from 'react';
import './App.css';
import {SearchBar} from './components/SearchBar.js';
import { Container, Row, Col, FormGroup, Button, Navbar, NavItem, Nav } from 'reactstrap';
import { TreeLayout } from './TreeLayout.js';
import panAndZoomHoc from 'react-pan-and-zoom-hoc';

const InteractiveDiv = panAndZoomHoc('div');

const X_START = 0.5
const Y_START = 0.9

class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      rootPerson: '',
      x: X_START,
      y: Y_START,
      scale: 1
    };
  }

  setRootPerson = (id) => {
    this.setState({rootPerson: id})
  }

  handlePanAndZoom = (x, y, scale) => {
    console.log("Pan: " + x + ", " + y + ", Scale: " + scale)
    this.setState({x, y, scale});
  }

  handlePanMove = (x, y) => {
    console.log("Pan: " + x + ", " + y)
    this.setState({x, y});
  }

  resetPan = () => {
    this.setState({x: X_START, y: Y_START})
  }

  render() {
    const {x, y, scale} = this.state;

    return (<>
        <Container>
          <Navbar color="white" light expand="md">
            <FormGroup>
              <SearchBar
                setRootPerson={this.setRootPerson}
              ></SearchBar>
            </FormGroup>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <Button onClick={this.resetPan}>Reset</Button>
              </NavItem>
            </Nav>
          </Navbar>
        </Container>
        <InteractiveDiv
            x={x}
            y={y}
            className='pan-container'
            scale={scale}
            scaleFactor={Math.sqrt(2)}
            minScale={this.state.scale}
            maxScale={this.state.scale}
            onPanAndZoom={(x, y, scale) => this.handlePanAndZoom(x, y, scale)}
            onPanMove={(x, y) => this.handlePanMove(x, y)}
        >
          <div style={{position: 'absolute', bottom: `${y * 100}%`, right: `${x * 100}%`, width: 1, height: 1, backgroundColor: 'black'}}>
            <TreeLayout id={this.state.rootPerson}></TreeLayout>
          </div>
        </InteractiveDiv>
      </>
    );
  }
}

export default App;
