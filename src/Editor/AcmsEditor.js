import React, { Component } from 'react';
import {Editor, EditorState, RichUtils} from 'draft-js';
import './AcmsEditor.css';


const COMMIT_TIMER = 1000;

class AcmsEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};    

    this.onChange = (editorState) => { this.setState({editorState}); this.editorStateChange(editorState) }

    this.toggleInline = this.toggleInline.bind(this);
    this.editorCommitState = this.editorCommitState.bind(this);

    this.editor = undefined;

    this.draftSaveTimer = undefined;
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

  editorCommitState(editorState) {
    this.props.onChange(3);
    console.log("Committing state.", this.state.editorState);
  }

  render() {
    return (
      <div>
        <button onClick={this.toggleInline} data-style-toggle="BOLD" ref="bold">Bold</button>
        <button onClick={this.toggleInline} data-style-toggle="ITALIC" ref="italics">Italics</button>
        <button onClick={this.toggleInline} data-style-toggle="UNDERLINE" ref="underline">Underline</button>
        <Editor 
          className="Editor"
          editorState={this.state.editorState}
          onChange={this.onChange}
          ref={editor => this.editor = editor}
        />
      </div>
    );
  }

}

export default AcmsEditor;
