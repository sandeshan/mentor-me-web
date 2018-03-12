import React, { Component } from 'react';
import { Link,
    withRouter } from 'react-router-dom';

import { Form, Input, Select, Button } from 'antd';
import { Alert } from 'antd';
import { Upload, Icon, message } from 'antd';

import { auth, db, storage } from '../../firebase';
import * as routes from '../../constants/routes';

import countryCodes from '../../components/util/country-codes.json'

import '../styles/SignUp.css'

const FormItem = Form.Item;
const Option = Select.Option;

const SignUpPage = ({ history }) =>
    <div className="sign-up-div">
        <div className="sign-up-title">Create your Mentor.me Account !</div>
        <WrappedRegistrationForm history={history}/>
    </div>

const INITIAL_STATE = {
    error: null,
};

const byPropKey = (propertyName, value) => () => ({
    [propertyName]: value,
});

class SignUpForm extends Component {
    constructor(props) {
        super(props);

        this.state = { 
            ...INITIAL_STATE,
            loading: false,
            uploadedImageURL: "",
            confirmDirty: false
         };
    }

    onSubmit = (event) => {

        const {
            history,
        } = this.props;

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                auth.doCreateUserWithEmailAndPassword(values.email, values.password)
                    .then(authUser => {
                        // Create a user in our Firebase Database
                        let prefix = countryCodes.find(x => x.name === values.prefix)
                        db.doCreateUser(authUser.uid, values.email, values.fullName, this.state.uploadedImageURL, prefix.dial_code, prefix.code, values.phone)
                            .then(() => {
                                this.setState(() => ({ ...INITIAL_STATE }));
                                history.push(routes.HOME);
                            })
                            .catch(error => {
                                this.setState(byPropKey('error', error));
                            });
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

    handleUpload = (file) => {

        this.setState({ loading: true });

        const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
        if (!isImage) {
            message.error('You can only upload JPG, PNG or GIF files!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        
        if (isImage && isLt2M) {
            var date = new Date();
            var storageRef = storage.storageRef();
            var uploadTask = storageRef.child('profile-pictures/' + date.toISOString() + '_' + file.name).put(file);
            
            uploadTask.on('state_changed',
            (snapshot) => {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
            }, (error) => {
                message.error('An error occured during file upload. Try agin!');
            }, () => {
                var imageUrl = uploadTask.snapshot.downloadURL;
                this.setState({
                    imageUrl,
                    uploadedImageURL: imageUrl,
                    loading: false
                });

                return false;
            });
        }

        this.setState({ loading: false });
        
        return false;
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

        const prefixSelector = getFieldDecorator('prefix', {
            initialValue: 'United States',
        })(
            <Select 
            showSearch
            filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
            style={{ width: 200 }}>
            {countryCodes.map(function (country) {
                return <Option key={country.code} value={country.name}>{country.name} ({country.dial_code})</Option>
            })}
            </Select>
        );

        const uploadButton = (
            <div>
                <Icon type={this.state.loading ? 'loading' : 'plus'} />
                <div className="ant-upload-text">Upload</div>
            </div>
        );
        const imageUrl = this.state.imageUrl;

        return (

            <Form onSubmit={this.onSubmit}>
                <FormItem
                    {...formItemLayout}
                    label="Profile Picture">
                    {getFieldDecorator('upload', {
                        rules: [{
                            required: true, message: 'Profile Picture is required!',
                        }]
                    })(
                        <Upload
                            name="avatar"
                            listType="picture-card"
                            className="avatar-uploader"
                            showUploadList={false}
                            accept="image/*"
                            action="#"
                            beforeUpload={this.handleUpload}
                        >
                            {imageUrl ? <img src={imageUrl} alt="" /> : uploadButton}
                        </Upload>
                    )}
                </FormItem>
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
                        <Input placeholder="Email Address"/>
                    )}
                </FormItem>
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
                        <Input type="password" placeholder="Password"/>
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
                <FormItem
                    {...formItemLayout}
                    label="Full Name">
                    {getFieldDecorator('fullName', {
                        initialValue: '',
                        rules: [{ required: true, message: 'Please input your full name!', whitespace: true }],
                    })(
                        <Input placeholder="Full Name"/>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="Phone Number">
                    {getFieldDecorator('phone', {
                        rules: [{ required: true, message: 'Please input your phone number!' }],
                    })(
                        <Input addonBefore={prefixSelector} style={{ width: '100%' }} />
                    )}
                </FormItem>
                <FormItem {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit" className="full-width-btn">Register</Button>
                </FormItem>

                {error && <Alert message={error.message} type="error" />}

            </Form>
        );
    }
}

const WrappedRegistrationForm = Form.create()(SignUpForm);

const SignUpLink = () =>
    <p>
        Don't have an account?
    {' '}
        <Link to={routes.SIGN_UP}>Sign Up</Link>
    </p>

export default withRouter(SignUpPage);

export {
    SignUpForm,
    SignUpLink,
};