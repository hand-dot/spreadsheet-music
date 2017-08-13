import React, { Component } from "react";
import UAParser from "ua-parser-js";
import "reset-css/reset.css";

//component
import Sequencer from "./Sequencer.js";

//style
import "../style/App.css";

class App extends Component {
  constructor() {
    super();
    this.state = {
      operatingCondition: false
    };
  }

  componentWillMount() {
    let parser = new UAParser();
    parser.setUA(window.navigator.userAgent);
    let result = parser.getResult();
    if (
      result.browser.name === "Chrome" &&
      result.device.type !== "mobile" &&
      result.device.type !== "tablet"
    ) {
      console.log("動作します。");
      this.setState({ operatingCondition: true });
    }
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>SpreadSheet meets Music</h2>
        </div>
        {(() => {
          if (this.state.operatingCondition) {
            return <Sequencer />;
          } else {
            return <p>デスクトップ版クロームブラウザ以外では動作しません。</p>;
          }
        })()}
      </div>
    );
  }

  componentDidMount() {}
}

export default App;
