var nconf = require('nconf');

// nconf could be configured by an actual application
if (!nconf.configured) {
  /* eslint no-console:0 */
  console.log('configuring %s', require('../package.json').name);
  nconf.argv()
    .env()
    .file({ file: __dirname + '/../dev-config.json' })
    .defaults({
      HOST: '127.0.0.1',
      PORT: 3010,
      MONGOLAB_URI: ''
    });
  nconf.configured = true;
}

module.exports = nconf;
