import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-toolbox/lib/button/Button';

// indexDb
import sequencerDb from '../scripts/sequencerDb';

// constant
import { DEFAULT_TITLE } from '../constants';

class SaveDialog extends Component {
  save() {
    if (!window.confirm('save this sequence data?')) {
      return;
    }
    if (this.props.title === DEFAULT_TITLE && !window.confirm('title has not been changed, is it OK?')) {
      return;
    }
    sequencerDb.insert(this.props).then(() => {
      window.alert('saved!');
    });
  }

  render() {
    return (
      <span>
        <Button raised label="SAVE" onClick={this.save.bind(this)} />
      </span>
    );
  }
}

SaveDialog.propTypes = {
  title: PropTypes.string,
};

SaveDialog.defaultProps = {
  title: DEFAULT_TITLE,
  tracks: [],
  bpm: 100,
  swing: 30,
  sustain: 50,
};
export default SaveDialog;
