var config = require('./src/config');
var getConfigured = config.get.bind(config);

var http = require('http');
var app = require('express')();
var initCrashReporter = require('crash-reporter-middleware');

var la = require('lazy-ass');
var check = require('check-more-types');

var dataStoreInit = require('crash-store-db');
la(check.fn(dataStoreInit), 'expected crash store fn', dataStoreInit);

initCrashReporter(getConfigured, app)
  .then(function (crashMiddleware) {
    if (crashMiddleware) {
      console.log('using crash reporter middleware');
      app.use(crashMiddleware);
    }

    dataStoreInit().then(function (store) {
      console.log('got data store with methods', Object.keys(store));

      var port = getConfigured('PORT');
      http.createServer(app).listen(port);
      console.log('listening at port %d', port);

    }, function (err) {
      console.error(err);
      process.exit(-1);
    });
  });
