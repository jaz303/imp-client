var K = [
    {   /* Packet IDs */
        PACKET_ID_GENERAL                   : 0x05
    },  
    {   /* Version */   
        VERSION                             : 0x01
    },
    {
        CORRELATION_ID_MASK                 : 0x3FFF,
        REPLY_BIT                           : 0x8000,
        NO_REPLY_BIT                        : 0x4000
    },
    {   /* Actions */   

        /* request description of resource. e.g. for ADC, this would
         * return the bit depth and whether or not it's unsigned */
        ACTION_DESCRIBE                     : 0x01,

        /* read the value of the requested resource */
        ACTION_READ                         : 0x02,

        /* write to the requested resource */
        ACTION_WRITE                        : 0x03,

        /* configure the requested resource, e.g. set pin mode of
         * GPIO */
        ACTION_CONFIGURE                    : 0x04,

        /* call/invoke the requested resource. */
        ACTION_CALL                         : 0x05,

        /* register to be notified whenever value of requested
         * resource changes. device will send IMP_STATUS_VALUE
         * messages for each update */
        ACTION_WATCH                        : 0x06,
    },  
    {   /* Statuses */  
        
        /* action completed successfully, no body */
        STATUS_OK                           : 0x80,

        /* response contains value of requested read/call etc. */
        STATUS_VALUE                        : 0x81,

        /* bitmask that can be used to check for error */
        MASK_ERROR                          : 0xF0,

        /* endpoint-specific error; status is in length bit */
        STATUS_ERROR                        : 0xF0,

        /* endpoint-specific error; extra information in payload */
        STATUS_EXTENDED_ERROR               : 0xF1,

        /* endpoint does not exist */
        STATUS_NO_SUCH_ENDPOINT             : 0xF2,

        /* resource does not exist */
        STATUS_NO_SUCH_RESOURCE             : 0xF3,

        /* Endpoint exists but does not support the requested operation.
         * There is no implication that the requseted resource exists */
        STATUS_NOT_IMPLEMENTED              : 0xF4,

        /* the endpoint exists and implements the requested operation but
         * the request cannot be completed at the moment */ 
        STATUS_NOT_POSSIBLE                 : 0xF5,

        /* the message payload could not be understood by the specified
         * endpoint/resource */
        STATUS_MALFORMED_REQUEST            : 0xF6,
    },  
    {   /* Endpoint classes */  
        ENDPOINT_CLASS_DEVICE               : 0x01,
        ENDPOINT_CLASS_GPIO                 : 0x02,
        ENDPOINT_CLASS_PWM8                 : 0x03,
        ENDPOINT_CLASS_PWM16                : 0x04,
        ENDPOINT_CLASS_ADC8                 : 0x05,
        ENDPOINT_CLASS_ADC16                : 0x06,
        ENDPOINT_CLASS_LCD                  : 0x07,
    },
    {
        ENDPOINT_MASTER_RESOURCE            : 0x00
    },
    {   /* Device Endpoint */

        /* request device rx/tx buffer sizes */
        DEVICE_RESOURCE_BUFFERS             : 0x01,

        /* request device vendor ID, product ID and serial number */
        DEVICE_RESOURCE_DEVICE_ID           : 0x02,

        /* request device product string */
        DEVICE_RESOURCE_PRODUCT_STRING      : 0x03,

        /* request array of device endpoint IDs */
        DEVICE_RESOURCE_ENDPOINTS           : 0x20,

        /* request array of device endpoint classes */
        DEVICE_RESOURCE_ENDPOINT_CLASSES    : 0x21
    },
    {   /* GPIO constants */
        GPIO_MODE_INPUT                     : 0x10,
        GPIO_MODE_OUTPUT                    : 0x20,
        GPIO_MODE_PULLUP                    : 0x01,
        GPIO_MODE_PULLDOWN                  : 0x02,
    },
    {   /* Vendor IDs */
        VENDOR_ID_GENERIC                   : 0xFFFF
    },
    {   /* Product IDs */
        PRODUCT_ID_GENERIC                  : 0xFFFF
    }
]

K.forEach(function(block) {
    for (var k in block) {
        Object.defineProperty(exports, k, {
            value: block[k],
            writable: false,
            enumerable: true
        });
    }    
});

// for generating C #defines
exports.__structure__ = K;