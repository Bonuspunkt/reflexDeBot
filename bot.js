var irc = require('irc');

var client = new irc.Client('irc.quakenet.org', 'reflexDeBot', {
  debug: true,
  retryDelay: 30000,
  channels: ['#reflex.de']
});


client.addListener('message', function (from, to, message) {

  try {
    registry.handle({
      client: client,
      to: /^#/.test(to) ? to : from,
      message: message.toLowerCase().trim()
    });
  } catch(e) {
    console.log(e);
  }
});