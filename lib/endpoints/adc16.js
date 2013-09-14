var k           = require('../constants'),
    Endpoint    = require('./endpoint'),
    util        = require('util');

function ADC16() {
    Endpoint.apply(this, arguments);
    this.pinCount = null;
    this.bitDepth = null;
}

util.inherits(ADC16, Endpoint);

ADC16.prototype.describable = true;

ADC16.prototype._handleDescribe = function(response) {
    this.pinCount = response.body.readUInt8(0);
    this.bitDepth = response.body.readUInt8(1);
}

ADC16.prototype.read = function(pin, cb) {

    var decoder = null;
    if (cb) {
        decoder = function(err, packet) {
            if (err) {
                cb(err);
            } else {
                var msg = packet.firstMessage();
                cb(msg.body.readUInt16BE(0));
            }
        }
    }

    var packet = this.newPacket();
    packet.writeMessage(this.endpoint, pin, k.ACTION_READ);
    this.send(packet, decoder);

}

module.exports = ADC16;