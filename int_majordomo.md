# Описание 

Модуль для интеграции устройств Zigbee или BLE для систем автоматизации на базе   [MAJORDOMO](https://mjdm.ru/). Для интеграции могут быть использованы программный  продукт  [zigbee2mqtt](https://www.zigbee2mqtt.io) совместно с разлиными вариантами zigbee-догнлов, либо  готовый апаратный  шлюз Smart Logic System (SLS) Zigbee BLE gateway. Модуль  позволяет одновременно работать с неограниченным количеством шлюзов или приложений zigbee2mqtt, представляя собой  клиента mqtt и  готовый набор базы данных  поддерживаемых устройств. Использование модуля избавляет пользователя от необходимости прописывания и запоминания  метрик устройств. 


# Общие сведения

Для корректной работы с MajorDoMo необходимо через маркет дополнений установить  модуль [zigbee2mqtt](https://connect.smartliving.ru/tasks/355.html).

После установки, нео


Ссылка на интересный тематический канал в телеграм: https://t.me/zigbeer
Ссылка на репозиторий модуля zigbee2mqtt: http://github.com/directman66/majordomo-zigbee2mqtt/
Топики для управления устройствами через mqtt   https://www.zigbee2mqtt.io/integration/home_assistant.html
Топики для управления  шлюзом через mqtt https://www.zigbee2mqtt.io/information/mqtt_topics_and_message_structure.html#zigbee2mqttbridgelog


Драйвера для smartRF04EB начинаются на swrc* есть в репозитории Кирова Ильи https://github.com/kirovilya/files
Огромная благодарность  Илье @goofyk за помощь в освоении материала )

Последние версии прошивок можно взять тут https://github.com/Koenkk/Z-Stack-firmware/tree/dev/coordinator/

Обсуждение умных ламп http://majordomo.smartliving.ru/forum/viewtopic.php?f=8&t=6016&p=95733#p95733

# Более подробная информация содержится на форуме  https://mjdm.ru/forum/viewtopic.php?f=5&t=6011 
