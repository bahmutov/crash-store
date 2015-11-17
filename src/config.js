var nconf = require('nconf');

// nconf could be configured by an actual application
if (!nconf.configured) {
  var defaults = {
    HOST: '127.0.0.1',
    PORT: 3010,
    MONGOLAB_URI: '',
    publicFolder: 'demo'
  };

  /* eslint no-console:0 */
  var name = require('../package.json').name;
  console.log('configuring %s', name);

  // using overrides because we are top-level application
  nconf.argv()
    .env()
    .file({ file: __dirname + '/../dev-config.json' })
    .overrides(defaults);

  nconf.configured = true;
}

module.exports = nconf;
