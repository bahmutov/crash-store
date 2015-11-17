/* eslint no-console:0 */
var config = require('./config');
var getConfigured = config.get.bind(config);

var la = require('lazy-ass');
var check = require('check-more-types');
var exists = require('fs').existsSync;

function startServer(errorMiddleware) {
  la(check.fn(errorMiddleware), 'missing error middleware');

  var http = require('http');
  var express = require('express');
  // our own crash reporter
  var initCrashReporter = require('crash-reporter-middleware');
  var app = express();

  function useCrash(crashMiddleware) {
    if (crashMiddleware) {
      console.log('using crash reporter middleware');
      app.use(crashMiddleware);
    }
  }

  function setupStaticFolder() {
    var publicFolder = config.get('publicFolder');
    console.log('public folder', publicFolder);
    if (check.unemptyString(publicFolder)) {
      la(exists(publicFolder), 'cannot find public folder', publicFolder);
      app.use(express.static(publicFolder));
      console.log('serving static files from %s', publicFolder);
    } else {
      console.log('no public folder to serve');
    }
  }

  function startListening() {
    var port = getConfigured('PORT');
    la(port, 'invalid port', port);

    http
      .createServer(app)
      .listen(port);

    var apiKeyNames = getConfigured('apiKeyNames');
    la(check.array(apiKeyNames), 'expected list of allowed api keys', apiKeyNames);

    console.log('listening at port %d', port);
    console.log('to test use httpie https://github.com/jkbrzt/httpie');
    console.log('http POST <hostname>:%d%s?%s=demo foo=bar Details=\'"nice"\'',
      port, getConfigured('apiUrl'), apiKeyNames[0]);
  }

  app.use(errorMiddleware);
  setupStaticFolder();

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
