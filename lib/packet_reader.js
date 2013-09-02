var k = require('./constants');

var EMPTY = new Buffer(0);

function Message(endpoint, resource, actionStatus, errorCode, body) {
    this.endpoint = endpoint;
    this.resource = resource;
    this.action = actionStatus;
    this.status = actionStatus;
    this.errorCode = errorCode;
    this.body = body;
    this.length = body.length;
    this.isError = (actionStatus & k.MASK_ERROR) > 0;
}

function PacketReader(buf) {
    
    this._buffer = buf;
    this._error = false;

    // packet ID must be correct
    if (buf.readUInt8(0) !== k.PACKET_ID_GENERAL) {
        this._error = "incorrect IMP packet ID";
        return;
    }
        
    // version must be correct
    if (buf.readUInt8(1) !== k.VERSION) {
        this._error = "incorrect IMP version";
        return;
    }
        
    var reportedSize = buf.readUInt16BE(2);

    // size must be at least 16 (i.e. must contain at least one message)
    if (reportedSize < 16) {
        this._error = "packet is too short";
        return;
    }
    
    // size must fit within buffer
    if (reportedSize > buf.length) {
        this._error = "buffer too small to contain packet";
        return;
    }

    // size must be multiple of 4
    if (reportedSize & 0x03) {
        this._error = "packet size is not multiple of 4";
        return;
    }

    // TODO: CRC16 check

    // extract IDs
    var cid = buf.readUInt16BE(6);
    this.correlationId = cid & 0x3FFF;
    this.isReply = (cid & 0x8000) > 0;
    this.noReply = (cid & 0x4000) > 0;

    // TODO: check message sizes fit within packet
    
}

PacketReader.prototype.error = function() {
    return this._error;
}

PacketReader.prototype.firstMessage = function() {
    return this.messageAtOffset(12);
}

PacketReader.prototype.messageAtOffset = function(offset) {

    var buf         = this._buffer,
        endpoint    = buf.readUInt8(offset + 0),
        resource    = buf.readUInt8(offset + 1),
        action      = buf.readUInt8(offset + 2),
        length      = buf.readUInt8(offset + 3),
        errorCode   = null;

    if (action === k.STATUS_ERROR) {
        errorCode = length;
        length = 0;
    }

    var buffer = (length > 0)
                    ? buf.slice(offset + 4, offset + 4 + length)
                    : EMPTY;

    return new Message(
        endpoint,
        resource,
        action,
        errorCode,
        buffer
    );

}

module.exports = PacketReader;