import React, { Component } from 'react';
import Slider from 'react-toolbox/lib/slider/Slider';

//constant
import {SCHEDULER_TICK,SCHEDULER_LOOK_AHEAD} from '../constants'

//script
import BufferLoader from '../scripts/bufferloader.js';
import timerWorker from '../scripts/timerWorker.js';
import sounds from '../scripts/sounds.js';

//component
import Track from './Track.js';
import LEDLine from './LEDLine.js';

//style
import '../style/Sequencer.css';

//audio context initialization
window.AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext = new AudioContext();

//loadimg audio buffers
let bufferLoader = new BufferLoader(
  audioContext,
  sounds,
  ()=>console.log('audio resource loading finished.'));
bufferLoader.load();

timerWorker.postMessage({"interval": SCHEDULER_TICK});

class Sequencer extends Component {
  constructor() {
    super();
    this.state = {
      tracks: [
        {name:"hihat-open",
         steps: [null,null,null,null,null,null,null,null,null,null,'■',null,null,null,null,null]},
        {name:"hihat-close",
         steps: ['■','■','■',null,'■',null,'■',null,'■',null,null,null,'■',null,'■',null]},
        {name:"snare",
         steps: [null,null,null,null,'■',null,null,null,null,null,null,null,'■',null,null,'■']},
        {name:"kick",
         steps: ['■',null,null,null,null,null,null,'■',null,'■','■',null,null,'■',null,null]},
      ],
      bpm: 100,
      isPlaying: false,
      idxCurrent16thNote: 0,
      startTime: 0.0,
      nextNoteTime: 0.0,
      swing: 0
    };
    timerWorker.onmessage = function(e) {
      if(e.data==="tick"){
            this.schedule();
      }
    }.bind(this);
  }

  render() {
    return (
      <div className="sequencer">
        <div className="area-tracks">
          {Array(4).fill().map((x,i) =>
            <Track 
              key={i}
              name={this.state.tracks[i].name}
              squares={this.state.tracks[i].steps}
              handler={(idx)=>this.toggleStep(i, idx)}
            />
            )
          }
          <LEDLine
            isPlaying={this.state.isPlaying}
            idxCurrent16thNote={this.state.idxCurrent16thNote}
          />
        </div>
        <hr />
        <div className="area-play">
          <button className="button-play" onClick={()=>this.togglePlayButton()}>
            {this.state.isPlaying ? '■STOP' : '▶PLAY!'}
          </button>
        </div>
        <div className="area-shuffle">
          <button className="button-shuffle" onClick={()=>this.shuffleNotes()}>SHUFFLE</button>
        </div>
        <div className="area-bpm">
          <span className="label-bpm">[bpm]</span>
          <div style={{display: 'inline-block', width: '200px'}}>
            <Slider min={40} max={250} step={1}
              editable pinned value={this.state.bpm} onChange={this.handleSliderChange.bind(this, 'bpm')}/>
          </div>
        </div>
        <div className="area-swing">
          <span className="label-swing">[swing]</span>
          <div style={{display: 'inline-block', width: '200px'}}>
            <Slider min={0} max={100} step={1}
              editable pinned value={this.state.swing} onChange={this.handleSliderChange.bind(this, 'swing')}/>
          </div>
        </div>
      </div>
    );
  }

  handleSliderChange(slider, value){
    const newState = {};
    newState[slider] = value;
    this.setState(newState);
  }

  shuffleNotes(){
    let tr = this.state.tracks.slice();
    tr[0].steps = this.generateSequence(0.1);
    tr[1].steps = this.generateSequence(0.6);
    tr[2].steps = this.generateSequence(0.25);
    tr[3].steps = this.generateSequence(0.33);
    this.setState({tracks: tr});
  }

  generateSequence(density){
    let newSeq = Array(16).fill().map((x,i) =>{
      let random = Math.random();
      return random <= density ? '■' : null;
    });
    return newSeq;
  }

  toggleStep(idxTrack, idxNote) {
    let tr = this.state.tracks.slice();
    tr[idxTrack].steps[idxNote] = tr[idxTrack].steps[idxNote] === null ? '■' : null;
    this.setState({tracks: tr});
  }

  togglePlayButton(){
      if (this.state.isPlaying === false) {
          timerWorker.postMessage("start");
          this.setState({
            // to avoid first note delay
            nextNoteTime: audioContext.currentTime + SCHEDULER_TICK/1000,
            isPlaying: true,
          });
      } else {
          timerWorker.postMessage("stop");
          this.setState({
            idxCurrent16thNote: 0,
            isPlaying: false,
          });
      }
  }

  schedule() {
    while (this.state.nextNoteTime < audioContext.currentTime + SCHEDULER_LOOK_AHEAD ) {
        this.scheduleSound( this.state.idxCurrent16thNote, this.state.nextNoteTime );
        this.nextNote();
    }
  }

  scheduleSound(idxNote, time) {
      this.state.tracks.map((tr, i) =>{
        let source
        if(tr.steps[idxNote]){
            source = audioContext.createBufferSource();
            source.buffer = bufferLoader.bufferList[i];
            source.connect(audioContext.destination);
            source.start(time);
        }
        return source;
      });
  }

  nextNote() {
      let secondsPerBeat = 60.0 / this.state.bpm;
      let noteRateWithSwingCalc = 
        this.state.idxCurrent16thNote % 2 === 0 ?
        1/4 + 1/1200*this.state.swing : 1/4 - 1/1200*this.state.swing;
      this.setState({
        nextNoteTime: this.state.nextNoteTime + noteRateWithSwingCalc * secondsPerBeat,
        idxCurrent16thNote: (this.state.idxCurrent16thNote + 1) % 16,
    });
  }
}

export default Sequencer;
