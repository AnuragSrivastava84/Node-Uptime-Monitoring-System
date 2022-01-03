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
    const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
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
// Required - phone number
// Optional - none
// @TODO - Let the user to access it's own data, not the other user's data
handlers._users.get = async (data) =>{
    try{
        // Check for the required field
        const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
        if(phone){
        const userData = await _data.read('user', phone);
        delete userData.password;
        return new Promise((resolve,reject) => resolve({
            status: 200,
            payload: userData
        }));
        }else{
            return new Promise((resolve, reject) => reject({
                status: 400,
                payload: {
                    error: 'Missing required field'
                }
            }))
        }
    }catch (err){
        return new Promise((resolve, reject) => reject({
            status: 404,
            payload: {
                error: 'User not found'
            }
        }))
    }
}

//  Users - put
// Required - phone number
// Optional - firstName or lastName or phone number (at least one field is required)
// @TODO: Only let the authenticated user to update it's own information, don't let the user to update other user's information
handlers._users.put = async (data) => {
    try{
        // Check for the required field
        const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
        
        // Check for optional fields
        const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.length > 0 ? data.payload.firstName.trim() : false;
        const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.length > 0 ? data.payload.lastName.trim() : false;
        const password = typeof(data.payload.password) === 'string' && data.payload.password.length > 0 ? data.payload.password.trim() : false;

        if(phone){
            const userData = await getUserData(phone);
            await updateUserData(userData.payload, firstName,lastName, password);
            delete userData.payload.password;
            return new Promise((resolve, reject) => resolve({
                status: 200,
                payload: userData
            }));
        }else{
            return new Promise((resolve, reject) => reject({
                status : 400,
                error : 'Missing required field'
            }))
        }
    }catch (err){
        return new Promise((resolve, reject) => reject({
            status : err.status,
            payload : err.payload
        }))
    }   
}

const getUserData = async (phone) => {
    try{
        const user = await _data.read('user', phone);
        return new Promise((resolve, reject) => resolve({
            status: 200,
            payload: user
        }));
    }catch (err){
        return new Promise((resolve, reject) => reject({
            status: 404,
            payload: {
                error: 'Specified user not found'
            }
        }))
    }
}

const updateUserData = async (userData,firstName, lastName, password) => {
    try{
        if(firstName || lastName || password){
            if(firstName)
                userData.firstName = firstName;
            
            if(lastName)
                userData.lastName = lastName;
            
            if(password)
                userData.password = helpers.hash(password); 
            
            await _data.update('user',userData.phone, userData); 
            return new Promise((resolve, reject) => resolve({
                status: 200,
                payload: userData
            }));
        }else{
            return new Promise((resolve, reject) => reject({
                status: 400,
                payload: {
                    error: 'Atleast one field is required to update'
                }
            }))
        }
    }catch (err){
        return new Promise((resolve, reject) => reject({
            status: 500,
            payload: {
                error: 'Error occurred in updating the user information'
            }
        }))
    }
}

// Users - delete
// Required - phone number
// @TODO: Only let the authenticated user to delete it's own information, don't let the user to delete other user's information
handlers._users.delete = async (data) => {
    // Check for the required field
    const phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
    if(phone){
        await getUserData(phone);
        await deleteUser(phone);
        return new Promise((resolve,reject) => resolve({
            status: 200,
            payload: {}
        }));
    }else{
        return new Promise((resolve, reject) => reject({
            status: 400,
            payload: {
                error: 'Missing required field'
            }
        }))
    }
}

const deleteUser = async (phone) =>{
    try {
        await _data.delete('user', phone);
        return new Promise((resolve, reject) => resolve({
            status: 200,
            payload: {}
        }))
    }catch (err){
        return new Promise((resolve, reject) => reject({
            status: 500,
            payload: {
                error: 'Error occurred in deleting the user'
            }
        }))
    }
}

export default handlers;