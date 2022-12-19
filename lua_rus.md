[Go to the english version of the site](/lua_eng.md)

# Поддержка lua скриптов

В шлюзе SLS имеется  поддержка автоматизаций на основе скриптового языка программирования [lua](https://ru.wikipedia.org/wiki/Lua). Редактор скриптов находится в меню *Actions -> Scripts* (а в новых версиях прошивки *Actions -> Files*).  

Текущая версия Lua 5.4.4

Для написания скрипта необходимо создать новый файл, например  с именем `script.lua` и в него ввести код на языке lua. 

Скриптовый `stdout` по команде `print` выводит информацию на экран страницы Scripts и в системный лог шлюза. Запустить скипт для тестов можно нажатием кнопки *RUN*.

При запуске шлюза выполняется файл `/init.lua`, который должен находиться рядом со всеми скриптами `.lua`. Если его там нет, то его нужно создать так же как и вышеописанный `script.lua`
![](/img/lua.png)


## Варианты запуска скриптов
1. Запуск скрипта при изменении состояния устройства. На вкладке Zigbee необходимо зайти в параметры устройства и в окне SimpleBind указать имя файла скрипта (префикс "/" необязателен) 
![](/img/execlua.jpg)
2. [Запуск скрипта по изменению объекта](lua_rus.md#выполнение-сценария-по-изменению-объекта)
3. Запуск lua скрипта по подписке mqtt. Ожидается.
4. [Запуск lua скрипта с помощью  http api](lua_rus.md#запуск-скрипта-с-помощью--http-api)
5. [Запуск lua скрипта из другого скрипта](lua_rus.md#запуск-lua-скрипта-из-другого-скрипта)
6. [Периодическй запуск lua скриптов (таймеры)](lua_rus.md#периодический-запуск-скриптов-таймеры)
7. [Скрипт инициализации](lua_rus.md#скрипт-инициализации)


## Список доступных функций и структур
1. [http.request()](lua_rus.md#httprequest)
2. [zigbee.value()](lua_rus.md#zigbeevalue)
3. [zigbee.get()](lua_rus.md#zigbeeget)
4. [zigbee.set()](lua_rus.md#zigbeeset)
5. [Event](lua_rus.md#event)
6. [os.time()](lua_rus.md#ostime) 
7. [obj.get()/obj.set()](lua_rus.md#objget--objset) 
8. [mqtt.pub()](lua_rus.md#mqttpub) 


### http.request 
Вызов URL запроса http.request (`url[:port], [method, headers, body]`)

В данный момент поддерживается только `http://` протокол.

Пример переключение gpio 12 для прошивки wifi-iot
```lua
http.request("http://192.168.1.34/gpio?st=2&pin=12")
```

Пример отправки POST запроса:
```lua
http.request("http://postman-echo.com:80/post?foo1=bar1", "POST", "Content-Type: text/text; charset=utf-8\r\n", "body") 
```
Альтернативный вариант:
```lua
http.request2("http://postman-echo.com:80/post?foo1=bar1", "POST", "Content-Type: text/text; charset=utf-8\r\n", "body") 
```

Пример переключения реле sw1 в прошивке espHome:

```lua
http.request("http://192.168.1.71/switch/sw1/toggle", "POST") 
```

Пример переключение gpio для MegaD при однократном нажатии btn_2 пульта Jager
```lua
if Event.State.Value == "btn_2_single"  then
  http.request("http://192.168.2.200/objects/?object=MegaD1-12&op=m&m=switch")
end
```

Запрос инфомации со стороннего ресурса
```lua
local Response = http.request("http://wtfismyip.com/text")
print("My IP: " .. Response)
```

### zigbee.value()
Получение значения состояния устройства из кэша zigbee.value("ieeard", "temperature")

```lua
-- Получаем значение температуры и округляем до целого  
temp = zigbee.value("0x00158D0001A2D2FE", "temperature")
temp = math.floor(temp)
print("Текущая температура: " .. temp .. " C°")
```

Вместо адреса устройства можно испрользовать FriendlyName (в том числе кириллицу), либо текущий адрес устройства в сети (0x9EC8).

```lua
-- Получаем значение температуры и округляем до целого  
temp = zigbee.value("датчик в комнате", "temperature")
temp = math.floor(temp)
print("Текущая температура: " .. temp .. " C°")
```

### zigbee.get()
Вызывает команду GET в ковертере. Используется для ручного чтения состояний из устройств.

Пример: 
```lua
zigbee.get("lamp1", "brightness")
```


### zigbee.join()
Синтаксис: `zigbee.join(duration, [target])`

Открывает сеть для подключения новых устройств на duration секунд (макс. 255), для устройства target или для всей сети. 

```lua
zigbee.join(255, "plug1")
```


### zigbee.set()
Установка значения  устройства `zigbee.set(Ident, StateName, StateValue)`

Пример скрипта, который при нажатии кнопки выключателя *lumi.sensor_switch* включает освещение *lamp_1*:
```lua
if zigbee.value("lumi.sensor_switch", "click") == "single" then
  -- toggle lamp
  current_brightness = zigbee.value("lamp_1", "brightness")
  if current_brightness == 0 then
    zigbee.set("lamp_1", "brightness", 255)
  else
    zigbee.set("lamp_1", "brightness", 0)
  end
end


-- switch 0x00124B0009FE36FC on single lumi.sensor_switch click
if Event.State.Value == "single" then
   zigbee.set("0x00124B0009FE36FC", "state", "toggle")
  end

```

### zigbee.setState(ident, name, value[[, type], events])
Устанавливает значение состояния Zigbee устройства. Можно указать тип значения (по умолчанию STR) и необходимо ли выполнять события (по умолчанию true).
Начиная с версии 2022.07.24d1.

```lua
zigbee.setState("0x00124B001E1EB5C0", "my_count", 5, "INT")
```

### zigbee.readAttr(ident, epId, clusterId, AttrId[, manufId])
Отправляет запрос на чтение атрибута в кластере.

Читает атрибут swBuild в кластере genBasic в 1 эндпоинте:
```lua
zigbee.readAttr("0x90FD9FFFFEF7E26D", 0x0000, 1, 0x4000)
```

### zigbee.writeAttr(ident, epId, clusterId, AttrId, dataType, value[, manufId])
Записывает значение атрибута в кластере.

### zigbee.configReport(ident, epId, clusterId, AttrId, dataType, minRepInt, maxRepInt, repChange)
Конфигурирует репортинг атрибута в кластере.

### zigbee.getStatus()
Возвращает статус координатора, если запущен успешно - 9.
Начиная с версии 2022.07.24d1.

```lua
coord_status = zigbee.getStatus()
```

### Event
Структура Event например позволяет использовать один и тот же скрипт для разных состояний или устройств.

Возможные варианты использования:

* Event.Name - Имя файла скрипта
* Event.nwkAddr - nwkAddr устройства, которое вызывало скрипт
* Event.ieeeAddr - ieeeAddr устройства, которое вызывало скрипт
* Event.FriendlyName - FriendlyName устройства, которое вызывало скрипт
* Event.State.Name - Имя состояния которое вызвало скрипт
* Event.State.Value - Новое значение состояния
* Event.State.OldValue - Предыдущее значение состояния

Пример скрипта для включения света диммируемого:
```lua
if Event.State.Value == "single" then 
  value = 255 
elseif Event.State.Value == "double" then 
  value = 0 
else 
  return 
end
zigbee.set("lamp_1", "brightness", value)
```

Пример скрипта для включения света ON/OFF:
```lua
if Event.State.Value == "single" then 
  value = "ON" 
elseif Event.State.Value == "double" then 
  value = "OFF" 
else 
  return 
end
zigbee.set("lamp_1", "brightness", value)
```

## Библиотека операционной системы (os)

### os.setSleep(enable/time)
Включает (*true*) и выключает (*false*) режим сна для модема WiFi. По умочланию выключено.

Так же можно заставить систему заснуть глубоким сном на *time* секунд, тем самым снизив энергопотребление практически до нуля. В этом режиме не работает ничего, кроме таймера отсчета до окончания сна, по прошествии которого система перезагрузится. Это может использоваться при питании от аккумулятора.

### os.time()
`os.time()` возвращает Unix время.

Пример получения текущего часа, времени и секунд, например для планировщика в таймере:

```lua
local gmt = 3
local time = os.time() + gmt * 3600;

local t1 = math.modf(time/60);
local sec  = time - t1*60;
local time = t1;
local t1 = math.modf(time/60);
local min  = time - t1*60;
local time = t1;
local t1 = math.modf(time/24);
local hour = time - t1*24;

print(hour .. ":" .. min .. ":" .. sec)
```

### os.delay()
Синтаксис: `os.delay(ms)`

Пауза на ms миллисекунд (1сек = 1000 мс)

### os.millis()
Возвращает количество миллисекунд с момента загрузки системы

### os.save()
Сохраняет данные

### os.restart()
Перезагружает ОС

### os.ping(host[, count])
Отправляет ICMP PING запросы, возвращает среднее время или -1 при недоступности.

### os.led(mode[ON/OFF/AUTO], brightness[0..255], r, g, b[, effect]]]])
Управление светодиодами.  Описание параметров:

**mode** (режим):
```
* OFF - выключено,
* ON - включено,
* AUTO - в этом режиме шлюз управляет светом автоматически
``` 
В режиме AUTO шлюз работает по следующему алгоритму: 
```
зеленый горит - Join
синий переливаеся - режим AP
синий мигает - подключение к WiFi
красный - ошибка подключения к WiFi
```

**brightness** (яркость) - целочисленное значение от 0 до 255, 

**r, g, b** - целые числа 0-255, устанавливает цвет светодиода на шлюзе. Можно использовать -1 для соответствующего цвета, если не нужно менять,

**effect**  - опциональный параметр включает эффекты в соответстии с [таблицей](/led_effects.md)

**Примеры для различных устройств:** 
Переделанный шлюз Xiaomi:

Индикаторный светодиод шлюза SLS DIN MINI:

Светодиодной кольцо с обычными светодиодами:

Светодиодное кольцо с адресными светодиодами:


### os.wdt(enable)
Включается и выключает WDT (Сторожевой таймер), может использоваться для отладки незапланированных перезагрузок.

Выключить WDT:
```lua
os.wdt(false)
```

###  obj.get() / obj.set()

`obj.get(ObjectName)` / `obj.set(ObjectName, ObjectValue)` для сохранения и получения объекта для обмена данными между скриптами

Проверка существования объекта:
```lua
local status = obj.get("security.status")
if (status == nil) then status = 0 end
```
Для изменения типа переменной сохраняемого значения можно сделать так:
```lua
obj.setOpt("security.status", "INT")
```

Получение времени события в секундах lua list (curr,prev):
```lua
curr, prev = obj.getTime("security.status")
print("Время предыдущего изменения:" .. prev .. ", И последнего: " .. curr .. " длительность события: " .. curr-prev)
```

### mqtt.pub()
Синтаксис: `mqtt.pub(topic, payload)`

Публикует на MQTT сервер в топик `topic` значение `payload`. 

Пример управления реле на прошивке Tasmota - `cmnd/имя устройства/имя реле`

```lua
  mqtt.pub('cmnd/sonoff5/power', 'toggle')
```

### mqtt.connected()
Проверяет подключение к брокеру



### Управление GPIO
```lua
gpio.mode(pin, mode)
gpio.read(pin) - чтение цифрового 
gpio.read(PIN, true) - чтение ADC
gpio.write(pin, level)
```

### Управление звуком
```lua
audio.playurl(url) -- проигрывание звука из URL
audio.geturl() --- возвращает текущий URL
audio.stop() -- остановить проигрывание
audio.setvolume(volume_procent) -- установить уровень громкости
audio.getvolume() -- возвращает текущий уровень громкости
audio.getstatus() -- возвращает текущий статус
```

### Ежеминутный таймер

Просто создайте скрипт с именем `OneMinTimer.lua`, он будет запускаться каждую минуту.

Установите [таймер](/lua_rus.md#периодический-запуск-скриптов-таймеры) через scripts.setTimer("OneMinTimer", 60). Для автоматического запуска `OneMinTimer.lua` добавьте эту строку в стартовый  скрипт init.lua.

Пример отправки данных каждую минуту на https://narodmon.ru

```lua
function SendNarodmon(name, value)
  local MAC = "BC:DD:C2:D7:68:BC"
  http.request("http://narodmon.ru/get?ID=" .. MAC .. "&" .. name .. "=" .. tostring(value))
end  

local value = zigbee.value("0x04CF8CDF3C771F6C", "illuminance")
SendNarodmon("illuminance", value)
```





### Отправка сообщений в телеграм 

1. Зарегистрировать своего бота можно у [@BotFather](https://t.me/BotFather). Во время регистрации будет выдан *token*.
2. Узнать свой *ChatId* можно у бота [@userinfobot](https://t.me/userinfobot).

*token* и *ChatId* достаточно написать 1 раз в `init.lua`, потом использовать только `telegram.send()` :


```lua
-- добавьте в init.lua
telegram.settoken("5961....:AAHJP4...")
telegram.setchat("5748.....")

-- добавьте в любой lua скрипт где требуется оповещение
telegram.send("Температура: " .. string.format("%.2f", zigbee.value(tostring(Event.ieeeAddr), "temperature")) .. "°C, Влажность: " .. string.format("%.2f",zigbee.value(tostring(Event.ieeeAddr), "humidity")) .. "%")
```



### Создание виртуальных свойств

```lua
zigbee.setState(IEEE, "myproperies", type) 
```

Варианты type:
* "BOOL"
* "INT"
* "FLOAT"
* "STR"

Пример инициализвции с сохранением данных

```lua
local res= zigbee.setState("0x00124B001F7CA144", "prop_float", "FLOAT") 
local res= zigbee.setState("0x00124B001F7CA144", "prop_bool", "BOOL") 
local res= zigbee.setState("0x00124B001F7CA144", "prop_int", "INT") 
local res= zigbee.setState("0x00124B001F7CA144", "prop_int", "STR") 
os.save()
```



### Запрос данных от устройств через скрипт, например запрос мгновенного потребления, если устройство само не оповещает

`zigbee.get("0x842E14FFFE05B8E2", "power")` в файле `onemintimer.lua` где  `0x842E14FFFE05B8E2` - идентификатор устройсва



### Запуск lua скрипта из другого скрипта

```lua
dofile("/int/test.lua")
```


### Запуск скрипта с помощью HTTP API

```lua
/api/scripts?action=evalFile&path=/test.lua
```

### Периодический запуск скриптов (таймеры)
Шлюз может запускать скрипты с определенной периодичностью. Для этого необходимо назначить ему таймер. 
Можно будет установить таймер к любому скрипту, а так же отменить его. Дискретность таймеров 1 секунда, для cron - 1 минута.


Типы таймеров:
* Периодический (выполняется каждые X секунд) (Event.Type = 5)
* Однократный (выполняется однократно в UNIX время) (Event.Type = 4)
* cron (синтаксис как у [UNIX cron](https://ru.wikipedia.org/wiki/Cron)) (Event.Type = 6) (начиная с версии 2022.04.24d11) 

Запуск скрипта OneMinTimer каждые 60 секунд:
```lua
scripts.setTimer("OneMinTimer", 60)
```

Запуск скрипта my1 через 5 секунд однократно:
```lua
scripts.setTimer("my1", os.time() + 5)
```

Запуск скрипта my2 каждый день в 01:05:
```lua
scripts.setTimer("my2", "5 1 * * *")
```

Отмена всех таймеров для скрипта OneMinTimer:
```lua
scripts.setTimer("OneMinTimer", 0)
```

:warning: **Внимание, скрипты OneMinTimer.lua и OneSecTimer.lua более не запускаются автоматически!!!**

### Скрипт инициализации 
При запуске системы единоразово выполняется init.lua. В нем полезно задать переменные для работы с устройством. 

```lua
telegram.settoken("51778***5:AAG0bvK***")
telegram.setchat("-3348***")
telegram.send("SLS   загружен "..net.localIP())

local sunset_hour, sunset_min = os.sunset()
local sunrise_hour, sunrise_min = os.sunrise()
telegram.send("sunrise " ..sunset_hour  ..":".. sunset_min )
```

## Работа с хранилищем](/storage_rus.md)
Примонтировать SD-карту, можно добавить в *init.lua*:
```lua
os.mountSD(true)
```
Проверка наличия файла, возвращает true/false
```lua
os.fileExists(fileName)
```
Удаления файла
```lua
 os.fileRemove(fileName)
```
Переименование файла
 ```lua
os.fileRename(old, new)
```
Запись в файл:
```lua
os.writeFile("/int/!file.db","привет\n",true)  --3 параметр определяет, перезаписывать или нет файл
value = os.readFile("/int/!file.db")
print(value)
```
Для карты памяти необходимо использовать путь "/sd/file.txt"

## Обработка нажатий кнопок
Многие ревизии шлюзов имеют кнопку, нажатия которой можно обрабатывать скриптами

Например для включение "режима сопряжения" при нажатии на боковую кнопку  шлюза
Необходимо привязать скрипт `btn_sw1.lua`
```lua
zigbee.join(255, "0x0000")
```
и привязать его выполнение в init.lua
```lua
obj.onChange("io.input0.value", "btn_sw1.lua")
```
- где `io.input0.value` - номер обрататываемого порта (в примере указана кнопка для круглого шлюза)

Более подробно вопрос с обрабокой событий gpio разобран в разделе [Модуля ввода-вывода](/devices/din_mini_io_rus.md)


## Полезные ссылки 
1) [Примеры типовых сценариев](/samples_rus.md) 
2) On-line учебник по [lua](https://zserge.wordpress.com/2012/02/23/lua-%D0%B7%D0%B0-60-%D0%BC%D0%B8%D0%BD%D1%83%D1%82/)
3) Генератор lua скриптов  на основе [Blockly](https://blockly-demo.appspot.com/static/demos/code/index.html)

