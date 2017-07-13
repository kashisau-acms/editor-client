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
    this.loadDocument = this.loadDocument.bind(this);
    this.componentWillUpdate = this.componentWillUpdate.bind(this);

    this.dataStore = new DataStore();

    this.editor = undefined;
    this.draftSaveTimer = undefined;

    if (props.isNew) {
      this.state = {editorState: EditorState.createEmpty()};
    } else {
      const document = this.loadDocument(props.documentId);
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
    
    this.props.onChange(0);
    this.draftSaveTimer = setTimeout(this.saveDocument, COMMIT_TIMER);
    this.setState({editorState: newState});
  }

  /**
   * Stores the EditorState against the documentId in the data store. If this is
   * a new document then the URL is changed to reflect the new document ID.
   * @param {EditorState} editorState
   * @return {Promise<AcmsDocument>}  Returns the saved AcmsDocument object.
   */
  async saveDocument(editorState) {
    let documentId = this.state.documentId;
    const protoDocument = {
      id: documentId,
      headline: this.state.headline,
      editorState: this.state.editorState,
      authorId: 0
    };

    this.props.onChange(3);

    try {
      const document = await this.dataStore.saveDocument(protoDocument);
      this.props.onChange(2);
      
      // Redirect for new documents.
      if (document.id !== documentId)
        createBrowserHistory().push(`/editor/edit/${document.id}`);

      return document;
    } catch (err) {
      this.props.onChange(3)
      throw new Error("There was an error saving the document.", err);
    }
  }

  /**
   * Loads the current document from the localStorage object.
   * @param {string} documentId Loads the Editor's state from the localstorage
   *                            object for that document.
   * @return {Promise<AcmsDocument>}  Returns the document object.
   */
  async loadDocument(documentId) {
    const dataStore = this.dataStore;
    try {
      const document = await dataStore.loadDocument(documentId);
      return dataStore.loadDcument(documentId);
    } catch (err) {
      throw new Error("There was an error retrieving the document.", err);
    }
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
