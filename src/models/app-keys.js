var mongoose = require('mongoose');

var appKeySchema = new mongoose.Schema({
  name:  String,
  date: { type: Date, default: Date.now }
});

var AppKey = mongoose.model('AppKey', appKeySchema);

AppKey.saveDummy = function saveDummy() {
  var newAppKey = new AppKey({
    name: 'dummy'
  });
  return newAppKey.save();
};

module.exports = AppKey;
