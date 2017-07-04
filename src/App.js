import React, { Component } from 'react';
import Indicator from './Indicator/Indicator';
import AcmsEditor from './Editor/AcmsEditor';
import io from 'socket.io-client';
import './App.css';

const STATUSES = {
  "idle": 0,
  "busy": 1,
  "complete": 2,
  "error" : 3
};
const SEVER_URL = "http://localhost:1337";

class App extends Component {

  constructor(props) {
    super(props);
    this.state ={
      editing: STATUSES["idle"],
      syncing: STATUSES["idle"],
      server: STATUSES["idle"]
    };
    this.changeServerStatus = this.changeServerStatus.bind(this);

    this.socket = io(SEVER_URL);
  }

  componentDidMount() {
    this.changeServerStatus(STATUSES["busy"]);
    this.socket.on('connect', () => this.changeServerStatus(STATUSES["complete"]));
    this.socket.on('disconnect', () => this.changeServerStatus(STATUSES["error"]));
  }

  changeServerStatus(status) {
    if (this.state.server === status) return;
    this.setState(
      (prevState, props) => ({
        server: status
      })
    );
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Markdown Editor</h2>
          <div className="Indicators">
            <ul className="Indicators__list">
              <li>Editing: <Indicator indicatorStatus={this.state.editing} /></li>
              <li>Syncing: <Indicator indicatorStatus={this.state.syncing} /></li>
              <li>Server: <Indicator indicatorStatus={this.state.server} /></li>
            </ul>
          </div>
        </div>
        <AcmsEditor />
      </div>
    );
  }
}

export default App;
