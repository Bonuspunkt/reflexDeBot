var common = require('./common');
var Sandbox = require('sandbox');

module.exports = function(options) {
  return common.queryData().then(function(servers) {
    var sandbox = new Sandbox();

    var filter = options.message.replace(/^!query\s+/i, '');

    var script = 
      'function execute() {\n' + 
      '  var servers = ' + JSON.stringify(servers) + ';\n' +
      '  var matches = servers' + filter + ';\n' +
      '  matches.forEach(function(match) {\n' +
      '    console.log(JSON.stringify(match));\n' +
      '  });\n' +
      '}\n' + 
      'execute();';

    sandbox.run(script, function(output) {
      try {
        var matches = output.console.map(function(json) { return JSON.parse(json); });

        var valid = matches.every(function(server) {
          return server.serverName && server.ip && server.gametype && 
                 server.maxPlayers && server.version;
        });
        if (!valid) { throw Error('> sorry i can`t let you do that'); }

        common.writeServerList(options.client, options.to, matches);
      } catch (e) {
        options.client.say(options.to, '> Error ' + (e || console.output));
      }
    })
  });
};