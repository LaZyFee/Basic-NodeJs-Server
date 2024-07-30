const crypto = require('crypto');
const utilities = {}
const environments = require('../helpers/environments'); 2

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
            .createHmac('sha256', environments[process.env.NODE_ENV].secretKey)
            .update(str)
            .digest('hex');
        return hash
    } else {
        return false
    }
}
//random string crate hash/HMAC
utilities.createRandomString = (strlength) => {

    return 'comingsooon'

}









module.exports = utilities