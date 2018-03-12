import React, { Component } from 'react';
import { List, Avatar, Icon } from 'antd';
import _ from 'lodash';

class ClassesList extends Component {

    constructor(props) {
        super(props);

        this.state = {
            pagination: {
                pageSize: 1,
                current: 1,
                total: this.props.classes ? this.props.classes.length : 0,
                onChange: this.changePage,
            }
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            pagination: {
                ...this.state.pagination,
                total: newProps.classes.length
            }
        });
    }

    changePage = (pageNum, pageSize) => {

        this.setState({ 
            pagination: { 
                ...this.state.pagination, 
                current: pageNum
            }});

    }

    render() {

        const listData = [];

        const classesArray = this.props.classes ? this.props.classes : {};

        const start = (this.state.pagination.current - 1) * this.state.pagination.pageSize;
        const end = start + this.state.pagination.pageSize <= this.props.classes.length ? start + this.state.pagination.pageSize : this.props.classes.length;

        _.forOwn(classesArray, (value, key) => {
            listData.push({
                href: '#',
                title: value.title,
                avatar: value.picture,
                description: value.summary,
                content: value.description,
            });
        });

        const IconText = ({ type, text }) => (
            <span>
                <Icon type={type} style={{ marginRight: 8 }} />
                {text}
            </span>
        );

        return (
            <List
                itemLayout="vertical"
                size="large"
                pagination={this.state.pagination}
                dataSource={listData}
                renderItem={item => (
                    <List.Item
                        key={item.title}
                        actions={[<IconText type="plus-circle-o" text="View Details" />]}
                        extra={<img width={272} alt="logo" src={item.avatar} />}
                    >                        
                        <List.Item.Meta
                            avatar={<Avatar src={item.avatar} />}
                            title={<a href={item.href}>{item.title}</a>}
                            description={item.description}
                        />
                        {item.content}
                    </List.Item>
                )}
            />
        );
    }

}

export default ClassesList;