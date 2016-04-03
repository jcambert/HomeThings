//Lets require/import the HTTP module
var http = require('http');
var stdio = require('stdio');
var dispatcher = require('httpdispatcher');

var opts = stdio.getopt({
    'port': {key: 'p',args:1, description: 'Http port listen'},
});

//Lets define a port we want to listen to
const DEFAULT_PORT=8080; 

//We need a function which handles requests and send response
function handleRequest(request, response){
    try {
        //log the request on console
        console.log(request.url);
        //Disptach
        dispatcher.dispatch(request, response);
    } catch(err) {
        console.log(err);
    }
}

//Create a server
var server = http.createServer(handleRequest);

var running_port =opts.port ? opts.port : DEFAULT_PORT;

//Lets start our server
server.listen(running_port, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", running_port);
});

dispatcher.onGet("/state", function(req, res) {
    res.writeHead(200, {"Content-Type": "application/json"});
    var result = { state:1, mode: 1 };
    res.end(JSON.stringify(result));
});   