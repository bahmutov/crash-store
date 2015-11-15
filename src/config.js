var nconf = require('nconf');

// nconf could be configured by an actual application
if (!nconf.configured) {
  console.log('setting up configuration');
  nconf.argv()
    .env()
    .file({ file: __dirname + '/../dev-config.json' })
    .defaults({
      PORT: 3010,
      MONGOLAB_URI: ''
    });
  nconf.configured = true;
}

module.exports = nconf;
