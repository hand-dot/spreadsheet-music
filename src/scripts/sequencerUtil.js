import _ from 'lodash';
import { NUM_OF_INSTRUMENTS, SCHEDULER_LOOK_AHEAD } from '../constants';

// script
import BufferLoader from '../scripts/bufferloader';
import soundObjs from '../scripts/sounds';

// audio context initialization
window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

// loadimg audio buffers
const bufferLoader = new BufferLoader(audioContext, soundObjs, () =>
  console.log('audio resource loading finished.'),
);
bufferLoader.load();

function parseUrlHash() {
  return parseInt(window.location.hash.replace('#', ''), 10) || 1;
}

function getHotDataFromUrlHash(tracks) {
  const page = parseUrlHash();
  const start = (page - 1) * NUM_OF_INSTRUMENTS;
  const end = page * NUM_OF_INSTRUMENTS;
  return _.slice(_.flatten(tracks), start, end);
}

function scheduleSound(idxCurrent16thNote, nextNoteTime, tracks, currentBarsCount, sustain) {
  Object.entries(tracks[currentBarsCount - 1]).map((entrie) => {
    const value = entrie[1];
    let source;
    if (value[idxCurrent16thNote]) {
      source = audioContext.createBufferSource();
      source.buffer = bufferLoader.bufferObjs[value[idxCurrent16thNote]];
      source.connect(audioContext.destination);
      source.start(nextNoteTime);
      source.stop(nextNoteTime + (sustain / 100));
    }
    return source;
  });
}

function nextNote(bpm, idxCurrent16thNote, swing, nextNoteTime) {
  const secondsPerBeat = 60.0 / bpm;
  const noteRateWithSwingCalc =
        idxCurrent16thNote % 2 === 0
    // 1 / 1200 = 0.0008333333333333334
          ? (1 / 4) + (0.00083 * swing)
          : (1 / 4) - (0.00083 * swing);
  return {
    nextNoteTime: nextNoteTime + (noteRateWithSwingCalc * secondsPerBeat),
    idxCurrent16thNote: (idxCurrent16thNote + 1) % 16,
  };
}

export { audioContext, parseUrlHash, getHotDataFromUrlHash, scheduleSound, nextNote };
