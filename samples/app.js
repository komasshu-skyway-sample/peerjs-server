var restify = require('restify')
  , bunyan = require('bunyan')
  , app = restify.createServer()
  , PeerServer = require('../lib/server').PeerServer
  , peerserver = new PeerServer({port: 9000, key: 'peerjs'});

app.use(restify.queryParser());

var log = bunyan.createLogger({
  name: 'audit',
  stream: process.stdout
});

app.on('after', restify.auditLogger({
  log: log
}));

app.get('/hello/:name', function(req, res, next) {
  res.send('hello ' + req.params.name);
});

app.get(/.*/, restify.serveStatic({
  directory: __dirname + '/public',
  default: 'index.html'
}));

app.listen(3000, function() {
  log.info('%s listening at %s', app.name, app.url);
});


peerserver.on("connection", function(id){
  log.info("peerserver detect connection from %s", id);
});
peerserver.on("disconnect", function(id){
  log.info("peerserver detect disconnect for %s", id);
});
