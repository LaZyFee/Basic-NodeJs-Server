const { hash, createRandomString, parseJson } = require('../../helpers/utilities');
const data = require('../../lib/data');
const handler = {}
handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callback);

    }
    else {
        callback(405);
    }
}

handler._token = {};

handler._token.post = (requestProperties, callback) => {
    const phone = typeof (requestProperties.body.phone) == 'string' && requestProperties.body.phone.trim().length == 11 ? requestProperties.body.phone : false;

    const password = typeof (requestProperties.body.password) == 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;
    if (phone && password) {
        data.read('users', phone, (err, userData) => {
            let hashedPassword = hash(password);

            if (hashedPassword === parseJson(userData).password) {
                let tokenId = createRandomString(20)
                let expires = Date.now() + 60 * 60 * 1000;

                let tokenObject = {
                    'id': tokenId,
                    phone,
                    expires
                };
                //store the token
                data.create('tokens', tokenId, tokenObject, (err) => {
                    if (!err) {
                        callback(200, tokenObject)
                    }
                    else {
                        callback(500, {
                            error: 'something went wrong in server side'
                        })
                    }
                })
            }
            else {
                callback(400, {
                    error: 'password is not valid',
                });
            }

        })
    }
    else {
        callback(400, {
            error: 'You have a error',
        });
    }

}
handler._token.get = (requestProperties, callback) => {
    //check the id if valid
    const id = typeof (requestProperties.queryStringObject.id) === 'string' && requestProperties.queryStringObject.id.trim().length == 20 ? requestProperties.queryStringObject.id : false;
    if (id) {
        //lookup the token
        data.read('tokens', id, (err, tokenData) => {
            const token = { ...parseJson(tokenData) }
            if (!err && token) {
                callback(200, token)
            }
            else {
                callback(404, {
                    error: 'Requested token was not found'
                })
            }
        })
    }
    else {
        callback(404, {
            error: 'Requested token was not found'
        })
    }


}
handler._token.put = (requestProperties, callback) => {
    const id = typeof (requestProperties.body.id) === 'string' && requestProperties.body.id.trim().length == 20 ? requestProperties.body.id : false;
    const extend = typeof (requestProperties.body.extend) === 'boolean' && requestProperties.body.extend === true ? true : false;
    if (id && extend) {
        data.read('tokens', id, (err, tokenData) => {
            const token = { ...parseJson(tokenData) }
            if (!err && token) {
                if (token.expires > Date.now()) {
                    token.expires = Date.now() + 60 * 60 * 1000
                    //store the new updates
                    data.update('tokens', id, token, (err) => {
                        if (!err) {
                            callback(200, token)
                        }
                        else {
                            callback(500, {
                                error: 'something went wrong in server side'
                            })
                        }
                    })
                }
                else {
                    callback(400, {
                        error: 'token already expired'
                    })
                }
            }
            else {
                callback(404, {
                    error: 'Requested token was not found'
                })
            }
        })
    }
    else {
        callback(404, {
            error: 'Requested token was not found'
        })
    }


}
handler._token.delete = (requestProperties, callback) => {
    const id = typeof (requestProperties.queryStringObject.id) === 'string' && requestProperties.queryStringObject.id.trim().length == 20 ? requestProperties.queryStringObject.id : false;
    if (id) {
        data.read('tokens', id, (err, tokenData) => {
            const token = { ...parseJson(tokenData) }
            if (!err && token) {
                data.delete('tokens', id, (err) => {
                    if (!err) {
                        callback(200, {
                            message: 'token was deleted successfully'
                        })
                    }
                    else {
                        callback(500, {
                            error: 'something went wrong in server side'
                        })
                    }
                })
            }
            else {
                callback(404, {
                    error: 'Requested token was not found'
                })
            }
        })
    }
    else {
        callback(404, {
            error: 'Requested token was not found'
        })
    }

}

handler._token.verify = (id, phone, callback) => {
    data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            if (parseJson(tokenData).phone == phone && parseJson(tokenData).expires > Date.now()) {
                callback(true)
            }
            else {
                callback(false)
            }
        }
        else {
            callback(false)
        }
    })
}

module.exports = handler