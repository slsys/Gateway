# Интеграция с Home Assistant

Шлюз SLS может быть легко интегрирован с системой домашней автоматизации [Home Assistant](www.home-assistant.io).

![koridor](/img/koridor.png)

## Подготовительные меропрития

Home Assistant интегрируется с SLS по протоколу MQTT (MQ Telemetry Transport).

Необходимо подготовить mosqutto брокер на [raspberry Pi](https://robot-on.ru/articles/ystanovka-mqtt-brokera-mosquitto-raspberry-orange-pi), [linux](https://smartideal.net/ustanovka-i-zapusk-mqtt-brokera-mosquitto/) или [Windows](https://mosquitto.org/download/)

## Discovery

Режим Discovery позволяет автоматически добавлять в систему новые устройства. Устройства в HAS создаются в момент первой записи состояния. Если устройства были сопряжены до включения данной настройки, необходимо провести процедуру пересопряжения.

В меню `Settings -> Link -> MQTT Setup` настроить:

- включить чекбокс Home Assistant MQTT Discovery
- указать топик SLS: `ZigbeeSLS`
- указать топик НА: `homeassistant`

![Home Assistant MQTT Discovery](/img/int_ha_discovery.png)

## Ручное добавление устройств

Устройства Zigbee шлюза SLS можно добавить в Home Assistant вручную. Для этого в конфигурационный файл `configuration.yaml` нужно добавить соответствующие типу устройств настройки. Ниже приведены протестированные фрагменты  конфигурационного файла:

Далее в примерах указан стартовый топик ZigbeeSLS - замените его на свой, который вы указали в настройках MQTT выше.

### Датчик протечки (binary_sensor) SJCGQ11LM

{% raw %}

```yaml
- platfyaml mqtt
  name: bathroom_leak
  availability_topic: "ZigbeeSLS/bridge/state"
  state_topic: "ZigbeeSLS/bathroom_leak_1"
  value_template: >-
    {% if value json.water_leak == true %}
      {{'ON'}}
    {% else %}
      {{'OFF'}}
    {% endif %}
# Датчик протечки №1 (уровень заряда) SJCGQ11LM
- platform: mqtt
  name: bathroom_leak_1_battery
  icon: mdi:battery-high
  unit_of_measurement: "%"
  availability_topic: "ZigbeeSLS/bridge/state"
  state_topic: "ZigbeeSLS/bathroom_leak_1"
  value_template: "{{ value_json.battery }}"
  ```

{% endraw %}

### Датчик температуры/вланости (круглый сяоми, обычный sensor) WSDCGQ01LM

```yaml
- platform: mqtt # Температура
  name: bathroom_temperature
  icon: mdi:thermometer
  unit_of_measurement: "°C"
  availability_topic: "ZigbeeSLS/bridge/state"
  state_topic: "ZigbeeSLS/bathroom_sensor"
  value_template: "{{ value_json.temperature | round(2) }}"
- platform: mqtt # Влажность
  name: bathroom_humidity
  icon: mdi:water-percent
  unit_of_measurement: "%"
  availability_topic: "ZigbeeSLS/bridge/state"
  state_topic: "ZigbeeSLS/bathroom_sensor"
  value_template: "{{ value_json.humidity | round(2) }}"
- platform: mqtt # Уровень заряда
  name: bathroom_sensor_battery
  icon: mdi:battery-high
  unit_of_measurement: "%"
  availability_topic: "ZigbeeSLS/bridge/state"
  state_topic: "ZigbeeSLS/bathroom_sensor"
  ```
  
### Квадратный датчик с давлением (в дополнение к предыдущему) WSDCGQ11LM

```yaml
- platform: mqtt # Давление
  name: loggia_pressure
  icon: mdi:gauge
  unit_of_measurement: "мм рт.ст."
  availability_topic: "ZigbeeSLS/bridge/state"
  state_topic: "ZigbeeSLS/loggia_sensor"
  value_template: "{{ (value_json.pressure | float * 7.501) | round | int }}"
 ```

### Квадратная кнопка сяоми (binary_sensor) WXKG11LM

Так как это именно кнопка, а не переключатель, то binary_sensor меняет свое состояние на очень короткий срок. Для работы с ним можно использовать автоматизацию типа этой (в данном случае при нажатии включается/отключается вентилятор):

```yaml
- platform: mqtt
  name: bathroom_button
  availability_topic: "ZigbeeSLS/bridge/state"
  state_topic: "ZigbeeSLS/bathroom_button"
  value_template: >-
    {% if value_json.click == '' %}
      {{'OFF'}}
    {% else %}
      {{'ON'}}
    {% endif %}
  expire_after: 5
 ```

### Подсветка шлюза (light)

```yaml
- platform: mqtt
  name: gateway
  availability_topic: "ZigbeeSLS/bridge/state"
  command_topic: "ZigbeeSLS/led"
  rgb_command_topic: "ZigbeeSLS/led"
  rgb_command_template: >-
    {
      "mode": "manual",
      "hex": "#{{ '%02x%02x%02x' | format(red, green, blue) }}"
    }
  on_command_type: "brightness"
  payload_off: '{"mode": "off"}'
```

### Статус шлюза с аттрибутами (binary_sensor)

```yaml
- platform: mqtt
  name: sls_state
  unique_id: cee1d05d-205a-4334-b257-723540c5d578
  state_topic: "ZigBeeGW/bridge/state"
  device_class: connectivity
  payload_on: online
  payload_off: offline
  json_attributes_topic: "ZigBeeGW/bridge/config"
  json_attributes_template: "{{ value_json | tojson }}"
```

### Режим сопряжения ZigBee/Bluetooth шлюза (switch)

```yaml
- platform: mqtt
  name: gateway_join
  availability_topic: "ZigbeeSLS/bridge/state"
  state_topic: "ZigbeeSLS/bridge/config"
  value_template: "{{ value_json.permit_join }}"
  state_on: true
  state_off: false
  command_topic: "ZigbeeSLS/bridge/config/permit_join"
  payload_on: "true"
  payload_off: "false"
```

### Время работы шлюза (sensor)

```yaml
- platform: mqtt
  name: gateway_uptime
  icon: mdi:timeline-clock
  unit_of_measurement: "%"
  availability_topic: "ZigbeeSLS/bridge/state"
  state_topic: "ZigbeeSLS/bridge/config"
  value_template: "{{ value_json.UptimeStr }}"
```

![статус sls](/img/int_ha_status_sls.png)

### Двухканальное реле сяоми switch LLKZMK11LM

```yaml
### бойлер
- platform: mqtt
  name: gas_boiler
  availability_topic: "ZigbeeSLS/bridge/state"
  state_topic: "ZigbeeSLS/gas_heating"
  value_template: "{{ value_json.state_l1 }}"
  command_topic: "ZigbeeSLS/gas_heating/set/state_l1"
  
### Насос теплого пола switch
- platform: mqtt
  name: warm_floor
  availability_topic: "ZigbeeSLS/bridge/state"
  state_topic: "ZigbeeSLS/gas_heating"
  value_template: "{{ value_json.state_l2 }}"
  command_topic: "ZigbeeSLS/gas_heating/set/state_l2"
 ```

Соответственно везде name и адреса топиков необходимо поменять на свои

### Включение/отключение вентиляции по нажатии на кнопку

```yaml
- alias: toggle_bathroom_fan_when_button_pushed
  trigger:
    - platform: state
      entity_id: binary_sensor.bathroom_button
      to: "on"
  action:
    - service: fan.toggle
      entity_id: fan.bathroom
```

### Aqara LED Light Bulb Tunable White Model ZNLDP12LM

```yaml
- platform: mqtt
    name: GardenBulbLeft
    state_topic: "ZigbeeSLS/GardenBulbLeft"
    availability_topic: "ZigbeeSLS/bridge/state"
    brightness: true
    color_temp: true
    schema: json
    command_topic: "ZigbeeSLS/GardenBulbLeft/set"

  - platform: mqtt
    name: GardenBulbRight
    state_topic: "ZigbeeSLS/GardenBulbRight"
    availability_topic: "ZigbeeSLS/bridge/state"
    brightness: true
    color_temp: true
    schema: json
    command_topic: "ZigbeeSLS/GardenBulbRight/set”
```

### Датчик движения/освещенности Xiaomi RTCGQ11LM

```yaml
#Сенсор Движение Коридор
  - platform: mqtt
    name: "Motion koridor battery"
    state_topic: "ZigbeeSLS/Sensor_Motion_Koridor"
    unit_of_measurement: '%'
    value_template: "{{ value_json.battery }}"
  - platform: mqtt
    name: "Motion koridor linkquality"
    state_topic: "ZigbeeSLS/Sensor_Motion_Koridor"
    value_template: "{{ value_json.linkquality }}"
  - platform: mqtt
    name: "Motion koridor dvigenie"
    state_topic: "ZigbeeSLS/Sensor_Motion_Koridor"
    value_template: "{{ value_json.occupancy }}"
    expire_after: 10
  - platform: mqtt
    name: "Motion koridor yarkost"
    state_topic: "ZigbeeSLS/Sensor_Motion_Koridor"
    value_template: "{{ value_json.illuminance }}"
    unit_of_measurement: 'lux'
```

### Датчик открытия окна Xiaomi MCCGQ01LM

```yaml
#Сенсор Дверь Улица
  - platform: mqtt
    name: "Door Uliza battery"
    state_topic: "ZigbeeSLS/Sensor_Door_Uliza"
    unit_of_measurement: '%'
    value_template: "{{ value_json.battery }}"
  - platform: mqtt
    name: "Door Uliza linkquality"
    state_topic: "ZigbeeSLS/Sensor_Door_Uliza"
    value_template: "{{ value_json.linkquality }}"
  - platform: mqtt
    name: "Door Uliza"
    state_topic: "ZigbeeSLS/Sensor_Door_Uliza"
    value_template: "{{ value_json.contact }}"
```

### Cкрипт переводит статус датчиков на off через требуемый таймаут

Создать файл

```py
#Victor Enot, [06.04.20 18:02]
#==========================================================================================
#  python_scripts/set_state.py 
#==========================================================================================
inputEntity = data.get('entity_id')
if inputEntity is None:
  logger.warning("===== entity_id is required if you want to set something.")
else:
  inputStateObject = hass.states.get(inputEntity)
  inputState = inputStateObject.state
  inputAttributesObject = inputStateObject.attributes.copy()
  for item in data:
    newAttribute = data.get(item)
    logger.debug("===== item = {0}; value = {1}".format(item,newAttribute))
    if item == 'entity_id':
      continue # already handled
    elif item == 'state':
      inputState = newAttribute
    else:
      inputAttributesObject[item] = newAttribute
    hass.states.set(inputEntity, inputState, inputAttributesObject)
```

В automations.yaml необходимо прописать следующий код

```yaml
- id: '1579606187576'
  alias: Tualet pir off
  description: ''
  trigger:
  - entity_id: binary_sensor.tualet_pir
    for: 00:02:00
    platform: state
    to: 'on'
  condition: []
  action:
  - data_template:
      entity_id: Binary_sensor.tualet_pir
      state: 'off'
    service: python_script.set_state
```

### Умный термостат Tuya MoesHouse BHT-002-GBLZB

```yaml
#Термостат теплый пол кухня
  - platform: mqtt
    name: Пол кухня
    payload_on: "true"
    payload_off: "false"
    power_command_topic: "zigbee5710/pol_kitchen/system_mode"
    temperature_command_topic: "zigbee5710/pol_kitchen/set/current_heating_setpoint"
    temperature_state_topic: "zigbee5710/pol_kitchen/current_heating_setpoint"
    current_temperature_topic: "zigbee5710/pol_kitchen/local_temperature"
    mode_state_topic: "zigbee5710/pol_kitchen/system_mode"
    action_topic: "true"
    mode_command_topic: "zigbee5710/pol_kitchen/set/system_mode"
    modes: 
      - "heat"
      - "off"
    min_temp: 20
    max_temp: 45
    temp_step: 1
    precision: 1
    retain: true
```

*PS: раздел в разработке.*
