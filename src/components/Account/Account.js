import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import UpdateDetailsForm from './UpdateDetails'
import { WrappedResetForm } from './PasswordForget';
import PasswordChangeForm from './PasswordChange';
import withAuthorization from '../Session/withAuthorization';

import { Collapse } from 'antd';

import { db } from '../../firebase';

import '../styles/Account.css'

const Panel = Collapse.Panel;

class AccountPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            user: null
        }
    }

    componentDidMount() {

        let currentUser = db.getUser(this.props.authUser.uid);

        currentUser.on('value', (snapshot) => {
            this.setState(() => ({ user: snapshot.val() }))
        }).bind(this);

        // db.getUser(this.props.authUser.uid).then(snapshot =>
        //     this.setState(() => ({ user: snapshot.val() }))
        // );
    }

    render() {
        return (
            <div>
                <h1>Welcome {this.state.user ? this.state.user.fullName : ''} !</h1>
                
                <Collapse accordion defaultActiveKey={['1']}>
                    <Panel header={<h3>Update Personal Details</h3>} key="1">
                        <UpdateDetailsForm />
                    </Panel>
                    <Panel header={<h3>Reset your Password</h3>} key="2">
                        <WrappedResetForm />
                    </Panel>
                    <Panel header={<h3>Change Password</h3>} key="3">
                        <p><PasswordChangeForm /></p>
                    </Panel>
                </Collapse>                
                
            </div>
        );
    }
}
    

const mapStateToProps = (state) => ({
    authUser: state.sessionState.authUser,
});

const authCondition = (authUser) => !!authUser;

export default compose(
    withAuthorization(authCondition),
    connect(mapStateToProps)
)(AccountPage);