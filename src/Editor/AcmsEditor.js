import React, { Component } from 'react';
import {Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import { createBrowserHistory } from 'history';
import DataStore from '../DataStore/DataStore.js';

import './AcmsEditor.css';
import { v1 as uuid } from 'uuid';

const COMMIT_TIMER = 1000;
const ACMS_DOC_LIST_KEY = 'acms.editor.documentList';

class AcmsEditor extends Component {

  constructor(props) {
    super(props);
    
    this.onChange = (editorState) => { this.setState({editorState}); this.editorStateChange(editorState) }

    this.toggleInline = this.toggleInline.bind(this);
    this.editorStateChange = this.editorStateChange.bind(this);
    this.saveDocument = this.saveDocument.bind(this);
    this.getDocumentObject = this.getDocumentObject.bind(this);
    this.loadDocument = this.loadDocument.bind(this);
    this.createNewDocument = this.createNewDocument.bind(this);
    this.componentWillUpdate = this.componentWillUpdate.bind(this);

    this.editor = undefined;
    this.draftSaveTimer = undefined;

    // this.dataStore = new Worker(window.URL.createObjectURL(dsSource));
    // this.dataStore.onmessage = (e) => {
    //   console.log("Received message: " + e.data);
    // }
    // this.dataStore.postMessage("Hello!");

    if (props.isNew) {
      this.state = {editorState: EditorState.createEmpty()};
    } else {
      const document = this.loadDocument(props.documentId)
      this.state = document;
    }
    
  }

  /**
   * Receives the document state (if available).
   * @param {*} props 
   */
  async componentWillUpdate(props) {
    const documentId = props.documentId;

    if ( ! documentId) return;
    if (documentId === this.state.documentId) return;

    await this.setState({documentId: documentId});
    const documentObject = this.loadDocument(documentId);
    this.setState(documentObject);
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
    this.draftSaveTimer = setTimeout(this.saveDocument, COMMIT_TIMER);
    this.setState({editorState: newState});
  }

  /**
   * Stores the EditorState against the documentId in the data store.
   * @param {EditorState} editorState 
   */
  async saveDocument(editorState) {
    this.props.onChange(3);
    const documentId = this.state.documentId;
    if ( ! documentId) {
      if (this.props.isNew) await this.createNewDocument();
    }
    localStorage.setItem(documentId, JSON.stringify(this.getDocumentObject()));

    DataStore.saveDocument({
      headline: this.state.headline,
      editorState: this.state.editorState
    });
  }

  /**
   * Gathers the document object.
   */
  getDocumentObject() {
    const contentState = this.state.editorState.getCurrentContent(),
      contentStateRaw = convertToRaw(contentState);

    const doc = {
      id: this.state.documentId,
      headline : this.state.headline,
      contentState: contentStateRaw,
      timestamp: Date.now(),
      author: 0
    }
    return doc;
  }

  /**
   * Loads the current document from the localStorage object.
   * @param {string} documentId Loads the Editor's state from the localstorage
   *                            object for that document.
   * @return {Document}  Returns the document object.
   */
  loadDocument(documentId) {
    if ( ! documentId)
      documentId = this.state.documentId;
    const documentObjectString = localStorage.getItem(documentId);
    if ( ! documentObjectString) createBrowserHistory.redirect('/editor/new');
    
    let documentObject = JSON.parse(documentObjectString),
      contentState = convertFromRaw(documentObject.contentState);

    documentObject.editorState = EditorState.createWithContent(contentState);
    return documentObject;
  }

  /**
   * Stores a new document and updates the route URL so that we're editing the
   * correct document.
   */
  async createNewDocument() {
    const documentId = uuid();
    await this.setState({documentId: documentId});
    let documentList = localStorage.getItem(ACMS_DOC_LIST_KEY);
    
    if (typeof documentList === "string") 
      documentList = JSON.parse(documentList);
    else
      documentList = [];
    
    documentList.push(documentId);
    localStorage.setItem(ACMS_DOC_LIST_KEY, JSON.stringify(documentList));

    createBrowserHistory().push(`/editor/edit/${documentId}`);
  }

  render() {
    return (
      <div className="AcmsEditor">
        <label>
          <span>Heading</span>
          <input className="Heading" value={this.state.headline} onChange={(changeEvent) => this.setState({headline: changeEvent.currentTarget.value})} />
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
