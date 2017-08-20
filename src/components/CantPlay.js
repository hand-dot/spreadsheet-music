import React, { Component } from 'react';

// style
import '../style/CantPlay.css';

class CantPlay extends Component {
  render() {
    return (
      <div className="cantplay">
        <p>Can Play Only the Chrome of Desktop</p>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/FcaDeMz2H28" frameBorder="0" allowFullScreen />
      </div>
    );
  }
}

export default CantPlay;
