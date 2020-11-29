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
1. `PanId` - Настройка идентификатора сети Zegbee (Personal area network ID - PAN ID)
1. `MQTT messages options` - Возможность выбора формата передаваемых данных MQTT.

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

![Main menu - Settings - Hardware](/img/slssetuphw.png)
1. Выбор типа модуля Zigbee: TI или NXP
1. Указание номера GPIO модуля ESP32 RX 
1. Указание номера GPIO модуля ESP32 TX
1. Настройка аппаратной кнопки. (**ВНИМАНИЕ!** Если кнопка притянута к земле, а при нажатии на нее на вход ESP32 подается 3.3В, то обязательно нужно ставить галку `PullUp`.)
1. Красный светодиод. (зажигается, когда приходит сообщение от конечного zigbee устройства)
1. Зеленый светодиод. (зажигается, когда активен режим [Join](#Join))
1. Синий светодиод.

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

