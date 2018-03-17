import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import { Form, Input, Select, Button } from 'antd';
import { Alert } from 'antd';
import { message } from 'antd';
import { Upload, Icon } from 'antd';

import { db, storage } from '../../firebase';
import withAuthorization from '../Session/withAuthorization';

import countryCodes from '../../components/util/country-codes.json'

const FormItem = Form.Item;
const Option = Select.Option;

const byPropKey = (propertyName, value) => () => ({
    [propertyName]: value,
});

const INITIAL_STATE = {
    passwordOne: '',
    passwordTwo: '',
    error: null,
};

class UpdateDetailsForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ...INITIAL_STATE,
            currentUser: null,
            loading: false,
            uploadedImageURL: "",
            confirmDirty: false
        };
    }

    componentDidMount() {

        let currentUser = db.getUser(this.props.authUser.uid);

        currentUser.on('value', (snapshot) => {
            this.setState({ 
                currentUser: snapshot.val(),
                imageUrl: snapshot.val() ? snapshot.val().profileImage : ''
             })
        });
    }

    onSubmit = (event) => {

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                // Update user details
                let prefix = countryCodes.find(x => x.name === values.prefix)
                db.updateUser(this.props.authUser.uid, values.fullName, this.state.uploadedImageURL, prefix.dial_code, prefix.code, values.phone)
                    .then(() => {
                        this.setState(() => ({ ...INITIAL_STATE }));
                        message.success('Profile Updated Succesfully!');
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

        const numberPrefix = this.state.currentUser ? countryCodes.find(x => x.code === this.state.currentUser.phoneNum.country).name : 'United States';

        const prefixSelector = getFieldDecorator('prefix', {
            initialValue: numberPrefix,
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
                    label="E-mail ID">
                    {getFieldDecorator('email', {
                        initialValue: this.state.currentUser ? this.state.currentUser.email : '',
                        rules: [{ required: true, message: 'Please input your full name!', whitespace: true }],
                    })(
                        <Input disabled placeholder="Your e-mail id" />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="Full Name">
                    {getFieldDecorator('fullName', {
                        initialValue: this.state.currentUser ? this.state.currentUser.fullName : '',
                        rules: [{ required: true, message: 'Please input your full name!', whitespace: true }],
                    })(
                        <Input placeholder="Full Name" />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="Phone Number">
                    {getFieldDecorator('phone', {
                        initialValue: this.state.currentUser ? this.state.currentUser.phoneNum.number : '',
                        rules: [{ required: true, message: 'Please input your phone number!' }],
                    })(
                        <Input addonBefore={prefixSelector} style={{ width: '100%' }} />
                    )}
                </FormItem>
                <FormItem {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit" className="full-width-btn">Update Details</Button>
                </FormItem>

                {error && <Alert message={error.message} type="error" />}

            </Form>
        );
    }
}

const mapStateToProps = (state) => ({
    authUser: state.sessionState.authUser,
});

const authCondition = (authUser) => !!authUser;

const WrappedUpdateForm = Form.create()(UpdateDetailsForm);

export default compose(
    withAuthorization(authCondition),
    connect(mapStateToProps)
)(WrappedUpdateForm);