#agent

Customer account creation is currently an alpha only feature, but will show up in the pro implementation in the near future.
For now, alpha.freeboard.io hosts the interface.

After creating an account, note the account id.  This will be used in the agent.  While this should ideally be a parameter 
passed to the agent from the device, I have added it here for convenience.

The new api, get/lock/for/, will allow a thing to authenticate with dweet.io and request it's session name and lock key
in the form

```
{
    "this": "succeeded",
    "by": "getting",
    "the": "key",
    "with": {
        "name": "[thing-session-name]",
        "key": "[key-lock]"
    }
}
```

These params will be used when invoking the pre-existing api dweet/for/ as normal.

#device.temperature

[LED]

GND - GND

VCC - Pin9

[Temperature Sensor]

http://www.digikey.com/product-detail/en/LM35DZ%2FNOPB/LM35DZ%2FNOPB-ND/32489

GND - GND

VCC - Pin8

DATA - Pin7

#device.moisture

[LED]

GND - GND

VCC - Pin9

[Moisture Sensor]

http://www.tinyosshop.com/index.php?route=product/product&product_id=458

VCC - Pin5

GND - GND

DO - Pin7

A0 - Pin8

#freeboard.io
https://freeboard.io/board/j6vF57

