import React, { Component } from 'react';

class SequenceStep extends Component {
  render() {
    return (
      <div>
        {Array(16).fill().map((x, i) =>
          (<div
            className={
              (this.props.isPlaying && this.props.idxCurrent16thNote === (i + 1) % 16) ? 'step  step-playing' : 'step'
            }
            key={i}
            disabled
          />))}
      </div>
    );
  }
}

export default SequenceStep;
