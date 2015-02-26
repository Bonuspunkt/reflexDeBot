#!/usr/bin/env node
var irc = require('irc');
var registry = require('./lib/registry');
var settings = require('./settings');

// load registry
if (settings.handlers) {
  Object.keys(settings.handlers).forEach(function(key) {
    registry.register(key, settings.handlers[key]);
  });
}

console.log('starting')
var client = new irc.Client(settings.server, settings.nick, settings.options);

client.addListener('message', function (from, to, message) {
  console.log('got message', from, to, message);
  try {
    registry.handle({
      client: client,
      to: /^#/.test(to) ? to : from,
      message: message
    });
  } catch(e) {
    console.log(e);
  }
});