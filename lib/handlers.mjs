/*
* Request Handlers
*/

import * as _data from './data.mjs';
// import helpers from './helper.mjs';

// Define the handlers
const handlers = {};

handlers.notFound = (data) => {
    return new Promise((resolve, reject) => reject({
        status: 404,
        payload: '',
    }));
};

// Ping handler
handlers.ping = (data) => {
    // Set the empty string if payload is empty
    const payloadString = typeof(data.payload) === 'string' ?  data.payload : '';
    return new Promise(resolve => resolve({
    status: 200,
    payload: payloadString,
    }));
};

// Container for the user module
handlers._users = {};


export default handlers;