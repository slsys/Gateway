# Структура дополнительных сообщений шлюза SLS Zigbee Gateway

Данные представлены в формате **топик {полезная нагрузка}**

## Перезагрузка

```
ZigBeeXXXX/reboot {}
```

## Управление подстветкой шлюза

```
ZigBeeXXXX/led {“mode”:”manual”,”hex”:”#FFFFFF”}
```

## Переименование датчика

```
ZigBeeXXXX/bridge/config/rename {"old": "0x00158D0001", "new": "water3"}
```
