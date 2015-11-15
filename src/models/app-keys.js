var mongoose = require('mongoose');

var appKeySchema = new mongoose.Schema({
  name:  String,
  date: { type: Date, default: Date.now }
});

var AppKey = mongoose.model('AppKey', appKeySchema);

module.exports = AppKey;
