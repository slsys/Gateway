# Описание HTTP API

## Введение

Взаимодействовать со шлюзом можно с помощью HTTP API команд. Поддерживаются `GET` и `POST` сообщения. В большинстве случаев команды возвращают JSON объект с результатом запроса и его статусом.

## Безопасность

В целях безопасности в меню `Settings -> Users` можно ограничить доступ к API токеном. В таком случае для доступа необходимо передавать параметр:

`&token=e9d38bed.......f4ef49476a2ed9575`

## Доступные команды HTTP API

### Zigbee

#### Получить список устройств сети zigbee

```http
GET /api/zigbee/devices
```

#### Запрос устройству XXX покинуть сеть zigbee

```http
GET /api/zigbee/remove?dev=XXX
```

#### Запрос устройству XXX покинуть сеть Zigbee и безусловное удаление

```http
GET /api/zigbee/remove?dev=XXX&force=true
```

#### Переименование  устройства в сети zigbee

```http
GET /api/zigbee/rename?old=XXX&new=YYY
```

#### Управление режимом сопряжения

```http
GET /api/zigbee/join?duration=255&target=XXX
```

- duration: продолжительность режима. Значения больше 0 указывают период ожидания в секундах. Для выключения - 0. Параметр не обязательный.
- target: разрешает сопряжение на конкретном роутере. Параметр не обязательный.

#### Очистка NVRAM

**Внимание! Запускать, только понимая, что вы делаете.**

Процесс занимает несколько минут. Информацию об очистке видно в логе.

```http
GET /api/zigbee/clearnvram
```

#### Запуск интервью на устройстве

```http
GET /api/zigbee?dev=0xABCD&action=setInterview&state=0
```

#### Получить список доступных сетей WiFi

```http
GET /api/wifi?action=scanNetworks
```

#### Получить текущее значение состояния из кэша

```http
GET /api/zigbee?dev=0x2855&action=getStateValue&name=brightness
```

#### Отправить устройству команду чтения состояния

Выполнить команду Get в конвертере

```http
GET /api/zigbee?dev=0x2855&action=getState&name=brightness
```

#### Записать значение состояния

```http
GET /api/zigbee?dev=0x2855&action=setState&name=state&value=ON
```

Установка состояния `state`, равным `ON` для устройства с адресом `nwkAddr = 0x2855`.  

Адрес может быть в формате `IEEE`, либо `FriendlyName`. Например:

- `state` может принимать значения `on`, `off`, `toggle`
- `command` может быть `open`, `close`, `stop` и другие, в зависимости от типа устройства.

#### Настроить правило Simple Bind при изменении состояния

```http
GET /api/zigbee?dev=0x1841&action=setSimpleBind&state=contact&value=test.lua
```

привязывает скрипт `test.lua` на запуск при изменении состояния `contact`, на устройстве с адресом `nwkAddr = 0x1841`. Также поддерживается адрес `IEEE`, либо `FriendlyName`. Также в параметре `value` можно указать драгие доступные правила SB. Подробнее о  [SimpleBind](/simplebind_rus.md)

### Настройка лога

#### Управление режимом логирования

```http
GET /api/messages-history?action=
```

Параметр `action` может принимать следующие значения:

- `action=getBuffer`
- `action=setLevel&value=1`  
- `action=getLevel`

### Управление Аудио

Все команды `GET`

- `/api/audio?action=play&url=xxx` - проигрывание звука из URL
- `/api/audio?action=geturl` - получить текущий URL
- `/api/audio?action=stop` - остановить проигрывание
- `/api/audio?action=setvolume&value=xxx` - установить уровень громкости
- `/api/audio?action=getvolume` - получить текущий уровень громкости
- `/api/audio?action=getstatus` - получить текущий статус

### Touchlink

Все команды `GET`

- `/api/zigbee/touchlink` - получить список устройств рядом
- `/api/zigbee/touchlink?action=scan` - запуск сканирования
- `/api/zigbee/touchlink?action=identify&dev=0x00158D00011D8CB1` - Идентификация устройства `0x00158D00011D8CB1`
- `/api/zigbee/touchlink?action=reset&dev=0x00158D00011D8CB1` - сброс устройства `0x00158D00011D8CB1`

### Скрипты LUA

 Получить список скриптов с назначенными таймерами

```http
GET /api/scripts
```

Запустить скрипт `test.lua`

```http
GET /api/scripts?action=evalFile&path=/test.lua
```

Запустить текст скрипта

```http
GET /api/scripts?action=evalCode&plain=print("ok!")
```

### [Хранилище](https://github.com/slsys/Gateway/blob/master/storage_rus.md#http-api)

### Leds

<!-- TODO - выделить в отдельный док -->

#### Установить цвет светодиода

```http
GET /api/led?red=5&green=5&blue=5&mode=manual
```

Альтернативный вариант управления череp [lua](/lua_rus.md#osled)

### [Объекты](/objects_rus.md)

Получить список объектов

```http
GET /api/obj
```

Установить значение `YYY` объекта `XXX`

```http
POST /api/obj?name=XXX&value=YYY
```

Удалить объект с устройства

```http
DELETE /api/obj?name=obj_name
```

Получить значение объекта `XXX`.

```http
GET /api/obj?name=XXX
```

 Флаги возвращаются в поле `flags: flag_value`:

- `flag_value = 0: ACK=0; MQTT=0`
- `flag_value = 1: ACK=0; MQTT=1`
- `flag_value = 2: ACK=1; MQTT=0`
- `flag_value = 3: ACK=1; MQTT=1`
