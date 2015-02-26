var http = require('http');

var store = {};

module.exports = {
  register: function(keyword, hander) {
    store[keyword] = handler;
  },
  handle: function(options) {
    var splitted = options.message.split(/\s/g);

    var command = splitted[0];
    
    options.args = splitted.filter(function(arg, i) {
      return i !== 0 && arg;
    });

    if (!store[command]) { return; }

    store[command](options).catch(function(err) {
      console.log(err.message, err.stackTrace);
    });
  }
};


store['!activeservers'] = function(options) {
  return queryData().then(function(servers) {
    servers = servers.filter(function(server) {
      return server.playerCount !== 0;
    });
    writeServerList(options.client, options.to, servers);
  });
};

store['!emptyservers'] = function(options) {
  return queryData().then(function(servers) {
    servers = servers.filter(function(server) {
      return server.playerCount === 0;
    });
    writeServerList(options.client, options.to, servers);
  });
};


function queryData() {
  return new Promise(function(resolve, reject) {
    http.get('http://reflex.syncore.org/api/servers', function(res) {
      var result = '';

      res.setEncoding('utf8');
      res.on('data', function(chunk){ result += chunk; });
      res.on('end', function() {
        var data = JSON.parse(result);
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
      });

    });
  });
}

function writeServerList(client, to, servers) {
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