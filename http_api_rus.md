## Описание HTTP API команд

Взаимодействовать с шлюзом можно с помощью HTTP API комманд. Поддерживаются GET и POST сообщения. 

Ниже указаны примеры доступных комманд:

```/api/zigbee/devices```
Получает список устройств сети zigbee.

```/api/zigbee/remove?dev=XXX``` - Удаление устройства XXX из  сети zigbee

```/api/zigbee/rename?old=XXX&new=YYY```  Переименование  устройства в сети zigbee

```/api/zigbee/join?duration=255&target=XXX```   Управление режимом сопряжения duration 0 для выключения, значения больше 0 указывают период ожидания в секундах,  target разрешает сопряжение на конктетном роутере.  все параметры не обязательны


```/api/log?action=X``` Управление режимом логирования, где X  может принимать следующие значения:

```
action=setLevel&value=1  

action=getBuffer

action=getLevel

```

```/api/zigbee?dev=0x1841&action=setSimpleBind&state=click&value=test.lua``` - привязывает запуск скрипта test.lua параметре state, равном click на устройстве с адресом 0x1841. Адрес может быть в формате IEEE, либо FriendlyName.

```/api/zigbee?dev=0x2855&action=setState&state=state&value=ON``` - Устанока состояния state, равным ON для устройства с адресом 0x2855.  Адрес может быть в формате IEEE, либо FriendlyName.

```/api/zigbee?dev=0xABCD&action=setInterview&state=0``` - Запуск интервью на устройстве.
