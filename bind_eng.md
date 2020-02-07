# Binding

The Zigbee protocol supports direct binding of Endpoint devices, which allows you to directly manage each other without the intervention of a coordinator or any home automation software.

# Types of devices
Not all devices have firmware that supports this binding. Xiaomi's popular manufacturer of zigbee equipment, only with the advent of Zigbee 3 devices, was concerned about the availability of this functionality, although the previously released Zigbee 1.2 protocol already had such an opportunity.

List of tested devices that have firmware with filled Endpoint parameters

### Ikea
Wireless Remote Control ICTC-G-1

### Xiaomi
Wireless Remote Controller WXCJKG12LM
XCJKG11LM Wireless Remote

### DiyRUZ

Remote controls with firmware from @DJONvl https://modkam.ru/?p=1264


The list will expand.

# Setup via MQTT (in development)

The topic structure completely repeats the [zigbee2mqtt project](https://www.zigbee2mqtt.io/information/binding.html)

Needed in topic
```
zigbee2mqtt/bridge/bind/SOURCE_DEVICE_FRIENDLY_NAME
```
send the value TARGET_DEVICE_FRIENDLY_NAME, where SOURCE_DEVICE_FRIENDLY_NAME is the address or FN of the remote, TARGET_DEVICE_FRIENDLY_NAME is the address or FN of the managed device.

As a result, the source device is bound to the target.

To untie the devices you must send
```
zigbee2mqtt/bridge/unbind/SOURCE_DEVICE_FRIENDLY_NAME
```
with the TARGET_DEVICE_FRIENDLY_NAME parameter, where SOURCE_DEVICE_FRIENDLY_NAME is the address or FN of the remote, TARGET_DEVICE_FRIENDLY_NAME is the address or FN of the managed device.

# Setup via the Web

It is necessary through the Web interface on the zigbee tab to go to the control device (remote) and specify the address and endpoint of the managed device.
