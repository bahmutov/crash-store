var nconf = require('nconf');

nconf.argv()
  .env()
  .file({ file: __dirname + '/../dev-config.json' })
  .defaults({
    PORT: 3010,
    MONGOLAB_URI: ''
  });

module.exports = nconf;
