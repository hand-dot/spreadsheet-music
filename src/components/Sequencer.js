import React, { Component } from "react";
import Slider from "react-toolbox/lib/slider/Slider";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.css";

//constant
import { SCHEDULER_TICK, SCHEDULER_LOOK_AHEAD } from "../constants";

//component
import LEDLine from './LEDLine.js';

//script
import BufferLoader from "../scripts/bufferloader.js";
import timerWorker from "../scripts/timerWorker.js";
import soundObjs from "../scripts/sounds.js";

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

//handosontable
let hot;

class Sequencer extends Component {
  constructor() {
    super();
    this.state = {
      tracks: {
        P1: [
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          ''
        ],
        P2:[
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          ''   
        ]
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
        <LEDLine
          isPlaying={this.state.isPlaying}
          idxCurrent16thNote={this.state.idxCurrent16thNote}
        />
        <div className="sequencer">
          <div className="area-tracks">
            <div id="hot" />
          </div>
          <div className="area-play">
            <button
              className="button-play"
              onClick={() => this.togglePlayButton()}
            >
              {this.state.isPlaying ? "■STOP" : "▶PLAY!"}
            </button>
          </div>
          <div className="area-bpm">
            <span className="label-bpm">[bpm]</span>
            <div style={{ display: "inline-block", width: "200px" }}>
              <Slider
                min={40}
                max={250}
                step={1}
                editable
                pinned
                value={this.state.bpm}
                onChange={this.handleSliderChange.bind(this, "bpm")}
              />
            </div>
          </div>
          <div className="area-swing">
            <span className="label-swing">[swing]</span>
            <div style={{ display: "inline-block", width: "200px" }}>
              <Slider
                min={0}
                max={100}
                step={1}
                editable
                pinned
                value={this.state.swing}
                onChange={this.handleSliderChange.bind(this, "swing")}
              />
            </div>
          </div>
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

    let container = document.getElementById("hot");
    hot = new Handsontable(container, {
      data: values,
      colWidths: Math.round(window.innerWidth / 16),
      colHeaders: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      // rowHeaderWidth:Math.round(window.innerWidth / 17),
      // rowHeaders: keys
    });
  }

  handleSliderChange(slider, value) {
    const newState = {};
    newState[slider] = value;
    this.setState(newState);
  }

  toggleStep(idxTrack, idxNote) {
    let tr = this.state.tracks.slice();
    tr[idxTrack].steps[idxNote] =
      tr[idxTrack].steps[idxNote] === null ? "■" : null;
    this.setState({ tracks: tr });
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
      let [key, value] = entrie;
      let source;
      if (value[idxNote]) {
        source = audioContext.createBufferSource();
        source.buffer = bufferLoader.bufferObjs[value[idxNote]];
        source.connect(audioContext.destination);
        source.start(time);
      }
      //handosontableのセルの選択
      // hot.selectCell(0,this.state.idxCurrent16thNote,0,this.state.idxCurrent16thNote);
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
