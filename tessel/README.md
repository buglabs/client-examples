# tessel-dweet.io

This is a simple example of a tessel.io v1 board interfacing with the accel-mma84 daughter board.  It is free to use, abuse, and extend as you see fit, but keep in mind:  The author really really enjoys hearing about the crazy things you'll do with it!

## PREREQUISITES

You will of course, need to have installed nodejs and npm for your specific OS and have installed the tessel environment by running:

```
npm install -g tessel

```

Ensure that your tessel board is running the latest firmware by running:

```
tessel update
```

Detailed instructions on managing nodejs, npm, and the tessel environment can be found at http://start.tessel.io/

## SETUP

Copy your.config.js to config.js then you will need to change your wifi settings to match your local wifi connection.  The proAccount field here references your https://alpha.freeboard.io account id.

This was issued at the time of account creation and can be found in https://alpha.freeboard.io when you log in, particularly under the 'My Things' page.

```
deviceService = {
    'proUrl': 'http://beta.dweet.io',
    'proAccount': '[your-account-id]',
    'postIntervalSeconds': 2000,
    'wifiSecurity': '[wpa|wpa2|wep]',
    'wifiSSID': '[your-ssid]',
    'wifiPassword': '[your-ssid-password]'
}
```

## INSTALLATION

This procedure is nothing new for tessel fans, but there are 2 ways to start having fun...

For remote, run:

```
tessel run app.js
```

For deploy, run:

```
tessel push app.js
tessel logs
```

## EXAMPLES

An example dashboard can be found here:
https://alpha.freeboard.io/board/kVQK57

## DISCLAIMERS

FreeboardPro is in active development and the URLs noted here, https://beta.dweet.io and https://alpha.freeboard.io are sandbox environments that are subject to change at the whim of the owners and will soon be consolidated into a single Pro product line.  Usage of them will change as the parent product evolves.

I'll also be refactoring this example and implementing additional interfaces to FreeboardPro into a npm library.
