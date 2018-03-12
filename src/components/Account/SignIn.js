import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import { Form, Icon, Input, Button } from 'antd';
import { Alert } from 'antd';

import { SignUpLink } from './SignUp';
import { PasswordForgetLink } from './PasswordForget';
import { auth } from '../../firebase';
import * as routes from '../../constants/routes';

import '../styles/SignIn.css'

const FormItem = Form.Item;

const SignInPage = ({ history }) =>
    <div className="sign-in-div">
        <h1>Sign in to Mentor.me!</h1>
        <LoginForm history={history} />
        <PasswordForgetLink />
        <SignUpLink />
    </div>

const byPropKey = (propertyName, value) => () => ({
    [propertyName]: value,
});

const INITIAL_STATE = {
    email: '',
    password: '',
    error: null,
};

class SignInForm extends Component {
    constructor(props) {
        super(props);

        this.state = { ...INITIAL_STATE };
    }

    onSubmit = (event) => {
        const {
            history,
        } = this.props;

        this.props.form.validateFields((err, values) => {
            if (!err) {
                auth.doSignInWithEmailAndPassword(values.email, values.password)
                    .then(() => {
                        this.setState(() => ({ ...INITIAL_STATE }));
                        history.push(routes.HOME);
                    })
                    .catch(error => {
                        this.setState(byPropKey('error', error));
                    });
            }
        });        

        event.preventDefault();
    }

    render() {
        const {
            email,
            password,
            error,
        } = this.state;
        
        const { getFieldDecorator } = this.props.form;

        return (

            <Form onSubmit={this.onSubmit} className="login-form">
                <FormItem>
                    {getFieldDecorator('email', {
                        rules: [{ required: true, message: 'Please input your Email Address!', initialValue: {email} }],
                    })(
                        <Input 
                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        onChange={event => this.setState(byPropKey('email', event.target.value))}
                        type="text" 
                        placeholder="Email Address" />
                    )}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('password', {
                        rules: [{ required: true, message: 'Please input your Password!', initialValue: {password} }],
                    })(
                        <Input 
                        prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        onChange={event => this.setState(byPropKey('password', event.target.value))} 
                        type="password" 
                        placeholder="Password" />
                    )}
                </FormItem>
                <FormItem>
                    <Button type="primary" htmlType="submit" className="login-form-button">
                        Log in
                    </Button>
                </FormItem>
                {error && <Alert message={error.message} type="error" />}
            </Form>
        );
    }
}

const LoginForm = Form.create()(SignInForm)

export default withRouter(SignInPage);

export {
    SignInForm,
};