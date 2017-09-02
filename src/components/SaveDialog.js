import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-toolbox/lib/button/Button';
import Dialog from 'react-toolbox/lib/dialog/Dialog';

// indexDb
import sequencerDb from '../scripts/sequencerDb';

// constant
import { DEFAULT_TITLE } from '../constants';

class SaveDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
    };
    this.actions = [
      { label: 'Cancel', onClick: this.handleToggle.bind(this) },
      { label: 'Save', onClick: this.save.bind(this) },
    ];
  }

  handleToggle() {
    this.setState({ active: !this.state.active });
  }

  save() {
    this.setState({ active: !this.state.active });
    if (this.props.title === DEFAULT_TITLE && !window.confirm('Title has not been changed, is it OK?')) {
      return;
    }
    sequencerDb.insert(this.props);
  }

  render() {
    return (
      <span>
        <Button raised label="SAVE" onClick={this.handleToggle.bind(this)} />
        <Dialog
          actions={this.actions}
          active={this.state.active}
          onEscKeyDown={this.handleToggle.bind(this)}
          onOverlayClick={this.handleToggle.bind(this)}
          title="Save SequenceData"
        >
          <p>
            this sequence data can save your browser strage.
          </p>
        </Dialog>
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
