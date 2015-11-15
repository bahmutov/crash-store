var config = require('./src/config');
var getConfigured = config.get.bind(config);

var http = require('http');
var app = require('express')();
var initCrashReporter = require('crash-reporter-middleware');

var la = require('lazy-ass');
var check = require('check-more-types');

function createDummyAppKey(name) {
  la(check.unemptyString(name), 'missing app name');
  var AppKey = require('./src/models/app-keys');
  var newAppKey = new AppKey({
    name: name
  });
  return newAppKey.save();
}

initCrashReporter(getConfigured, app)
  .then(function (crashMiddleware) {
    if (crashMiddleware) {
      console.log('using crash reporter middleware');
      app.use(crashMiddleware);
    }

    var dbInit = require('./src/db');
    dbInit.then(function (db) {
      var port = getConfigured('PORT');
      http.createServer(app).listen(port);
      console.log('listening at port %d', port);

      createDummyAppKey('dummy').then(function () {
        console.log('created dummy key');
      }, function (err) {
        console.error(err);
      });

    }, function (err) {
      console.error(err);
      process.exit(-1);
    });
  });
