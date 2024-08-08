const https = require('https');
const { twilio } = require('./environments').default;
const queryString = require('querystring');

const notification = {};

//send notification
notification.sendTwilioSms = (phone, message, callback) => {
    const userPhone = typeof (phone) == 'string' && phone.trim().length == 11 ? phone.trim() : false;
    const msg = typeof (message) == 'string' && message.trim().length > 0 && message.trim().length <= 1600 ? message.trim() : false;
    if (userPhone && msg) {
        //configure the request payload
        const payload = {
            'From': twilio.fromPhone,
            'To': `+88${userPhone}`,
            'Body': msg,
        };

        //stringify the payload
        const payloadString = queryString.stringify(payload);
        //configure the request details
        const requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
            'auth': `${twilio.accountSid}:${twilio.authToken}`,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(payloadString)
            }
        };

        //Instantiate the request object
        const req = https.request(requestDetails, (res) => {
            //get the status of the sent request
            const status = res.statusCode;
            //callback if the request went ok
            if (status == 200 || 201) {
                callback("the message is successfully sent");
            } else {
                callback(`Status code returned was ${status}`);
            }
        });
        //bind to the error event so it doesn't get thrown
        req.on('error', (e) => {
            callback(e);
        });
        //add the payload
        req.write(payloadString);
        //end the request
        req.end();
    } else {
        callback('Given parameters were missing or invalid');
    }
};

module.exports = notification;
