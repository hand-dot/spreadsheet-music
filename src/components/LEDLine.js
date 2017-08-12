import React, { Component } from 'react';

class LEDLine extends Component {
  render() {
    return (
        <div className="track">
          <span className="track-name"></span>
          {Array(16).fill().map((x,i) =>
          <div className={
            (this.props.isPlaying && this.props.idxCurrent16thNote === (i+1)%16)? "led  led-playing" : "led"
            } key={i} disabled ></div>)}
        </div>
    );
  }
}

export default LEDLine;