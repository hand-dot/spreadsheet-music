import React, { Component } from 'react';
import Slider from 'react-toolbox/lib/slider';
import Button from 'react-toolbox/lib/button/Button';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';

// constant
import { SCHEDULER_TICK, SCHEDULER_LOOK_AHEAD } from '../constants';

// component
import SequenceStep from './SequenceStep';

// script
import BufferLoader from '../scripts/bufferloader';
import timerWorker from '../scripts/timerWorker';
import soundObjs from '../scripts/sounds';

// style
import '../style/Sequencer.css';

// audio context initialization
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

// loadimg audio buffers
const bufferLoader = new BufferLoader(audioContext, soundObjs, () =>
  console.log('audio resource loading finished.'),
);
bufferLoader.load();
timerWorker.postMessage({ interval: SCHEDULER_TICK });

class Sequencer extends Component {
  constructor() {
    super();
    this.state = {
      tracks: {
        drum: ['Kick', '', 'CloseHihat', '', 'Snare', '', 'CloseHihat', 'Kick', 'CloseHihat', 'Snare', 'OpenHihat', '', 'Kick', '', 'OpenHihat'],
        piano: ['C', '', '', '', '', '', '', 'D', '', '', '', '', '', '', '', ''],
      },
      bpm: 100,
      isPlaying: false,
      idxCurrent16thNote: 0,
      startTime: 0.0,
      nextNoteTime: 0.0,
      swing: 0,
    };
    timerWorker.onmessage = function (e) {
      if (e.data === 'tick') {
        this.schedule();
      }
    }.bind(this);
  }

  componentDidMount() {
    const keys = [];
    const values = [];
    Object.entries(this.state.tracks).map((entrie) => {
      const [key, value] = entrie;
      keys.push(key);
      values.push(value);
      return entrie;
    });

    const autocompleteSource = [];
    Object.entries(soundObjs).map((entrie) => {
      autocompleteSource.push(entrie[0]);
      return entrie;
    });

    const container = document.getElementById('hot');
    // const hot = 
    Handsontable(container, {
      autoInsertRow: false,
      data: values,
      colWidths: Math.round(window.innerWidth / 16) - (20 / 16),
      colHeaders: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      columns: Array(16).fill({
        type: 'autocomplete',
        source: autocompleteSource,
        strict: true,
        allowInvalid: false,
      }),
    });
  }

  handleSliderChange(slider, value) {
    const newState = {};
    newState[slider] = value;
    this.setState(newState);
  }

  togglePlayButton() {
    if (this.state.isPlaying === false) {
      timerWorker.postMessage('start');
      this.setState({
        // to avoid first note delay
        nextNoteTime: audioContext.currentTime + (SCHEDULER_TICK / 1000),
        isPlaying: true,
      });
    } else {
      timerWorker.postMessage('stop');
      this.setState({
        idxCurrent16thNote: 0,
        isPlaying: false,
      });
    }
  }

  schedule() {
    while (this.state.nextNoteTime < audioContext.currentTime + SCHEDULER_LOOK_AHEAD) {
      this.scheduleSound(
        this.state.idxCurrent16thNote,
        this.state.nextNoteTime,
      );
      this.nextNote();
    }
  }

  scheduleSound(idxNote, time) {
    Object.entries(this.state.tracks).map((entrie) => {
      const value = entrie[1];
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
    const secondsPerBeat = 60.0 / this.state.bpm;
    const noteRateWithSwingCalc =
      this.state.idxCurrent16thNote % 2 === 0
      // 1 / 1200 = 0.0008333333333333334
        ? (1 / 4) + (0.00083 * this.state.swing)
        : (1 / 4) - (0.00083 * this.state.swing);
    this.setState({
      nextNoteTime:
        this.state.nextNoteTime + (noteRateWithSwingCalc * secondsPerBeat),
      idxCurrent16thNote: (this.state.idxCurrent16thNote + 1) % 16,
    });
  }

  render() {
    return (
      <div className="sequencer">
        <h3>How to Play → <a href="https://youtu.be/FcaDeMz2H28">https://youtu.be/FcaDeMz2H28</a></h3>
        <SequenceStep
          isPlaying={this.state.isPlaying}
          idxCurrent16thNote={this.state.idxCurrent16thNote}
        />
        <div className="handsontable" id="hot" />
        <p>BPM</p>
        <Slider
          min={0}
          max={250}
          step={1}
          editable
          pinned
          value={this.state.bpm}
          onChange={this.handleSliderChange.bind(this, 'bpm')}
        />
        <p>Swing</p>
        <Slider
          min={0}
          max={100}
          step={1}
          editable
          pinned
          value={this.state.swing}
          onChange={this.handleSliderChange.bind(this, 'swing')}
        />
        <Button raised label={this.state.isPlaying ? 'STOP' : 'PLAY'} onClick={() => this.togglePlayButton()} />
      </div>
    );
  }
}

export default Sequencer;
