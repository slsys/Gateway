[Go to the english version of the site](/readme.md)

# Zigbee шлюз

Шлюз  предназначен для работы с  устройствами ZigBee.  В основе  лежит контроллер [ESP32 от Espressif](https://www.espressif.com/sites/default/files/documentation/esp32-wrover_datasheet_en.pdf). В качестве связущего звена протокола Zigbee  выступает тандем чипов от Texas Instruments [ZIgbee CC2538](https://www.ti.com/product/CC2538?utm_source=google&utm_medium=cpc&utm_campaign=epd-null-null-GPN_EN-cpc-pf-google-wwe&utm_content=CC2538&ds_k=%7b_dssearchterm%7d&DCM=yes&gclid=CjwKCAiA35rxBRAWEiwADqB37x__0Gm1rR2TUfCBETyuqrLjOtof6TuYSD3ZHzINYdNAbrXqfDxrwRoCpToQAvD_BwE&gclsrc=aw.ds) и  усилителя  [сс2592](https://www.ti.com/product/CC2592?utm_source=google&utm_medium=cpc&utm_campaign=epd-null-null-GPN_EN-cpc-pf-google-wwe&utm_content=CC2592&ds_k=%7b_dssearchterm%7d&DCM=yes&gclid=CjwKCAiA35rxBRAWEiwADqB3776CVlMD1GHdk-unOn9R0YeMtlwAnjUv-CIPuWvjhNqZRbiq6zy-ExoCxjYQAvD_BwE&gclsrc=aw.ds).



# Общие сведения
Шлюз выполняет роль координатора Zigbee и позволяет:

1) Использовать большинство доступного Zigbee оборудования. Список поддерживаемого и протестированного обрудования доступен по [ссылке](https://slsys.io/action/devicelists.html). Новое оборудование может быть добавлено после обсуждения с нами.

2) Отказаться от необходимости использования облаков производителей устройств. В качестве альтернативы, предлагается использовать облачный сервис [Smart Logic System](https://cloud.slsys.io), либо нативные приложения для Android и Apple iPhone (в разработке). 

3) Использовать распространенные  локальные системы автоматизации, такие как [MajorDomo](https://mjdm.ru/), [ioBroker Smarthome](https://www.iobroker.net), [HomeAssisiant](https://www.home-assistant.io), [Node-Red](https://nodered.org) и др. Для интеграции с этими системами используется протокол MQTT. Структура топиков протокола MQTT идентична  проекту  [zigbee2mqtt](https://www.zigbee2mqtt.io), поэтому для использования и интеграции шлюза нет необходимости изучать скриптовые языки указанных выше систем, так как протокол в основном уже доступен с помощью  модулей расширения.


# Дополнительные возможности шлюза через Web интерфейс
1. Управление и просмотр сведений  устройств через Web интерфейс шлюза по адресу http://ipadress (80 порт). Возможность отображения источника питания, уровня заряда батареи, доступных [EndPoint устройств](https://community.nxp.com/thread/332332)  в web-интерфейсе.

2. Создание локальных автоматизаций внутри шлюза [SimpleBind](/simplebind_rus.md).

3. Возможность написания сценариев на языке [Lua](https://ru.wikipedia.org/wiki/Lua) [Книга по Lua на русском языке](https://www.htbook.ru/kompjutery_i_seti/programmirovanie/programmirovanie-na-yazyke-lua).

4.	Возможность создания групп для управления несколькими устройствами одновременно (в разработке).

5.	Возможность задавать имя устройству. Если вы планируете использовать  шлюз с локальными системами автоматизации, рекомендуется установить галочку отправки адреса вместо устройств.

5.	Возможность удаления устройства. 

6.	Возможность отображения маршрутов в web-интерфейсе (в разработке).

8.	Возможность установить прямые связи [Bind](/bind_rus.md) между устройствами ZigBee без участия координатора для управления конечными устройствами.

9.	Возможность управлять аппаратными [светодиодами (адресными или RGB)](/faq_rus.md). 

10.	Возможность управлять звуком (при наличии распаянного усилителя) (в разработке)

11.	Возможность изменить PanId и номер канала.

12.	Возможность задать имя шлюза в сети.

13.	Возможность перехода шлюза в режим АР при нажатии аппаратной кнопки в течение 2-5 секунд после подачи питания.



# Аппаратная часть
Устройство можно [собрать самостоятельно](https://modkam.ru/?p=1342), или приобрести на сайте [Smart Logic System](slsys.io)

![home](/img/Mi_Gateway_Shield12.jpg)



# Прошивка устройства
[Постоянная ссылка на прошивку устроуства](https://github.com/slsys/Gateway/tree/master/rom)

[История изменений прошивки](/rom/history_ru.txt)

[Подробная инструкция по перепрошивке](flashing_rus.md)

[Прошивка для использования шлюза как WiFi-моста](https://github.com/slsys/Gateway/tree/master/rom/2020.08.05d1-bridge.bin) (позволяет подключить координатор по WiFi к программному шлюзу zigbee2mqtt / ioBroker.Zigbee и др. порт 8881)



# Полезные ссылки:


## [Первый запуск](/firststart_rus.md)

## [Web-интерфейс](/web_rus.md)


## [SimpleBind](/simplebind_rus.md)

## [Touchlink](/touchlink_rus.md)

## [Binding](/bind_rus.md)

## [Сохранение/восстановление настроек шлюза](/backup_rus.md)

## [Поддержка Lua-скриптов](/lua_rus.md)

## [Описание HTTP API комманд](/http_api_rus.md)

## [Карта сети  zigbee](/map_rus.md)

## [FAQ (часто задаваемые вопросы)](/faq_rus.md)

## [Структура сообщений zigbee2mqtt](https://www.zigbee2mqtt.io/information/mqtt_topics_and_message_structure.html) (поддерживается большинство комманд)

## [Структура сообщений SLS zigbee2mqtt](/slscommand_rus.md)

## [Список поддерживаемых устройств](https://slsys.io/action/devicelists.html)

## [Сбор средств на покупку оборудования для добавления поддержки](/donate_rus.md)

## [Создание своей страницы устройств](/ui_rus.md)

# Интеграции

Благодаря использованию протокола MQTT, шлюз SLS ZG может быть интегрирован с любой локальной или облачной  системой автоматизации. Структура топиков почти полностью повторяет [zigbee2mqtt](https://www.zigbee2mqtt.io/information/mqtt_topics_and_message_structure.html). Для удобства  использования ко многим системам были  разработаны дополнительные драйверы или модули  интеграции.


## [Интеграция с Majordomo](/int_majordomo_rus.md)

## [Интеграция с HomeAssistant](/int_has_rus.md) 

## [Интеграция с Node-Red](/int_nodered_rus.md)   (в разработке)

## [Интеграция с IObroker](/int_iob_rus.md)  (в разработке)

## [Интеграция с Алисой Яндекс](/int_yandex_rus.md)  (в разработке)

## [Интеграция с Google Home](/int_google_rus.md)  (в разработке)

## [Интеграция с HomeKit](/int_homekit_rus.md)  (в разработке)

## [Интеграция с Domoticz](/int_domoticz_rus.md)  (в разработке)

# Полезные ссылки
[Официальный чат проекта](https://t.me/slsys)

[Группа новостей и новых версий прошивок](https://t.me/slssys)

[Список поддерживаемых устройств](https://slsys.io/action/devicelists.html)

[Как собрать шлюз самому](https://modkam.ru/?p=1342)

[Где приобрести](https://t.me/zigberu)

[Партнерский чат для обсуждения устройств Zigbee](https://t.me/zigbeer)

[Русский Wiki на портале myzigbee.ru](https://myzigbee.ru/)


