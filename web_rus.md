# Web-интерфейс
Web интерфейс необходим для первоначальной конфигурации шлюза, просмотра лога, добавления новых устройств и др.

## Home
На странице `Home` показаны основные статусы контроллера

![Main menu - Home](/img/slshome.png)

## Zigbee
Доступные пункты меню

![zigbee](/img/main_menu-zigbee.png)
1. `Devices` - [Страница со списком сопряженных устройств.](#Devices)
1. `Join` - [Запуск режима спаривания устройств в течение 255 секунд.](#Join)
1. `Map` - [Карта Zigbee сети.](#Map)
1. `Groups` - [Cоздание, редактирование, удаление групп.](#Groups)
1. `Config` - [Настройка Zigbee модуля.](#Config)
1. `Reset to Default` - [Сброс настроек в состояние "По умолчанию".](#Reset-to-Default)

### Devices
Страница со списком сопряженных устройств (`Zigbee -> Devices`)

![Main menu - Zigbee](/img/slszigbee.png)

`nwkAddr` – Адрес устройства в сети. Координатор всегда имеет адрес 0x0000. 

`FriendlyName` - Дружественное имя устройства в сети. 

`ieeeAddr` – Физический адрес устройства в сети. 

`ManufName` – Наименование производителя. 

`ModelId` – Условное обозначение модели устройства. 

`Link` – Оценка качества связи. 

`Interview` – Процесс получения исходных данных от устройства при первой привязке устройства к шлюзу. 

`LastSeen` – Время, которое прошло с момента последнего сообщения от устройства. 

`Routes` – Адрес устройства, являющегося маршрутизатором. 

`PS` – Заряд батареи в %, при условии, что устройство питается от батареи. Если устройство питается от сети, то отображается значок ![PowerSource - Plug](/img/power_source-plug.png) 

`Actions` - управление устройствами. Удалить устройство, задать имя

### Join
Запуск режима спаривания устройств в течение 255 секунд. (`Zigbee -> Join`)

![Main menu - Join](/img/zigbee-join.png)

### Map
![Main menu - Map](/img/map.png)

### Groups

### Config
Страница настроек zigbee (`Zigbee -> Config`)

![Main menu - Config](/img/zigbee-config.png)

1. `Channel` - Выбор номера частотного канала, на котором будет работать сеть Zigbee (Значение по умолчанию - `11`)
2. `PanId` - Настройка идентификатора сети Zegbee (Personal area network ID - PAN ID)
3. `MQTT messages options` - Возможность выбора формата передаваемых данных MQTT

#### MQTT messages options

- MQTT Send Raw Command
  - Все атрибуты отправляются в сыром виде
```bash
ZigbeeSLS/0xA4C138E143F426BA//2/MS_TEMPERATURE_MEASUREMENT/REPORT {"raw":"0000297E09","0000":{"type":41,"raw":"7E09","value":2430,"len":2},"trSeqNum":53,"linkquality":43}
```
- MQTT Send parsed JSON (Default)
  - Все атрибуты отправляются одним пакетом в формате JSON
```bash
ZigbeeSLS/0xA4C138E143F426BA {"alarm_humidity":"off","alarm_humidity_max":90,"alarm_humidity_min":30,"alarm_temperature":"off","alarm_temperature_max":40,"alarm_temperature_min":10,"battery":30,"humidity":48.8,"last_seen":1700015809,"linkquality":43,"temperature":24.8,"voltage":2.8,"friendly_name":"dht_bedroom","model_name":"TS0201"}
  ```
- MQTT Send parsed Attributes
  - Каждый атрибут в отдельном пакете:
```bash
  ZigbeeSLS/0xA4C138E143F426BA/alarm_humidity off
ZigbeeSLS/0xA4C138E143F426BA/alarm_humidity_max 90
ZigbeeSLS/0xA4C138E143F426BA/alarm_humidity_min 30
ZigbeeSLS/0xA4C138E143F426BA/alarm_temperature off
ZigbeeSLS/0xA4C138E143F426BA/alarm_temperature_max 40
ZigbeeSLS/0xA4C138E143F426BA/alarm_temperature_min 10
ZigbeeSLS/0xA4C138E143F426BA/battery 30
ZigbeeSLS/0xA4C138E143F426BA/humidity 44.6
ZigbeeSLS/0xA4C138E143F426BA/last_seen 1700016518
ZigbeeSLS/0xA4C138E143F426BA/linkquality 43
ZigbeeSLS/0xA4C138E143F426BA/temperature 24.50
ZigbeeSLS/0xA4C138E143F426BA/voltage 2.8
ZigbeeSLS/0xA4C138E143F426BA/friendly_name dht_bedroom
ZigbeeSLS/0xA4C138E143F426BA/model_name TS0201
 ```
- Use FriendlyName (for MQTT Topic & HA Entity ID)
  - Если указано, то топики именуются `friendly_name`: `ZigbeeSLS/dht_bedroom`
  - Иначе топики именуются `ieeeAddr`: `ZigbeeSLS/0xA4C138E143F426BA`
- Send Cache States (Default)
  - Отправка данных из кэша SLS
- Clear States
  - Очистка состояния при отправке. Требуется для правильной работы некоторых автоматизаций. Например, кнопка с несколькими значениями состояния `action`: если данная опция выключена и кнопка шлет одно состояние `single` то автоматизация, которая контролирует его изменение работать не будет.
- Add options states to payload
  - отправка дополнительных состояний
  - выкл:
    ```bash
    ZigbeeSLS/0xA4C138AAA29895A8 {"current":0,"energy":0,"linkquality":123,"power":0,"state":"ON","test":"0","voltage":225}
    ```
  - вкл:
    ```bash
    ZigbeeSLS/0xA4C138AAA29895A8 {"backlight_mode":"OFF","child_lock":false,"current":0,"energy":0,"last_seen":1700015792,"linkquality":123,"power":0,"power_on_behavior":"OFF","state":"ON","test":"0","voltage":231,"friendly_name":"pig_slow-cooker","model_name":"TS011F"}
    ```

- Add transaction number to payload
  - отправка `trSeqNum`: номер транзакции
- Add model name to json payload
  - отправка `model_name`: `ModelId` на вкладке `Info` устройства
- Add last seen to json payload
  - отправка `last_seen`: unixtime последнего появления устройства в сети

### Reset to Default
Сброс к "заводским настройкам"

![Main menu - Reset to Default](/img/zigbee-reset.png)

## Log
На странице log можно посмотреть последние сообщения системы.

![Main menu - Log](/img/slslog2.png)

## Settings
Доступные пункты меню

![Main menu - Settings](/img/main_menu-settings.png)
1. `WiFi` - [Настройка параметров сети WiFi.](#WiFi)
1. `Time` - [Настройка часов шлюза.](#Time)
1. `Link` - [Настройка подключения к внешним сервисам.](#Link)
1. `Serial` - 
1. `Services` - [Настройка сервисов шлюза.](#Services)
1. `Hardware` - [Настройка аппаратной части шлюза.](#Hardware)

### Wifi
На данной странице можно параметры сети WiFi:

![Main menu - Settings - WiFi](/img/slswifi.png)

### Time
На данной странице можно настроить часовой пояс и сервер синхронизации времени.

![Main menu - Settings - Time](/img/slstime.png)

### Link
Настройки сервера MQTT, NativeApi и RestApi.

![Main menu - Settings - Link](/img/slssetuplink.png)

Настройка подключения к MQTT брокеру

![Main menu - Settings - MQTT Setup](/img/slssetupmqtt.png)

Настройка подключения к серверу Native API

![Main menu - Settings - Native API Setup](/img/slssetupnapive.png)

### Serial

### Services
Настройка сервисов шлюза

![Main menu - Settings - Services](/img/settings-services.png)

### Hardware
Настройки аппаратной части шлюза.

![Main menu - Settings - Hardware](/img/settings-hardware.png)
1. Выбор типа модуля Zigbee: TI или NXP
1. Указание номера GPIO модуля ESP32 RX 
1. Указание номера GPIO модуля ESP32 TX
1. Настройка аппаратной кнопки. (**ВНИМАНИЕ!** Если кнопка притянута к земле, а при нажатии на нее на вход ESP32 подается 3.3В, то обязательно нужно ставить галку `PullUp`.)
1. Настройка адрессных светодиодов
1. Красный светодиод. (зажигается, когда приходит сообщение от конечного zigbee устройства)
1. Зеленый светодиод. (зажигается, когда активен режим [Join](#Join))
1. Синий светодиод.
1. Настройка I2C SDA (линия данных)
1. Настройка I2C SCL (линия синхронизации)

### Help
![Main menu - Help](/img/main_menu-help.png)

## Actions
![Main menu - Actions](/img/main_menu-actions.png)
1. `Files` - [Доступ к файловой системе и редактору скриптов](#Files)
1. `Backup` - [Создание резервных копий настроек](#Backup)
1. `Update Firmware` - [Обновление прошивки](#Update-Firmware)
1. `Save` - [Запись текущего состояния](#Save)
1. `Reboot System` - [Перезагрузка шлюза](#Reboot-System)

### Files

### Backup 

### Update Firmware
Обновление прошивки шлюза по ОТА.

![update](/img/slsupdate.png)

### Save

### Reboot System
Reboot – перезагрузка шлюза.

