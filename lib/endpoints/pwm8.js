var k           = require('../constants'),
    Endpoint    = require('./endpoint'),
    util        = require('util');

function PWM8() {
    Endpoint.apply(this, arguments);
}

util.inherits(PWM8, Endpoint);

PWM8.prototype._handleDescribe = function(response, cb) {
    setTimeout(cb, 0); // TODO: impl
}

PWM8.prototype.write = function(pin, value) {

}

module.exports = PWM8;