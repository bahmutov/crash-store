var config = require('./config');
var mongoose = require('mongoose');
var la = require('lazy-ass');
var check = require('check-more-types');

var uri = config.get('MONGOLAB_URI');
la(check.unemptyString(uri), 'invalid mongo uri', uri);
var address = uri.substr(uri.indexOf('@') + 1);
console.log('MongoDB at %s', address);

mongoose.connect(config.get('MONGOLAB_URI'));
var Promise = require('bluebird');

var db = mongoose.connection;

module.exports = new Promise(function (resolve, reject) {
  db.on('error', reject);
  db.once('open', function () {
    console.log('opened DB connection');
    resolve(db);
  });
});
