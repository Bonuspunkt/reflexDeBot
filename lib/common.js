var http = require('http');
var settings = require('../settings');


var LIMIT = 5;

module.exports = {
  queryData: function() {
    return new Promise(function(resolve, reject) {
      var request = http.get('http://reflex.syncore.org/api/servers', function(res) {
        var result = '';

        res.setEncoding('utf8');
        res.on('data', function(chunk){ result += chunk; });
        res.on('end', function() {
          var data = JSON.parse(result);

          var serverList = data.servers.map(function(server) {
            var splitted = server.gametype.split(/\|/g);

            return {
              serverName: server.serverName,
              ip: server.ip,
              port: server.port,
              mode: splitted[0],
              protocolVersion: splitted[2],
              playerCount: server.playerCount,
              maxPlayers: server.maxPlayers,
              version: server.version,
              hasVacProtection: server.hasVacProtection,
              serverType: server.serverType,
              countryCode: (splitted[1] || server.countryCode).toUpperCase()
            };

          }).filter(function(server) {
            return server.protocolVersion === settings.reflexVersion;
          }).filter(function(server) {
            return server.hasVacProtection;
          }).filter(function(server) {
            return server.serverType === 'dedicated';
          });

          resolve(serverList);
        });
      });

      request.on('error', function(e) { reject(e); });
    });
  },
  writeServerList: function (client, to, servers) {
    if (!servers.length) {
      return client.say(to, 'no servers found');
    }
    var count = servers.length;
    servers.splice(LIMIT);

    servers.forEach(function(server) {
      var msg = [
        server.serverName,
        'steam://connect/' + server.ip + ':' + server.port,
        server.mode,
        '(' + server.playerCount + '/' + server.maxPlayers + ')',
        server.version
      ].join(' ');

      client.say(to, msg);
    });
    if (count > LIMIT) {
      client.say(to, '...truncating. total matches: ' + count);
    }
  }
};