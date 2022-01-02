/*
* Primary file for the API
*/

// Dependencies
import http from 'http';
import https from 'https';
import url from 'url';
import { StringDecoder } from 'string_decoder';
import {environementToExport as config} from './lib/config.mjs';
import fs from 'fs';
import handlers from './lib/handlers.mjs';
import helpers from './lib/helpers.mjs';

// Instantiating the http server
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);    
});

// Start the http server
httpServer.listen(config.httpPort,()=>{
    console.log('The server is listening on port '+ config.httpPort+ ' in '+config.envName+ ' mode');
});

// Instantiating the HTTPS server
const httpsServerOption = {
    key: fs.readFileSync('./https/key.pem'),
    cert: fs.readFileSync('./https/cert.pem')
}

// Instatiating the https server
const httpsServer = https.createServer(httpsServerOption, (req, res) => {
    unifiedServer(req, res);    
});

// Start the https server
httpsServer.listen(config.httpsPort,()=>{
    console.log('The server is listening on port '+ config.httpsPort+ ' in '+config.envName+ ' mode');
});

// All the server logic for both the http and https server
const unifiedServer = (req, res) => {
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

    req.on('end', async () => {
        buffer += decoder.end();
        // Choose the handler this request should go to, if one is not found, use the not found handler
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            payload : helpers.parseJsonAToObject(buffer)
        }

        // Route the requests to handler specified in the router
        try{
            const handlerResponse =  await chosenHandler(data);
            // Return the response
            setResponse(res, handlerResponse);

            // Log the request path
            console.log('Returning this response: ', handlerResponse.status, handlerResponse.payload);
        }catch(err){
            setResponse(res, err);
        }        
    });
}

const setResponse = (res, handlerResponse) => {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(handlerResponse.status);
    const payloadString = typeof handlerResponse.payload === 'object' ? JSON.stringify(handlerResponse.payload) : '';
    res.end(payloadString);
} 

// Define a request router
const router = {
    ping: handlers.ping,
    users: handlers.users,
}