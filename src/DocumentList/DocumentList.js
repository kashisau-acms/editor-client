import React, { Component } from 'react';
import ArticleTeaser from './ArticleTeaser';
import { Link } from 'react-router-dom';
import './DocumentList.css';

const ACMS_DOC_LIST_KEY = 'acms.editor.documentList';

class DocumentList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            articles: []
        };

        this.retrieveDocuments = this.retrieveDocuments.bind(this);
    }

    /**
     * Gathers the documents from the localstorage
     */
    retrieveDocuments() {
        const storedDocs = localStorage.getItem(ACMS_DOC_LIST_KEY);
        if ( ! storedDocs) return;
    }

    render() {
        const articles = this.state.articles;
        return <div className="DocumentList">
            <Link to="/new" title="Write new article">
                <article className="ArticleTeaser ArticleTeaser-new">
                    <h1>New article</h1>
                    <p>...</p>
                </article>
            </Link>
            {articles.map((article, i) => <ArticleTeaser {...article} key={i} />)}
        </div>
    }
}

export default DocumentList;