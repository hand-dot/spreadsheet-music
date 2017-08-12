import React, { Component } from 'react';

function Square (props) {
    return (
        <button className="note" onClick={()=>props.onClick()}>
            {props.marking}
        </button>
    );
}

class Track extends Component {
  render() {
    return (
        <div className="track">
          <span className="track-name">{this.props.name}</span>
          {Array(16).fill().map((x,i) =>
            <Square 
              key={i}
              marking={this.props.squares[i]}
              onClick={()=>this.props.handler(i)}
            />)}
        </div>
    );
  }
}

export default Track;
