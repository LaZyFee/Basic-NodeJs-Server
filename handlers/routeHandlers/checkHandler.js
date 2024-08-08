const { hash, parseJSON, createRandomString } = require('../../helpers/utilities');
const data = require('../../lib/data');
const tokenHandler = require('./tokenHandler'); //import tokenHandler
const { maxChecks } = require('../../helpers/environments').default

const handler = {}

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['post', 'get', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);

    }
    else {
        callback(405);
    }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
    const protocol =
        typeof (requestProperties.body.protocol) === 'string' && ['https', 'http'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;
    const url =
        typeof (requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;
    const method =
        typeof (requestProperties.body.method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;
    const successCodes =
        typeof requestProperties.body.successCodes === 'object' &&
            requestProperties.body.successCodes instanceof Array
            ? requestProperties.body.successCodes
            : false;


    const timeoutSeconds =
        typeof requestProperties.body.timeoutSeconds === 'number' &&
            requestProperties.body.timeoutSeconds % 1 === 0 &&
            requestProperties.body.timeoutSeconds >= 1 &&
            requestProperties.body.timeoutSeconds <= 5
            ? requestProperties.body.timeoutSeconds
            : false;


    if (protocol && url && method && successCodes) {
        const token = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;

        data.read('tokens', token, (err, tokenData) => {

            if (!err && tokenData) {
                let userPhone = parseJSON(tokenData).phone;
                data.read('users', userPhone, (err, userData) => {
                    if (!err && userData) {
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                let userObject = parseJSON(userData);
                                let userChecks = typeof (userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                if (userChecks.length < maxChecks) {

                                    let checkId = createRandomString(20);

                                    let checkObject = {
                                        id: checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,

                                    };
                                    data.create('checks', checkId, checkObject, (err) => {
                                        if (!err) {
                                            data.read('users', userPhone, (err, userData) => {
                                                if (!err && userData) {
                                                    let userObject = parseJSON(userData);
                                                    // userObject.checks = typeof (userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];
                                                    userObject.checks = userChecks;
                                                    userObject.checks.push(checkId);
                                                    data.update('users', userPhone, userObject, (err) => {
                                                        if (!err) {
                                                            callback(200, checkObject);
                                                        } else {
                                                            callback(500, {
                                                                Error: 'Could not update the user with new check'
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    callback(500, {
                                                        Error: 'Could not find the user who created the check'
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                Error: 'Could not create the new check'
                                            });
                                        }
                                    });
                                } else {
                                    callback(400, {
                                        Error: 'The user already has the maximum number of checks (' + maxChecks + ')'
                                    });
                                }
                            } else {
                                callback(403, {
                                    Error: 'Authentication failed'
                                });
                            }
                        });

                    } else {
                        callback(500, {
                            Error: 'Could not find the user who created the check'
                        });
                    }
                });
            } else {
                callback(403, {
                    Error: 'Authentication failed'
                });
            }
        });
    } else {
        callback(400, {
            Error: 'You have a problem in your request'
        });
    }
}

handler._check.get = (requestProperties, callback) => {
    const id = typeof (requestProperties.queryStringObject.id) === 'string' && requestProperties.queryStringObject.id.trim().length == 20 ? requestProperties.queryStringObject.id : false;
    if (id) {
        data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                const token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false

                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        callback(200, parseJSON(checkData));
                    } else {
                        callback(403, {
                            Error: 'Authentication failed'
                        });
                    }
                })
            } else {
                callback(404, {
                    Error: 'Check not found'
                });
            }
        });
    } else {
        callback(400, {
            Error: 'You have a problem in your request'
        });
    }

}
handler._check.put = (requestProperties, callback) => {
    const id =
        typeof (requestProperties.body.id) === 'string' && requestProperties.body.id.trim().length == 20 ? requestProperties.body.id : false;
    const protocol =
        typeof (requestProperties.body.protocol) === 'string' && ['https', 'http'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;
    const url =
        typeof (requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;
    const method =
        typeof (requestProperties.body.method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;
    const successCodes =
        typeof (requestProperties.body.successCodes) === 'object' && requestProperties.body.successCodes instanceof Array && requestProperties.body.successCodes.length > 0 ? requestProperties.body.successCodes : false;
    const timeoutSeconds =
        typeof (requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false;

    if (id) {
        if (protocol || url || method || successCodes || timeoutSeconds) {
            data.read('checks', id, (err, checkData) => {
                if (!err && checkData) {
                    const token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false;

                    tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            checkData = parseJSON(checkData);

                            if (protocol) {
                                checkData.protocol = protocol;
                            }
                            if (url) {
                                checkData.url = url;
                            }
                            if (method) {
                                checkData.method = method;
                            }
                            if (successCodes) {
                                checkData.successCodes = successCodes;
                            }
                            if (timeoutSeconds) {
                                checkData.timeoutSeconds = timeoutSeconds;
                            }

                            data.update('checks', id, checkData, (err) => {
                                if (!err) {
                                    callback(200, checkData);
                                } else {
                                    callback(500, {
                                        Error: 'Could not update the check'
                                    });
                                }
                            });
                        } else {
                            callback(403, {
                                Error: 'Authentication failed'
                            });
                        }
                    });
                } else {
                    callback(400, {
                        Error: 'Check not found'
                    });
                }
            });
        } else {
            callback(400, {
                Error: 'You have a problem in your request'
            });
        }
    } else {
        callback(400, {
            Error: 'You have a problem in your request'
        });
    }
};

handler._check.delete = (requestProperties, callback) => {
    const id = typeof requestProperties.queryStringObject.id === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;

    if (id) {
        data.read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                const token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false;

                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        data.delete('checks', id, (err) => {
                            if (!err) {
                                data.read('users', parseJSON(checkData).userPhone, (err, userData) => {
                                    if (!err && userData) {
                                        const userObject = parseJSON(userData);
                                        const userChecks = typeof userObject.checks === 'object' && userObject.checks instanceof Array ? userObject.checks : [];
                                        const checkPosition = userChecks.indexOf(id);

                                        if (checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1);
                                            userObject.checks = userChecks;

                                            data.update('users', userObject.phone, userObject, (err) => {
                                                if (!err) {
                                                    callback(200);
                                                } else {
                                                    callback(500, { Error: 'Could not update the user' });
                                                }
                                            });
                                        } else {
                                            callback(500, { Error: 'Check ID not found in user checks' });
                                        }
                                    } else {
                                        callback(500, { Error: 'Could not find the user' });
                                    }
                                });
                            } else {
                                callback(500, { Error: 'Could not delete the check' });
                            }
                        });
                    } else {
                        callback(403, { Error: 'Authentication failed' });
                    }
                });
            } else {
                callback(500, { Error: 'Could not find the check' });
            }
        });
    } else {
        callback(400, { Error: 'Missing required fields' });
    }
};


module.exports = handler