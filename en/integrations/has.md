# Integration with Home-Assistant

The SLS Gateway can be easily integrated with the [Home Assistant](www.home-assistant.io) home automation system. For integration, the software [zigbee2mqtt](https://www.zigbee2mqtt.io) can be used together with various versions of zigbee dongles, or the ready-made Smart Logic System (SLS) Zigbee BLE gateway.

![koridor](/img/koridor.png)

# Preparatory activities

The module works through MQTT.
Install mosqutto on raspberry or linux:

[link 1](https://robot-on.ru/articles/ystanovka-mqtt-brokera-mosquitto-raspberry-orange-pi)

[link 2](https://smartideal.net/ustanovka-i-zapusk-mqtt-brokera-mosquitto/)

Mosqutto for windows can be downloaded [here](https://mosquitto.org/download/)

# Discovery

Discovery mode automatically adds new devices to the system. Devices in HAS are created when the state is first recorded. If the devices were paired before enabling this setting, it is necessary to re-pair.

You can enable Discovery mode from the ZIgbee-> Config menu (checkbox Home Assistant MQTT Discovery)

![Home Assistant MQTT Discovery](/img/int_ha_discovery.png)

# Manually adding devices

SLS Zigbee Gateway devices can be manually added to the Home-Assistant. To do this, add the appropriate settings for the device type to the configuration.yaml configuration file. Below are tested examples of clippings from the configuration file:

\*The following examples show the ZigBeeCA20 starting topic - replace it with yours, which you specified in the MQTT settings of the SLS gateway.
