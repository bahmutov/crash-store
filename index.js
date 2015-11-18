// load config first,
// before any dependency tries to load its configuration
var config = require('./src/config');
var la = require('lazy-ass');
var check = require('check-more-types');
la(check.object(config), 'missing config object');

/* eslint no-console:0 */
var errorReceiver = require('error-receiver');
var dataStoreInit = require('crash-store-db');
la(check.fn(dataStoreInit), 'expected crash store fn', dataStoreInit);

var listenerInit = require('./src/listener');

var dataStore;

var dataStoreSchema = {
  addApplicationKey: check.fn,
  isValidApplicationKey: check.fn,
  saveCrash: check.fn
};
var isValidStore = check.schema.bind(null, dataStoreSchema);

function checkDataStore(store) {
  la(check.has(store, 'api'), 'missing api object', store);
  console.log('got data store with methods', Object.keys(store.api));
  la(isValidStore(store.api), 'invalid store api', Object.keys(store.api));
  dataStore = store.api;
  return dataStore;
}

function initErrorReceiver(dataStore) {
  return errorReceiver.middleware.bind(null, dataStore.isValidApplicationKey);
}

function connectEmitterToStore(crashEmitter) {
  la(check.object(crashEmitter),
    'missing crash event emitter', errorReceiver);
  la(check.object(dataStore), 'missing data store', dataStore);

  crashEmitter.on('crash', function (crashInfo) {
    console.log('crash emitter on crash handler');
    la(check.object(crashInfo), 'invalid crashInfo', crashInfo);
    la(check.has(crashInfo, 'apiKey'), 'missing api key in', crashInfo);

    dataStore.saveCrash(crashInfo.apiKey, crashInfo)
      .then(function () {
        console.log('stored crash info successfully for %s', crashInfo.apiKey);
      })
      .catch(function (err) {
        console.error('could not store crash info for %s', crashInfo.apiKey);
        console.error(err);
      });
  });
}

function finalHandler(err) {
  console.log('error');
  console.error(err);
  console.error(err.stack);
  process.exit(-1);
}

dataStoreInit()
  .then(checkDataStore)
  .then(initErrorReceiver)
  .then(listenerInit)
  .then(connectEmitterToStore.bind(null, errorReceiver.crashEmitter))
  .catch(finalHandler);
