import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import { Form, Input, Select, AutoComplete, Button } from 'antd';
import { Upload, Icon } from 'antd';
import { Alert, message } from 'antd';

import { db, storage } from '../../firebase';
import withAuthorization from '../Session/withAuthorization';

const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

const placesURL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';

const byPropKey = (propertyName, value) => () => ({
    [propertyName]: value,
});

const INITIAL_STATE = {
    error: null,
};

class AddClassForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            ...INITIAL_STATE,
            currentUser: null,
            confirmDirty: false,
            loading: false,
            uploadedImageURL: "",
            placesResults: [],
            categoriesArray: []
        };
    }

    componentDidMount() {

        let currentUser = db.getUser(this.props.authUser.uid);
        let categoriesRef = db.getCategories();

        currentUser.on('value', (snapshot) => {
            this.setState({ currentUser: snapshot.val() })
        });

        categoriesRef.on('value', (snapshot) => {
            this.setState({ categoriesArray: snapshot.val() })
        });
    }

    locationSearch = (query) => {

        if (query) {
            var proxyURL = process.env.REACT_APP_PROXY_URL;
            var targetUrl = `${placesURL}?input=${query}&key=${process.env.REACT_APP_PLACES_API_KEY}`;
            fetch(proxyURL + targetUrl)
                .then(response => response.json())
                .then(json => this.setState({
                    placesResults: json.predictions
                }))
                .catch(e => {
                    return e;
                });
        } else {
            this.setState({
                placesResults: []
            });
        }
    }

    onSubmit = (event) => {

        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                // Add new class
                let createdTime = new Date();
                let placeID = values.location.split('|')[0];
                let address = values.location.split('|')[1];                
                
                db.doCreateClass(this.props.authUser.uid, values.category, values.title, values.summary, values.description, this.state.uploadedImageURL, placeID, address, createdTime)
                    .then(() => {
                        this.setState(() => ({ ...INITIAL_STATE }));
                        message.success('Class Added!');
                        this.props.form.resetFields();
                        this.props.classAdded();
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
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Image must smaller than 5 MB!');
        }

        if (isImage && isLt5M) {
            var date = new Date();
            var storageRef = storage.storageRef();
            var uploadTask = storageRef.child('class-pictures/' + date.toISOString() + '_' + file.name).put(file);

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

        const { placesResults } = this.state;

        const children = placesResults.map((place) => {
            let key = place.place_id + "|" + place.description
            return <Option key={key}>{place.description}</Option>;
        });

        const uploadButton = (
            <div>
                <Icon type={this.state.loading ? 'loading' : 'plus'} />
                <div className="ant-upload-text">Upload</div>
            </div>
        );

        const imageUrl = this.state.imageUrl;

        const categorySelect = getFieldDecorator('category', {
            rules: [{ required: true, message: 'Please select a category!' }],
        })(
            <Select
            showSearch
            placeholder="Select a Category"
            filterOption={(input, option) => option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
            {this.state.categoriesArray.map(function (category) {
                return <Option key={`category-key-${category.id}`} value={category.id}>{category.name}</Option>
                })}
            </Select>
        );

        return (
            <div>
                <Form layout='vertical' onSubmit={this.onSubmit}>
                    <FormItem label="Title">
                        {getFieldDecorator('title', {
                            initialValue: '',
                            rules: [{ required: true, message: 'Class title is required!' }],
                        })(
                            <Input placeholder="Give it a catchy title" />
                        )}
                    </FormItem>
                    <FormItem
                        label="Category">
                        {categorySelect}
                    </FormItem>
                    <FormItem
                        label="Display Image">
                        {getFieldDecorator('upload', {
                            rules: [{
                                required: true, message: 'Upload a display picture!',
                            }]
                        })(
                            <Upload
                                name="clasPicture"
                                listType="picture-card"
                                className="class-picture-uploader"
                                showUploadList={false}
                                accept="image/*"
                                action="#"
                                beforeUpload={this.handleUpload}
                            >
                                {imageUrl ? <img src={imageUrl} alt="" /> : uploadButton}
                            </Upload>
                        )}
                    </FormItem>
                    <FormItem label="Summary">
                        {getFieldDecorator('summary', {
                            initialValue: '',
                            rules: [{ required: true, message: 'Class summary is required!' }],
                        })(
                            <Input placeholder="Short one-line summary of your class" />
                        )}                        
                    </FormItem>
                    <FormItem label="Desription">
                        {getFieldDecorator('description', {
                            initialValue: '',
                            rules: [{ required: true, message: 'Class description is required!' }],
                        })(
                            <TextArea rows={4} placeholder="Use this space to better explain about your class" />
                        )}
                    </FormItem>
                    <FormItem label="Location">
                    {getFieldDecorator('location', {
                            initialValue: '',
                            rules: [{ required: true, message: 'Please input the class location!' }],
                        })(
                            <AutoComplete
                                size="large"
                                onSearch={this.locationSearch}
                                placeholder="Start typing address..">
                                {children}
                            </AutoComplete>
                        )}                        
                    </FormItem>
                    <FormItem>
                        <Button type="primary" htmlType="submit" className="full-width-btn">Submit</Button>
                    </FormItem>
                </Form>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    authUser: state.sessionState.authUser,
});

const authCondition = (authUser) => !!authUser;

const WrappedAddClassForm = Form.create()(AddClassForm);

export default compose(
    withAuthorization(authCondition),
    connect(mapStateToProps)
)(WrappedAddClassForm);