/* eslint no-console:0 */

var config = require('./config');
var getConfigured = config.get.bind(config);

var la = require('lazy-ass');
var check = require('check-more-types');

function startServer(errorMiddleware) {
  var http = require('http');
  // our own crash reporter
  var initCrashReporter = require('crash-reporter-middleware');
  var app = require('express')();

  function useCrash(crashMiddleware) {
    if (crashMiddleware) {
      console.log('using crash reporter middleware');
      app.use(crashMiddleware);
    }
  }

  function startListening() {
    var hostname = getConfigured('HOST');
    la(check.unemptyString(hostname), 'invalid hostname', hostname);
    var port = getConfigured('PORT');
    la(port, 'invalid port', port);

    http.createServer(app).listen(port, hostname);

    var apiKeyNames = getConfigured('apiKeyNames');
    la(check.array(apiKeyNames), 'expected list of allowed api keys', apiKeyNames);

    console.log('listening at port %d', port);
    console.log('to test use httpie https://github.com/jkbrzt/httpie');
    console.log('http POST %s:%d%s?%s=demo foo=bar Details=\'"nice"\'',
      hostname, port, getConfigured('apiUrl'), apiKeyNames[0]);
  }

  app.use(errorMiddleware);
  app.use(function send404(req, res) {
    console.log('sending 404 for %s %s', req.method, req.url);
    res.writeHead(404);
    res.end(http.STATUS_CODES[404]);
  });

  return initCrashReporter(getConfigured, app)
    .then(useCrash)
    .then(startListening);
}


module.exports = startServer;
