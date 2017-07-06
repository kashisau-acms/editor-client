import React, { Component } from 'react';
import ArticleTeaser from './ArticleTeaser';
import './DocumentList.css';

class DocumentList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            articles: [
              {
                  id: "dcba",
                  title: "Ten dollar note",
                  dateTime: "20170401 11:00:22",
                  timeFriendly: "2 hours ago",
                  teaser: "From the sons of the mountains of Scotland."
              },
              {
                  id: "abcd",
                  title: "The Fall of the House of Usher",
                  dateTime: "20170401 10:02:27",
                  timeFriendly: "3 hours ago",
                  teaser: "During the whole of a dull, dark and dreary day, in the autumn of the year, when the clouds hung oppresively..."
              }
            ]
        };
    }

    render() {
        const articles = this.state.articles;
        return <div>
            {articles.map((article, i) => <ArticleTeaser {...article} key={i} />)}
        </div>
    }
}

export default DocumentList;