// load config first,
// before any dependency tries to load its configuration
var config = require('./src/config');

var la = require('lazy-ass');
var check = require('check-more-types');

var dataStoreInit = require('crash-store-db');
la(check.fn(dataStoreInit), 'expected crash store fn', dataStoreInit);
var listenerInit = require('./src/listener');

var dataStore, crashEmitter;

function checkDataStore(store) {
  la(check.has(store, 'api'), 'missing api object', store);
  console.log('got data store with methods', Object.keys(store.api));
  dataStore = store.api;
}

function checkCrashEmitter(emitter) {
  la(check.object(emitter), 'missing crash event emitter', emitter);
  la(check.fn(emitter.on), 'missing on method in crash emitter', emitter);
  crashEmitter = emitter;
}

function connectEmitterToStore() {
  la(check.object(crashEmitter), 'missing crash event emitter', crashEmitter);
  la(check.object(dataStore), 'missing data store', dataStore);
  la(check.fn(dataStore.storeException), 'missing data store save method', dataStore);

  crashEmitter.on('crash', function (crashInfo) {
    console.log('crash emitter on crash handler');
    la(check.object(crashInfo), 'invalid crashInfo', crashInfo);
    dataStore.storeException(crashInfo)
      .catch(function (err) {
        console.error('could not store crash info');
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
  .then(listenerInit)
  .then(checkCrashEmitter)
  .then(connectEmitterToStore)
  .catch(finalHandler);
