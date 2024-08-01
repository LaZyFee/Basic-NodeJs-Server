const handler = {}

handler.sampleHandler = (requestProperties, callback) => {

    callback(200, {
        message: 'this is sample handler'

    });

}

module.exports = handler