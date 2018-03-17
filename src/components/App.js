import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

import unirest from 'unirest';

import { Layout } from 'antd';

import Navigation from './Navigation';
import LandingPage from './Landing';
import SignUpPage from './Account/SignUp';
import SignInPage from './Account/SignIn';
import PasswordForgetPage from './Account/PasswordForget';
import HomePage from './Home';
import AccountPage from './Account/Account';

import Classes from './Classes/Classes';
import Teach from './Teach/Teach';

import logo from '../assets/app_icon.png';
import Image from './util/Image'

import withAuthentication from './Session/withAuthentication';

import * as routes from '../constants/routes';

import 'antd/dist/antd.css';
import './styles/App.css';

const { Header, Content, Footer } = Layout;

const quotesURL = "andruxnet-random-famous-quotes.p.mashape.com"

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            footerQuote: '',
            quoteAuthor: ''
        }
    }

    componentDidMount() {
        unirest.get("https://andruxnet-random-famous-quotes.p.mashape.com/")
            .header("X-Mashape-Key", process.env.REACT_APP_MASHAPE_KEY)
            .header("X-Mashape-Host", quotesURL)
            .end((result) =>{
                this.setState({
                    footerQuote: result.body.quote,
                    quoteAuthor: result.body.author
                })
            });
    }

    render() {
        return (
            <Router>
                <Layout className="layout">
                    <Header>
                        <div className="header-logo">
                            <Image src={logo} width={50} height={50} mode='fit' />
                        </div>
                        <Navigation />
                    </Header>
                    <Content style={{ padding: '0 50px' }}>
                        <Route exact path={routes.LANDING} component={() => <LandingPage />} />
                        <Route exact path={routes.CLASSES} component={() => <Classes />} />
                        <Route exact path={routes.TEACH} component={() => <Teach />} />
                        <Route exact path={routes.SIGN_UP} component={() => <SignUpPage />} />
                        <Route exact path={routes.SIGN_IN} component={() => <SignInPage />} />
                        <Route exact path={routes.PASSWORD_FORGET} component={() => <PasswordForgetPage />} />
                        <Route exact path={routes.HOME} component={() => <HomePage />} />
                        <Route exact path={routes.ACCOUNT} component={() => <AccountPage />} />
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>
                       "{this.state.footerQuote}" - {this.state.quoteAuthor}
                    </Footer>
                </Layout>
            </Router>
        )
    }
}

export default withAuthentication(App);