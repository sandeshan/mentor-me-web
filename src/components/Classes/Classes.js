import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import _ from 'lodash';
import axios from 'axios';

import ClassesList from './ClassesList';

import { AutoComplete, Select } from 'antd';

import withAuthorization from '../Session/withAuthorization'
import { db } from '../../firebase';

const Option = Select.Option;

const proxyURL = process.env.REACT_APP_PROXY_URL;
const placesURL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const distanceURL = 'https://maps.googleapis.com/maps/api/distancematrix/json';

class Classes extends Component {
    constructor(props) {
        super(props);

        this.state = {
            classes: [],
            selectedCity: '',
            placesResults: []
        };

        fetch(proxyURL + 'https://freegeoip.net/json/')
            .then(response => response.json())
            .then(json => {
                const query = `${json.city}, ${json.region_name}, ${json.country_name}`;

                this.state = {
                    classes: [],
                    selectedCity: query,
                    placesResults: []
                };
            })
            .catch(error => {
                console.log(error);
            });
    }

    onSelect = (option, value) => {
        console.log(value);
    }

    locationSearch = (query) => {

        if (query) {
            var targetUrl = `${placesURL}?input=${query}&types=(cities)&key=${process.env.REACT_APP_PLACES_API_KEY}`;
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

    calcDistance = (thisClass) => {
        var targetUrl = `${distanceURL}?origins=${this.state.selectedCity}&destinations=${thisClass.location.address}&key=${process.env.REACT_APP_DISTANCE_MATRIX_KEY}`;

        axios.get(proxyURL + targetUrl)
            .then(function (response) {
                let json = response.data;
                if (json.rows[0].elements[0].status === 'ZERO_RESULTS') {
                    return false;
                } else {
                    return (json.rows[0].elements[0].distance.value <= 50000);
                }                                    
            })
            .catch(function (error) {
                console.log(error);
                return false;
            });

        // fetch(proxyURL + targetUrl)
        //     .then(response => response.json())
        //     .then(json => {
        //         if (json.rows[0].elements[0].status === 'ZERO_RESULTS')
        //             return false;
        //         else
        //             return (json.rows[0].elements[0].distance.value <= 50000);
        //     })
        //     .catch(error => {
        //         console.log(error);
        //         return false;
        //     });
    }

    componentDidMount() {
        const { onSetClasses } = this.props;

        let classesQuery = db.getClasses();

        classesQuery.on('value', (snapshot) => {

            let allClasses = [];
            allClasses = _.filter(snapshot.val(), this.calcDistance);

            this.setState(() => ({
                classes: allClasses
             }));          
        });
    }

    render() {
        const { classes, placesResults } = this.state;

        const children = placesResults.map((place) => {
            let key = place.place_id + "|" + place.description
            return <Option key={key}>{place.description}</Option>;
        });

        return (
            <div>
                <h1>Classes Home</h1>
                <br/>
                <div>
                    <AutoComplete
                        size="large"
                        onSearch={this.locationSearch}
                        onSelect={this.onSelect}
                        placeholder="Select your city">
                        {children}
                    </AutoComplete>
                </div>

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