var http = require('http');
var irc = require('irc');

var client = new irc.Client('irc.quakenet.org', 'reflexDeBot', {
  debug: true,
  retryDelay: 30000,
  channels: ['#reflex.de']
});


client.addListener('message', function (from, to, message) {

    if (message.toLowerCase() === '!activeservers') {
      queryData().then(function(servers) {
        servers = servers.filter(function(server) {
          return server.playerCount !== 0;
        });
        writeServerList(to, servers);
      }).catch(function(err) {
        console.log(err);
      });
    }

    if (message.toLowerCase() === '!emptyservers') {
      queryData().then(function(servers) {
        servers = servers.filter(function(server) {
          return server.playerCount === 0;
        });
        writeServerList(to, servers);
      })
    }
});

function queryData() {
  return new Promise(function(resolve, reject) {
    http.get('http://reflex.syncore.org/api/servers', function(res) {
      res.setEncoding('utf8');
      var result = ''
      res.on('data', function(chunk){ result += chunk; });
      res.on('end', function() {
        var data = JSON.parse(result)
        var serverList = data.servers.filter(function(server) { 
          return ['DE', 'CH', 'AT'].indexOf(server.countryCode) !== -1;
        }).filter(function(server) {
          return server.game === '41';
        }).filter(function(server) {
          return server.hasVacProtection;
        }).filter(function(server) {
          return server.serverType === 'dedicated';
        });
        resolve(serverList);
      })
    });
  });
}

function writeServerList(to, servers) {
  if (!servers.length) {
    return client.say(to, 'no servers found');
  }
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
}
