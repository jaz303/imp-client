var k = require('./constants');

var DEFAULT_SIZE = 128;

function PacketWriter(size) {

    var buf = Buffer.isBuffer(size)
                ? size
                : (new Buffer(size || DEFAULT_SIZE));

    // 0-1 packet ID + version
    buf.writeUInt8(k.PACKET_ID_GENERAL, 0);
    buf.writeUInt8(k.VERSION, 1);

    // 2-3 - Length. Filled in later.
    // 4-5 - CRC16. Filled in later.
    // 6-7 - Correlation ID & status bits. Filled in later.

    // 8-9 - Source address
    buf.writeUInt16BE(0, 8);
    
    // 10-11 - Destination address
    buf.writeUInt16BE(0, 10);

    this.buffer = buf;
    this.length = 12; 
    this.correlationId = 0;
    this.reply = false;
    this.noReply = false;
    this.closed = false;
    
}

PacketWriter.prototype.setCorrelationId = function(id) {
    this.correlationId = id;
    return this;
}

PacketWriter.prototype.setReply = function(isReply) {
    this.reply = !!isReply;
    return this;
}

PacketWriter.prototype.setNoReply = function(noReply) {
    this.noReply = !!noReply;
    return this;
}

PacketWriter.prototype.end = function() {

    if (!this.closed) {

        var buf = this.buffer;

        // Write correlation ID & status bits
        var correlationId = this.correlationId & k.CORRELATION_ID_MASK;
        if (this.reply) correlationId |= k.REPLY_BIT;
        if (this.noReply) correlationId |= k.NO_REPLY_BIT;
        buf.writeUInt16BE(correlationId, 6);

        // Write packet length
        buf.writeUInt16BE(this.length, 2);

        // Calculate CRC16
        // TODO: calculate CRC
        buf.writeUInt16BE(0, 4);

        this.closed = true;

    }

    return this;

}

PacketWriter.prototype.toBuffer = function() {
    return this.buffer.slice(0, this.length);
}

PacketWriter.prototype.writeMessage = function(endpoint, resource, action) {
    var buf = this.buffer;
    buf.writeUInt8(endpoint, this.length++);
    buf.writeUInt8(resource, this.length++);
    buf.writeUInt8(action,   this.length++);
    buf.writeUInt8(0,        this.length++);
    return this;
}

PacketWriter.prototype.startMessage = function(endpoint, resource, action) {
    var buf = this.buffer;
    buf.writeUInt8(endpoint, this.length++);
    buf.writeUInt8(resource, this.length++);
    buf.writeUInt8(action,   this.length++);
    buf.writeUInt8(0,        this.length++);
    this._messageStart = this.length;
    return this;
}

PacketWriter.prototype.endMessage = function() {
    var buf = this.buffer;
    buf.writeUInt8(this.length - this._messageStart, this._messageStart - 1);
    while (this.length & 0x03)
        buf.writeUInt8(0x00, this.length++);
    return this;
}

PacketWriter.prototype.writeUInt8 = function(v) {
    this.buffer.writeUInt8(v, this.length);
    this.length++;
    return this;
}

PacketWriter.prototype.writeUInt16 = function(v) {
    this.buffer.writeUInt16BE(v, this.length);   
    this.length += 2;
    return this;
}

PacketWriter.prototype.writeUInt32 = function(v) {
    this.buffer.writeUInt32BE(v, this.length);
    this.length += 4;
    return this;
}

PacketWriter.prototype.writeInt8 = function(v) {
    this.buffer.writeInt8(v, this.length);
    this.length++;
    return this;
}

PacketWriter.prototype.writeInt16 = function(v) {
    this.buffer.writeInt16BE(v, this.length);
    this.length += 2;
    return this;
}

PacketWriter.prototype.writeInt32 = function(v) {
    this.buffer.writeInt32BE(v, this.length);
    this.length += 4;
    return this;
}

module.exports = PacketWriter;