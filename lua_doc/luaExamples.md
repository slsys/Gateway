- [Главная (LUA)](/lua_doc/luaDoc.md)

[[toc]]
# Примеры скриптов
## Скрипт инициализации
```lua
-- init.lua --
-- Таймер. Ежеминутный запуск скрипта для отслеживания юзеров в сети
scripts.setTimer("personesTracker.lua", 60)
-- Таймер. Запуск скрипта для каких-либо ежеминутных проверок/действий
scripts.setTimer("flush", 60, "bowl")
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
-- Инициализация объектов для обмена между скриптами --
obj.setOpt("there.is.no.spoon", "BOOL")
obj.set("there.is.no.spoon", true, true)
-- Привязка скрипта btn_sw1.lua к событию нажатия аппаратной кнопки шлюза --
obj.onChange("io.input0.value", "btn_sw1.lua")
```
## События
### Разбор всех свойств событий
При разработке сценариев, часто требуется получить все параметры, передаваемые в него через события. Но, не все свойства бывают описаны в документации. Особенно при добавлении в прошивку новых функций или доработке существующих. Для получения и разбора всех свойств, может помочь такой пример:
```lua
for key, val in pairs(Event) do
  if type(val) == "table" then
    for key2, val2 in pairs(val) do
      print("Event." .. key .. "." .. key2, val2)
    end
  else
    print("Event." .. key, val)  
  end
end

```
Пример вывода:

![luaEventsParser](/img/luaEventsParser.png)
### Включение режима сопряжения по нажатию на кнопку шлюза
По нажатию на аппаратную кнопку будет включаться режим сопряжения (Join) Zigbee устройств. 
1. в `init.lua` добавить код: 
```lua
obj.onChange("io.input0.value", "btn_sw1.lua")
```
2. создать `btn_sw1.lua` с кодом: 
```lua
zigbee.join(255, "0x0000")
```
### Обработка нажатий кнопки и управление сетом
####  Переключение света через управление яркостью
```lua
-- однократное нажатие, включить свет (яркость max)
if Event.State.Value == "single" then 
  value = 255 
-- двойное нажатие, выключить свет (яркость 0)
elseif Event.State.Value == "double" then 
  value = 0 
-- другие нажатия - ничего не делать
else 
  return 
end
-- непосредственно, отправка полученного значения в целевое устройство
zigbee.set("lamp_1", "brightness", value)
```
#### Переключение света
```lua
if Event.State.Value == "single" then 
  value = "ON" 
elseif Event.State.Value == "double" then 
  value = "OFF" 
else 
  return 
end
zigbee.set("lamp_1", "state", value)
```

## Таймеры
Запуск скрипта каждые 60 секунд:
```lua
scripts.setTimer("getMoney", 60, "$")
```
Запуск скрипта через 5 минут, однократно:
```lua
scripts.setTimer("giveMoney", os.time() + 300)
```
Запуск скрипта каждый день в 01:05:
```lua
scripts.setTimer("earnMoney", "5 1 * * *")
```
Сброс таймера для скрипта OneMinTimer.lua:
```lua
scripts.setTimer("OneMinTimer", 0)
```

## Объекты

## Zigbee
### Включение режим сопряжения для подключения новых устройств, через роутер 
```lua
zigbee.join(255, "plug1")
-- включить JOIN через роутер "plug1", на 255 секунд
```

### Получение значения состояния устройства из кэша
```lua
-- Получаем значение температуры и округляем до целого  
temp = zigbee.value("0x00158D0001A2D2FE", "temperature")
-- Вместо адреса устройства можно использовать FriendlyName, в том числе кириллицу; либо текущий адрес устройства в сети (0x9EC8).
-- temp = zigbee.value("датчик в комнате", "temperature")
temp = math.floor(temp)
print("Текущая температура: " .. temp .. " C°")
```
### Получение значения состояния устройства вызовом GET в конвертере
```lua
-- Получаем значение яркости лампочки
zigbee.get("lamPochka", "brightness")
```

Установка значения  устройства 

### Переключение лампочки при нажатии кнопки выключателя
1. при нажатии кнопки выключателя переключает лампу 'lamp_1' через контроль яркости. Может выполняться как самостоятельно, например по таймеру, так и из правила Simple Bind

```lua
-- получаем значение состояния 'click' кнопки 'lumi.sensor_switch'
-- если значение = single
if zigbee.value("lumi.sensor_switch", "click") == "single" then
  -- переключаем (toggle) лампу
  -- получим текущее значение яркости лампы
  current_brightness = zigbee.value("lamp_1", "brightness")
  -- если лампа выключена (яркость = 0)
  if current_brightness == 0 then
    -- включим её
    zigbee.set("lamp_1", "brightness", 255)
  else -- если включена (значение яркости отлично от 0)
    -- включим
    zigbee.set("lamp_1", "brightness", 0)
  end
end
```
2. при нажатии кнопки переключает лампу 0x00124B0009FE36FC, через установку состояния "State" в "TOGGLE". Должен выполняться из SB Rule
```lua
-- toggleLamp.lua
-- switch 0x00124B0009FE36FC on single lumi.sensor_switch click
if Event.State.Value == "single" then
   zigbee.set("0x00124B0009FE36FC", "state", "toggle")
  end

```
### Преобразование показателей давления из kPa в mmhg
Необходимо создать lua скрипт и назначить его вызов при изменении pressure:

```lua
-- kPa2mmhg.lua
local press = zigbee.value(tostring(Event.ieeeAddr), "pressure")
local pressmm = zigbee.value(tostring(Event.ieeeAddr), "pressure_mm")
zigbee.setState(Event.ieeeAddr, "pressure_mm", press * 7.5, "FLOAT")
```

## HTTP запросы
### Пример отправки POST запроса
```lua
http.request2("http://postman-echo.com:80/post?foo1=bar1", "POST", "Content-Type: text/text; charset=utf-8\r\n", "body") 
-- Альтернативный вариант:
http.request("http://postman-echo.com:80/post?foo1=bar1", "POST", "Content-Type: text/text; charset=utf-8\r\n", "body") 
```
### Переключение gpio 12 для прошивки wifi-iot
```lua
http.request("http://192.168.1.34/gpio?st=2&pin=12")
```
### Переключение реле sw1 в прошивке espHome
```lua
http.request("http://192.168.1.71/switch/sw1/toggle", "POST") 
```
### Переключение gpio для MegaD при однократном нажатии btn_2 пульта Jager
```lua
if Event.State.Value == "btn_2_single"  then
  http.request("http://192.168.2.200/objects/?object=MegaD1-12&op=m&m=switch")
end
```
### Запрос информации со стороннего ресурса
```lua
local Response = http.request("http://wtfismyip.com/text")
print("My IP: " .. Response)
```

## Библиотека OS
### Получение текущего часа, времени и секунд, например для планировщика в таймере:
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
### Управление адресными светодиодами
#### Шлюз SLS в корпусе Xiaomi
[Модернизированный  шлюз Xiaomi](https://modkam.ru/2019/11/25/obnovljaem-shljuz-xiaomi/) или индикаторное кольцо с обычными светодиодами.  На странице настроек *Settings-> Hardware* необходимо выполнить настройки:

![](/img/luaIntLedGPIOSettings.png)

#### Шлюз SLS DIN MINI (индикаторный светодиод)
На странице настроек *Settings -> Hardware* необходимо установить: *Led Red (or addr): 21*, указать количество светодиодов *Number addressable leds: 1*.

#### Светодиодное кольцо Modkam
![](https://modkam.ru/wp-content/uploads/2019/11/Mi_Gateway_Shield02.jpg).
На странице настроек *Settings -> Hardware* необходимо установить: *Led Red (or addr): 21*, указать количество светодиодов *Number addressable leds: 1*.

#### Примеры управления светодиодами:
```lua
os.led('ON',255,200,1, 1) -- красный, с максимальной яркостью
os.led('ON',255,1,250, 1) -- зеленый, с максимальной яркостью
os.led('ON',255,1,1, 255) -- синий, с максимальной яркостью
os.led('ON',255,200,100,100,10) -- включить эффект номер 10
os.led('OFF') -- выключить
os.led('AUTO') -- вернуть к индикации состояния шлюза
```
