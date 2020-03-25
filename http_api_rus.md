## Описание HTTP API команд

/api/zigbee/devices - список устройств сети zigbee 
/api/zigbee/remove?dev=XXX - удаление устройства из  сети zigbee
/api/zigbee/rename?old=XXX&new=YYY - переименование  устройства в сети zigbee
/api/zigbee/join?duration=255&target=XXX  - Управление режимом сопряжения duration 0 для выключения, значения больше 0 указывают период ожидания в секундах,  target разрешает сопряжение на конктетном роутере.  все параметры не обязательны
