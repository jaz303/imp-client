var PacketWriter    = require('../packet_writer'),
    k               = require('../constants');

function Endpoint(imp, endpoint) {
    this.imp = imp;
    this.endpoint = endpoint;
}

Endpoint.prototype.describe = function(cb) {
    var pw = this.newPacket(), self = this;
    pw.writeMessage(this.endpoint, k.ENDPOINT_MASTER_RESOURCE, k.ACTION_DESCRIBE);
    this.send(pw, function(err, response) {
        if (err) {
            cb(err);
        } else {
            var message = response.firstMessage();
            if (message.isError) {
                cb(message);
            } else {
                self._handleDescribe(message, cb);    
            }
        }
    });
}

Endpoint.prototype._handleDescribe = function(message, cb) {
    cb(message.isError);
}

Endpoint.prototype.send = function(packet, cb) {
    this.imp.send(packet, cb);
}

Endpoint.prototype.newPacket = function() {
    return new PacketWriter();
}

module.exports = Endpoint;