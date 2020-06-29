import React, { Component } from 'react';

class Article extends Component {
    constructor(props) {
        super(props);

        this.state = {
            articleTotal: null,
            dataList: [],
            type: null,
            page: 1,
            limit: 10,
            dataTotal: 0,
        };
    }

    render() {
        return (
            <div>文章管理页面</div>
        )
    }
}

export default Article;