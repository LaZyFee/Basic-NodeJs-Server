
//dependencies
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const routes = require('../routes');
const { notFoundHandler } = require('../handlers/routeHandlers/notFoundHandler');
const { parseJson } = require('../helpers/utilities');
//module scaffolding
const handler = {};



handler.handleReqRes = (req, res) => {
    //get the url and parse it
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');
    //get the http method
    const method = req.method.toLowerCase();
    //get the query string object
    const queryStringObject = parsedUrl.query;
    //get the headers
    const headersObject = req.headers;

    const requestProperties = {
        parsedUrl,
        path,
        trimmedPath,
        method,
        queryStringObject,
        headersObject
    }


    //get the payload if any
    const decoder = new StringDecoder('utf-8');
    let realData = '';

    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;


    // req.on('error', (err) => {
    //     console.log(err);
    // });

    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });

    req.on('end', () => {
        realData += decoder.end();

        requestProperties.body = parseJson(realData);


        chosenHandler(requestProperties, (statusCode, payload) => {
            statusCode = typeof (statusCode) === 'number' ? statusCode : 200;
            payload = typeof (payload) === 'object' ? payload : {};

            const payloadString = JSON.stringify(payload);

            //return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });
        //response handle 
        // res.end('Hello World');
    });
}


module.exports = handler