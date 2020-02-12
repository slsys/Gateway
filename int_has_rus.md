# Интеграция с Home-Assistant

Шлюз SLS Gateway может быть легко интегрирован с системой домашней автоматизации   [Home Assistant](www.home-assistant.io). Для интеграции могут быть использованы программный  продукт  [zigbee2mqtt](https://www.zigbee2mqtt.io) совместно с разлиными вариантами zigbee-донглов, либо  готовый апаратный  шлюз Smart Logic System (SLS) Zigbee BLE gateway. Модуль  позволяет одновременно работать с неограниченным количеством шлюзов или приложений zigbee2mqtt, представляя собой  клиента mqtt и  готовый набор базы данных  поддерживаемых устройств. Использование модуля избавляет пользователя от необходимости прописывания и запоминания  метрик устройств. 

![home](/img/home.png)


# Подготовительные меропрития

Модуль работает через MQTT. 
Установка mosqutto на raspberry или linux:

[ссылка 1](https://robot-on.ru/articles/ystanovka-mqtt-brokera-mosquitto-raspberry-orange-pi)

[ссылка 2](https://smartideal.net/ustanovka-i-zapusk-mqtt-brokera-mosquitto/)

Mosqutto для windows можно скачать [тут](https://mosquitto.org/download/)


Для корректной работы с MajorDoMo необходимо через маркет дополнений установить  модуль [zigbee2mqtt](https://connect.smartliving.ru/tasks/355.html).
