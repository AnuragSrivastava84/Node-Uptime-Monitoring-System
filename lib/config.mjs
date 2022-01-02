/*
* Create and export configuartion variables
*/

// Container for all the environment
const environments = {};

// Staging (default) environment
environments.staging = {
    httpPort: 3000,
    httpsPort : 3001,
    envName : 'staging',
    hashingSecret: 'thisIsASecret'
};

// Production environment
environments.production = {
    httpPort: 5000,
    httpsPort : 5001,
    envName : 'production',
    hashingSecret: 'thisIsASecret'
};


// Determine which environment was as a command line argument
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is one the environments above, if not, default to staging
const environementToExport = typeof(environments[currentEnvironment]) === 'object' ?  environments[currentEnvironment] : environments.staging;

// Export the module
export {environementToExport};