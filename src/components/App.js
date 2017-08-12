import React, { Component } from 'react';
import 'reset-css/reset.css';

//component
import Sequencer from './Sequencer.js';

//style
import '../style/App.css';

//logo
import logo from '../resource/logo.svg';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <Sequencer/>
      </div>
    );
  }
}

export default App;
