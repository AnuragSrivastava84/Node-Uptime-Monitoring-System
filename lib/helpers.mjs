/*
* Helpers for various tasks
*/

import crypto from 'crypto';
import {environementToExport as config} from './config.mjs'

const helpers = {};

// Create a SHA256 hash
helpers.hash = (str) => {
    if(typeof (str) === 'string' && str.length > 0){
        const hash = crypto.createHash('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    }else{
        return false;
    }
}

// Parse JSON string to an object in all the cases without thorwing an error
helpers.parseJsonAToObject = (str) => {
    try{
        const obj = JSON.parse(str);
        return obj;
    }catch(err){
        return {};
    }
}

export default helpers;