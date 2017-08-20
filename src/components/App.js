import React, { Component } from 'react';
import ThemeProvider from 'react-toolbox/lib/ThemeProvider';
import UAParser from 'ua-parser-js';
import 'reset-css/reset.css';

// style
import '../style/App.css';

// component
import Sequencer from './Sequencer';
import CantPlay from './CantPlay';

// toolbox
import '../toolbox/theme.css';
import theme from '../toolbox/theme';

class App extends Component {
  constructor() {
    super();
    this.state = {
      operatingCondition: false,
    };
  }

  componentWillMount() {
    const parser = new UAParser();
    parser.setUA(window.navigator.userAgent);
    const result = parser.getResult();
    if (
      result.browser.name === 'Chrome' &&
      result.device.type !== 'mobile' &&
      result.device.type !== 'tablet'
    ) {
      this.setState({ operatingCondition: true });
    }
  }

  componentDidMount() {}

  render() {
    return (
      <ThemeProvider theme={theme}>
        <div className="App">
          <div className="App-header">
            <h1>SpreadSheet meets Music<span>(Beta)</span></h1>
          </div>
          <div className="App-body">
            {(() => {
              if (this.state.operatingCondition) {
                return <Sequencer />;
              }
              return <CantPlay />;
            })()}
          </div>
        </div>
      </ThemeProvider>
    );
  }
}

export default App;
