new (function() {
    var device = null;
    var input = [0,1,2,3,4,5,6,7,8,9,10];
    var poller = null;
    var ext = this;

    function HIDReadCallback(buffer) { 
        input=buffer;
    };

    ext._deviceConnected = function(dev) {
        if(device) return;

        device = dev;
        device.open();

        poller = setInterval(function() {
            //input = device.read(48);
            device.read( HIDReadCallback, 48);
        }, 100);

//        setInterval(function() { console.log(input); }, 100);
    };


    ext._deviceRemoved = function(dev) {
        if(device != dev) return;
        device = null;
        stopPolling();
    };

    function stopPolling() {
        if(poller) clearInterval(poller);
        poller = null;
    }

    ext._shutdown = function() {
        if(poller) clearInterval(poller);
        poller = null;

        if(device) device.close();
        device = null;
    }

    ext._getStatus = function() {
        if(!device) return {status: 1, msg: 'Controller disconnected'};
        return {status: 2, msg: 'Controller connected'};
    }

    // Converts two 8 bit values into one 16 bit number
    function to16Bit(hbyte, lbyte) { return ((hbyte*256)+lbyte); }
    ext.readJoystick = function(name) {
        var retval = null;
        switch(name) {
            case 'leftX': retval = to16Bit(input[1] , input[2]); break;
            case 'leftY': retval = to16Bit(input[3] , input[4]); break;
            case 'rightX': retval = to16Bit(input[5] , input[6]); break;
            // case 'rightY': retval = to16Bit(input[7] , input[8]); break;
            case 'rightY': retval = to16Bit(3,0); break;
        }

        //return retval;
        return retval;
    }

    var descriptor = {
        blocks: [
            ['r', 'get joystick %m.joystickPart', 'readJoystick', 'leftX']
        ],
        menus: {
            joystickPart: ['leftX', 'leftY', 'rightX', 'rightY']
        }
    };
    ScratchExtensions.register('Joystick', descriptor, ext, {type: 'hid', vendor:0x461, product:0x20});
})();