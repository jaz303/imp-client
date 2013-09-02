var PacketWriter = require('../packet_writer');

function Endpoint() {

}

Endpoint.prototype.send = function(packet, cb) {
    this.imp.send(packet, cb);
}

Endpoint.prototype.newPacket = function() {
    return new PacketWriter();
}

module.exports = Endpoint;