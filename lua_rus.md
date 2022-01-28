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
```
http.request("http://192.168.1.34/gpio?st=2&pin=12")
```

Пример отправки POST запроса:
```
http.request("http://postman-echo.com:80/post?foo1=bar1", "POST", "Content-Type: text/text; charset=utf-8\r\n", "body") 
```

Пример переключения реле sw1 в прошивке espHome:

```
http.request("http://192.168.1.71/switch/sw1/toggle", "POST") 
```

Пример переключение gpio для MegaD при однократном нажатии btn_2 пульта Jager
```
if Event.State.Value == "btn_2_single"  then
  http.request("http://192.168.2.200/objects/?object=MegaD1-12&op=m&m=switch")
end
```

Запрос инфомации со стороннего ресурса
```
local Response = http.request("http://wtfismyip.com/text")
print("My IP: " .. Response)
```

### zigbee.value()
Получение значения состояния устройства из кэша zigbee.value("ieeard", "temperature")

```
-- Получаем значение температуры и округляем до целого  
temp = zigbee.value("0x00158D0001A2D2FE", "temperature")
temp = math.floor(temp)
print("Текущая температура: " .. temp .. " C°")
```

Вместо адреса устройства можно испрользовать FriendlyName (в том числе кириллицу), либо текущий адрес устройства в сети (0x9EC8).

```
-- Получаем значение температуры и округляем до целого  
temp = zigbee.value("датчик в комнате", "temperature")
temp = math.floor(temp)
print("Текущая температура: " .. temp .. " C°")
```

### zigbee.get()
Вызывает команду GET в ковертере. Используется для ручного чтения состояний из устройств.

Пример: 
```
zigbee.get("lamp1", "brightness")
```


### zigbee.join()
Синтаксис: `zigbee.join(duration, [target])`

Открывает сеть для подключения новых устройств на duration секунд (макс. 255), для устройства target или для всей сети. 

```
zigbee.join(255, "plug1")
```


### zigbee.set()
Установка значения  устройства `zigbee.set(Ident, StateName, StateValue)`

Пример скрипта, который при нажатии кнопки выключателя *lumi.sensor_switch* включает освещение *lamp_1*:
```
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

### zigbee.readAttr(ident, epId, clusterId, AttrId[, manufId])
Отправляет запрос на чтение атрибута в кластере.

Читает атрибут swBuild в кластере genBasic в 1 эндпоинте:
```
zigbee.readAttr("0x90FD9FFFFEF7E26D", 0x0000, 1, 0x4000)
```

### zigbee.writeAttr(ident, epId, clusterId, AttrId, dataType, value[, manufId])
Записывает значение атрибута в кластере.

### zigbee.configReport(ident, epId, clusterId, AttrId, dataType, minRepInt, maxRepInt, repChange)
Конфигурирует репортинг атрибута в кластере.

### Event
Структура Event например позволяет использовать один и тот же скрипт для разных состояний или устройств.

Возможные варианты использования:

* Event.Name - Имя файла скрипта
* Event.nwkAddr - nwkAddr устройства, которое вызывало скрипт
* Event.ieeeAddr - ieeeAddr устройства, которое вызывало скрипт
* Event.FriendlyName - FriendlyName устройства, которое вызывало скрипт
* Event.State.Name - Имя состояния которое вызвало скрипт
* Event.State.Value - Новое значение состояния

Пример скрипта для включения света диммируемого:
```
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
```
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



### os.time()
`os.time()` возвращает Unix время.

Пример получения текущего часа, времени и секунд, например для планировщика в таймере:

```
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

### os.led(r, g, b[, mode])

r, g, b - целые числа 0-255, устанавливает цвет светодиода на шлюзе. Можно использовать -1 для соответствующего цвета, если не нужно менять.

mode:
* 0 - выключено,
* 1 - ручной,
* 2 - авто

### os.wdt(enable)
Включается и выключает WDT (Сторожевой таймер), может использоваться для отладки незапланированных перезагрузок.

Выключить WDT:
```
os.wdt(false)
```

###  obj.get() / obj.set()

`obj.get(ObjectName)` / `obj.set(ObjectName, ObjectValue)` для сохранения и получения объекта для обмена данными между скриптами

Проверка существования объекта:
```
local status = obj.get("security.status")
if (status == nil) then status = 0 end
```
Для изменения типа переменной сохраняемого значения можно сделать так:
```
obj.setOpt("security.status", "INT")
```

Получение времени события в секундах lua list (curr,prev):
```
curr, prev = obj.getTime("security.status")
print("Время предыдущего изменения:" .. prev .. ", И последнего: " .. curr .. " длительность события: " .. curr-prev)
```

### mqtt.pub()
Синтаксис: `mqtt.pub(topic, payload)`

Публикует на MQTT сервер в топик `topic` значение `payload`. 

Пример управления реле на прошивке Tasmota - `cmnd/имя устройства/имя реле`

```
  mqtt.pub('cmnd/sonoff5/power', 'toggle')
```

### mqtt.connected()
Проверяет подключение к брокеру

### Включение "режима сопряжения" при нажатии на боковую кнопку  шлюза

При нажатии на кнопку вызывается сценарий `btn_sw1.lua`. 
В сценарий нужно добавить следующий код:

```
zigbee.join(255, "0x0000")
```

### Управление GPIO
```
gpio.mode(pin, mode)
gpio.read(pin) - чтение цифрового 
gpio.read(PIN, true) - чтение ADC
gpio.write(pin, level)
```

### Управление звуком
```
audio.playurl(url) -- проигрывание звука из URL
audio.geturl() --- возвращает текущий URL
audio.stop() -- остановить проигрывание
audio.setvolume(volume_procent) -- установить уровень громкости
audio.getvolume() -- возвращает текущий уровень громкости
audio.getstatus() -- возвращает текущий статус
```

### Ежеминутный таймер

Просто создайте скрипт с именем `OneMinTimer.lua`, он будет запускаться каждую минуту.

Пример отправки данных каждую минуту на https://narodmon.ru

```
function SendNarodmon(name, value)
  local MAC = "BC:DD:C2:D7:68:BC"
  http.request("http://narodmon.ru/get?ID=" .. MAC .. "&" .. name .. "=" .. tostring(value))
end  

local value = zigbee.value("0x04CF8CDF3C771F6C", "illuminance")
SendNarodmon("illuminance", value)
```


### Отправка сообщения в телеграм с помощью вашего бота

```
local char_to_hex = function(c)
  return string.format("%%%02X", string.byte(c))
end

function round(exact, quantum)
    local quant,frac = math.modf(exact/quantum)
    return quantum * (quant + (frac > 0.5 and 1 or 0))
end

local function urlencode(url)
  if url == nil then
    return
  end
  url = url:gsub("\n", "\r\n")
  url = url:gsub("([^%w ])", char_to_hex)
  url = url:gsub(" ", "+")
  return url
end

local hex_to_char = function(x)
  return string.char(tonumber(x, 16))
end

function SendTelegram(text)
  local token = "5177...:AAG0b...."  --
  local chat_id = "38806....."
  --http.request("https://api.telegram.org/bot" .. token .. "/sendMessage?chat_id=" .. chat_id .. "&text=" .. tostring(text))  -- https пока не работает в lua
  http.request("http://212.237.16.93/bot" .. token .. "/sendMessage?chat_id=" .. chat_id .. "&text=" .. urlencode(text))
end  


local value = zigbee.value("0x00158D00036C1508", "temperature")
local text = "temperature: " .. round(tostring(value),2)
SendTelegram(text)
```

### Уведомление в телеграм об открытии двери

```
local char_to_hex = function(c)
  return string.format("%%%02X", string.byte(c))
end

function round(exact, quantum)
    local quant,frac = math.modf(exact/quantum)
    return quantum * (quant + (frac > 0.5 and 1 or 0))
end

local function urlencode(url)
  if url == nil then
    return
  end
  url = url:gsub("\n", "\r\n")
  url = url:gsub("([^%w ])", char_to_hex)
  url = url:gsub(" ", "+")
  return url
end

local hex_to_char = function(x)
  return string.char(tonumber(x, 16))
end

function SendTelegram(text)
  local token = "517781...:AAG0..."
  local chat_id = "38806...."
  --http.request("https://api.telegram.org/bot" .. token .. "/sendMessage?chat_id=" .. chat_id .. "&text=" .. tostring(text))  -- https пока не работает в lua
  http.request("http://212.237.16.93/bot" .. token .. "/sendMessage?chat_id=" .. chat_id .. "&text=" .. urlencode(text))
end  


local state =  zigbee.value(tostring(Event.ieeeAddr), "contact")
if (state) then
  SendTelegram("Дверь открыта") 
else
  SendTelegram("Дверь закрыта")
end 
```

### Оповещение в телеграм при сработке датчика движения

```
local char_to_hex = function(c)
  return string.format("%%%02X", string.byte(c))
end

function round(exact, quantum)
    local quant,frac = math.modf(exact/quantum)
    return quantum * (quant + (frac > 0.5 and 1 or 0))
end

local function urlencode(url)
  if url == nil then
    return
  end
  url = url:gsub("\n", "\r\n")
  url = url:gsub("([^%w ])", char_to_hex)
  url = url:gsub(" ", "+")
  return url
end

local hex_to_char = function(x)
  return string.char(tonumber(x, 16))
end

function SendTelegram(text)
  local token = "517781...:AAG0bv...."
  local chat_id = "3880......"
  --http.request("https://api.telegram.org/bot" .. token .. "/sendMessage?chat_id=" .. chat_id .. "&text=" .. tostring(text))  -- https пока не работает в lua
  http.request("http://212.237.16.93/bot" .. token .. "/sendMessage?chat_id=" .. chat_id .. "&text=" .. urlencode(text))
end  


local state =  zigbee.value(tostring(Event.ieeeAddr), "occupancy")
if (state) then
  SendTelegram("Датчик движения ".. Event.ieeeAddr  .." обнаружил активность")
else
  SendTelegram("Значение датчика ".. Event.FriendlyName .." движения нормализовалось")
end
```

###  Оповещение об изменении значения датчика температуры/влажности
```
local char_to_hex = function(c)
  return string.format("%%%02X", string.byte(c))
end

function round2(num, numDecimalPlaces)
  local mult = 10^(numDecimalPlaces or 0)
  return math.floor(num * mult + 0.5) / mult
end

local function urlencode(url)
  if url == nil then
    return
  end
  url = url:gsub("\n", "\r\n")
  url = url:gsub("([^%w ])", char_to_hex)
  url = url:gsub(" ", "+")
  return url
end

local hex_to_char = function(x)
  return string.char(tonumber(x, 16))
end

function SendTelegram(text)
    local token = "5177....:AAG0......"
  local chat_id = "3880..."
  --http.request("https://api.telegram.org/bot" .. token .. "/sendMessage?chat_id=" .. chat_id .. "&text=" .. tostring(text))  -- https пока не работает в lua
  http.request("http://212.237.16.93/bot" .. token .. "/sendMessage?chat_id=" .. chat_id .. "&text=" .. urlencode(text))
end  

local temp =  round2(zigbee.value(tostring(Event.ieeeAddr), "temperature"),1)
local hum =  round2(zigbee.value(tostring(Event.ieeeAddr), "humidity"),1)
SendTelegram("Значение ДТВ ".. Event.FriendlyName .. " ".. temp.."° / " .. hum .. "%") 

------------  отправка значения на narodmon
function SendNarodmon(name, value)
  local MAC =tostring(Event.ieeeAddr)
  http.request("http://narodmon.ru/get?ID=" .. MAC .. "&" .. name .. "=" .. tostring(value))
end  

SendNarodmon("temperature", temp)
SendNarodmon("humidity", hum)
```


### Упрощенная отправка сообщений в телеграм (начиная с версии 20200915)

1. Зарегистрировать своего бота можно у [@BotFather](https://t.me/BotFather). Во время регистрации будет выдан *token*.
2. Узнать свой *ChatId* можно у бота [@userinfobot](https://t.me/userinfobot).

*token* и *ChatId* достаточно написать 1 раз в `init.lua`, потом использовать только `telegram.send()` :


```
-- добавьте в init.lua
telegram.settoken("5961....:AAHJP4...")
telegram.setchat("5748.....")

-- добавьте в любой lua скрипт где требуется оповещение
telegram.send("Температура: " .. string.format("%.2f", zigbee.value(tostring(Event.ieeeAddr), "temperature")) .. "°C, Влажность: " .. string.format("%.2f",zigbee.value(tostring(Event.ieeeAddr), "humidity")) .. "%")
```

### Подсветка шлюза по датчику движению только в ночное время с 22 до 6

Вариант через GPIO

```
local gmt = 3  
local time = os.time()  
local hour = (math.modf(time / 3600) + gmt) % 24  
if hour >= 22 or hour < 6 then  
  if Event.State.Value == "true" then  
    gpio.pwm(0, 255)  
    gpio.pwm(1, 255)  
    gpio.pwm(2, 255)  
  else  
    gpio.pwm(0, 0)  
    gpio.pwm(1, 0)  
    gpio.pwm(2, 0)  
  end  
end
```

Вариант через MQTT:
```
local gmt = 3
local time = os.time()
local hour = (math.modf(time / 3600) + gmt) % 24
if hour >= 22 or hour <6 then
  if Event.State.Value == "true" then
    mqtt.pub('ZigBeeSls/led', '{"mode":"manual","hex":"#FF0000"}')
  else
    mqtt.pub('ZigBeeSls/led', '{"mode": "off"}')
  end
end
```

### Создание режима охраны

Постановка 
```
obj.set("security_status", "armed")
```

Проверка
```
if obj.get("security_status")=="armed" then 
  print("Объект на охране.")
else 
  print("Объект не на охране.")
end
```

### Включение звука дверного звонка по событию (звуковой файл лежит в открытой сети)

192.168.1.5 - адрес другого шлюза. Нельзя запускать на самом себе таким образом, используйте объект audio.

```
http.request("http://192.168.1.5/audio?action=setvolume&value=100")
http.request("http://192.168.1.5/audio?action=play&url=http://funny-dog.surge.sh/door_bell.mp3")
```

### Создание виртуальных свойств

```
zigbee.add(IEEE, "myproperies", type) 
```

Варианты type:
* "BOOL"
* "INT"
* "FLOAT"
* "STRING"

Пример инициализвции с сохранением данных

```
local res= zigbee.add("0x00124B001F7CA144", "prop_float", "FLOAT") 
local res= zigbee.add("0x00124B001F7CA144", "prop_bool", "BOOL") 
local res= zigbee.add("0x00124B001F7CA144", "prop_int", "INT") 
local res= zigbee.add("0x00124B001F7CA144", "prop_int", "STR") 
os.save()
```


### Преобразование показателей давления из кПа в мм.рт.ст.

Необходимо создать lua скрипт, который будет вызываться при изменении pressure:

```
local press = zigbee.value(tostring(Event.ieeeAddr), "pressure")
local pressmm = zigbee.value(tostring(Event.ieeeAddr), "pressure_mm")
if pressmm == null  then
  zigbee.add(tostring(Event.ieeeAddr), "pressure_mm", "FLOAT")
end
zigbee.set(tostring(Event.ieeeAddr), "pressure_mm", press * 7.5)
```

### Запрос данных от устройств через скрипт, например запрос мгновенного потребления, если устройство само не оповещает

`zigbee.get("0x842E14FFFE05B8E2", "power")` в файле `onemintimer.lua` где  `0x842E14FFFE05B8E2` - идентификатор устройсва

### Пример работы с астротаймером

Астротаймером называется обычный таймер, имеющий привязку к циклам захода\восхода солнца.
Так как на разной широте время захода и восхода отличается, то в таких таймерах присутствует установка долготы/широты. Параметры долготы/широты задаются через Web на вкладке *Settings->Location*.

Астротаймер вызывавается скриптом `OneMinTimer.lua` каждую минуту:

```
local sunrise_add_min <const> = 15
local sunrise_hour, sunrise_min = os.sunrise()
sunrise_min = sunrise_min + sunrise_add_min
if sunrise_min > 59 then
  sunrise_hour = sunrise_hour + 1
  sunrise_min = sunrise_min - 60
end  
if Event.Time.hour == sunrise_hour and Event.Time.min == sunrise_min then
  print(sunrise_hour .. ":" .. sunrise_min)
end
```

Данный скрипт напечатает время рассвета, через 15 минут после наступления, т.е. если 8:55 наступает рассвет,  добавляем 15 минут, то скрипт сработает в 9:10. Можно задавать 
не более 60 минут. 


### Пример использования астротаймера

```
local sunset_add_min <const> = 20
local sunset_hour, sunset_min = os.sunset()
sunset_min = sunset_min + sunset_add_min

if sunset_min > 59 then
  sunset_hour = sunset_hour + 1
  sunset_min = sunset_min - 60
end

if Event.Time.hour == sunset_hour and Event.Time.min == sunset_min then
  -- Включает уличный свет через 20 минут после заката
  telegram.send("Включено уличное освещение")
  http.request("http://192.168.2.200:8888/objects/?object=MegaD3-8&op=m&m=extended")
end

local sunrise_add_min <const> = 1
local sunrise_hour, sunrise_min = os.sunrise()
sunrise_min = sunrise_min + sunrise_add_min

if sunrise_min > 59 then
  sunrise_hour = sunrise_hour + 1
  sunrise_min = sunrise_min - 60
end

if Event.Time.hour == sunrise_hour and Event.Time.min == sunrise_min then
  -- Открывает шторы после рассвета
  telegram.send("Шторы в гостинной открыты")
  zigbee.set("0x5C0272FFFEC8A21B", "position", 0)
end
```

### Определение времени суток (светлое или темное)

```
sunrise_h, sunrise_m = os.sunrise()
sunset_h, sunset_m = os.sunset()
sunshine = (Event.Time.hour*60+Event.Time.min)>(sunrise_h*60+sunrise_m) and (Event.Time.hour*60+Event.Time.min)<(sunset_h*60+sunset_m)
```
sunshine -  булева переменная, показывает время суток, дневное или вечернее. 



### Запуск lua скрипта из другого скрипта

```
dofile("/int/test.lua")
```


### Запуск скрипта с помощью HTTP API

```
/api/scripts?action=evalFile&path=/test.lua
```

### Периодический запуск скриптов (таймеры)
Шлюз может запускать скрипты с определенной периодичностью. Для этого необходимо назначить ему таймер. 
Можно будет установить таймер к любому скрипту, а так же отменить его. Дискретность таймеров 1 секунда.


Типы таймеров:
* Периодический (выполняется каждые X секунд)
* Однократный (выполняется однократно в UNIX время)


Запуск скрипта OneMinTimer каждые 60 секунд:
```
scripts.setTimer("OneMinTimer", 60)
```

Запуск скрипта my1 через 5 секунд однократно:
```
scripts.setTimer("my1", os.time() + 5)
```

Отмена таймера для скрипта OneMinTimer:
```
scripts.setTimer("OneMinTimer", 0)
```

:warning: **Внимание, скрипты OneMinTimer.lua и OneSecTimer.lua более не запускаются автоматически!!!**

### Скрипт инициализации 
При запуске системы единоразово выполняется init.lua. В нем полезно задать переменные для работы с устройством. 

```
telegram.settoken("51778***5:AAG0bvK***")
telegram.setchat("-3348***")
telegram.send("SLS загружен!!!")

local sunset_hour, sunset_min = os.sunset()
local sunrise_hour, sunrise_min = os.sunrise()
telegram.send("sunrise " ..sunset_hour  ..":".. sunset_min )
```



## Полезные ссылки 
1) On-line учебник по [lua](https://zserge.wordpress.com/2012/02/23/lua-%D0%B7%D0%B0-60-%D0%BC%D0%B8%D0%BD%D1%83%D1%82/)

2) Генератор lua скриптов  на основе [Blockly](https://blockly-demo.appspot.com/static/demos/code/index.html)

