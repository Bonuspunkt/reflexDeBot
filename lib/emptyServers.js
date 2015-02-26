var common = require('./common');

module.exports = function(options) {
  var countryCodes = options.args;
  if (!countryCodes.length) {
    countryCodes = ['DE', 'CH', 'AT'];
  }
  countryCodes = countryCodes.map(function(cc) { return cc.toUpperCase(); });

  return common.queryData().then(function(servers) {
    servers = servers.filter(function(server) { 
        return countryCodes.indexOf(server.countryCode) !== -1;
      }).filter(function(server) {
        return server.playerCount === 0;
      });
    common.writeServerList(options.client, options.to, servers);
  });
};