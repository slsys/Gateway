## Description of HTTP API commands

You can interact with the gateway using the HTTP API commands. GET and POST messages are supported.

The following are examples of available commands:

```/api/zigbee/devices```
Gets a list of zigbee network devices.

```/api/zigbee/remove?dev=XXX``` - Remove a XXX device from the zigbee network

``` /api/zigbee/rename?old=XXX&new=YYY``` Renaming a device on a zigbee network

``` /api/zigbee/join?duration = 255 & target = XXX``` Controls the pairing mode duration 0 to turn off, values ​​greater than 0 indicate the waiting period in seconds, target allows pairing on the contact router. all parameters are optional


```/api/log?action=X``` Logging mode control, where X can take the following values:
```
action=setLevel & value = 1

action=getBuffer

action=getLevel
```
```/api/zigbee?dev=0x1841&action=setSimpleBind&state=click&value=test.lua``` - Binds the start of the test.lua script to the state parameter equal to click on the device with the address 0x1841. The address can be in IEEE format, or FriendlyName.

```/api/zigbee?dev=0x2855&action=setState&state=state&value=ON``` - Sets the state state to ON for the device with the address 0x2855. The address can be in IEEE format, or FriendlyName.

```/api/zigbee?dev=0xABCD&action=setInterview&state=0``` - Start the interview on the device.
