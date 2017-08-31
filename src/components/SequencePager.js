import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';

// style
import '../style/SequencePager.css';

function SequencePager({ trackLength, currentBarsCount, addBars, removeBars }) {
  return (
    <div>
      <div className="pagination">
        {Array(trackLength).fill().map((x, i) =>
          (
            <div key={uuid()}>
              <a className={currentBarsCount === i + 1 ? 'active' : ''} href={`#${i + 1}`}>{i + 1}</a>
              {(() => {
                if (i !== 0) {
                  return <span onClick={e => removeBars(i, e)}>x</span >;
                }
                return '';
              })()}
            </div>
          ),
        )}
        <div>
          <a href={`#${trackLength}`} onClick={() => addBars()}>+</a>
        </div>
      </div>
    </div>
  );
}

SequencePager.propTypes = {
  trackLength: PropTypes.number,
  currentBarsCount: PropTypes.number,
  addBars: PropTypes.func,
  removeBars: PropTypes.func,
};

SequencePager.defaultProps = {
  trackLength: 0,
  currentBarsCount: 1,
  addBars: null,
  removeBars: null,
};
export default SequencePager;

