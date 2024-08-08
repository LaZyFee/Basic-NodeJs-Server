//depedencies


//module scaffolding
const environments = {}


environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'thisIsASecretKey',
    maxChecks: 5,
    twilio: {
        fromPhone: '+12089532154',
        accountSid: 'AC74ca703f99618fce73cf811d846237c3',
        authToken: 'e4d9a37b1572a566cd96438ca7ae224f',
    },

}

environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'thisIsASecretKey',
    maxChecks: 5,
    twilio: {
        fromPhone: '+12089532154',
        accountSid: 'AC74ca703f99618fce73cf811d846237c3',
        authToken: 'e4d9a37b1572a566cd96438ca7ae224f',
    },

}

//determine which environment was passed
const currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : 'staging';

//export corresponding environment object
const environmentToExport = typeof (environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

//export module
module.exports = environmentToExport