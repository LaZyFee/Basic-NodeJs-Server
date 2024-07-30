const handler = {}

handler.notFoundHandler = (requestProperties, callback) => {

    callback(404, {
        message: 'error handler'

    });

}



module.exports = handler