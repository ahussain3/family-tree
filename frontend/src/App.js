import React, { Component } from 'react';
import './App.css';
import {SearchBar} from './components/SearchBar.js';
import { Container, Row, Col, FormGroup, Button, Navbar, NavItem, Nav } from 'reactstrap';
import { TreeLayout } from './TreeLayout.js';
import panAndZoomHoc from 'react-pan-and-zoom-hoc';
import {SteppedLineTo, DrawLinesTo} from './components/Line.js';

const InteractiveDiv = panAndZoomHoc('div');

const X_START = 0.4
const Y_START = 0.6

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
    const style = {
      delay: true,
      borderColor: 'black',
      borderStyle: 'solid',
      borderWidth: 3,
    };

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
        <Container>
          <div id="container" className="flex-container" style={{width:500}}>
            <div id="a" style={{width:100, height: 100, border: "1px solid black", margin: 20}}>Father</div>
            <div id="b" style={{width:100, height: 100, border: "1px solid black", margin: 20}}>Mother</div>
          </div>
          <div id="container" className="flex-container" style={{width:500}}>
            <div id="c1" style={{width:100, height: 100, border: "1px solid black", margin: 20}}>Child</div>
            <div id="c2" style={{width:100, height: 100, border: "1px solid black", margin: 20}}>Child</div>
            <div id="c3" style={{width:100, height: 100, border: "1px solid black", margin: 20}}>Child</div>
          </div>
          {/* <SteppedLineTo from="a" to="b" orientation="h" fromAnchor="right" toAnchor="left" {...style}/> */}
          <DrawLinesTo parent_a="a" parent_b="b" children={["c1", "c2", "c3"]} {...style}></DrawLinesTo>
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
          <div style={{position: 'absolute', bottom: `${y * 100}%`, right: `${x * 100}%`, width: 200, height: 200}}>
            <TreeLayout id={this.state.rootPerson}></TreeLayout>
          </div>
        </InteractiveDiv>
      </>
    );
  }
}

export default App;
