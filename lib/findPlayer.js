var common = require('./common');

module.exports = function(options) {
  var playerNames = options.args;
  if (!playerNames.length) { 
    return client.say(options.to, 'missing parameter playername(s)'); 
  }

  return common.queryData().then(function(servers) {
    servers = servers.filter(function(server) {
      return server.players.some(function(player) { 
        return playerNames.indexOf(player.name.toLowerCase()) !== -1; 
      });
    });
    common.writeServerList(options.client, options.to, servers);
  });
};