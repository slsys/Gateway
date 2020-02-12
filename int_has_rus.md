# Интеграция с Home-Assistant

Шлюз SLS Gateway может быть легко интегрирован с системой домашней автоматизации   [Home Assistant](www.home-assistant.io). Для интеграции могут быть использованы программный  продукт  [zigbee2mqtt](https://www.zigbee2mqtt.io) совместно с разлиными вариантами zigbee-донглов, либо  готовый апаратный  шлюз Smart Logic System (SLS) Zigbee BLE gateway. 

![has](/img/has.png)


# Подготовительные меропрития

Модуль работает через MQTT. 
Установка mosqutto на raspberry или linux:

[ссылка 1](https://robot-on.ru/articles/ystanovka-mqtt-brokera-mosquitto-raspberry-orange-pi)

[ссылка 2](https://smartideal.net/ustanovka-i-zapusk-mqtt-brokera-mosquitto/)

Mosqutto для windows можно скачать [тут](https://mosquitto.org/download/)





# Discovery
Режим Discovery позволяет автоматически добавлять в систему новые устройства. В настоящее время такой функционал в шлюзе SLS в разработке. 

# Ручное добавление устройств
Устройства шлюза SLS Zigbee Gateway можно добавить в Home-Assistant вручную. Для этого в конфигурационный файл configuration.yaml нужно добавить соответсвующие типа устройств настройки. Ниже приведены протестированные примеры настроек для различных типов устройств:



### Датчик протечки (binary_sensor)
```
- platform: mqtt
  name: bathroom_leak
  availability_topic: "/zigbee-ble/bridge/state"
  state_topic: "/zigbee-ble/bathroom_leak_1"
  value_template: >-
    {% if value_json.water_leak == true %}
      {{'ON'}}
    {% else %}
      {{'OFF'}}
    {% endif %}
 ```
### Датчик протечки №1 (уровень заряда)
```
- platform: mqtt
  name: bathroom_leak_1_battery
  icon: mdi:battery-high
  unit_of_measurement: "%"
  availability_topic: "/zigbee-ble/bridge/state"
  state_topic: "/zigbee-ble/bathroom_leak_1"
  value_template: "{{ value_json.battery }}"
  ````
### Датчик температуры/влажности (круглый сяоми, обычный sensor)
````
- platform: mqtt # Температура
  name: bathroom_temperature
  icon: mdi:thermometer
  unit_of_measurement: "°C"
  availability_topic: "/zigbee-ble/bridge/state"
  state_topic: "/zigbee-ble/bathroom_sensor"
  value_template: "{{ value_json.temperature | round(2) }}"
- platform: mqtt # Влажность
  name: bathroom_humidity
  icon: mdi:water-percent
  unit_of_measurement: "%"
  availability_topic: "/zigbee-ble/bridge/state"
  state_topic: "/zigbee-ble/bathroom_sensor"
  value_template: "{{ value_json.humidity | round(2) }}"
- platform: mqtt # Уровень заряда
  name: bathroom_sensor_battery
  icon: mdi:battery-high
  unit_of_measurement: "%"
  availability_topic: "/zigbee-ble/bridge/state"
  state_topic: "/zigbee-ble/bathroom_sensor"
  ````
  
### Квадратный датчик с  давлением (в дополнение к предыдущему):
```
- platform: mqtt # Давление
  name: loggia_pressure
  icon: mdi:gauge
  unit_of_measurement: "мм рт.ст."
  availability_topic: "/zigbee-ble/bridge/state"
  state_topic: "/zigbee-ble/loggia_sensor"
  value_template: "{{ (value_json.pressure | float * 7.501) | round | int }}"
 ```
### Квадратная кнопка сяоми (binary_sensor)
```
- platform: mqtt
  name: bathroom_button
  availability_topic: "/zigbee-ble/bridge/state"
  state_topic: "/zigbee-ble/bathroom_button"
  value_template: >-
    {% if value_json.click == '' %}
      {{'OFF'}}
    {% else %}
      {{'ON'}}
    {% endif %}
  expire_after: 5
 ```
### Подсветка шлюза (light)
```
- platform: mqtt
  name: gateway
  availability_topic: "/zigbee-ble/bridge/state"
  command_topic: "/zigbee-ble/led"
  rgb_command_topic: "/zigbee-ble/led"
  rgb_command_template: >-
    {
      "mode": "manual",
      "hex": "#{{ '%02x%02x%02x' | format(red, green, blue) }}"
    }
  on_command_type: "brightness"
  payload_off: '{"mode": "off"}'
```  
### Режим спаривания ZigBee/Bluetooth шлюза (switch)
```
- platform: mqtt
  name: gateway_join
  availability_topic: "/zigbee-ble/bridge/state"
  state_topic: "/zigbee-ble/bridge/config"
  value_template: "{{ value_json.permit_join }}"
  state_on: true
  state_off: false
  command_topic: "/zigbee-ble/bridge/config/permit_join"
  payload_on: "true"
  payload_off: "false"
```  
### Время работы шлюза (sensor)
```
- platform: mqtt
  name: gateway_uptime
  icon: mdi:timeline-clock
  unit_of_measurement: "%"
  availability_topic: "/zigbee-ble/bridge/state"
  state_topic: "/zigbee-ble/bridge/config"
  value_template: "{{ value_json.UptimeStr }}"
```  
Двухканальное реле сяоми (датчик потребления энергии не заводил, так как спалил его. switch)

### Газовый котел
```
- platform: mqtt
  name: gas_boiler
  availability_topic: "/zigbee-ble/bridge/state"
  state_topic: "/zigbee-ble/gas_heating"
  value_template: "{{ value_json.state_l1 }}"
  command_topic: "/zigbee-ble/gas_heating/set/state_l1"
  ```

### Насос теплого пола
```
- platform: mqtt
  name: warm_floor
  availability_topic: "/zigbee-ble/bridge/state"
  state_topic: "/zigbee-ble/gas_heating"
  value_template: "{{ value_json.state_l2 }}"
  command_topic: "/zigbee-ble/gas_heating/set/state_l2"
 ```
соответственно везде name и адреса топиков поменять на свои
на данный момент это пока что все
Замечание по кнопке - так как это именно кнопка, а не переключатель, то binary_sensor меняет свое состояние на очень короткий срок. Для работы с ним можно использовать автоматизацию типа этой (в данном случае при нажатии включается/отключается вентилятор):

### Включение/отключение вентиляции по нажатии на кнопку
```
- alias: toggle_bathroom_fan_when_button_pushed
  trigger:
    - platform: state
      entity_id: binary_sensor.bathroom_button
      to: "on"
  action:
    - service: fan.toggle
      entity_id: fan.bathroom
```      
      
