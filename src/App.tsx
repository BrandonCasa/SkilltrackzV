import { Menu } from 'electron';
import React, { useState, Component } from 'react';
import {
  Button,
  Form,
  FormControl,
  Nav,
  Navbar,
  NavDropdown,
} from 'react-bootstrap';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';
import { initCapture, sendCanvasAI } from './recorder';
import * as tf from '@tensorflow/tfjs';
import path from 'path';
import fs from 'fs';
import { Chart } from 'chart.js';
const Home = (props: { theModel: any }) => {
  return (
    <div>
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">Skilltrackz-V</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <NavDropdown title="Dropdown" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href="#about">About</Nav.Link>
            <Nav.Item>
              <Button>thing</Button>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
};

export default class App extends Component<
  {},
  { modelLoaded: any; theModel: any; theApp: any; prediction: any }
> {
  constructor(props: any) {
    super(props);
    const { app } = window.require('electron').remote;

    const RESOURCES_PATH = app.isPackaged
      ? path.join(process.resourcesPath, 'assets')
      : path.join(__dirname, '../assets');
    const getAssetPath = (...paths: string[]): string => {
      return path.join(RESOURCES_PATH, ...paths);
    };

    let jsonModel = JSON.parse(
      fs.readFileSync(getAssetPath('model/model.json')).toString()
    );
    jsonModel.weightsManifest[0].paths[0] = getAssetPath(
      'model/group1-shard1of7.bin'
    ).toString();
    jsonModel.weightsManifest[0].paths[1] = getAssetPath(
      'model/group1-shard2of7.bin'
    ).toString();
    jsonModel.weightsManifest[0].paths[2] = getAssetPath(
      'model/group1-shard3of7.bin'
    ).toString();
    jsonModel.weightsManifest[0].paths[3] = getAssetPath(
      'model/group1-shard4of7.bin'
    ).toString();
    jsonModel.weightsManifest[0].paths[4] = getAssetPath(
      'model/group1-shard5of7.bin'
    ).toString();
    jsonModel.weightsManifest[0].paths[5] = getAssetPath(
      'model/group1-shard6of7.bin'
    ).toString();
    jsonModel.weightsManifest[0].paths[6] = getAssetPath(
      'model/group1-shard7of7.bin'
    ).toString();
    fs.writeFileSync(
      getAssetPath('model/model.json'),
      JSON.stringify(jsonModel)
    );
    tf.loadLayersModel(getAssetPath('model/model.json')).then((model: any) => {
      this.setState({ theModel: model });
      initCapture(model, (value: any) => this.setState({ prediction: value }));
    });
    console.log('Loaded Model Successfully');

    this.state = {
      modelLoaded: true,
      theModel: {},
      theApp: app,
      prediction: '',
    };
  }

  componentDidMount() {
    let ctx = (document.getElementById(
      'srChart'
    ) as HTMLCanvasElement).getContext('2d');
    if (ctx !== null) {
      var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
          datasets: [
            {
              label: '# of Votes',
              data: [12, 19, 3, 5, 2, 3],
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        },
      });
    }
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route path="/">
            <Home theModel={this.state.theModel} />
            {this.state.prediction}
          </Route>
        </Switch>
        <canvas
          id="srChart"
          style={{ width: '200px' }}
          className="Chart"
        ></canvas>
        <video id="videoElement" className="Hidden"></video>
        <canvas
          id="canvasElementAI"
          className="Hidden"
          width="224"
          height="224"
        ></canvas>
        <canvas
          id="canvasElementText"
          className="Hidden"
          width="1920"
          height="1080"
        ></canvas>
      </Router>
    );
  }
}
