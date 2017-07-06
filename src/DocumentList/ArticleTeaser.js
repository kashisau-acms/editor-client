import React, { Component } from 'react';
import './ArticleTeaser.css';

export default class ArticleTeaser extends Component {
    render() {
        return (
        <a href={"/editor/article/" + this.props.id} title="Edit this article">
            <article className="ArticleTeaser">
                <h1>{this.props.title}</h1>
                <time dateTime={this.props.dateTime}>{this.props.timeFriendly}</time>
                <p>{this.props.teaser}</p>
            </article>
        </a>
        );
    }
}