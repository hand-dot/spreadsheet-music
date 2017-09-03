import _ from 'lodash';
import React, { Component } from 'react';
import Button from 'react-toolbox/lib/button/Button';
import Input from 'react-toolbox/lib/input/Input';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';

// constant
import { SCHEDULER_TICK, SCHEDULER_LOOK_AHEAD, DEFAULT_TITLE } from '../constants';

// data
import { drum, none } from '../data/tracks';

// component
import SaveDialog from './SaveDialog';
import LoadDialog from './LoadDialog';
import SequenceStep from './SequenceStep';
import SequencePager from './SequencePager';
import SequenceSlider from './SequenceSlider';

// script
import timerWorker from '../scripts/timerWorker';
import soundObjs from '../scripts/sounds';
import { audioContext, parseUrlHash, getHotDataFromUrlHash, scheduleSound, nextNote } from '../scripts/sequencerUtil';

// style
import '../style/Sequencer.css';


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
      nextNoteTime: 0.0,
    };
    timerWorker.onmessage = (e) => {
      if (e.data === 'tick') {
        this.schedule();
      }
    };
  }

  componentWillMount() {
    window.location.hash = 1;
  }

  componentDidMount() {
    const autocompleteSource = [];
    Object.entries(soundObjs).map((entrie) => {
      autocompleteSource.push(entrie[0]);
      return entrie;
    });

    const container = document.getElementById('hot');
    hot = Handsontable(container, {
      autoInsertRow: false,
      data: getHotDataFromUrlHash(this.state.tracks),
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
      hot.loadData(getHotDataFromUrlHash(this.state.tracks));
      this.setState({
        currentBarsCount: parseUrlHash(),
      });
    });
  }
  loadData(data) {
    this.setState({
      title: data.title,
      tracks: data.tracks,
      bpm: data.bpm,
      swing: data.swing,
      sustain: data.sustain,
    });
    hot.updateSettings({
      data: getHotDataFromUrlHash(data.tracks),
    });
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
      if (this.state.idxCurrent16thNote === 15) {
        setTimeout(() => {
          const urlHash = parseUrlHash();
          const newBarsCount = urlHash === this.state.tracks.length ? 1 : urlHash + 1;
          this.setState({
            currentBarsCount: newBarsCount,
          });
          window.location.hash = newBarsCount;
        }, SCHEDULER_LOOK_AHEAD);
      }
      scheduleSound(this.state);
      this.setState(nextNote(this.state));
    }
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
          <LoadDialog
            loadData={this.loadData.bind(this)}
          />
        </div>
      </div>
    );
  }
}

export default Sequencer;
