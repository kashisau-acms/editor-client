import React, { Component } from 'react';
import classNames from 'classnames';
import './indicator.css';

const STATES = {
    0: "idle",
    1: "busy",
    2: "complete",
    3: "error"
};

class Indicator extends Component {

  constructor(props) {
    super(props);
    this.state = {
        indicatorStatus: STATES[0]
    };
    this.statusBem = this.statusBem;
  }

  statusBem() {
      let statusClass = STATES[this.props.indicatorStatus];
      return `--is-${statusClass}`;
  }

  render() {
    return (
      <div className={classNames('Indicator', this.statusBem())}></div>
    );
  }
}

export default Indicator;
