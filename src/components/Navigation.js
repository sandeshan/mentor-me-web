import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { Menu, Icon } from 'antd';
import { Avatar } from 'antd';
import { Popover } from 'antd';

import { auth, db } from '../firebase';

import * as routes from '../constants/routes';

const Navigation = ({ authUser }) =>
    <div>
        {authUser
            ? <NavigationAuth authUser={authUser} />
            : <NavigationNonAuth />
        }
    </div>

class NavigationAuth extends Component {

    constructor(props) {
        super(props);

        this.state = {
            user: null,
            imageURL: ''
        }
    }

    handleClick = (e) => {

        if (e.key === 'item-logout')
            auth.doSignOut();

    }

    componentDidMount = () => {

        if (this.props.authUser) {

            let currentUser = db.getUser(this.props.authUser.uid);

            currentUser.on('value', (snapshot) => {
                this.setState({
                    user: snapshot.val(),
                    imageURL: snapshot.val() ? snapshot.val().profileImage : ''
                })
            });

        }

    }

    render() {

        const content = (
            <div>
                <Menu onClick={this.handleClick}>
                    <Menu.Item key="item-account">
                        <Icon type="user" />
                        <Link to={routes.ACCOUNT} style={{display: "initial"}}>Account</Link>
                    </Menu.Item>
                    <Menu.Item key="item-logout">
                        <Icon type="logout" />
                        <span>Sign Out</span>
                    </Menu.Item>
                </Menu>
            </div>
        );

        const menuTitle = this.state.user ? `Welcome ${this.state.user.fullName} !` : 'Welcome!';
        let AvatarObj;

        if (this.state.imageURL && this.state.imageURL !== '')
            AvatarObj = <Avatar size="large" src={this.state.imageURL} />
        else
            AvatarObj = <Avatar size="large" icon="user" />

        return (
            <Menu
                theme="dark"
                mode="horizontal"
                defaultSelectedKeys={['header-menu-1']}
                style={{ lineHeight: '64px' }}>
                <Menu.Item key="header-menu-1"><Link to={routes.LANDING}>Landing</Link></Menu.Item>
                <Menu.Item key="header-menu-2"><Link to={routes.CLASSES}>Learn</Link></Menu.Item>
                <Menu.Item key="header-menu-3"><Link to={routes.TEACH}>Teach</Link></Menu.Item>
                <Menu.Item key="header-menu-4"><Link to={routes.HOME}>Home</Link></Menu.Item>
                <Menu.Item key="header-menu-6" style={{ 'float': 'right' }}>
                    <Popover placement="bottomRight" content={content} title={menuTitle}>
                        {AvatarObj}
                    </Popover>
                </Menu.Item>     
            </Menu>
        );
    }
}

const NavigationNonAuth = () =>

    <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={['header-menu-1']}
        style={{ lineHeight: '64px' }}>
        <Menu.Item key="header-menu-1"><Link to={routes.LANDING}>Landing</Link></Menu.Item>
        <Menu.Item key="header-menu-2"><Link to={routes.SIGN_IN}>Sign In</Link></Menu.Item>
    </Menu>

const mapStateToProps = (state) => ({
    authUser: state.sessionState.authUser,
});

export default connect(mapStateToProps)(Navigation);