# MQTT

Шлюз умеет подключаться к MQTT-брокеру как клиент, получать и отправлять данные в топики.

## Работа с MQTT из скриптов

### mqtt.prefix()

Получает или задает системный префикс, настроенный в меню `Settings -> Link -> MQTT Setup`, поле `System prefix topic`

```lua
mqtt.prefix([topic])
-- topic - STR, System prefix topic
--
-- Получить префикс
local mqtt_prifix = mqtt.prefix()
-- Задать префикс
mqtt.prefix("newTopic")
```

### mqtt.connected()

Возвращает статус подключение к брокеру MQTT. Выполняется без параметров.

### mqtt.pub()

Публикует на MQTT сервер в топик _topic_ значение _payload_.

```lua
mqtt.pub(topic, payload)
```

Пример управления реле на прошивке Tasmota - `cmnd/имя устройства/имя реле`

```lua
mqtt.pub('cmnd/sonoff5/power', 'toggle')
```

### mqtt.sub()

Подписывается на топик и помещает полученные значения в объект. Можно вызывать повторно с другим именем объекта, для его изменения.

```lua
mqtt.sub(topic, objName[, objType])
-- topic - STR, топик MQTT
-- objName - STR, объект, в который записываются данные
-- objType - STR, тип значения объекта
```

Пример подписки на топик с температурой, которую шлюз помещает в объект:

```lua
mqtt.sub('dev/sensor/temp', 'room_temp')
```

с указанием типа объекта:

```lua
mqtt.sub('dev/sensor/temp', 'room_temp', 'INT')
```

### mqtt.unSub()

Отписывается от топика.

```lua
mqtt.unSub(topic)
```

Пример отписки от топика с температурой

```lua
mqtt.unSub('dev/sensor/temp')
```
