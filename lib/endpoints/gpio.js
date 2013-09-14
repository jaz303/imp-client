var k           = require('../constants'),
    Endpoint    = require('./endpoint'),
    util        = require('util');

function GPIO() {
    Endpoint.apply(this, arguments);
    this.gpioCount = null;
}

util.inherits(GPIO, Endpoint);

GPIO.prototype._handleDescribe = function(response) {
    this.gpioCount = response.body.readUInt8(0);
}

GPIO.prototype.setMode = function(pin, mode, cb) {
    var packet = this.newPacket();
    packet.startMessage(this.endpoint, pin, k.ACTION_CONFIGURE);
    packet.writeUInt8(mode);
    packet.endMessage();
    this.send(packet, cb);
}

GPIO.prototype.write = function(pin, value, cb) {
    var packet = this.newPacket();
    packet.startMessage(this.endpoint, pin, k.ACTION_WRITE);
    packet.writeUInt8(value ? 1 : 0);
    packet.endMessage();
    this.send(packet, cb);
}

GPIO.prototype.read = function(pin, cb) {

    var decoder = null;
    if (cb) {
        decoder = function(err, packet) {
            if (err) {
                cb(err);
            } else {
                var msg = packet.firstMessage();
                cb(msg.body.readUInt8(0) ? true : false);
            }
        }
    }

    var packet = this.newPacket();
    packet.writeMessage(this.endpoint, pin, k.ACTION_READ);
    this.send(packet, decoder);

}

module.exports = GPIO;