const crypto = require('crypto');
const utilities = {}
const environments = require('../helpers/environments');

//parse JSON string to object
utilities.parseJson = (jsonString) => {
    let output;
    try {
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }

    return output
}

//hash string crate hash/HMAC
utilities.hash = (str) => {
    if (typeof (str) === 'string' && str.length > 0) {
        const hash = crypto
            .createHmac('sha256', environments.secretKey)
            .update(str)
            .digest('hex');
        return hash
    }
    return false
}
//random string crate hash/HMAC
utilities.createRandomString = (strlength) => {
    let length = strlength;
    length = typeof strlength === 'number' && strlength > 0 ? strlength : false;

    if (length) {
        let possibleCharacter = 'abcdefghijklmnopqrstuvwxyz123456789'
        let output = ''
        for (let i = 1; i <= strlength; i++) {
            const randomCharacter = possibleCharacter.charAt(Math.floor(Math.random() * possibleCharacter.length))

            output += randomCharacter;
        }
        return output;
    }
    else
        return false;
}



module.exports = utilities