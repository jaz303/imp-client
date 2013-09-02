var k           = require('../constants'),
    Endpoint    = require('./endpoint'),
    util        = require('util');

function GPIO() {
    Endpoint.apply(this, arguments);
}

util.inherits(GPIO, Endpoint);

GPIO.prototype._handleDescribe = function(response, cb) {
    this.gpioCount = response.body.readUInt8(0);
    cb();
}

GPIO.prototype.setMode = function(pin, mode) {

}

GPIO.prototype.write = function(pin, value) {

}

GPIO.prototype.read = function(pin, cb) {

}

module.exports = GPIO;