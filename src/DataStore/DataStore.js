import { EditorState, ContentState, convertToRaw, convertFromRaw } from 'draft-js';
import { v1 as uuid } from 'uuid';

/**
 * @typedef {Object} AcmsDocument A document object that is transportable across the CMS.
 * @property {string} id    The document's ID.
 * @property {string} headline  The headline of the document.
 * @property {ContentState} content The contents of the document, as an Editor contentstate.
 * @property {Date} published   The time that the document was published.
 * @property {Date} created The time that the document was created.
 * @property {Number} authorId  The author's unique ID.
 */
 /**
 * @typedef {Object} AcmsProtoDocument A document object that is transportable across the CMS.
 * @property {string} id    The document's ID.
 * @property {string} headline  The headline of the document.
 * @property {EditorState} editorState The editor's state at present. This will be used to produce a contentState.
 * @property {Date} published   The time that the document was published.
 * @property {Date} created The time that the document was created.
 * @property {Number} authorId  The author's unique ID.
 */

const ACMS_PREFIX = 'acms.editor';
const ACMS_DOCUMENT_LIST = `${ACMS_PREFIX}.documentList`;
const ACMS_DOCUMENT_PREFIX = `${ACMS_PREFIX}.document`;

/**
 * Saves the proto document that has been provided.
 * @param {AcmsProtoDocument} protoDoc
 * @return {AcmsDocument}   Returns a furnished document for use by the
 *                          AcmsEditor.
 */
const saveDocument = async function(protoDoc, convertToRaw, uuid) {
    const editorState = protoDoc.editorState,
        contentState = editorState.getCurrentContent(),
        contentStateRaw = convertToRaw(contentState);
    
    const documentId = protoDoc.id || uuid(),
        authorId = protoDoc.authorId,
        created = protoDoc.created || Date.now(),
        published = protoDoc.published,
        documentStorageKey = `${ACMS_DOCUMENT_PREFIX}.${documentId}`,
        documentListStr = localStorage.getItem(ACMS_DOCUMENT_LIST) || '[]';
    
    const acmsDocument = {
        id: documentId,
        headline: protoDoc.headline,
        content: contentStateRaw,
        authorId: authorId,
        created: created,
        published: published
    },
    acmsDocString = JSON.stringify(acmsDocument);
    
    localStorage.setItem(documentStorageKey, acmsDocString);
    
    // Update the document list
    const documentList = JSON.parse(documentListStr);
    documentList.push(documentId);
    const newDocumentListStr = JSON.stringify(documentList);
    
    localStorage.setItem(ACMS_DOCUMENT_LIST, newDocumentListStr);

    return acmsDocument;
}

/**
 * Loads a document from the localStorage, populating the contentstate and 
 * its undo/redo history.
 * @param {string} documentId The document's unique identifier.
 * @return {AcmsDocument}   Returns a document that may be used to furnish
 *                          the AcmsEditor component.
 */
const loadDocument = async function(documentId, convertFromRaw, EditorState) {
    const documentStorageKey = `${ACMS_DOCUMENT_PREFIX}.${documentId}`,
        documentStr = localStorage.getItem(documentStorageKey);
    
    if ( ! documentStr)
        throw new Error("Unidentified document ID");

    const document = JSON.parse(documentStr),
        contentState = convertFromRaw(document.content);
    let editorState = EditorState.createWithContent(contentState);
    
    document.editorSate = editorState;

    return document;
};

export default class DataStore {
    /**
     * Asynchronous data storage, processing and retrieval helper for use with the
     * AcmsEditor.
     */
    constructor(props) {
        this.saveDocument = async protoDocument => 
            saveDocument(protoDocument, convertToRaw, uuid);
        this.loadDocument = async document =>
            loadDocument(document, convertFromRaw, EditorState);
    }
}