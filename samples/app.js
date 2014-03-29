var restify = require('restify')
  , bunyan = require('bunyan')
  , app = restify.createServer()
  , PeerServer = require('../lib/server').PeerServer
  , peerserver = new PeerServer({port: 9000, key: 'peerjs', debug: false, disable_xhr: true})
  , socket_io = require('socket.io')
  
  
app.use(restify.bodyParser());
app.use(restify.queryParser());

var log = bunyan.createLogger({
  name: 'audit',
  stream: process.stdout
});

// restify

app.on('after', restify.auditLogger({
  log: log
}));

app.get('/hello/:name', function(req, res, next) {
  res.send('hello ' + req.params.name);
});

app.post('/message/:id', function(req, res, next) {
  var mesg = decodeURI(req.body.split("=")[1]);
  var id = req.params.id;
  push(id, mesg);
  log.info(id, mesg);
  res.send("message received");

  return next;
});

app.get(/.*/, restify.serveStatic({
  directory: __dirname + '/public',
  default: 'index.html'
}));

app.listen(3000, function() {
  log.info('%s listening at %s', app.name, app.url);
});

// socket.io
var io = socket_io.listen(app, {'log level': 1, 'transports': ['xhr-polling']});

io.sockets.on('connection', function(socket) {
});

var push = function(id, mesg) {
  io.sockets.emit('message', {id: id, mesg: mesg});
}

// peerjs-server
peerserver.on("connection", function(id){
  log.info("peerserver detect connection from %s", id);
});
peerserver.on("disconnect", function(id){
  log.info("peerserver detect disconnect for %s", id);
});
