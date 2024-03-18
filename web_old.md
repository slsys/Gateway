# Web-интерфейс

Web интерфейс необходим для первоначальной конфигурации шлюза, просмотра лога, добавления новых устройств и др.

## Home

На странице `Home` показаны основные статусы контроллера

![Main menu - Home](/img/slshome.png)

## Zigbee

Доступные пункты меню

![zigbee](/img/main_menu-zigbee.png)

- `Devices` - Страница со списком сопряженных устройств.
- `Join` - Запуск режима спаривания устройств в течение 255 секунд.
- `Map` - Карта Zigbee сети.
- `Groups` - Создание, редактирование, удаление групп.
- `Config` - Настройка Zigbee модуля.
- `Reset to Default` - Сброс настроек в состояние "По умолчанию".

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

- `Channel` - Выбор номера частотного канала, на котором будет работать сеть Zigbee (Значение по умолчанию - `11`)
- `PanId` - Настройка идентификатора сети Zigbee (Personal area network ID - PAN ID)
- `MQTT messages options` - Возможность выбора формата передаваемых данных MQTT.

### Reset to Default

Сброс к "заводским настройкам"

![Main menu - Reset to Default](/img/zigbee-reset.png)

## Log

На странице log можно посмотреть последние сообщения системы.

![Main menu - Log](/img/slslog2.png)

## Settings

Доступные пункты меню

![Main menu - Settings](/img/main_menu-settings.png)

- `WiFi` - Настройка параметров сети WiFi.
- `Time` - Настройка часов шлюза.
- `Link` - Настройка подключения к внешним сервисам.
- `Serial` - Настройка последовательного интерфейса
- `Services` - Настройка сервисов шлюза.
- `Hardware` - Настройка аппаратной части шлюза.

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

- Выбор типа модуля Zigbee: TI или NXP
- Указание номера GPIO модуля ESP32 RX 
- Указание номера GPIO модуля ESP32 TX
- Настройка аппаратной кнопки. (**ВНИМАНИЕ!** Если кнопка притянута к земле, а при нажатии на нее на вход ESP32 подается 3.3В, то обязательно нужно ставить галку `PullUp`.)
- Настройка адрессных светодиодов
- Красный светодиод. (зажигается, когда приходит сообщение от конечного zigbee устройства)
- Зеленый светодиод. (зажигается, когда активен режим `Join`)
- Синий светодиод.
- Настройка I2C SDA (линия данных)
- Настройка I2C SCL (линия синхронизации)

### Help

![Main menu - Help](/img/main_menu-help.png)

## Actions

![Main menu - Actions](/img/main_menu-actions.png)

- `Files` - Доступ к файловой системе и редактору скриптов
- `Backup` - Создание резервных копий настроек
- `Update Firmware` - Обновление прошивки
- `Save` - Запись текущего состояния
- `Reboot System` - Перезагрузка шлюза

### Files

### Backup

### Update Firmware

Обновление прошивки шлюза по ОТА.

![update](/img/slsupdate.png)

### Save

### Reboot System

Reboot – перезагрузка шлюза.
