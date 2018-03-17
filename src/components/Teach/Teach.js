import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import AddClass from './AddClass';
import ClassesList from '../Classes/ClassesList';

import { Tabs, Icon } from 'antd';

import withAuthorization from '../Session/withAuthorization'
import { db } from '../../firebase';

import _ from 'lodash';

import '../styles/Teach.css';

const TabPane = Tabs.TabPane;

class Teach extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: "1",
            myClasses: {}
        };
    }

    componentDidMount() {
        const { onSetClasses } = this.props;

        let currentUser = db.getUser(this.props.authUser.uid);

        let allClasses = db.getClasses();

        allClasses.on('value', (snapshot) => {
            let classesObj = snapshot.val();

            this.setState(() => ({
                classes: _.pickBy(classesObj, (value, key) => {
                    return value.teacherID === this.props.authUser.uid;
                })
            }))

        }).bind(this);
    }

    classAdded = () => {
        this.setState({
            activeTab: "1"
        });
    }

    tabChange = (key) => {
        this.setState({
            activeTab: key
        });
    }

    render() {
        const { classes } = this.state;

        return (
            <div>
                <Tabs defaultActiveKey="1" activeKey={this.state.activeTab} onTabClick={this.tabChange}>
                    <TabPane tab={<span><Icon type="user" />Your Classes</span>} key="1">
                        <h1>My Teaching History</h1>
                        {!!classes && <ClassesList classes={classes} />}                        
                    </TabPane>
                    <TabPane tab={<span><Icon type="plus" />Add New Class</span>} key="2">
                        <h1>Add New Class</h1>
                        <AddClass classAdded={this.classAdded} />                        
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    authUser: state.sessionState.authUser,
    classes: state.classesState.classes,
});

const mapDispatchToProps = (dispatch) => ({
    onSetClasses: (classes) => dispatch({ type: 'TEACHING_SET', classes }),
});

const authCondition = (authUser) => !!authUser;

export default compose(
    withAuthorization(authCondition),
    connect(mapStateToProps, mapDispatchToProps)
)(Teach);