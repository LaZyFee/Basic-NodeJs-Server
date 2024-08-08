//depedencies


//module scaffolding
const environments = {}



environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'thisIsASecretKey',
    maxChecks: 5,
    twilio: {
        fromPhone: process.env.TWILIO_FROM_PHONE,
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
    },

}

environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'thisIsASecretKey',
    maxChecks: 5,
    twilio: {
        fromPhone: process.env.TWILIO_FROM_PHONE,
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
    },

}

//determine which environment was passed
const currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : 'staging';

//export corresponding environment object
const environmentToExport = typeof (environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

//export module
export default environmentToExport