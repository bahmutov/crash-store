var config = require('./config');
var getConfigured = config.get.bind(config);

var la = require('lazy-ass');
var check = require('check-more-types');

function initListener() {
  var http = require('http');
  var initCrashReporter = require('crash-reporter-middleware');
  var app = require('express')();

  function useCrash(crashMiddleware) {
    if (crashMiddleware) {
      console.log('using crash reporter middleware');
      app.use(crashMiddleware);
    }
  }

  function startListening() {
    var port = getConfigured('PORT');
    http.createServer(app).listen(port);
    console.log('listening at port %d', port);

    var events = require('events');
    var crashEmitter = new events.EventEmitter();
    return crashEmitter;
  }

  return initCrashReporter(getConfigured, app)
    .then(useCrash)
    .then(startListening);
}


module.exports = initListener;
