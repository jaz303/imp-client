var events          = require('events'),
    util            = require('util');

var k               = require('./constants'),
    PacketReader    = require('./packet_reader');

var ADC16           = require('./endpoints/adc16'),
    Device          = require('./endpoints/device'),
    GPIO            = require('./endpoints/gpio'),
    LCD             = require('./endpoints/lcd'),
    PWM8            = require('./endpoints/pwm8');

var SB_MSG_START    = 0x7F,
    SB_MSG_END      = 0x7E,
    SB_MSG_ESCAPE   = 0x7D,
    SB_MSG_XOR      = 0x20;

var endpointCtors = {};
endpointCtors[k.ENDPOINT_CLASS_GPIO]    = GPIO;
endpointCtors[k.ENDPOINT_CLASS_PWM8]    = PWM8;
endpointCtors[k.ENDPOINT_CLASS_PWM16]   = null;
endpointCtors[k.ENDPOINT_CLASS_ADC8]    = null;
endpointCtors[k.ENDPOINT_CLASS_ADC16]   = ADC16;
endpointCtors[k.ENDPOINT_CLASS_LCD]     = LCD;

// TODO: this should use a buffer pool rather than reallocating
// on every operation.
function encode(inBuffer) {

    var outBuffer = new Buffer((inBuffer.length * 2) + 2);

    var ip = 0, op = 0;

    outBuffer.writeUInt8(SB_MSG_START, op++);

    while (ip < inBuffer.length) {
        var b = inBuffer.readUInt8(ip++);
        if (b === SB_MSG_START || b === SB_MSG_END || b === SB_MSG_ESCAPE) {
            outBuffer.writeUInt8(SB_MSG_ESCAPE, op++);
            outBuffer.writeUInt8(SB_MSG_XOR ^ b, op++);
        } else {
            outBuffer.writeUInt8(b, op++);
        }
    }

    outBuffer.writeUInt8(SB_MSG_END, op++);

    return outBuffer.slice(0, op);

}

function Client(serialPort) {

    if (!(this instanceof Client)) {
        return new Client(serialPort);
    }

    this.serial             = serialPort;
    this.handlers           = {};
    this.endpoints          = [new Device(this, 0)];
    this.error              = false;
    this.device             = this.endpoints[0];
    this.nextCorrelationId  = 1;

    var self = this;

    serialPort.on('open', function() {

        var inBuffer    = new Buffer(65536),
            parseState  = 0,
            inLen       = 0;
        
        // TODO: length error checking
        // TODO: should buffer be copied rather than sliced?
        serialPort.on('data', function(data) {
            for (var i = 0, l = data.length; i < l; ++i) {
                var b = data.readUInt8(i);
                if (b === SB_MSG_START) {
                    parseState = 1;
                    inLen = 0;
                } else {
                    if (parseState === 1) {
                        if (b === SB_MSG_END) {
                            self._dispatchResponse(inBuffer.slice(0, inLen));
                            parseState = 0;
                        } else if (b === SB_MSG_ESCAPE) {
                            parseState = 2;
                        } else {
                            inBuffer.writeUInt8(b, inLen++);
                        }
                    } else if (parseState === 2) {
                        inBuffer.writeUInt8(b ^ SB_MSG_XOR, inLen++);
                        parseState = 1;
                    }
                }
            }
        });
    
        self._inspect();

    });

}

util.inherits(Client, events.EventEmitter);

Client.prototype.send = function(packet, cb) {
    if (this.nextCorrelationId === 16384) {
        this.nextCorrelationId = 1;
    }
    var cid = this.nextCorrelationId++;
    packet.setCorrelationId(cid);
    this.serial.write(encode(packet.end().toBuffer()));
    if (cb) {
        this.handlers[cid] = cb;
    }
}

Client.prototype._inspect = function() {
    
    var d = this.device;
    var self = this;

    d.getBufferSizes(function(err, bufferSizes) {
        d.getDeviceId(function(err, deviceId) {
            d.getProductString(function(err, productString) {
                d.getDeviceEndpoints(function(err, endpoints) {
                    d.getDeviceEndpointClasses(function(err, endpointClasses) {
                        
                        self.rxBufferSize   = bufferSizes.rx;
                        self.txBufferSize   = bufferSizes.tx;
                        self.vendorId       = deviceId.vendorId;
                        self.productId      = deviceId.productId;
                        self.serialNumber   = deviceId.serialNumber;
                        self.productString  = productString;

                        var endpointsToDescribe = [];
                        
                        for (var i = 0; i < endpoints.length; ++i) {
                            
                            var eid     = endpoints[i],
                                ec      = endpointClasses[i],
                                ctor    = endpointCtors[ec];
                            
                            if (eid === 0) {
                                continue; // device endpoint
                            }
                            
                            if (typeof ctor === 'function') {
                                var endpoint = new ctor(self, eid);
                                self.endpoints[eid] = endpoint;
                                endpointsToDescribe.push(endpoint);
                            }
                        
                        }

                        var pendingDescribes = endpointsToDescribe.length;

                        endpointsToDescribe.forEach(function(ep) {
                            ep.describe(function(err) {
                                if (--pendingDescribes === 0) {
                                    self.emit('ready');
                                }
                                // if (err) {
                                //     self.emit('error', {

                                //     })
                                // } else {
                                    
                                // }
                            });
                        });

                    });
                });
            });
        });
    });

}

Client.prototype._dispatchResponse = function(buffer) {
    
    var reader = new PacketReader(buffer);

    if (reader.error()) {
        // nothing we can do - corrupt packet means we can't parse it
        // to work out its correlation ID
        this.emit('error', {
            message: "couldn't parse response packet",
            packet: packet
        });
        return;
    }

    var cid = reader.correlationId;
        cb  = this.handlers[cid];

    if (cb) {
        delete this.handlers[cid];
        cb(false, reader);
    }

}

module.exports = Client;