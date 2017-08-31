import React from 'react';
import uuid from 'uuid';

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

export default SequenceStep;
