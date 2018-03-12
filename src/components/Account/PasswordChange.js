import React, { Component } from 'react';

import { Form, Input, Button } from 'antd';
import { Alert } from 'antd';
import { message } from 'antd';

import { auth } from '../../firebase';

const FormItem = Form.Item;

const byPropKey = (propertyName, value) => () => ({
    [propertyName]: value,
});

const INITIAL_STATE = {
    passwordOne: '',
    passwordTwo: '',
    error: null,
};

class PasswordChangeForm extends Component {
    constructor(props) {
        super(props);

        this.state = { 
            ...INITIAL_STATE,
            confirmDirty: false
         };
    }

    onSubmit = (event) => {

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                // Update password
                auth.doPasswordUpdate(values.password)
                    .then(() => {
                        this.setState(() => ({ ...INITIAL_STATE }));
                        message.success('Password Changed Succesfully!');
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

    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('password')) {
            callback('Two passwords that you enter is inconsistent!');
        } else {
            callback();
        }
    }

    validateToNextPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && this.state.confirmDirty) {
            form.validateFields(['confirm'], { force: true });
        }
        callback();
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
                    label="Password">
                    {getFieldDecorator('password', {
                        initialValue: '',
                        rules: [{
                            required: true, message: 'Please input your password!',
                        }, {
                            validator: this.validateToNextPassword,
                        }],
                    })(
                        <Input type="password" placeholder="Password" />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="Confirm Password">
                    {getFieldDecorator('confirm', {
                        rules: [{
                            required: true, message: 'Please confirm your password!',
                        }, {
                            validator: this.compareToFirstPassword,
                        }],
                    })(
                        <Input type="password" placeholder="Confirm Password" onBlur={this.handleConfirmBlur} />
                    )}
                </FormItem>
                <FormItem {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit" className="full-width-btn">Update Password</Button>
                </FormItem>

                {error && <Alert message={error.message} type="error" />}

            </Form>
        );
    }
}

const PasswordUpdateForm = Form.create()(PasswordChangeForm);

export default PasswordUpdateForm;