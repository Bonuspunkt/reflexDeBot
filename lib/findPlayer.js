var common = require('./common');

module.exports = function(options) {
  var playerPatterns = options.args.map(function(string) {
    var regex = string
      .replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, "\\$&")
      .replace(/\*/, '.*')
    return new RegExp(regex, 'i');
  });
  if (!playerPatterns.length) {
    return options.client.say(options.to, 'missing parameter playername(s)');
  }

  return common.queryData().then(function(servers) {
    servers = servers.map(function(server) {
      var matchingPlayers = server.players
        .map(function(player) { return player.name })
        .filter(function(player) {
          return playerPatterns.some(function(pattern) { return pattern.test(player); });
        });
      if (matchingPlayers.length) {
        server.addInfo = '4' + matchingPlayers.join(', ');
      }
      return server;
    }).filter(function(server) {
      return server.addInfo;
    });
    common.writeServerList(options.client, options.to, servers);
  });
};