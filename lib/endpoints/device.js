var k           = require('../constants'),
    Endpoint    = require('./endpoint'),
    util        = require('util');

function Device() {
    Endpoint.apply(this, arguments);
}

util.inherits(Device, Endpoint);

// device endpoint cannot be described
Device.prototype.describe = function(cb) {
    setTimeout(cb, 0);
}

function writeGetBufferSizesMessage(pw, endpoint) {
    pw.writeMessage(endpoint, k.DEVICE_RESOURCE_BUFFERS, k.ACTION_READ);
}

function writeGetDeviceIdMessage(pw, endpoint) {
    pw.writeMessage(endpoint, k.DEVICE_RESOURCE_DEVICE_ID, k.ACTION_READ);
}

function writeGetProductStringMessage(pw, endpoint) {
    pw.writeMessage(endpoint, k.DEVICE_RESOURCE_PRODUCT_STRING, k.ACTION_READ);
}

function writeGetDeviceEndpointsMessage(pw, endpoint) {
    pw.writeMessage(endpoint, k.DEVICE_RESOURCE_ENDPOINTS, k.ACTION_READ);
}

function writeGetDeviceEndpointClassesMessage(pw, endpoint) {
    pw.writeMessage(endpoint, k.DEVICE_RESOURCE_ENDPOINT_CLASSES, k.ACTION_READ);
}

Device.prototype.getBufferSizes = function(cb) {
    var p = this.newPacket();
    writeGetBufferSizesMessage(p, this.endpoint);
    this.send(p, function(err, packet) {
        if (cb) {
            var body = packet.firstMessage().body;
            cb(false, {
                rx: body.readUInt16BE(0),
                tx: body.readUInt16BE(2)
            });
        }
    });
}

Device.prototype.getDeviceId = function(cb) {
    var p = this.newPacket();
    writeGetDeviceIdMessage(p, this.endpoint);
    this.send(p, function(err, packet) {
        if (cb) {
            var body = packet.firstMessage().body;
            cb(false, {
                vendorId        : body.readUInt16BE(0),
                productId       : body.readUInt16BE(2),
                serialNumber    : body.readUInt32BE(4)
            });
        }
    });
}

Device.prototype.getProductString = function(cb) {
    var p = this.newPacket();
    writeGetProductStringMessage(p, this.endpoint);
    this.send(p, function(err, packet) {
        if (cb) {
            var body = packet.firstMessage().body;
            cb(false, body.toString('ascii'));
        }
    });
}

Device.prototype.getDeviceEndpoints = function(cb) {
    var p = this.newPacket();
    writeGetDeviceEndpointsMessage(p, this.endpoint);
    this.send(p, function(err, packet) {
        if (cb) {
            var body        = packet.firstMessage().body,
                endpoints   = [];
            for (var i = 0; i < body.length; ++i) {
                endpoints.push(body.readUInt8(i));
            }
            cb(false, endpoints);
        }
    });
}

Device.prototype.getDeviceEndpointClasses = function(cb) {
    var p = this.newPacket();
    writeGetDeviceEndpointClassesMessage(p, this.endpoint);
    this.send(p, function(err, packet) {
        if (cb) {
            var body        = packet.firstMessage().body,
                classes     = [];
            for (var i = 0; i < body.length; i += 2) {
                classes.push(body.readUInt16BE(i));
            }
            cb(false, classes);
        }
    });
}

module.exports = Device;