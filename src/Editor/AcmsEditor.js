import React, { Component } from 'react';
import {Editor, EditorState, RichUtils} from 'draft-js';
import './AcmsEditor.css';

class AcmsEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};    

    this.onChange = (editorState) => this.setState({editorState});
    this.toggleInline = this.toggleInline.bind(this);
    this.editor = undefined;
  }

  toggleInline(style) {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, style));
    setTimeout(() => this.editor.focus(), 0);
  }

  render() {
    return (
      <div>
        <button onClick={this.toggleInline}>Bold</button>
        <button onClick={this.toggleInline}>Italics</button>
        <button onClick={this.toggleInline}>Underline</button>
        <Editor 
          className="Editor"
          editorState={this.state.editorState}
          onChange={this.onChange}
          ref={(editor) => this.editor = editor}
        />
      </div>
    );
  }

}

export default AcmsEditor;
