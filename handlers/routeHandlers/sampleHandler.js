const handler = {}

handler.sampleHandler = (requestProperties, callback) => {

    callback(406, {
        message: 'sample handler'

    });

}

module.exports = handler