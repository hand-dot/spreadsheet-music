import React, { Component } from 'react';
import Slider  from 'react-toolbox/lib/slider';
import Button  from 'react-toolbox/lib/button/Button';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';

//constant
import { SCHEDULER_TICK, SCHEDULER_LOOK_AHEAD } from '../constants';

//component
import SequenceStep from './SequenceStep';

//script
import BufferLoader from '../scripts/bufferloader';
import timerWorker from '../scripts/timerWorker';
import soundObjs from '../scripts/sounds';

//style
import '../style/Sequencer.css';

//audio context initialization
window.AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext = new AudioContext();

//loadimg audio buffers
let bufferLoader = new BufferLoader(audioContext, soundObjs, () =>
  console.log("audio resource loading finished.")
);
bufferLoader.load();
timerWorker.postMessage({ interval: SCHEDULER_TICK });

//handsontable
let hot;

class Sequencer extends Component {
  constructor() {
    super();
    this.state = {
      tracks: {
        P1: [],
        P2:[]
      },
      bpm: 100,
      isPlaying: false,
      idxCurrent16thNote: 0,
      startTime: 0.0,
      nextNoteTime: 0.0,
      swing: 0
    };
    timerWorker.onmessage = function(e) {
      if (e.data === "tick") {
        this.schedule();
      }
    }.bind(this);
  }

  render() {
    return (
      <div>
        <h3>How to Play → <a href="https://youtu.be/FcaDeMz2H28">https://youtu.be/FcaDeMz2H28</a></h3>
        <SequenceStep
          isPlaying={this.state.isPlaying}
          idxCurrent16thNote={this.state.idxCurrent16thNote}
        />
        <div className="sequencer">
          <div className="handsontable" id="hot" />
          <p>BPM</p>
          <Slider
            min={0}
            max={250}
            step={1}
            editable
            pinned
            value={this.state.bpm}
            onChange={this.handleSliderChange.bind(this, "bpm")}
          />
          <p>Swing</p>
          <Slider
            min={0}
            max={100}
            step={1}
            editable
            pinned
            value={this.state.swing}
            onChange={this.handleSliderChange.bind(this, "swing")}
          />
          <Button raised label={this.state.isPlaying ? "STOP" : "PLAY"} onClick={() => this.togglePlayButton()}/>
        </div>
      </div>
    );
  }

  componentDidMount() {
    let keys = [];
    let values = [];
    Object.entries(this.state.tracks).map((entrie, i) => {
      let [key, value] = entrie;
      keys.push(key);
      values.push(value);
      return entrie;
    });

    let autocompleteSource = [];
    Object.entries(soundObjs).map((entrie, i) => {
      autocompleteSource.push(entrie[0]);
      return entrie;
    });

    let container = document.getElementById("hot");
    hot = new Handsontable(container, {
      autoInsertRow:false,
      data: values,
      colWidths: Math.round(window.innerWidth / 16) - 20/16,
      colHeaders: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      columns: Array(16).fill({
        type: 'autocomplete',
        source: autocompleteSource,
        strict: true,
        allowInvalid: false
      })
    });
  }

  handleSliderChange(slider, value) {
    const newState = {};
    newState[slider] = value;
    this.setState(newState);
  }

  togglePlayButton() {
    if (this.state.isPlaying === false) {
      timerWorker.postMessage("start");
      this.setState({
        // to avoid first note delay
        nextNoteTime: audioContext.currentTime + SCHEDULER_TICK / 1000,
        isPlaying: true
      });
    } else {
      timerWorker.postMessage("stop");
      this.setState({
        idxCurrent16thNote: 0,
        isPlaying: false
      });
    }
  }

  schedule() {
    while (this.state.nextNoteTime < audioContext.currentTime + SCHEDULER_LOOK_AHEAD) {
      this.scheduleSound(
        this.state.idxCurrent16thNote,
        this.state.nextNoteTime
      );
      this.nextNote();
    }
  }

  scheduleSound(idxNote, time) {
    Object.entries(this.state.tracks).map((entrie, i) => {
      let value = entrie[1];
      let source;
      if (value[idxNote]) {
        source = audioContext.createBufferSource();
        source.buffer = bufferLoader.bufferObjs[value[idxNote]];
        source.connect(audioContext.destination);
        source.start(time);
      }
      return source;
    });
  }

  nextNote() {
    let secondsPerBeat = 60.0 / this.state.bpm;
    let noteRateWithSwingCalc =
      this.state.idxCurrent16thNote % 2 === 0
        ? 1 / 4 + 1 / 1200 * this.state.swing
        : 1 / 4 - 1 / 1200 * this.state.swing;
    this.setState({
      nextNoteTime:
        this.state.nextNoteTime + noteRateWithSwingCalc * secondsPerBeat,
      idxCurrent16thNote: (this.state.idxCurrent16thNote + 1) % 16
    });
  }
}

export default Sequencer;
