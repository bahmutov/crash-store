/* eslint no-console:0 */

var config = require('./config');
var getConfigured = config.get.bind(config);

var la = require('lazy-ass');
var check = require('check-more-types');

var url = require('url');
// handle data encoded in json or text body
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var textParser = bodyParser.text();

function respondToInvalid(res) {
  res.writeHead(400, {
    'Content-Type': 'text/plain'
  });
  res.end('Invalid request\n');
}

function respondToInvalidCrash(res) {
  res.writeHead(400, {
    'Content-Type': 'text/plain'
  });
  res.end('Invalid crash information\n');
}

function isValid(req, parsed) {
  return req.method === 'POST' &&
    parsed &&
    parsed.query &&
    check.has(parsed.query, 'apiKey');
}

function isValidCrash(crashInfo) {
  return check.object(crashInfo) &&
    check.has(crashInfo, 'Details');
}

function writeResponse(res) {
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end('Got crash info\n');
}

function saveCrashReport(crashEmitter, req) {
  var crashInformation = req.body;
  if (check.unemptyString(crashInformation.Details)) {
    console.log('parsing', crashInformation.Details);
    crashInformation.Details = JSON.parse(crashInformation.Details);
  }
  var title = crashInformation.Details &&
    crashInformation.Details.Error &&
    crashInformation.Details.Error.Message;
  if (!title &&
    check.unemptyString(crashInformation.Details)) {
    title = crashInformation.Details;
  }
  console.log('saving crash report with title "%s"', title);
  crashEmitter.emit('crash', crashInformation);
}

function initListener() {
  var http = require('http');
  var initCrashReporter = require('crash-reporter-middleware');
  var app = require('express')();

  var events = require('events');
  var crashEmitter = new events.EventEmitter();

  app.use(function filterInvalid(req, res, next) {
    var parsed = url.parse(req.url, true);
    console.log('%s - %s query', req.method, parsed.href, parsed.query);
    if (!isValid(req, parsed)) {
      return respondToInvalid(res);
    }
    next();
  });

  app.use(jsonParser);
  app.use(textParser);

  app.use(function filterInvalidCrashes(req, res, next) {
    if (!isValidCrash(req.body)) {
      return respondToInvalidCrash(res);
    }
    next();
  });

  app.use(function (req, res, next) {
    saveCrashReport(crashEmitter, req);
    writeResponse(res);
    next();
  });

  function useCrash(crashMiddleware) {
    if (crashMiddleware) {
      console.log('using crash reporter middleware');
      app.use(crashMiddleware);
    }
  }

  function startListening() {
    var port = getConfigured('PORT');
    la(check.positiveNumber(port), 'invalid port', port);

    http.createServer(app).listen(port);
    console.log('listening at port %d', port);
    console.log('to test use httpie https://github.com/jkbrzt/httpie');
    console.log('http POST <host>:<port>/?apiKey=demo foo=bar Details=\'"nice"\'');
    return crashEmitter;
  }

  return initCrashReporter(getConfigured, app)
    .then(useCrash)
    .then(startListening);
}


module.exports = initListener;
