# Integration with Home-Assistant

The SLS Gateway can be easily integrated with the [Home Assistant] home automation system (www.home-assistant.io). For integration, the software [zigbee2mqtt] (https://www.zigbee2mqtt.io) can be used together with various versions of zigbee dongles, or the ready-made Smart Logic System (SLS) Zigbee BLE gateway.

! [koridor] (/ img / koridor.png)


# Preparatory activities

The module works through MQTT.
Install mosqutto on raspberry or linux:

[link 1] (https://robot-on.ru/articles/ystanovka-mqtt-brokera-mosquitto-raspberry-orange-pi)

[link 2] (https://smartideal.net/ustanovka-i-zapusk-mqtt-brokera-mosquitto/)

Mosqutto for windows can be downloaded [here] (https://mosquitto.org/download/)





# Discovery
Discovery mode allows you to automatically add new devices to the system. This functionality is in development.



# Manually adding devices
SLS Zigbee Gateway devices can be manually added to the Home-Assistant. To do this, add the appropriate settings for the device type to the configuration.yaml configuration file. Below are tested examples of clippings from the configuration file:



### Leakage Sensor (binary_sensor) SJCGQ11LM
`` ``
- platform: mqtt
  name: bathroom_leak
  availability_topic: "/ zigbee-ble / bridge / state"
  state_topic: "/ zigbee-ble / bathroom_leak_1"
  value_template:> -
    {% if value_json.water_leak == true%}
      {{'ON'}}
    {% else%}
      {{'OFF'}}
    {% endif%}

# Leak Sensor # 1 (charge level) SJCGQ11LM
- platform: mqtt
  name: bathroom_leak_1_battery
  icon: mdi: battery-high
  unit_of_measurement: "%"
  availability_topic: "/ zigbee-ble / bridge / state"
  state_topic: "/ zigbee-ble / bathroom_leak_1"
  value_template: "{{value_json.battery}}"
  `` ``
### Temperature / humidity sensor (xiaomi round, normal sensor) WSDCGQ01LM
`` ``
- platform: mqtt # Temperature
  name: bathroom_temperature
  icon: mdi: thermometer
  unit_of_measurement: "° C"
  availability_topic: "/ zigbee-ble / bridge / state"
  state_topic: "/ zigbee-ble / bathroom_sensor"
  value_template: "{{value_json.temperature | round (2)}}"
- platform: mqtt # Humidity
  name: bathroom_humidity
  icon: mdi: water-percent
  unit_of_measurement: "%"
  availability_topic: "/ zigbee-ble / bridge / state"
  state_topic: "/ zigbee-ble / bathroom_sensor"
  value_template: "{{value_json.humidity | round (2)}}"
- platform: mqtt # Charge level
  name: bathroom_sensor_battery
  icon: mdi: battery-high
  unit_of_measurement: "%"
  availability_topic: "/ zigbee-ble / bridge / state"
  state_topic: "/ zigbee-ble / bathroom_sensor"
  `` ``
  
### Square sensor with pressure (in addition to the previous one) WSDCGQ11LM:
`` ``
- platform: mqtt # Pressure
  name: loggia_pressure
  icon: mdi: gauge
  unit_of_measurement: "mmHg"
  availability_topic: "/ zigbee-ble / bridge / state"
  state_topic: "/ zigbee-ble / loggia_sensor"
  value_template: "{{(value_json.pressure | float * 7.501) | round | int}}"
 `` ``
### Square xiaomi button (binary_sensor) WXKG11LM
`` ``
- platform: mqtt
  name: bathroom_button
  availability_topic: "/ zigbee-ble / bridge / state"
  state_topic: "/ zigbee-ble / bathroom_button"
  value_template:> -
    {% if value_json.click == ''%}
      {{'OFF'}}
    {% else%}
      {{'ON'}}
    {% endif%}
  expire_after: 5
 `` ``
A note on a button - since this is a button, not a switch, binary_sensor changes its state for a very short time. To work with it, you can use automation such as this (in this case, when pressed, the fan turns on / off):
 
 
 
### Gateway backlight (light)
`` ``
- platform: mqtt
  name: gateway
  availability_topic: "/ zigbee-ble / bridge / state"
  command_topic: "/ zigbee-ble / led"
  rgb_command_topic: "/ zigbee-ble / led"
  rgb_command_template:> -
    {
      "mode": "manual",
      "hex": "# {{'% 02x% 02x% 02x' | format (red, green, blue)}}"
    }
  on_command_type: "brightness"
  payload_off: '{"mode": "off"}'
`` ``
### Attribute Gateway Status (binary_sensor)
`` ``
- platform: mqtt
  name: sls_state
  unique_id: cee1d05d-205a-4334-b257-723540c5d578
  state_topic: "ZigBeeGW / bridge / state"
  device_class: connectivity
  payload_on: online
  payload_off: offline
  json_attributes_topic: "ZigBeeGW / bridge / config"
  json_attributes_template: "{{value_json | tojson}}"
`` ``
### ZigBee / Bluetooth gateway pairing mode (switch)
`` ``
- platform: mqtt
  name: gateway_join
  availability_topic: "/ zigbee-ble / bridge / state"
  state_topic: "/ zigbee-ble / bridge / config"
  value_template: "{{value_json.permit_join}}"
  state_on: true
  state_off: false
  command_topic: "/ zigbee-ble / bridge / config / permit_join"
  payload_on: "true"
  payload_off: "false"
`` ``
### Gateway uptime (sensor)
`` ``
- platform: mqtt
  name: gateway_uptime
  icon: mdi: timeline-clock
  unit_of_measurement: "%"
  availability_topic: "/ zigbee-ble / bridge / state"
  state_topic: "/ zigbee-ble / bridge / config"
  value_template: "{{value_json.UptimeStr}}"
`` ``

! [permit] (
