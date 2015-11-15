var nconf = require('nconf');

nconf.argv()
  .env()
  .defaults({
    PORT: 3010
  });

module.exports = nconf;
