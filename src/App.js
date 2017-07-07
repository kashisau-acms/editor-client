import React, { Component } from 'react';
import Indicator from './Indicator/Indicator';
import AcmsEditor from './Editor/AcmsEditor';
import DocumentList from './DocumentList/DocumentList';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';
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
    this.changeEditorStatus = this.changeEditorStatus.bind(this);

    this.documentList = () => <DocumentList />
    this.editor = (routeProps) => <AcmsEditor 
      onChange={this.changeEditorStatus}
      isNew={routeProps.match.path === "/new"}
      documentId={routeProps.match.params.documentId} />

    this.socket = io(SEVER_URL);
  }

  componentDidMount() {
    this.changeServerStatus(STATUSES["busy"]);
    this.socket.on('connect', () => this.changeServerStatus(STATUSES["complete"]));
    this.socket.on('disconnect', () => this.changeServerStatus(STATUSES["error"]));
  }

  /**
   * Updates the status of the indicator for the server communication.
   * @param {Number} status
   */
  changeServerStatus(status) {
    if (this.state.server === status) return;
    this.setState(
      (prevState, props) => ({
        server: status
      })
    );
  }

  /**
   * 
   * @param {Number} status 
   */
  changeEditorStatus(status) {
    this.setState(
      (prevState, props) => ({
        editing: status
      })
    );
  }

  render() {
      return (
      <Router basename="/editor">
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
          
          <Route exact path="/" component={this.documentList}/>
          <Route exact path="/new" component={this.editor}/>
          <Route exact path="/edit/:documentId" component={this.editor}/>
        </div>
        </Router>
    );
  }
}

export default App;
