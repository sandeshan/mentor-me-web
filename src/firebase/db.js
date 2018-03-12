import { db } from './firebase';

// User API

export const doCreateUser = (id, email, fullName, profileImage, phonePrefix, phoneCountry, phoneNum) =>
    db.ref(`users/${id}`).set({
        email,
        fullName,
        profileImage,
        phoneNum: {
            country: phoneCountry,
            prefix: phonePrefix,
            number: phoneNum
        }
    });

export const onceGetTestData = () =>
    db.ref('test').once('value');

// Get details of User by unique id
export const getUser = (uid) => 
    db.ref('users/' + uid);

// Update user details
export const updateUser = (id, fullName, profileImage, phonePrefix, phoneCountry, phoneNum) =>
    db.ref(`users/${id}`).update({
        fullName,
        profileImage,
        phoneNum: {
            country: phoneCountry,
            prefix: phonePrefix,
            number: phoneNum
        }
    });

// Classes API

// Get all Classes
export const getClasses = (uid) =>
    db.ref('classes');

export const getCategories = () =>
    db.ref('categories');

export const doCreateClass = (teacherID, category, title, summary, description, picture, location, createdTime) =>
    db.ref('classes').push({
        teacherID, category, title, summary, description, picture, location, createdTime,
        interested: []
    });
