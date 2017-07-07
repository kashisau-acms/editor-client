import React, { Component } from 'react';
import {Editor, EditorState, RichUtils} from 'draft-js';
import { BrowserRouter } from 'react-router-dom';
import { StaticRouter } from 'react-router-dom';

import './AcmsEditor.css';
import { v1 as uuid } from 'uuid';

const COMMIT_TIMER = 1000;

class AcmsEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};    

    this.onChange = (editorState) => { this.setState({editorState}); this.editorStateChange(editorState) }

    this.toggleInline = this.toggleInline.bind(this);
    this.editorCommitState = this.editorCommitState.bind(this);

    this.componentWillUpdate = this.componentWillUpdate.bind(this);
    this.createNewDocument = this.createNewDocument.bind(this);

    this.editor = undefined;

    this.draftSaveTimer = undefined;
  }

  /**
   * Receives the document state (if available).
   * @param {*} props 
   */
  componentWillUpdate(props) {
    const documentId = props.documentId;
    console.log("Props received: ", props);
    if (typeof this.state.documentId !== "undefined")
      if (this.state.documentId === documentId) return;
  }

  /**
   * Toggles a style change for the selected text.
   * @param {SyntheticEvent} toggleEvent
   */
  toggleInline(toggleEvent) {
    let styleButton = toggleEvent.currentTarget,
      style = styleButton.dataset.styleToggle;
    
    if ( ! style) return setTimeout(() => this.editor.focus(), 0);
    
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, style));
    setTimeout(() => this.editor.focus(), 0);
  }

  /**
   * Updates the editor's content, and triggers a watch for a save.
   * @param {EditorState} newState  The contents of the editor in its new state.
   */
  editorStateChange(newState) {
    if (this.draftSaveTimer)
      clearTimeout(this.draftSaveTimer);
    
    this.props.onChange(1);
    this.draftSaveTimer = setTimeout(this.editorCommitState, COMMIT_TIMER);
    this.setState({editorState: newState});
  }

  /**
   * Stores the EditorState against the documentId in the data store.
   * @param {EditorState} editorState 
   */
  editorCommitState(editorState) {
    this.props.onChange(3);
    const documentId = this.state.documentId;
    if ( ! documentId) {
      if (this.props.isNew) this.createNewDocument();
    }
    localStorage.setItem(documentId, JSON.stringify(editorState));
  }

  /**
   * Stores a new document and updates the route URL so that we're editing the
   * correct document.
   */
  createNewDocument() {
    const documentId = uuid();
    this.setState((prevState, props) => ({ documentId: documentId }));
  }

  render() {
    return (
      <div className="AcmsEditor">
        <label>
          <span>Heading</span>
          <input className="Heading" />
        </label>
        <label onClick={() => this.editor.focus()}><span>Document</span></label>
        <nav className="Toolbar">
          <button onClick={this.toggleInline} data-style-toggle="BOLD" ref="bold">Bold</button>
          <button onClick={this.toggleInline} data-style-toggle="ITALIC" ref="italics">Italics</button>
          <button onClick={this.toggleInline} data-style-toggle="UNDERLINE" ref="underline">Underline</button>
        </nav>
        <div className="DocumentVersion">{this.props.documentVersion || "New document"}</div>
        <Editor 
          className="Editor"
          editorState={this.state.editorState}
          onChange={this.onChange}
          spellCheck={true}
          ref={editor => this.editor = editor}
        />
      </div>
    );
  }

}

export default AcmsEditor;
