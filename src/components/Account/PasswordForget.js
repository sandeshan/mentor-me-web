import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Form, Input, Button } from 'antd';
import { Alert } from 'antd';

import { auth } from '../../firebase';

import '../styles/Account.css'

const FormItem = Form.Item;

const PasswordForgetPage = () =>
    <div>
        <h1>Reset your Password here</h1>
        <WrappedResetForm />
    </div>

const byPropKey = (propertyName, value) => () => ({
    [propertyName]: value,
});

const INITIAL_STATE = {
    email: '',
    error: null,
};

class PasswordForgetForm extends Component {
    
    constructor(props) {
        super(props);

        this.state = { ...INITIAL_STATE };
    }

    onSubmit = (event) => {

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                // Send password reset e-mail
                auth.doPasswordReset(values.email)
                    .then(() => {
                        this.setState(() => ({ ...INITIAL_STATE }));
                    })
                    .catch(error => {
                        this.setState(byPropKey('error', error));
                    });
            }
        });

        event.preventDefault();
    }

    handleConfirmBlur = (e) => {
        const value = e.target.value;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    }

    render() {

        const { getFieldDecorator } = this.props.form;

        const {
            error,
        } = this.state;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };

        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 16,
                    offset: 8,
                },
            },
        };

        return (

            <Form onSubmit={this.onSubmit}>
                <FormItem
                    {...formItemLayout}
                    label="E-mail">
                    {getFieldDecorator('email', {
                        initialValue: '',
                        rules: [{
                            type: 'email', message: 'The input is not valid E-mail!',
                        }, {
                            required: true, message: 'Please input your E-mail!',
                        }],
                    })(
                        <Input placeholder="Email Address" />
                    )}
                </FormItem>
                <FormItem {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit" className="full-width-btn">Reset Password</Button>
                </FormItem>

                {error && <Alert message={error.message} type="error" />}

            </Form>
        );
    }
}

const WrappedResetForm = Form.create()(PasswordForgetForm);

const PasswordForgetLink = () =>
    <p>
        <Link to="/pw-forget">Forgot Password?</Link>
    </p>

export default PasswordForgetPage;

export {
    WrappedResetForm,
    PasswordForgetLink,
};