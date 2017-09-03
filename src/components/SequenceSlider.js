import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-toolbox/lib/slider';

// style
import '../style/SequenceSlider.css';

function SequenceSlider({ bpm, swing, sustain, handleChange }) {
  return (
    <section className="sequenceSlider">
      <p>BPM</p>
      <Slider
        min={0}
        max={250}
        step={1}
        editable
        pinned
        value={bpm}
        onChange={handleChange.bind(this, 'bpm')}
      />
      <p>Swing</p>
      <Slider
        min={0}
        max={100}
        step={1}
        editable
        pinned
        value={swing}
        onChange={handleChange.bind(this, 'swing')}
      />
      <p>Sustain</p>
      <Slider
        min={20}
        max={200}
        step={1}
        editable
        pinned
        value={sustain}
        onChange={handleChange.bind(this, 'sustain')}
      />
    </section>
  );
}

SequenceSlider.propTypes = {
  bpm: PropTypes.number,
  swing: PropTypes.number,
  sustain: PropTypes.number,
  handleChange: PropTypes.func,
};

SequenceSlider.defaultProps = {
  bpm: 100,
  swing: 30,
  sustain: 50,
  handleChange: null,
};
export default SequenceSlider;

