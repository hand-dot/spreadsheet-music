import _ from 'lodash';
import React, { Component } from 'react';
import uuid from 'uuid';
import PropTypes from 'prop-types';
import Button from 'react-toolbox/lib/button/Button';
import Dialog from 'react-toolbox/lib/dialog/Dialog';

// indexDb
import sequencerDb from '../scripts/sequencerDb';

// style
import '../style/LoadDialog.css';

class LoadDialog extends Component {
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
    sequencerDb.selectAll().then((results) => {
      this.setState({
        datas: results,
      });
    });
  }

  handleToggle() {
    sequencerDb.selectAll().then((results) => {
      this.setState({
        active: !this.state.active,
        datas: results,
      });
    });
  }

  loadData(data) {
    this.handleToggle();
    this.props.loadData(data);
  }

  removeData(data) {
    if (!window.confirm('remove this sequence data?')) {
      return;
    }
    const self = this;
    sequencerDb.deleteById(data.id).then(() => {
      sequencerDb.selectAll().then((results) => {
        self.setState({
          active: !self.state.active,
          datas: results,
        });
      });
    });
  }

  render() {
    return (
      <span>
        <Button raised label="LOAD" onClick={this.handleToggle.bind(this)} />
        <Dialog
          className="loadDialog"
          actions={this.actions}
          active={this.state.active}
          onEscKeyDown={this.handleToggle.bind(this)}
          onOverlayClick={this.handleToggle.bind(this)}
          title="Load SequenceData"
        >
          <p>
            load sequence data in your browser strage.(max 100 data)
          </p>
          <hr />
          <ul className="loadDialogList">
            {this.state.datas.map(data =>
              (
                <li key={uuid()}>
                  <div>
                    <h4>■{data.title}</h4>
                    <p>{data.createdAt.toString()}</p>
                    <button onClick={() => this.loadData(data)}>LOAD</button>
                    <button onClick={() => this.removeData(data)}>REMOVE</button>
                  </div>
                </li>
              ),
            )}
          </ul>
        </Dialog>
      </span>
    );
  }
}

LoadDialog.propTypes = {
  loadData: PropTypes.func,
};

LoadDialog.defaultProps = {
  loadData: null,
};
export default LoadDialog;
