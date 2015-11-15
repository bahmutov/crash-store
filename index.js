var config = require('./src/config');
var getConfigured = config.get.bind(config);

var http = require('http');
var app = require('express')();
var initCrashReporter = require('crash-reporter-middleware');

initCrashReporter(getConfigured, app)
  .then(function (crashMiddleware) {
    if (crashMiddleware) {
      console.log('using crash reporter middleware');
      app.use(crashMiddleware);
    }

    var port = getConfigured('PORT');
    http.createServer(app).listen(port);
    console.log('listening at port %d', port);
  });
