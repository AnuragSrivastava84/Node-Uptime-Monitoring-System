/*
* Primary file for the API
*/

// Dependencies
import http from 'http';
import url from 'url';
import { StringDecoder } from 'string_decoder';
import {environementToExport as config} from './config.mjs';

const server = http.createServer((req, res) => {
    
    // Get the URL and parse it into
    const parsedUrl = url.parse(req.url, true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/$/g,'');

    // Get the query string as an object
    const queryStringObject = parsedUrl.query;

    // Get the HTTP method
    const method = req.method.toLowerCase();

    // Get the header as an object
    const headers = req.headers;

    // Get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        // Choose the handler this request should go to, if one is not found, use the not found handler
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            'payload' : buffer
        }

        // Route the requests to handler specified in the router
        chosenHandler(data, (statusCode, payload)=>{
            // use the status code called back by the handler, or default set to 200
            statusCode = typeof(statusCode) === 'number'? statusCode : 200;

            // use the payload called back by the handler, or default to an empty object
            payload = typeof(payload) === 'object' ? payload : {};

            // Convert the payload to a string
            const payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            
            // Log the request path
            console.log('Returning this response: ', statusCode, payloadString);
        });        
    });
});

server.listen(config.port,()=>{
    console.log('The server is listening on port '+ config.port+ ' in '+config.envName+ ' mode');
});

// Define the handlers
const handlers = {};

// Sample handlers
handlers.sample = (data, callback) =>{
    // Callback a http status code, and a payload object
    callback(406, {'name': 'sample handler'});
}

handlers.notFound = (data, callback) => {
    callback(404);
}
// Define a request router
const router = {
    'sample': handlers.sample
}