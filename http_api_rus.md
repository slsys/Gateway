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
````
