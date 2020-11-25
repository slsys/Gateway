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
Запуск режима спаривания устройств в течение 255 секунд.

![Main menu - Join](/img/zigbee-join.png)

### Map

### Groups

### Config
Страница настроек zigbee

Меню `Zigbee -> Config`

![Main menu - Config](/img/zigbee-config.png)

1. `Channel` - Выбор номера частотного канала, на котором будет работать сеть Zigbee (Значение по умолчанию - 11)
1. `PanId` - 
1. `MQTT messages options` - Возможность выбора формата передаваемых данных MQTT.

### Reset to Default
Сброс к "заводским настройкам"

![Main menu - Reset to Default](/img/zigbee-reset.png)

## Log
На странице log можно посмотреть последние сообщения системы.

![Main menu - Log](/img/slslog2.png)

## Settings
![Main menu - Settings](/img/main_menu-settings.png)

### Wifi
На данной странице можно параметры сети Wi-Fi:

![Main menu - Settings - WiFi](/img/slswifi.png)

### Time
На данной странице можно настроить часовой пояс и сервер синхронизации времени.

![Main menu - Settings - Time](/img/slstime.png)

### Link
Настройки сервера MQTT,NativeApi и  RestApi.

![Main menu - Settings - Link](/img/slssetuplink.png)

Настройка подключения к MQTT брокеру

![Main menu - Settings - MQTT Setup](/img/slssetupmqtt.png)

Настройка подключения к серверу Native API

![Main menu - Settings - Native API Setup](/img/slssetupnapive.png)

### Serial

### Hardware
Настройки аппаратной части шлюза.

1) В данном меню можно выбрать тип модуля Zigbee TI или NXP, а также указать номера GPIO модуля ESP32 (RX, TX)

2) Аппаратной кнопки. (если кнопка притянута к земле, а при нажатии на нее на вход ESP32 подается 3.3В, то обязательно нужно ставить галку PullUp.

3) Красный светодиод. (зажигается, когда приходит сообщение от конечного zigbee устройства)

4) Зеленый светодиод. (зажигается, когда активен режим Join)

5) Синий светодиод.

![Main menu - Settings - Hardware](/img/slssetuphw.png)

### Help
![Main menu - Help](/img/main_menu-help.png)

## Actions
![Main menu - Actions](/img/main_menu-actions.png)

### Files

### Backup 

### Update Firmware
Обновление прошивки шлюза по ОТА.

![update](/img/slsupdate.png)

### Save

### Reboot System
Reboot – перезагрузка шлюза.

