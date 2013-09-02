var k           = require('../constants'),
    Endpoint    = require('./endpoint'),
    util        = require('util');

function ADC16() {
    Endpoint.apply(this, arguments);
}

util.inherits(ADC16, Endpoint);

ADC16.prototype._handleDescribe = function(response, cb) {
    setTimeout(cb, 0); // TODO: impl
}

ADC16.prototype.read = function(pin) {

}

module.exports = ADC16;