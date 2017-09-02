import _ from 'lodash';
import React, { Component } from 'react';
import Button from 'react-toolbox/lib/button/Button';
import Input from 'react-toolbox/lib/input/Input';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';

// constant
import { SCHEDULER_TICK, SCHEDULER_LOOK_AHEAD, NUM_OF_INSTRUMENTS, DEFAULT_TITLE } from '../constants';

// data
import { drum, none } from '../data/tracks';

// component
import SaveDialog from './SaveDialog';
import SequenceStep from './SequenceStep';
import SequencePager from './SequencePager';
import SequenceSlider from './SequenceSlider';

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
      title: DEFAULT_TITLE,
      tracks: [
        [_.cloneDeep(drum), _.cloneDeep(none)],
      ],
      bpm: 100,
      swing: 30,
      sustain: 50,
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

  handleChange(name, value) {
    this.setState({ ...this.state, [name]: value });
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
    if (hot) {
      const tracks = _.cloneDeep(this.state.tracks);
      tracks.push([_.cloneDeep(none), _.cloneDeep(none)]);
      hot.updateSettings({
        data: tracks,
      });
      this.setState({
        tracks,
      });
    }
  }

  removeBars(index, e) {
    e.stopPropagation();
    const ans = window.confirm(`remove this track[${index + 1}]?`);
    if (ans) {
      const tracks = _.cloneDeep(this.state.tracks);
      _.pullAt(tracks, index);
      window.location.hash = 1;
      this.setState({
        currentBarsCount: 1,
        tracks,
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
    const track = this.state.tracks[this.state.currentBarsCount - 1];
    Object.entries(track).map((entrie) => {
      const value = entrie[1];
      let source;
      if (value[idxNote]) {
        source = audioContext.createBufferSource();
        source.buffer = bufferLoader.bufferObjs[value[idxNote]];
        source.connect(audioContext.destination);
        source.start(time);
        source.stop(time + (this.state.sustain / 100));
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
        <section>
          <Input type="text" label="Title" name="title" minLength={1} maxLength={32} value={this.state.title} onChange={this.handleChange.bind(this, 'title')} />
        </section>
        <SequenceStep
          isPlaying={this.state.isPlaying}
          idxCurrent16thNote={this.state.idxCurrent16thNote}
        />
        <div className="handsontable" id="hot" />
        <SequencePager
          trackLength={this.state.tracks.length}
          currentBarsCount={this.state.currentBarsCount}
          addBars={this.addBars.bind(this)}
          removeBars={this.removeBars.bind(this)}
        />
        <div>
          <SequenceSlider
            bpm={this.state.bpm}
            swing={this.state.swing}
            sustain={this.state.sustain}
            handleChange={this.handleChange.bind(this)}
          />
          <Button raised label={this.state.isPlaying ? 'STOP' : 'PLAY'} onClick={() => this.togglePlayButton()} />
          <SaveDialog
            title={this.state.title}
            tracks={this.state.tracks}
            bpm={this.state.bpm}
            swing={this.state.swing}
            sustain={this.state.sustain}
          />
        </div>
      </div>
    );
  }
}

export default Sequencer;
