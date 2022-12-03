# Поддержка lua скриптов (Draft)

## Введение
Шлюз SLS самодостаточен и может обходиться без внешних систем управления Умным домом. Для реализации автоматизаций, он поддерживает скриптовый язык программирования [LUA](https://ru.wikipedia.org/wiki/Lua).
При разработке скриптов можно использовать функции как встроенные в прошивку шлюза, так и функции поддерживаемых шлюзом библиотек LUA.
<!--	#ToDo - какие библиотеки встроены в прошивку
		известны из доков:
		os
		string
		...
 -->
Текущая, поддерживаемая, версия [LUA 5.4.4](https://www.lua.org/versions.html#5.4).
## Соглашения
Немного о форматировании и названиях различных объектов шлюза.

Для работы с различными объектами используется формат кода типа `zigbee.getStatus()`. В терминологии LUA это выглядит как `библиотека.функция()`. Поэтому постараемся придерживаться подобного именования объектов SLS.

Форматирование текста:
- пункты меню: *File -> Save* 
- небольшие куски кода: `print(a)`
- многострочный код:
```lua
local var = 0
print(var)
```
Поскольку материала по теме достаточно много, дабы не превращать документацию в бесконечно длинную простыню, решено разбить его на несколько страничек. Также большинство примеров выделено отдельно, с удобными кросс-ссылками.

let's begin

### Скрипт инициализации
При запуске системы выполняется скрипт инициализации `init.lua`, если он есть. Перед началом работы со скриптами, рекомендуется проверить его наличие рядом со всеми остальными скриптами `*.lua`. Если файла нет, то его нужно создать так же как и вышеописанный `test.lua`.  В нем полезно инициализировать переменные для работы с устройством, а также выполнить какие либо разовые действия. Например:
```lua
-- init.lua --
-- Уведомление в Telegram о старте шлюза --
telegram.settoken("51778***5:AAG0bvK***")
telegram.setchat("-3348***")
telegram.send("SLS загружен!!!")
--[[
  Уведомление в Telegram о времени восхода и заката солнца.
  Для правильной работы необходимо в системных настройках
  заполнить данные о координатах шлюза в меню Settings -> Time & Location
--]]
local sunset_hour, sunset_min = os.sunset()
local sunrise_hour, sunrise_min = os.sunrise()
telegram.send("sunrise " .. sunset_hour .. ":" .. sunset_min)
-- Запуск скрипта для каких-либо ежеминутных проверок/действий --
scripts.setTimer("flush", 60, "bowl")
-- Инициализация объектов для обмена между скриптами --
obj.setOpt("there.is.no.spoon", "BOOL")
obj.set("there.is.no.spoon", true, true)
```

### Запуск скрипта при изменении состояния устройства
Скрипт можно запускать как одно из правил [SimpleBind](simplebind_rus.md).

Синтаксис: `scriptname.lua[,Param]`

Например, так может выглядеть запись SB Rule для датчика открытия![](img\luaSBRule.png)

- `mainDoorOnLight.lua` - имя запускаемого скрипта
- `Param` - необязательный параметр, через который в скрипт можно передать необходимые аргументы. Принимается он в скрипте через Событие `Event.Param`
<!--	#ToDo - добавить ссылку на описание событий -->
Аргументов может быть несколько. В данном примере передается 3 аргумента, разделенные символом `:`: целевое устройство, которым должен управлять датчик по сработке; контролируемый статус; задержка управляющего действия. Если аргументы не прописывать, то при изменении условий, придется менять эти значения в теле скрипта.
<!--	#ToDo - добавить пример кода -->

### Запуск скрипта по событию изменения объекта
<!--	#ToDo - в документации вендора данный пункт ссылается на несуществующий раздел.
Выяснить где можно его применять, кроме объектов io.input0.*
Остальные, кастомные, объекты изменяются из скриптов. Почему бы не вызывать нужный скрипт из них, а не через onChange?
Добавить ссылку на описание Объектов
-->
Синтаксис: `obj.onChange('objName', 'script.lua')`
- objName - имя контролируемого объекта
- script.lua - имя скрипта, вызываемого при возникновении события

Например, можно вызвать скрипт по событию нажатия аппаратной кнопки шлюза. Реагировать можно на объекты `io.input0.*`. Включим "режим сопряжения" по нажатию на кнопку:
1. в `init.lua` добавить код: `obj.onChange("io.input0.value", "btn_sw1.lua")`
2. создать `btn_sw1.lua` с кодом: `zigbee.join(255, "0x0000")`
<!--	#ToDo - добавить ссылку на описание join  -->
 
### Запуск LUA скрипта из другого скрипта

Синтаксис: `dofile("/int/test.lua")`

### Запуск скрипта с помощью HTTP API

Скрипт SLS можно вызвать из внешней системы используя [HTTP API](http_api_rus.md):
`/api/scripts?action=evalFile&path=/test.lua`


## Список доступных функций и структур
1. [http.request()](lua2_rus.md#httprequest)
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

### os.led(r, g, b[, mode])

r, g, b - целые числа 0-255, устанавливает цвет светодиода на шлюзе. Можно использовать -1 для соответствующего цвета, если не нужно менять.

mode:
* 0 - выключено,
* 1 - ручной,
* 2 - авто

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

### Включение "режима сопряжения" при нажатии на боковую кнопку  шлюза
Необходимо привязать скрипт `btn_sw1.lua` к `io.input0.value` который будет вызываться при нажатии на кнопку:
```lua
obj.onChange("io.input0.value", "btn_sw1.lua")
```

В скрипт `btn_sw1.lua` нужно добавить следующий код:
```lua
zigbee.join(255, "0x0000")
```

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


### Отправка сообщения в телеграм с помощью вашего бота

```lua
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

```lua
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

```lua
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
```lua
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


```lua
-- добавьте в init.lua
telegram.settoken("5961....:AAHJP4...")
telegram.setchat("5748.....")

-- добавьте в любой lua скрипт где требуется оповещение
telegram.send("Температура: " .. string.format("%.2f", zigbee.value(tostring(Event.ieeeAddr), "temperature")) .. "°C, Влажность: " .. string.format("%.2f",zigbee.value(tostring(Event.ieeeAddr), "humidity")) .. "%")
```

### Подсветка шлюза по датчику движению только в ночное время с 22 до 6

Вариант через GPIO

```lua
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
```lua
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
```lua
obj.set("security_status", "armed")
```

Проверка
```lua
if obj.get("security_status")=="armed" then 
  print("Объект на охране.")
else 
  print("Объект не на охране.")
end
```

### Включение звука дверного звонка по событию (звуковой файл лежит в открытой сети)

192.168.1.5 - адрес другого шлюза. Нельзя запускать на самом себе таким образом, используйте объект audio.

```lua
http.request("http://192.168.1.5/audio?action=setvolume&value=100")
http.request("http://192.168.1.5/audio?action=play&url=http://funny-dog.surge.sh/door_bell.mp3")
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


### Преобразование показателей давления из кПа в мм.рт.ст.

Необходимо создать lua скрипт, который будет вызываться при изменении pressure:

```lua
local press = zigbee.value(tostring(Event.ieeeAddr), "pressure")
local pressmm = zigbee.value(tostring(Event.ieeeAddr), "pressure_mm")
zigbee.setState(Event.ieeeAddr, "pressure_mm", press * 7.5, "FLOAT")
```

### Запрос данных от устройств через скрипт, например запрос мгновенного потребления, если устройство само не оповещает

`zigbee.get("0x842E14FFFE05B8E2", "power")` в файле `onemintimer.lua` где  `0x842E14FFFE05B8E2` - идентификатор устройсва

### Пример работы с астротаймером

Астротаймером называется обычный таймер, имеющий привязку к циклам захода\восхода солнца.
Так как на разной широте время захода и восхода отличается, то в таких таймерах присутствует установка долготы/широты. Параметры долготы/широты задаются через Web на вкладке *Settings->Location*.

Астротаймер вызывавается скриптом `OneMinTimer.lua` каждую минуту:

```lua
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

```lua
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

```lua
sunrise_h, sunrise_m = os.sunrise()
sunset_h, sunset_m = os.sunset()
sunshine = (Event.Time.hour*60+Event.Time.min)>(sunrise_h*60+sunrise_m) and (Event.Time.hour*60+Event.Time.min)<(sunset_h*60+sunset_m)
```
sunshine -  булева переменная, показывает время суток, дневное или вечернее. 

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
telegram.send("SLS загружен!!!")

local sunset_hour, sunset_min = os.sunset()
local sunrise_hour, sunrise_min = os.sunrise()
telegram.send("sunrise " ..sunset_hour  ..":".. sunset_min )
```



## Полезные ссылки 
1) On-line учебник по [lua](https://zserge.wordpress.com/2012/02/23/lua-%D0%B7%D0%B0-60-%D0%BC%D0%B8%D0%BD%D1%83%D1%82/)

2) Генератор lua скриптов  на основе [Blockly](https://blockly-demo.appspot.com/static/demos/code/index.html)
