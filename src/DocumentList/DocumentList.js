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
        this.componentWillMount = this.componentWillMount.bind(this);
    }

    componentWillMount() {
        this.retrieveDocuments();
    }

    /**
     * Gathers the documents from the localstorage
     */
    retrieveDocuments() {
        const documentIdsString = localStorage.getItem(ACMS_DOC_LIST_KEY);
        if ( ! documentIdsString) return;

        const documentIds = JSON.parse(documentIdsString),
            articles = documentIds.reduce((articleList, documentId) => {
                const documentStr = localStorage.getItem(documentId);
                // Article does not exist, on to the next one.
                if ( ! documentStr) return articleList;
                const document = JSON.parse(documentStr),
                    article = {
                        id: document.id,
                        headline: document.headline,
                        datetime: document.timestamp,
                        timeFriendly: "Today",
                        teaser: "Deblocking algorithm goes here."
                    };
                articleList.push(article);
                return articleList;
            }, []);
        this.setState({articles: articles});
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