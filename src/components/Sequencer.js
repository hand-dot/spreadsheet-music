import _ from 'lodash';
import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import Button from 'react-toolbox/lib/button/Button';
import Input from 'react-toolbox/lib/input/Input';
import Checkbox from 'react-toolbox/lib/checkbox/Checkbox';
import ReactHandsontable from 'react-handsontable';
import Handsontable from 'handsontable';

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
import { drumNotes, pianoNotes } from '../scripts/sounds';

import { audioContext, parseUrlHash, getHotDataFromUrlHash, scheduleSound, nextNote } from '../scripts/sequencerUtil';

// style
import '../style/Sequencer.css';

timerWorker.postMessage({ interval: SCHEDULER_TICK });

class Sequencer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: DEFAULT_TITLE,
      tracksLabel: ['Drum', 'Paino'],
      tracks: [
        [_.cloneDeep(drum), _.cloneDeep(none)],
      ],
      soundOn: [true, true],
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
    Handsontable.dom.addEvent(window, 'hashchange', () => {

      this.hot.hotInstance.loadData(getHotDataFromUrlHash(this.state.tracks));
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
    this.hot.hotInstance.updateSettings({
      data: getHotDataFromUrlHash(data.tracks),
    });
  }

  handleChange(name, value) {
    this.setState({ ...this.state, [name]: value });
  }

  handleChangeArr(name, index, value) {
    console.log(name, index, value);
    const arr = _.clone(this.state[name]);
    arr[index] = value;
    this.setState({ ...this.state, [name]: arr });
  }

  togglePlayButton() {
    if (this.state.isPlaying) {
      timerWorker.postMessage('stop');
      this.setState({
        idxCurrent16thNote: 0,
        isPlaying: false,
      });
    } else {
      timerWorker.postMessage('start');
      this.setState({
        // to avoid first note delay
        nextNoteTime: audioContext.currentTime + (SCHEDULER_TICK / 1000),
        isPlaying: true,
      });
    }
  }

  addBars() {
    const tracks = _.cloneDeep(this.state.tracks);
    tracks.push([_.cloneDeep(none), _.cloneDeep(none)]);
    this.hot.hotInstance.updateSettings({
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
    const self = this;
    return (
      <div>
        <h3>How to Play → <a href="https://youtu.be/FcaDeMz2H28">https://youtu.be/FcaDeMz2H28</a></h3>
        <hr />
        <section>
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
            <ReactHandsontable
              root="hot"
              ref={(ref) => { this.hot = ref; }}
              settings={{
                data: getHotDataFromUrlHash(this.state.tracks),
                fillHandle: { // enable plugin in vertical direction and with autoInsertRow as false
                  autoInsertRow: false,
                  direction: 'horizontal', // 'vertical' or 'horizontal'
                },
                colWidths: Math.round(window.innerWidth / 17),
                colHeaders: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
                cells(row) {
                  let cellProperties = {};
                  const visualRowIndex = this.instance.toVisualRow(row);
                  if (visualRowIndex === 0) {
                    cellProperties = {
                      type: 'autocomplete',
                      source: Object.entries(drumNotes).map(entrie => entrie[0]),
                      strict: true,
                      allowInvalid: false,
                    };
                  }
                  if (visualRowIndex === 1) {
                    cellProperties = {
                      type: 'autocomplete',
                      source: Object.entries(pianoNotes).map(entrie => entrie[0]),
                      strict: true,
                      allowInvalid: false,
                    };
                  }
                  return cellProperties;
                },
                rowHeaders(index) {
                  return self.state.tracksLabel[index];
                },
              }}
            />
            <SequencePager
              trackLength={this.state.tracks.length}
              currentBarsCount={this.state.currentBarsCount}
              addBars={this.addBars.bind(this)}
              removeBars={this.removeBars.bind(this)}
            />
          </section>
        </div>
        <div className="controller">
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
