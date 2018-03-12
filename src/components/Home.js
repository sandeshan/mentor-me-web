import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import withAuthorization from './Session/withAuthorization';
import { db } from '../firebase';

class HomePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
        };
    }

    componentDidMount() {
        const { onSetUsers } = this.props;

        db.onceGetTestData().then(snapshot =>
            this.setState(() => ({ data: snapshot.val() }))
        );
    }

    render() {
        const { data } = this.state;

        return (
            <div>
                <h1>Home</h1>
                <p>The Home Page is accessible by every signed in user.</p>

                {!!data && <TestList data={data} />}

            </div>
        );
    }
}

const TestList = ({ data }) =>
    <div>
        <h2>List of Test Data</h2>

        {Object.keys(data).map(key =>
            <div key={key}>{data[key].name} : {data[key].house}</div>
        )}
    </div>

const mapStateToProps = (state) => ({
    users: state.userState.users,
});

const mapDispatchToProps = (dispatch) => ({
    onSetUsers: (users) => dispatch({ type: 'USERS_SET', users }),
});

const authCondition = (authUser) => !!authUser;

export default compose(
    withAuthorization(authCondition),
    connect(mapStateToProps, mapDispatchToProps)
)(HomePage);