import React, { Component } from 'react';
import './App.css';
import {SearchBar} from './components/SearchBar.js';
import { Container, Row, Col, FormGroup } from 'reactstrap';
import { TreeLayout } from './TreeLayout.js';
import panAndZoomHoc from 'react-pan-and-zoom-hoc';

const InteractiveDiv = panAndZoomHoc('div');

class App extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      rootPerson: '',
      x: 0.5,
      y: 0.5,
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

  render() {
    const {x, y, scale} = this.state;

    return (<>
        <Container>
          <FormGroup>
            <SearchBar
              setRootPerson={this.setRootPerson}
            ></SearchBar>
          </FormGroup>
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
