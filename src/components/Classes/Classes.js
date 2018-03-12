import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import ClassesList from './ClassesList';

import withAuthorization from '../Session/withAuthorization'
import { db } from '../../firebase';

class Classes extends Component {
    constructor(props) {
        super(props);

        this.state = {
            classes: []
        };
    }

    componentDidMount() {
        const { onSetClasses } = this.props;

        let allClasses = db.getClasses();

        allClasses.on('value', (snapshot) => {
            this.setState(() => ({ 
                classes: snapshot.val()
             }))            
        }).bind(this);
    }

    render() {
        const { classes } = this.state;

        return (
            <div>
                <h1>Classes Home</h1>

                {!!classes && <ClassesList classes={classes} />}

            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    classes: state.classesState.classes,
});

const mapDispatchToProps = (dispatch) => ({
    onSetClasses: (classes) => dispatch({ type: 'CLASSES_SET', classes }),
});

const authCondition = (authUser) => !!authUser;

export default compose(
    withAuthorization(authCondition),
    connect(mapStateToProps, mapDispatchToProps)
)(Classes);