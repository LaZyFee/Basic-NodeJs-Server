const { hash, parseJson } = require('../../helpers/utilities');
const data = require('../../lib/data');
const tokenHandler = require('./tokenHandler'); //import tokenHandler


const handler = {}

handler.userHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._users[requestProperties.method](requestProperties, callback);

    }
    else {
        callback(405);
    }
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {
    // Log the request body to debug
    // console.log('Request Body:', requestProperties.body);

    const firstName = typeof requestProperties.body.firstName === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName.trim() : false;
    const lastName = typeof requestProperties.body.lastName === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName.trim() : false;
    const phone = typeof requestProperties.body.phone === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone.trim() : false;
    const password = typeof requestProperties.body.password === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password.trim() : false;
    const tosAgreement = typeof requestProperties.body.tosAgreement == 'boolean' ? requestProperties.body.tosAgreement : false;

    // console.log(firstName, lastName, phone, password, tosAgreement);
    if (firstName && lastName && phone && password && tosAgreement) {
        // Check if user already exists
        data.read('users', phone, (err) => {
            if (err) {
                const userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement
                };
                // Store the new user in the database
                data.create('users', phone, userObject, (err) => {
                    if (!err) {
                        callback(200, {
                            message: 'User was created successfully'
                        });
                    } else {
                        callback(500, {
                            error: 'There was a problem in the server side'
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'User already exists'
                });
            }
        });
    }
    else {
        callback(400, {
            error: 'You have a problem in your request'
        });
    }

};

handler._users.get = (requestProperties, callback) => {
    //check the phone if valid
    const phone = typeof requestProperties.queryStringObject.phone === 'string' && requestProperties.queryStringObject.phone.trim().length == 11 ? requestProperties.queryStringObject.phone : false;
    if (phone) {
        //veify token
        const token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false;
        tokenHandler._token.verify(token, phone, (tokenId) => {
            if (tokenId) {
                //lookup the user
                data.read('users', phone, (err, user) => {
                    const data = { ...parseJson(user) }
                    if (!err && data) {
                        delete data.password;
                        callback(200, data);
                    } else {
                        callback(404, {
                            error: 'Requested user was not found'
                        })
                    }
                })
            } else {
                callback(403, {
                    error: 'Authentication failed'
                })
            }
        })


        //lookup the user
        data.read('users', phone, (err, user) => {
            const data = { ...parseJson(user) }
            if (!err && data) {
                delete data.password;
                callback(200, data);
            } else {
                callback(404, {
                    error: 'Requested user was not found'
                })
            }
        })
    } else {
        callback(404, {
            error: 'Requested user was not found'
        })
    }
}
handler._users.put = (requestProperties, callback) => {
    //check the phone if valid
    const phone = typeof (requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length == 11 ? requestProperties.body.phone : false;
    //check the optional fields
    const firstName = typeof (requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;
    const lastName = typeof (requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;
    const password = typeof (requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;
    if (phone) {
        if (firstName || lastName || password) {
            //veify token
            const token = typeof requestProperties.headersObject.token === 'string' ? requestProperties.headersObject.token : false;
            tokenHandler._token.verify(token, phone, (tokenId) => {
                if (tokenId) {
                    //lookup the user
                    data.read('users', phone, (err, uData) => {

                        const userData = { ...parseJson(uData) }

                        if (!err && userData) {
                            if (firstName) {
                                userData.firstName = firstName
                            }
                            if (lastName) {
                                userData.lastName = lastName
                            }
                            if (password) {
                                userData.password = hash(password)
                            }
                            //store the new updates
                            data.update('users', phone, userData, (err) => {
                                if (!err) {
                                    callback(200, {
                                        message: 'User was updated successfully'
                                    })
                                } else {
                                    callback(500, {
                                        error: 'There was a problem in the server side'
                                    })
                                }
                            })
                        } else {
                            callback(404, {
                                error: 'Requested user was not found'
                            })
                        }
                    })

                } else {
                    callback(403, {
                        error: 'Authentication failed'
                    })
                }
            })

        }
        else {
            callback(400, {
                error: 'You have a problem in your request'
            })
        }
    } else {
        callback(404, {
            error: 'Requested user was not found'
        })
    }

}
handler._users.delete = (requestProperties, callback) => {
    //check the phone if valid
    const phone = typeof (requestProperties.queryStringObject.phone) === 'string' && requestProperties.queryStringObject.phone.trim().length == 11 ? requestProperties.queryStringObject.phone : false;
    if (phone) {
        //lookup the user
        data.read('users', phone, (err, userData) => {
            if (!err && userData) {
                data.delete('users', phone, (err) => {
                    if (!err) {
                        callback(200, {
                            message: 'User was deleted successfully'
                        })
                    } else {
                        callback(500, {
                            error: 'There was a problem in the server side'
                        })
                    }
                })
            } else {
                callback(404, {
                    error: 'Requested user was not found'
                })
            }
        })
    } else {
        callback(404, {
            error: 'Requested user was not found'
        })
    }

}

module.exports = handler