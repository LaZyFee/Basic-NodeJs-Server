const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');
const data = require('./lib/data');


//app object
const app = {};

//testing file system
data.create('test', 'sample.txt', { name: 'sample', job: 'coder' }, (err) => {
    console.log(err);
})
data.read('test', 'sample.txt', (err, data) => {
    console.log(err, data);
})
data.update('test', 'sample.txt', { name: 'person', job: 'developer' }, (err) => {
    console.log(err);
})
// data.delete('test', 'sample.txt', (err) => {
//     console.log(err);
// })



//create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);

    server.listen(environment.port, () => {
        console.log(`server is running on http://${environment.port}`);
    });

}
//handle request and response
app.handleReqRes = handleReqRes


app.createServer();