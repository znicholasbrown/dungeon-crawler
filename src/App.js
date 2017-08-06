import React, { Component } from 'react';
import logo from './icon-sword.svg';
import './App.css';
import World from './world.js';

class App extends Component {

  render() {
    return (
      <div className="app">
        <div className="header">
          <h2>Dungeon <img src={logo} className="logo" alt="logo" /> Crawler</h2>
        </div>
        <div className="app-components">
          <World/>
        </div>
      </div>
    );
  }
}


export default App;
