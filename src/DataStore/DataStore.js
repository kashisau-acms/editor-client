import { EditorState, ContentState, convertToRaw, convertFromRaw } from 'draft-js';
import { v5 as uuid } from 'uuid';
/**
 * @typedef {Object} AcmsDocument A document object that is transportable across the CMS.
 * @property {string} id    The document's ID.
 * @property {string} headline  The headline of the document.
 * @property {ContentState} content The contents of the document, as an Editor contentstate.
 * @property {StackContentState} undoStack    The previous states of the document.
 * @property {StackContentState} redoStack    The subsequent states of the document.
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
 * Asynchronous data storage, processing and retrieval helper for use with the
 * AcmsEditor.
 */
export default class DataStore {

    /**
     * Saves the proto document that has been provided.
     * @param {AcmsProtoDocument} protoDoc
     * @return {AcmsDocument}   Returns a furnished document for use by the
     *                          AcmsEditor.
     */
    static async saveDocument(protoDoc) {
        return new Promise(
            (resolve, reject) => {
                const contentState = protoDoc.editorState.getCurrentContent(),
                    contentStateRaw = convertToRaw(contentState),
                    undoStack = protoDoc.undoStack,
                    redoStack = protoDoc.redoStack,
                    documentId = protoDoc.id || uuid(),
                    authorId = +protoDoc.authorId,
                    created = protoDoc.created || Date.now(),
                    published = protoDoc.published,
                    documentStorageKey = `${ACMS_DOCUMENT_PREFIX}.${documentId}`,
                    documentListStr = localStorage.getItem(ACMS_DOCUMENT_LIST) || '[]';
                
                const acmsDocument = {
                    id: documentId,
                    headline: protoDoc.headline,
                    content: contentStateRaw,
                    undoStack: undoStack,
                    redoStack: redoStack,
                    authorId: authorId,
                    created: created,
                    published: published
                },
                acmsDocString = JSON.stringify(acmsDocument);
                
                localStorage.setItem(documentStorageKey, acmsDocString);
                
                // Update the document list
                const documentList = JSON.parse(documentListStr).push('documentId'),
                    newDocumentListStr = JSON.stringify(documentList);
                
                localStorage.setItem(ACMS_DOCUMENT_LIST, newDocumentListStr);

                resolve(acmsDocument);
            }
        );
    }
    
    /**
     * Loads a document from the localStorage, populating the contentstate and 
     * its undo/redo history.
     * @param {string} documentId The document's unique identifier.
     * @return {AcmsDocument}   Returns a document that may be used to furnish
     *                          the AcmsEditor component.
     */
    static async loadDocument(documentId) {
        return new Promise(
            (resolve, reject) => {
                const documentStorageKey = `${ACMS_DOCUMENT_PREFIX}.${documentId}`,
                    documentStr = localStorage.getItem(documentStorageKey);
                
                if ( ! documentStr) reject(new Error("Document not found."));

                const document = JSON.parse(documentStr),
                    contentState = convertFromRaw(document.content),
                    editorState = EditorState.createWithContent(contentState);
                
                editorState.undoStack = document.undoStack;
                editorState.redoStack = document.redoStack;

                resolve(document);
            }
        );
    }

    onMessage = message => {
        postMessage("Hello back! " + message);
    }
}