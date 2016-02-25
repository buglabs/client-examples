var tessel = require('tessel');
var accel = require('accel-mma84').use(tessel.port['A']);
var wifi = require('wifi-cc3000');
var http = require('http');
var config = require('./config');
var uuid = require('node-uuid');

var dweetDeviceName = tessel.deviceId(); //this device ID should be provisioned as a 'thing name' in your account.  I'm choosing to use the SN of the tessel board
var dweetDeviceId = null;
var dweetDeviceKey = null;
var acceleration = null;
var wifiuptime = 0;
var systemUptime = 0;

//go make a wifi connection with our config.js settings
function connect() {
    while (wifi.isBusy()) {
        console.log('connect, wifi is busy');
    }

    wifi.reset(function() {
        console.log('wifi reset complete');

    	var json = {
            security: config.deviceService.wifiSecurity,
            timeout:  120, // in seconds
            ssid: config.deviceService.wifiSSID,
            password: config.deviceService.wifiPassword
        };
    	console.log('try to connect to wifi with ' + JSON.stringify(json));
        wifi.connect(json);
    });
}

//when we detect a legit wifi connection, we'll start up the rest of our processess
wifi.on('connect', function(data) {
    console.log('wifi connect ' + JSON.stringify(data));
    wifiuptime = 0;
});

wifi.on('disconnect', function(data) {
    if (data) {
        console.log('wifi disconnect, reconnect ' + JSON.stringify(data));
        connect();
    } else {
        console.log('wifi disconnect, false callback ' + JSON.stringify(data));
    }
})

wifi.on('timeout', function(err) {
    console.log('wifi timeout ' + JSON.stringify(err));
    connect();
});

wifi.on('error', function(err) {
    console.log('wifi error ' + JSON.stringify(err));
    connect();
});

accel.on('ready', function() {
    accel.on('data', function(xyz) {
        acceleration = xyz;
    });
});

//add all the collection/datamodelling thing syou want to add here.  use dweetAcceleration as an example
//other things are making sure wifi is on, you don't have to worry about that here, just check that you are
//connected before trying to dweet anything
function dweet() {
    if (wifi.isConnected()) {
        if (dweetDeviceId != null && dweetDeviceKey) {
            dweetAcceleration();
        } else {
            getKeyFor();
        }
    }
}

//this thingy is just collecting the recorded sensor data into a properly formatted json object for posting to dweet
//you can also tier json, but i've flattened it out here for simplicity's sake.  add any new sensor readings you take
//here and it'll get delivered to dweet
function dweetAcceleration() {
    if (acceleration != null) {
        var payload = {
            acceleration: {  //can post complex objects, and / or construct this payload from more than 1 data source
                "x": acceleration[0].toFixed(2),
                "y": acceleration[1].toFixed(2),
                "z": acceleration[2].toFixed(2)
            }, diagnostics: {
                "uptime_seconds": systemUptime,
                "wifi_uptime_seconds": wifiuptime,
                "transaction_id": uuid.v4()
            }
        }
        dweetFor(payload);
    }
}

//get key is a dweet api.  this will be moved to the dweet library in the future
//in essense, this api says: 
//device-to-server:  'hey man, my account is X, and I am Y, can I please talk to the server?'
//server-to-device:  'yea, dude, your access tokens are dweetDeviceId and dweetDeviceKey'
function getKeyFor() {
    http.get(config.deviceService.proUrl + '/get/key/for/' + config.deviceService.proAccount + '/' + dweetDeviceName, function(response) {
        response.on('data', function(data) {
            var jsonString = new Buffer(data).toString();
            var json = JSON.parse(jsonString);
            dweetDeviceId = json.with.thing;
            dweetDeviceKey = json.with.key;
            console.log('/get/key/for/' + config.deviceService.proAccount + '/' + dweetDeviceName + ' :: ' + jsonString);
        });

        response.on('end', function() {
            console.log('http.get end');
        });
    }).on('error', function(error) {
        console.log('http.get error ' + JSON.stringify(error));
        connect();
    });
}

//dweet for is a dweet api.  this will be moved to the dweet library in the future
//this api is responsible for delivering the JSON payload you created earlier with all the cool acceleration data
//in it to the dweet server and associates it with your account and device.
function dweetFor(payload) {
    if (payload != null) {
        console.log(' ');

        var payloadString = JSON.stringify(payload);
        console.log('post ' + dweetDeviceName + ' /dweet/for/' + dweetDeviceId + '?key=' + dweetDeviceKey + ' ' + payloadString);

        var headers = {
            'Content-Type': 'application/json',
            'Content-Length': payloadString.length
        };

        var postUrl = config.deviceService.proUrl.replace('http://', '').replace('https://', '');
        var options = {
            host: postUrl,
            port: 80,
            path: '/dweet/for/' + dweetDeviceId + '?key=' + dweetDeviceKey,
            method: 'POST',
            headers: headers
        };

        var req = http.request(options, function(res) {
            res.setEncoding('utf-8');
            var responseString = '';

            res.on('data', function(data) {
                responseString += data;
            });

            res.on('end', function() {
                var resultObject = JSON.parse(responseString);
                console.log('post response ' + JSON.stringify(resultObject));
            });
        });

        req.on('error', function(err) {
            console.log("http.request error " + JSON.stringify(err));
            connect();
        });

        req.write(payloadString);
        req.end();

        return payload;
    } else {
        return null;
    }
}

//i just wanna have a counter of how many seconds the wifi connection has been alive
function incrementUptime() {
    wifiuptime++;
    systemUptime++;
}

console.log('start up everything');
connect();
setInterval(incrementUptime, 1000);
setInterval(dweet, config.deviceService.postIntervalSeconds);


