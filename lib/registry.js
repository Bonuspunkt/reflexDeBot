var store = {};

module.exports = {
  register: function(keyword, handler) {
    store[keyword.toLowerCase()] = handler;
  },
  handle: function(options) {
    var splitted = options.message.toLowerCase().split(/\s/g);

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
