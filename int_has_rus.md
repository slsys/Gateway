![permit](/img/permit.png)






### Двухканальное реле сяоми switch LLKZMK11LM

```
### бойлер
- platform: mqtt
  name: gas_boiler
  availability_topic: "/ZigBeeCA20/bridge/state"
  state_topic: "/ZigBeeCA20/gas_heating"
  value_template: "{{ value_json.state_l1 }}"
  command_topic: "/ZigBeeCA20/gas_heating/set/state_l1"
  

### Насос теплого пола switch

- platform: mqtt
  name: warm_floor
  availability_topic: "/ZigBeeCA20/bridge/state"
  state_topic: "/ZigBeeCA20/gas_heating"
  value_template: "{{ value_json.state_l2 }}"
  command_topic: "/ZigBeeCA20/gas_heating/set/state_l2"
 ```
соответственно везде name и адреса топиков поменять на свои


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

###  Aqara LED Light Bulb Tunable White Model ZNLDP12LM
```
- platform: mqtt
    name: GardenBulbLeft
    state_topic: "/ZigBeeCA20/GardenBulbLeft"
    availability_topic: "/ZigBeeCA20/bridge/state"
    brightness: true
    color_temp: true
    schema: json
    command_topic: "/ZigBeeCA20/GardenBulbLeft/set"

  - platform: mqtt
    name: GardenBulbRight
    state_topic: "/ZigBeeCA20/GardenBulbRight"
    availability_topic: "/ZigBeeCA20/bridge/state"
    brightness: true
    color_temp: true
    schema: json
    command_topic: "/ZigBeeCA20/GardenBulbRight/set”
```

### Датчик движения/освещенности Xiaomi RTCGQ11LM 
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

### Датчик открытия окна Xiaomi MCCGQ01LM
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


### Cкрипт переводит статус датчиков на off через требуемый таймаут.
Создаете файл 
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

В  automations.yaml необходимо прописать следующий код
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


      


*PS: раздел в разработке.*
