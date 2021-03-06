import _ from 'lodash';
import React, { Component } from 'react';
import Button from 'react-toolbox/lib/button/Button';
import Input from 'react-toolbox/lib/input/Input';
import Checkbox from 'react-toolbox/lib/checkbox/Checkbox';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';

// constant
import { SCHEDULER_TICK, SCHEDULER_LOOK_AHEAD, DEFAULT_TITLE } from '../constants';

// data
import { none } from '../data/tracks';

// component
import SaveDialog from './SaveDialog';
import LoadDialog from './LoadDialog';
import SequenceStep from './SequenceStep';
import SequencePager from './SequencePager';
import SequenceSlider from './SequenceSlider';

// script
import timerWorker from '../scripts/timerWorker';
import { drumNotes, pianoNotes, bassNotes } from '../scripts/sounds';

import { audioContext, parseUrlHash, getHotDataFromUrlHash, scheduleSound, nextNote } from '../scripts/sequencerUtil';

// style
import '../style/Sequencer.css';

// handosontable
let hot = null;

timerWorker.postMessage({ interval: SCHEDULER_TICK });

class Sequencer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: DEFAULT_TITLE,
      tracksLabel: ['Drum', 'Paino', 'Bass'],
      tracks: [
        [_.cloneDeep(none), _.cloneDeep(none), _.cloneDeep(none)],
      ],
      soundOn: [true, true, true],
      bpm: 100,
      swing: 0,
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
    const self = this;
    hot = new Handsontable(document.getElementById('hot'), {
      fillHandle: {
        autoInsertRow: false,
        direction: 'horizontal',
      },
      data: getHotDataFromUrlHash(this.state.tracks),
      colWidths: Math.round(window.innerWidth / 17),
      colHeaders: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      cells(row) {
        let notes = null;
        const visualRowIndex = this.instance.toVisualRow(row);
        if (visualRowIndex === 0) {
          notes = drumNotes;
        } else if (visualRowIndex === 1) {
          notes = pianoNotes;
        } else if (visualRowIndex === 2) {
          notes = bassNotes;
        }
        return {
          type: 'autocomplete',
          source: _.keys(notes),
          strict: true,
          allowInvalid: false,
        };
      },
      rowHeaders(index) {
        return self.state.tracksLabel[index];
      },
    });
    Handsontable.dom.addEvent(window, 'hashchange', () => {
      hot.loadData(getHotDataFromUrlHash(this.state.tracks));
      this.setState({
        currentBarsCount: parseUrlHash(),
      });
    });
  }
  loadData(data) {
    window.location.hash = 1;
    this.setState({
      currentBarsCount: 1,
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

  handleChangeArr(name, index, value) {
    const arr = _.clone(this.state[name]);
    arr[index] = value;
    this.setState({ ...this.state, [name]: arr });
  }

  play() {
    timerWorker.postMessage('start');
    this.setState({
      // to avoid first note delay
      nextNoteTime: audioContext.currentTime + (SCHEDULER_TICK / 1000),
      isPlaying: true,
    });
  }

  stop() {
    timerWorker.postMessage('stop');
    this.setState({
      idxCurrent16thNote: 0,
      isPlaying: false,
    });
  }

  togglePlayButton() {
    if (this.state.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }

  addBars() {
    const tracks = _.cloneDeep(this.state.tracks);
    tracks.push([_.cloneDeep(none), _.cloneDeep(none), _.cloneDeep(none)]);
    hot.updateSettings({
      data: tracks,
    });
    this.setState({
      tracks,
    });
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
    const ml10 = { marginLeft: 10 };
    return (
      <div>
        <h3 style={ml10}>How to Play → <a href="https://youtu.be/FcaDeMz2H28">https://youtu.be/FcaDeMz2H28</a></h3>
        <hr />
        <section style={ml10}>
          <Input type="text" label="Title" name="title" minLength={1} maxLength={32} value={this.state.title} onChange={this.handleChange.bind(this, 'title')} />
        </section>
        <div className="sequencer">
          <section className="muteButton">
            {this.state.soundOn.map((on, index) =>
              (<Checkbox
                checked={this.state.soundOn[index]}
                onChange={this.handleChangeArr.bind(this, 'soundOn', index)}
                label={this.state.tracksLabel[index]}
                key={this.state.tracksLabel[index]}
              />))}
          </section>
          <section className="handsontable">
            <SequenceStep
              isPlaying={this.state.isPlaying}
              idxCurrent16thNote={this.state.idxCurrent16thNote}
            />
            <div id="hot" style={{ height: 100 }} />
            <SequencePager
              trackLength={this.state.tracks.length}
              currentBarsCount={this.state.currentBarsCount}
              addBars={this.addBars.bind(this)}
              removeBars={this.removeBars.bind(this)}
            />
          </section>
        </div>
        <div style={ml10} className="controller">
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
            stopSequencer={this.stop.bind(this)}
          />
          <LoadDialog
            loadData={this.loadData.bind(this)}
            stopSequencer={this.stop.bind(this)}
          />
        </div>
      </div>
    );
  }
}

export default Sequencer;
