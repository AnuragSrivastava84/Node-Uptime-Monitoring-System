/*
* Request Handlers
*/

import { default as _data } from './data.mjs';
import helpers from './helpers.mjs';

// Define the handlers
const handlers = {};

handlers.notFound = (data) => {
    return new Promise((resolve, reject) => reject({
        status: 404,
        payload: {},
    }));
};

// Ping handler
handlers.ping = (data) => {
    // Set the empty string if payload is empty
    return new Promise(resolve => resolve({
    status: 200,
    payload: data.payload,
    }));
};

// Users handler
handlers.users = async (data) => {
    const acceptableMethods = ['post', 'get','put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > - 1){
        const userResponse = await handlers._users[data.method](data);
        return userResponse;
    }else{
        return new Promise((resolve, reject) => reject({
            staus: 405,
            payload: {}
        }))
    }
}

// Container for the user module
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = async (data) => {
    const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.length > 0 ? data.payload.lastName.trim() : false;
    const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.length === 10 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) === 'string' && data.payload.password.length > 0 ? data.payload.password.trim() : false;
    const tosAgreement = typeof(data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement === true ? true : false;
    if(firstName && lastName && phone && password && tosAgreement){
        // Make sure that the user does not already exist
        await createUser(data);
        return new Promise((resolve, reject) => resolve({
            status: 200,
            payload: {}
        }))
    }else {
        return new Promise((resolve, reject) => reject({
            status: 400,
            payload: {
                error: 'Missing required fields'
            }
        }));
    }
}

const createUser = async (data) => {
    try{
        await _data.read('user',data.payload.phone);
        return new Promise((resolve, reject) => reject({
            status: 400,
            payload : {
                error: 'User already exist'
            }
        }))
    }catch(err){
        await createUserFile(data);
        return;
    }
}

const createUserFile = async (data) => {
    try{
        const userPassword = helpers.hash(data.payload.password);
        if(userPassword){
            const userObject = {
                firstName: data.payload.firstName,
                lastName: data.payload.lastName,
                phone: data.payload.phone,
                password: userPassword,
                tosAgreement: data.payload.tosAgreement,
            }
            await _data.create('user',data.payload.phone, userObject);
            return;
        }else {
            return new Promise((resolve,reject) => reject({
                status: 500,
                payload: {
                    error: 'Could not hash the user\'s password'
                }
            }));
        }
    }catch (err){
        return new Promise((resolve, reject) => reject({
            status: 500,
            payload: {
                error: `User with the ${data.payload.phone} phone number is already exist`
            }
        }));
    }
}

// Users - get
handlers._users.get = (data) =>{}

//  Users - put
handlers._users.put = (data) => {}

// Users - delete
handlers._users.delete =(data) => {}

export default handlers;