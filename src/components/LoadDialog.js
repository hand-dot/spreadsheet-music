import _ from 'lodash';
import React, { Component } from 'react';
import uuid from 'uuid';
import PropTypes from 'prop-types';
import Button from 'react-toolbox/lib/button/Button';
import Dialog from 'react-toolbox/lib/dialog/Dialog';

// indexDb
import sequencerDb from '../scripts/sequencerDb';

class SaveDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      datas: [],
    };
    this.actions = [
      { label: 'Close', onClick: this.handleToggle.bind(this) },
    ];
  }

  componentWillMount() {
    sequencerDb.init().then((result) => {
      result.selectAll().then((results) => {
        if (!_.isEmpty(results)) {
          this.state.datas = results;
        }
      });
    });
  }

  handleToggle() {
    const self = this;
    sequencerDb.selectAll().then((results) => {
      if (!_.isEmpty(results)) {
        self.state.datas = results;
      }
      self.setState({ active: !self.state.active });
    });
  }

  loadData(data) {
    this.handleToggle();
    this.props.loadData(data);
  }

  removeData(data) {
    console.log(data.id);
  }

  render() {
    return (
      <span>
        <Button raised label="LOAD" onClick={this.handleToggle.bind(this)} />
        <Dialog
          actions={this.actions}
          active={this.state.active}
          onEscKeyDown={this.handleToggle.bind(this)}
          onOverlayClick={this.handleToggle.bind(this)}
          title="Load SequenceData"
        >
          <p>
            load sequence data in your browser strage.
          </p>
          <ul>
            {this.state.datas.map(data =>
              (
                <li key={uuid()}>
                  <p>{data.title} / {data.createdAt.toString()}
                    <button onClick={() => this.loadData(data)}>LOAD</button>
                    <button onClick={() => this.removeData(data)}>REMOVE</button>
                  </p>
                </li>
              ),
            )}
          </ul>
        </Dialog>
      </span>
    );
  }
}

SaveDialog.propTypes = {
  loadData: PropTypes.func,
};

SaveDialog.defaultProps = {
  loadData: null,
};
export default SaveDialog;
