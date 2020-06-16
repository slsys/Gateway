# Интеграция с Home-Assistant

Шлюз SLS Gateway может быть легко интегрирован с системой домашней автоматизации   [Home Assistant](www.home-assistant.io). Для интеграции могут быть использованы программный  продукт  [zigbee2mqtt](https://www.zigbee2mqtt.io) совместно с разлиными вариантами zigbee-донглов, либо  готовый апаратный  шлюз Smart Logic System (SLS) Zigbee BLE gateway. 

![koridor](/img/koridor.png)


# Подготовительные меропрития

Модуль работает через MQTT. 
Установка mosqutto на raspberry или linux:

[ссылка 1](https://robot-on.ru/articles/ystanovka-mqtt-brokera-mosquitto-raspberry-orange-pi)

[ссылка 2](https://smartideal.net/ustanovka-i-zapusk-mqtt-brokera-mosquitto/)

Mosqutto для windows можно скачать [тут](https://mosquitto.org/download/)





# Discovery
Режим Discovery позволяет автоматически добавлять в систему новые устройства. Данный функционал в разработке. 



# Ручное добавление устройств
Устройства шлюза SLS Zigbee Gateway можно добавить в Home-Assistant вручную. Для этого в конфигурационный файл configuration.yaml нужно добавить соответствующие типу устройств настройки. Ниже приведены протестированные примеры  вырезок из  конфигурационного файла:

Далее в примерах указан стартовый топик ZigBeeCA20  - замените его на свой, который вы указали в настройках MQTT шлюза SLS.



### Датчик протечки (binary_sensor) SJCGQ11LM
{% raw %}
```
- platform: mqtt
  name: bathroom_leak
  availability_topic: "ZigBeeCA20/bridge/state"
  state_topic: "ZigBeeCA20/bathroom_leak_1"
  value_template: >-
    {% if value_json.water_leak == true %}
      {{'ON'}}
    {% else %}
      {{'OFF'}}
    {% endif %}

# Датчик протечки №1 (уровень заряда) SJCGQ11LM
- platform: mqtt
  name: bathroom_leak_1_battery
  icon: mdi:battery-high
  unit_of_measurement: "%"
  availability_topic: "ZigBeeCA20/bridge/state"
  state_topic: "ZigBeeCA20/bathroom_leak_1"
  value_template: "{{ value_json.battery }}"
  ````
  {% endraw %}
### Датчик температуры/влажности (круглый сяоми, обычный sensor) WSDCGQ01LM
{% raw %}
````
- platform: mqtt # Температура
  name: bathroom_temperature
  icon: mdi:thermometer
  unit_of_measurement: "°C"
  availability_topic: "ZigBeeCA20/bridge/state"
  state_topic: "ZigBeeCA20/bathroom_sensor"
  value_template: "{{ value_json.temperature | round(2) }}"
- platform: mqtt # Влажность
  name: bathroom_humidity
  icon: mdi:water-percent
  unit_of_measurement: "%"
  availability_topic: "ZigBeeCA20/bridge/state"
  state_topic: "ZigBeeCA20/bathroom_sensor"
  value_template: "{{ value_json.humidity | round(2) }}"
- platform: mqtt # Уровень заряда
  name: bathroom_sensor_battery
  icon: mdi:battery-high
  unit_of_measurement: "%"
  availability_topic: "ZigBeeCA20/bridge/state"
  state_topic: "ZigBeeCA20/bathroom_sensor"
  ````
  {% endraw %}
  
### Квадратный датчик с  давлением (в дополнение к предыдущему) WSDCGQ11LM:
{% raw %}
```
- platform: mqtt # Давление
  name: loggia_pressure
  icon: mdi:gauge
  unit_of_measurement: "мм рт.ст."
  availability_topic: "ZigBeeCA20/bridge/state"
  state_topic: "ZigBeeCA20/loggia_sensor"
  value_template: "{{ (value_json.pressure | float * 7.501) | round | int }}"
 ```
 {% endraw %}
### Квадратная кнопка сяоми (binary_sensor) WXKG11LM
{% raw %}
```
- platform: mqtt
  name: bathroom_button
  availability_topic: "ZigBeeCA20/bridge/state"
  state_topic: "ZigBeeCA20/bathroom_button"
  value_template: >-
    {% if value_json.click == '' %}
      {{'OFF'}}
    {% else %}
      {{'ON'}}
    {% endif %}
  expire_after: 5
 ```
 {% endraw %}
Замечание по кнопке - так как это именно кнопка, а не переключатель, то binary_sensor меняет свое состояние на очень короткий срок. Для работы с ним можно использовать автоматизацию типа этой (в данном случае при нажатии включается/отключается вентилятор):
 
 
 
### Подсветка шлюза (light)

{% raw %}
```
- platform: mqtt
  name: gateway
  availability_topic: "ZigBeeCA20/bridge/state"
  command_topic: "ZigBeeCA20/led"
  rgb_command_topic: "ZigBeeCA20/led"
  rgb_command_template: >-
    {
      "mode": "manual",
      "hex": "#{{ '%02x%02x%02x' | format(red, green, blue) }}"
    }
  on_command_type: "brightness"
  payload_off: '{"mode": "off"}'
``` 
{% endraw %}
### Статус шлюза с аттрибутами (binary_sensor)

{% raw %}
```
- platform: mqtt
  name: sls_state
  unique_id: cee1d05d-205a-4334-b257-723540c5d578
  state_topic: "ZigBeeGW/bridge/state"
  device_class: connectivity
  payload_on: online
  payload_off: offline      
  json_attributes_topic: "ZigBeeGW/bridge/config"
  j  son_attributes_template: "{{ value_json | tojson }}"
```
{% endraw %}
### Режим сопряжения ZigBee/Bluetooth шлюза (switch)

{% raw %}
```
- platform: mqtt
  name: gateway_join
  availability_topic: "ZigBeeCA20/bridge/state"
  state_topic: "ZigBeeCA20/bridge/config"
  value_template: "{{ value_json.permit_join }}"
  state_on: true
  state_off: false
  command_topic: "ZigBeeCA20/bridge/config/permit_join"
  payload_on: "true"
  payload_off: "false"
```  
{% endraw %}
### Время работы шлюза (sensor)
{% raw %}
```
- platform: mqtt
  name: gateway_uptime
  icon: mdi:timeline-clock
  unit_of_measurement: "%"
  availability_topic: "ZigBeeCA20/bridge/state"
  state_topic: "ZigBeeCA20/bridge/config"
  value_template: "{{ value_json.UptimeStr }}"
```  
{% endraw %}

![permit](/img/permit.png)






### Двухканальное реле сяоми switch LLKZMK11LM

{% raw %}
```
### бойлер
- platform: mqtt
  name: gas_boiler
  availability_topic: "ZigBeeCA20/bridge/state"
  state_topic: "ZigBeeCA20/gas_heating"
  value_template: "{{ value_json.state_l1 }}"
  command_topic: "ZigBeeCA20/gas_heating/set/state_l1"
  

### Насос теплого пола switch

- platform: mqtt
  name: warm_floor
  availability_topic: "ZigBeeCA20/bridge/state"
  state_topic: "ZigBeeCA20/gas_heating"
  value_template: "{{ value_json.state_l2 }}"
  command_topic: "ZigBeeCA20/gas_heating/set/state_l2"
 ```
 {% endraw %}
 
соответственно везде name и адреса топиков поменять на свои


### Включение/отключение вентиляции по нажатии на кнопку

{% raw %}
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
{% endraw %}

###  Aqara LED Light Bulb Tunable White Model ZNLDP12LM

{% raw %}
```
- platform: mqtt
    name: GardenBulbLeft
    state_topic: "ZigBeeCA20/GardenBulbLeft"
    availability_topic: "ZigBeeCA20/bridge/state"
    brightness: true
    color_temp: true
    schema: json
    command_topic: "ZigBeeCA20/GardenBulbLeft/set"

  - platform: mqtt
    name: GardenBulbRight
    state_topic: "ZigBeeCA20/GardenBulbRight"
    availability_topic: "ZigBeeCA20/bridge/state"
    brightness: true
    color_temp: true
    schema: json
    command_topic: "ZigBeeCA20/GardenBulbRight/set”
```
{% endraw %}

### Датчик движения/освещенности Xiaomi RTCGQ11LM 

{% raw %}
```
#Сенсор Движение Коридор
  - platform: mqtt
    name: "Motion koridor battery"
    state_topic: "ZigBeeCA20/Sensor_Motion_Koridor"
    unit_of_measurement: '%'
    value_template: "{{ value_json.battery }}"
  - platform: mqtt
    name: "Motion koridor linkquality"
    state_topic: "ZigBeeCA20/Sensor_Motion_Koridor"
    value_template: "{{ value_json.linkquality }}"
  - platform: mqtt
    name: "Motion koridor dvigenie"
    state_topic: "ZigBeeCA20/Sensor_Motion_Koridor"
    value_template: "{{ value_json.occupancy }}"
    expire_after: 10
  - platform: mqtt
    name: "Motion koridor yarkost"
    state_topic: "ZigBeeCA20/Sensor_Motion_Koridor"
    value_template: "{{ value_json.illuminance }}"
    unit_of_measurement: 'lux'
```
{% endraw %}

### Датчик открытия окна Xiaomi MCCGQ01LM

{% raw %}
```
#Сенсор Дверь Улица
  - platform: mqtt
    name: "Door Uliza battery"
    state_topic: "ZigBeeCA20/Sensor_Door_Uliza"
    unit_of_measurement: '%'
    value_template: "{{ value_json.battery }}"
  - platform: mqtt
    name: "Door Uliza linkquality"
    state_topic: "ZigBeeCA20/Sensor_Door_Uliza"
    value_template: "{{ value_json.linkquality }}"
  - platform: mqtt
    name: "Door Uliza"
    state_topic: "ZigBeeCA20/Sensor_Door_Uliza"
    value_template: "{{ value_json.contact }}"
```
{% endraw %}


### Cкрипт переводит статус датчиков на off через требуемый таймаут.
Создаете файл 

{% raw %}
```
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
            continue            # already handled
        elif item == 'state':
            inputState = newAttribute
        else:
            inputAttributesObject[item] = newAttribute
        
    hass.states.set(inputEntity, inputState, inputAttributesObject)
```
{% endraw %}

В  automations.yaml необходимо прописать следующий код
{% raw %}
```
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
{% endraw %}
     


*PS: раздел в разработке.*
