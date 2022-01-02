/*
* Library for storing and editing data 
*/

// Depencies
import {open, readFile, unlink} from 'fs/promises';
import path from 'path';

// Container for the module (to be exported)
const lib = {};

// Base directory of the data folder
const __dirname = path.resolve();
lib.baseDir = path.join(__dirname, '/.data'); 

// Write data to a file
lib.create = async (dir, file, data) => {
    try{
        // Convert the data to string
        const stringData = JSON.stringify(data);

        // Open the file
        const fileHandler = await open(lib.baseDir+'/'+dir+'/'+file+'.json','wx');
        
        // Write and close the file
        await fileHandler.writeFile(stringData);
        await fileHandler.close();
        return new Promise((resolve,reject) => { resolve();});
    }catch (err){
        console.log('Error: ', err);
        return new Promise((resolve,reject) => { reject(err);});
    }
};

// Read data from a file
lib.read = async (dir, file) => {
    try{
        // Read the file
        const data = await readFile(lib.baseDir+'/'+dir+'/'+file+'.json',{encoding: 'utf8'});
        console.log('Data: ', data);
        return new Promise((resolve,reject) => { resolve();});
    }catch (err){
        console.log('Error: ', err);
        return new Promise((resolve,reject) => { reject(err);});
    }
}

// Update data inside a file
lib.update = async (dir, file, data) => {
    try{
        // Open the file
        const fileHandler = await open(lib.baseDir+'/'+dir+'/'+file+'.json','r+');

        // Truncate the file
        await fileHandler.truncate();

        // Convert the data to string
        const stringData = JSON.stringify(data);

        // Write and close the file
        await fileHandler.writeFile(stringData);
        await fileHandler.close();
        return new Promise((resolve,reject) => { resolve();});

    }catch (err){
        console.log('Error: ', err);
        return new Promise((resolve,reject) => { reject(err);});
    }
}

// Delete a file
lib.delete = async (dir, file) => {
    try{
        // Unlink the file
        unlink(lib.baseDir+'/'+dir+'/'+file+'.json');
        return new Promise((resolve,reject) => { resolve();});
    }catch (err){
        console.log('Error: ', err);
        return new Promise((resolve,reject) => { reject(err);});
    }
}

// Export the module
export default lib;