var k           = require('../constants'),
    Endpoint    = require('./endpoint'),
    util        = require('util');

function LCD() {
    Endpoint.apply(this, arguments);
}

util.inherits(LCD, Endpoint);

LCD.prototype._handleDescribe = function(response, cb) {
    setTimeout(cb, 0); // TODO: impl
}

LCD.prototype.clear = function() {

}

LCD.prototype.print = function(str) {

}

LCD.prototype.set = function(line, str) {

}

module.exports = LCD;