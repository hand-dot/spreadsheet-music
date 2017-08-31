import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';

// style
import '../style/SequenceStep.css';

function SequenceStep({ isPlaying, idxCurrent16thNote }) {
  return (
    <div>
      {Array(16).fill().map((x, i) =>
        (<div
          className={
            (isPlaying && idxCurrent16thNote === (i + 1) % 16) ? 'step  active' : 'step'
          }
          key={uuid()}
          disabled
        />))}
    </div>
  );
}

SequenceStep.propTypes = {
  isPlaying: PropTypes.bool,
  idxCurrent16thNote: PropTypes.number,
};

SequenceStep.defaultProps = {
  isPlaying: false,
  idxCurrent16thNote: 0,
};
export default SequenceStep;
