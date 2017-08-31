import React, { Component } from 'react';
import Button from 'react-toolbox/lib/button/Button';
import Dialog from 'react-toolbox/lib/dialog/Dialog';

class SaveDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
    };
    this.actions = [
      { label: 'Cancel', onClick: this.handleToggle.bind(this) },
      { label: 'Save', onClick: this.handleToggle.bind(this) },
    ];
  }

  handleToggle() {
    this.setState({ active: !this.state.active });
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
          title="My awesome dialog"
        >
          <p>
            Here you can add arbitrary content. Components like Pickers are
            using dialogs now.
          </p>
        </Dialog>
      </span>
    );
  }
}

export default SaveDialog;
