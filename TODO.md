## Some small improvements

Message reader needs to proxy buffer methods to their BE equivalents

Endpoint classes need shortcuts for sending single-message packets; callback should automatically unwrap first message too. Shouldn't need to deal with packets at all at this level.

Rename PWM, ADC and GPIO to PWM_BANK etc. Leaves option open in future for creating endpoints that allow more individal control. I propose this:

  * PWM - individual PWM
  * PWM_GROUP - what we've currently got
  * PWM_BANK - optimised set for dealing with groups in a single message

Extract auto-introspecting client from current Client class.

Auto assign first of each endpoint class as quick lookups. Algorithm:

    var client = this;
    this.endpoints.forEach(function(ep) {
        var shortName = ep.shortName;
        if (!client[shortName])
            client[shortName] = ep;
    })

The above will allow us to do stuff like:

    client.gpio.write(2, false);

Rather than:

    client.endpoints[1].write(2, false)

## RESET

Device endpoint needs a RESET resource that can be CALLed. Should be a well-known number e.g. 0x01 or 0xFF.

## Endpoint widths

The original plan was to offer endpoints like PWM and ADC in variants for each bit width e.g. PWM8, PWM16, PWM24. This leads to a lot of duplicated code, where the only difference is how a single value is read/written to a buffer.

Would it be better for the endpoint to simply report its bit depth in response to DESCRIBE and thereafter communicate using 32-bit values, from which the recipient just extracts the data it can deal with?

Concerns with this approach:

  * wasted space. a 3-byte overhead isn't too bad but if we introduce batch operations that becomes a 3n-byte overhead, where n is the number of channels being read/written in a single operation (in the case of an 8-bit actual with with a 32-bit virtual width)