var http = require('http');

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
          var serverList = data.servers.filter(function(server) {
            return server.game === '41';
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
        server.ip + ':' + server.port, 
        server.gametype, 
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