## Описание HTTP API команд

Взаимодействовать с шлюзом можно с помощью HTTP API комманд. Поддерживаются GET и POST сообщения. 

Ниже указаны примеры доступных комманд:

``` /api/zigbee/devices ```
Получает список устройств сети zigbee.

``` /api/zigbee/remove?dev=XXX``` - Запрос устройству XXX покинуть сеть Zigbee

``` /api/zigbee/remove?dev=XXX&force=true``` - Запрос устройству XXX покинуть сеть Zigbee и безусловное удаление

``` /api/zigbee/rename?old=XXX&new=YYY```  Переименование  устройства в сети zigbee

```/api/zigbee/join?duration=255&target=XXX```   Управление режимом сопряжения duration 0 для выключения, значения больше 0 указывают период ожидания в секундах,  target разрешает сопряжение на конктетном роутере.  все параметры не обязательны



``` /api/zigbee?dev=0xABCD&action=setInterview&state=0 ``` - Запуск интервью на устройстве.


``` /api/wifi?action=scanNetworks ``` - показывает список доступных  сетей WiFi.

#### States

```/api/zigbee?dev=0x2855&action=getStateValue&name=brightness``` - Возвращает текущее значение состояния из кэша

```/api/zigbee?dev=0x2855&action=getState&name=brightness``` - Отправить устройству команду чтения состояния

```/api/zigbee?dev=0x2855&action=setState&name=state&value=ON``` - Установка состояния state, равным ON для устройства с адресом 0x2855.  Кроме того, адрес  может быть в формате IEEE, либо FriendlyName. Для state может принимать значения on, off, toggle. command может быть open, close, stop и др. в зависимости от типа устройства.

```/api/zigbee?dev=0x1841&action=setSimpleBind&state=click&value=test.lua``` - привязывает запуск скрипта test.lua параметре state, равном click на устройстве с адресом 0x1841. Адрес может быть в формате IEEE, либо FriendlyName.

#### Logs

```/api/log?action=X``` Управление режимом логирования, где X  может принимать следующие значения:

```
action=getBuffer

action=setLevel&value=1  

action=getLevel

```

#### Audio

/api/audio?action=playurl&url=xxx

/api/audio?action=geturl

/api/audio?action=stop

/api/audio?action=setvolume&value=xxx

/api/audio?action=getvolume

/api/audio?action=getstatus


#### Touchlink

```/api/zigbee/touchlink``` - список устройств рядом

```/api/zigbee/touchlink?action=scan``` - запуск сканирования

```/api/zigbee/touchlink?action=identify&dev=0x00158D00011D8CB1``` - Идентификация устройства 0x00158D00011D8CB1

```/api/zigbee/touchlink?action=reset&dev=0x00158D00011D8CB1``` - Сброс устройства 0x00158D00011D8CB1

#### Scripts
```/api/scripts?action=evalFile&path=/test.lua``` - запуск скрипта test.lua через http.

Также вовзможны варианты: 
```
GET http://172.16.1.16/api/files?path=/test.lua
POST http://172.16.1.16/api/files?path=/test.lua
DELETE http://172.16.1.16/api/files?path=/test.lua
```
