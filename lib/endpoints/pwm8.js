var k           = require('../constants'),
    Endpoint    = require('./endpoint'),
    util        = require('util');

function PWM8() {
    Endpoint.apply(this, arguments);
}

util.inherits(PWM8, Endpoint);

PWM8.prototype.describable = true;

PWM8.prototype._handleDescribe = function(response) {
    this.pinCount = response.body.readUInt8(0);
}

PWM8.prototype.write = function(pin, value, cb) {
    var packet = this.newPacket();
    packet.startMessage(this.endpoint, pin, k.ACTION_WRITE);
    packet.writeUInt8(value);
    packet.endMessage();
    this.send(packet, cb);
}

module.exports = PWM8;