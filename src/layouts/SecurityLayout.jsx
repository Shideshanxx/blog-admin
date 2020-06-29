import React from 'react';
import { connect } from 'dva';

class SecurityLayout extends React.Component {
    state = {
        isReady: false,
    };

    componentDidMount() {
        this.setState({
            isReady: true,
        });

        const { dispatch } = this.props;

        let userId = null;
        if (JSON.parse(localStorage.getItem('loginInfo'))) {
            userId = JSON.parse(localStorage.getItem('loginInfo')).userId
        }

        if (dispatch && userId) {
            dispatch({
                type: 'user/fetchCurrent',
            });
        }
    }

    render() {
        return this.props.children;
    }
}

export default connect(({ user, loading }) => ({
    currentUser: user.userInfo,
    loading: loading.models.user,
}))(SecurityLayout);
