import _ from 'lodash';
import uuid from 'uuid';
import React, { Component } from 'react';
import Slider from 'react-toolbox/lib/slider';
import Button from 'react-toolbox/lib/button/Button';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';

// constant
import { SCHEDULER_TICK, SCHEDULER_LOOK_AHEAD, NUM_OF_INSTRUMENTS } from '../constants';

// data
import { drum, none } from '../data/tracks';

// component
import SaveDialog from './SaveDialog';
import SequenceStep from './SequenceStep';

// script
import BufferLoader from '../scripts/bufferloader';
import timerWorker from '../scripts/timerWorker';
import soundObjs from '../scripts/sounds';

// style
import '../style/Sequencer.css';

const parseUrlHash = () => parseInt(window.location.hash.replace('#', ''), 10) || 1;

// audio context initialization
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

// loadimg audio buffers
const bufferLoader = new BufferLoader(audioContext, soundObjs, () =>
  console.log('audio resource loading finished.'),
);
bufferLoader.load();
timerWorker.postMessage({ interval: SCHEDULER_TICK });

// handosontable
let hot = null;

class Sequencer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tracks: [
        [_.cloneDeep(drum), _.cloneDeep(none)],
        [_.cloneDeep(drum), _.cloneDeep(none)],
      ],
      bpm: 100,
      swing: 0,
      isPlaying: false,
      idxCurrent16thNote: 0,
      currentBarsCount: 1,
      startTime: 0.0,
      nextNoteTime: 0.0,
    };
    timerWorker.onmessage = function (e) {
      if (e.data === 'tick') {
        this.schedule();
      }
    }.bind(this);
  }

  componentWillMount() {
    window.location.hash = 1;
  }

  componentDidMount() {
    const self = this;
    const autocompleteSource = [];
    Object.entries(soundObjs).map((entrie) => {
      autocompleteSource.push(entrie[0]);
      return entrie;
    });

    const container = document.getElementById('hot');
    hot = Handsontable(container, {
      autoInsertRow: false,
      data: self.getData(),
      colWidths: Math.round(window.innerWidth / 16) - (20 / 16),
      colHeaders: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      columns: Array(16).fill({
        type: 'autocomplete',
        source: autocompleteSource,
        strict: true,
        allowInvalid: false,
      }),
    });

    Handsontable.dom.addEvent(window, 'hashchange', () => {
      hot.loadData(self.getData());
      self.setState({
        currentBarsCount: parseUrlHash(),
      });
    });
  }

  getData() {
    const page = parseUrlHash();
    const start = (page - 1) * NUM_OF_INSTRUMENTS;
    const end = page * NUM_OF_INSTRUMENTS;
    return _.slice(_.flatten(this.state.tracks), start, end);
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

  addBars() {
    const tmp = _.cloneDeep(this.state.tracks);
    tmp.push([_.cloneDeep(none), _.cloneDeep(none)]);
    hot.updateSettings({
      data: tmp,
    });
    this.setState({
      tracks: tmp,
    });
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
    const track = this.state.tracks[this.state.currentBarsCount - 1];
    Object.entries(track).map((entrie) => {
      const value = entrie[1];
      let source;
      if (value[idxNote]) {
        source = audioContext.createBufferSource();
        source.buffer = bufferLoader.bufferObjs[value[idxNote]];
        source.connect(audioContext.destination);
        source.start(time);
        source.stop(time + (this.state.bpm / 200)); // FIXME 適当
      }
      return source;
    });
    if (this.state.idxCurrent16thNote === 15) {
      const urlHash = parseUrlHash();
      this.setState({
        currentBarsCount: urlHash === this.state.tracks.length ? 1 : urlHash + 1,
      });
      window.location.hash = this.state.currentBarsCount;
    }
  }

  nextNote() {
    const secondsPerBeat = 60.0 / this.state.bpm;
    const noteRateWithSwingCalc =
      this.state.idxCurrent16thNote % 2 === 0
      // 1 / 1200 = 0.0008333333333333334
        ? (1 / 4) + (0.00083 * this.state.swing)
        : (1 / 4) - (0.00083 * this.state.swing);
    this.setState({
      nextNoteTime: this.state.nextNoteTime + (noteRateWithSwingCalc * secondsPerBeat),
      idxCurrent16thNote: (this.state.idxCurrent16thNote + 1) % 16,
    });
  }

  render() {
    return (
      <div className="sequencer">
        <h3>How to Play → <a href="https://youtu.be/FcaDeMz2H28">https://youtu.be/FcaDeMz2H28</a></h3>
        <hr />
        <SequenceStep
          isPlaying={this.state.isPlaying}
          idxCurrent16thNote={this.state.idxCurrent16thNote}
        />
        <div className="handsontable" id="hot" />
        <div className="pagination">
          {Array(this.state.tracks.length).fill().map((x, i) =>
            (<a className={this.state.currentBarsCount === i + 1 ? 'active' : ''} href={`#${i + 1}`} key={uuid()} >{i + 1}</a>))}
        </div>
        <div className="pagination">
          <a href={`#${this.state.tracks.length}`} onClick={() => this.addBars()}>+</a>
        </div>
        <div>
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
          <SaveDialog />
        </div>
      </div>
    );
  }
}

export default Sequencer;
