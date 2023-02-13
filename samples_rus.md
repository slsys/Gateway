- [Главная (LUA)](/lua_rus.md)

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
```
[22:28:49.552] [Scripts] Event.State.OldValue	true
[22:28:49.558] [Scripts] Event.State.Name	contact
[22:28:49.563] [Scripts] Event.State.Value	false
[22:28:49.568] [Scripts] Event.Name			tables.lua
[22:28:49.667] [Scripts] Event.Type			1
[22:28:49.672] [Scripts] Event.Param
[22:28:49.678] [Scripts] Event.nwkAddr		42108
[22:28:49.687] [Scripts] Event.Time.min		28
[22:28:49.694] [Scripts] Event.Time.month	12
[22:28:49.702] [Scripts] Event.Time.year	2022
[22:28:49.709] [Scripts] Event.Time.sec		49
[22:28:49.713] [Scripts] Event.Time.hour	22
[22:28:49.721] [Scripts] Event.Time.wday	5
[22:28:49.726] [Scripts] Event.Time.day		9
[22:28:49.733] [Scripts] Event.ModelId		lumi.sensor_magnet
[22:28:49.738] [Scripts] Event.FreindlyName	
[22:28:49.745] [Scripts] Event.ieeeAddr		0x0123456789ABCDEF
```
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
### Обработка нажатий кнопки и управление светом
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
### Запуск скрипта каждые 60 секунд
```lua
scripts.setTimer("getMoney", 60, "$")
```
### Запуск скрипта через 5 минут, однократно
```lua
scripts.setTimer("giveMoney", os.time() + 300)
```
### Запуск скрипта каждый день в 01:05
```lua
scripts.setTimer("earnMoney", "5 1 * * *")
```
### Сброс таймера для скрипта OneMinTimer.lua
```lua
scripts.setTimer("OneMinTimer", 0)
```
### Отправка данных каждую минуту на narodmon.ru
```lua
function SendNarodmon(name, value)
  local MAC = "BC:DD:C2:D7:68:BC"
  http.request("http://narodmon.ru/get?ID=" .. MAC .. "&" .. name .. "=" .. tostring(value))
end  

local value = zigbee.value("0x04CF8CDF3C771F6C", "illuminance")
SendNarodmon("illuminance", value)
```
###  Задачи cron
```lua
--init.lua
-- Аквариум 
scripts.setTimer("crontab", "5 6 * * 1-5", "aqua_on") -- Время включения 6:05 в будни:
scripts.setTimer("crontab", "0 22 * * 1-5", "aqua_off") -- Время выключения 22:00 в будни:
-- Будильник 
scripts.setTimer("alarmClock", "50 5 * * 1-5", 1) -- Сценарий №1. По будням в 5:50
```

```lua
--crontab.lua
local action = Event.Param

if (action == "aqua_on") then
  zigbee.set("0xA4C138E56B96596D", "state", "ON")
elseif (action == "aqua_off") then
  zigbee.set("0xA4C138E56B96596D", "state", "OFF")
end

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
1. при нажатии кнопки переключает лампу 0x00124B0009FE36FC, через установку состояния "State" в "TOGGLE". Должен выполняться из SB Rule
```lua
-- toggleLamp.lua
-- switch 0x00124B0009FE36FC on single lumi.sensor_switch click
if Event.State.Value == "single" then
   zigbee.set("0x00124B0009FE36FC", "state", "toggle")
  end

```

### Создание виртуальных свойств устройства
Пример инициализации с сохранением данных
```lua
local res= zigbee.setState("0x00124B001F7CA144", "prop_float", "FLOAT") 
local res= zigbee.setState("0x00124B001F7CA144", "prop_bool", "BOOL") 
local res= zigbee.setState("0x00124B001F7CA144", "prop_int", "INT") 
local res= zigbee.setState("0x00124B001F7CA144", "prop_int", "STR") 
os.save()
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

## Включение освещения по датчику движения и выключение через определенное время
Такой сценарий легко решается без использования lua скриптов. Разберем пример из датчка движения Aqara lumi.sensor_motion и исполнительного реле на 8 каналов с [modkam](https://modkam.ru/?p=1638).


### Вариант 1 с использованием команд [SimpleBind](/simplebind_rus.md)

На вкладке датчика движения настраиваем при включении occupation=true будет включать освещение, при occupation=false соответственно выключать.

Пример команды SimpleBind для включения реле по датчику движения:
```
true,0x00124B001F7CA144,state_l1,ON;false,0x00124B001F7CA144,state_l1,OFF;
```
![](/img/ocup_sb.png)

С помощью occupancy_timeout можно задать интервал, в течении которого будет сбрасываться значение датчика. 


### Вариант 2 с использованием значений датчика освещения и сценариев [lua](/lua_rus.md)
В данном примере мы будем использовать датчик движения Aqara 	lumi.sensor_motion.aq2 со встроенным датчиком освещенности  и исполнительное реле на 8 каналов с [modkam](https://modkam.ru/?p=1638). 

Создаем сценарий occupancy.lua

```lua
local state =  zigbee.value(tostring(Event.ieeeAddr), "occupancy")
local lightlevel =  zigbee.value(tostring(Event.ieeeAddr), "illuminance")
local minlightlevel=300 --зададим минимальный уровень освещенности, когда необходимо включать освещение

if (state) then telegram.send("Датчик движения ".. Event.FriendlyName  .." обнаружил активность") 
  
if (lightlevel<minlightlevel) then 
  zigbee.set("0x00124B001F7CA144", "state_l2", "ON")
  telegram.send("Свет в комнате ".. Event.FriendlyName  .." включили") 
end    
    
    
 else
  telegram.send("Значение датчика движения "..  Event.FriendlyName .."  нормализовалось") 
  
  if (lightlevel<minlightlevel) then 
  zigbee.set("0x00124B001F7CA144", "state_l2", "OFF")
  telegram.send("Свет в комнате ".. Event.FriendlyName  .." выключили") 
end    
end 
```
На вкладке датчика движения привязываем сценарий 

![](/img/ocup_lua21.png)



### Вариант 3 с использованием астротаймера и сценариев [lua](/lua_rus.md)

В данном примере мы будем использовать любой датчик движения, а в качестве определения необходимости включения освещения будем использовать астро-таймер, встроенный в SLS шлюз. Управлять будем реле на 8 каналов с [modkam](https://modkam.ru/?p=1638).  Перед использованнием астротаймера, не забудьте в настройках системы указать ваши коодинаты:

![](/img/astrosettings.png)

Создаем сценарий occupancy_astro.lua

```lua
local state =  zigbee.value(tostring(Event.ieeeAddr), "occupancy")

local sunset_hour, sunset_min = os.sunset() --закат 
local sunrise_hour, sunrise_min = os.sunrise() --рассвет

local str=Event.Param 
local p = {}
 
for  x in string.gmatch(str,'([^:]+)') do
  table.insert(p, x) 
end

local ieee=p[1]
local par=p[2]

zigbee.setState(ieee, par.."_activate_on", "STR")  --добавляем переменную для хранения информации, что управляемый сенсор включен датчиком движения

if (state) then 


	if Event.Time.hour >= sunset_hour or Event.Time.hour <= sunrise_hour  then

  --если выключен, мы его включаем и записываем, кто включил
 if (zigbee.value(ieee, par)=="OFF")      then  
     zigbee.set(ieee, par, "ON")
     zigbee.set(ieee, par.."_activate_on", "PIR")
-- 	 telegram.send("Свет в комнате ".. Event.FriendlyName  .." включили") 
	end    
    end      
    
    
 else


  if Event.Time.hour >= sunset_hour or Event.Time.hour <= sunrise_hour   then
    
--проверяем, если включен не датчиком движений PIR, то не трогаем    
if (zigbee.value(ieee, par.."_activate_on") )=="PIR"    then 
  zigbee.set(ieee, par, "OFF")
  zigbee.set(ieee, par.."_activate_on", "")    
---  telegram.send("Свет в комнате ".. Event.FriendlyName  .." выключили") 
      
	end      
    end    
	end	
```

Для корректной работы   сценария, необходимо передать два параметра через двоеточие, наример:  occupancy_astro.lua,0x00124B001F7CA144:state_l1.
Сценарий запоминает, что свет включен по датчику движения, и выключает только в том случае, если был включен по датчику движения. 


### Вариант 4. Привязка нескольких устройств  с использованием астротаймера и сценариев [lua](/lua_rus.md)

При вызове lua скрипта необходимо в виде параметров передать список привязываемых устройств. Пример параметров:
```
occupancy_astro2.lua,0x00124B001EC83D62:state_l4/0x00124B001EC83D62:state_l2
```

Пример сценария occupancy_astro2.lua

```lua
local state =  zigbee.value(tostring(Event.ieeeAddr), "occupancy")

local sunset_hour, sunset_min = os.sunset() --закат 
local sunrise_hour, sunrise_min = os.sunrise() --рассвет

local str=Event.Param 

--telegram.send(str) 


for  x1 in string.gmatch(str,'([^/]+)') do
  
local p = {}  
for  x2 in string.gmatch(x1,'([^:]+)') do
     table.insert(p, x2) 
end

local ieee=p[1]
local par=p[2]

zigbee.setState(ieee, par.."_activate_on", "STR")  --добавляем переменную для хранения информации, что управляемый сенсор включен датчиком движения

if (state) then 


	if Event.Time.hour >= sunset_hour or Event.Time.hour <= sunrise_hour  then
	--если выключен, мы его включаем и записываем, кто включил
 		if (zigbee.value(ieee, par)=="OFF")      then  
     		zigbee.set(ieee, par, "ON")
     		zigbee.set(ieee, par.."_activate_on", "PIR")
		--telegram.send("Свет в комнате ".. Event.FriendlyName  .." включили ("..par..")") 
		end    
    	end
	else


	if Event.Time.hour >= sunset_hour or Event.Time.hour <= sunrise_hour   then
    
		--проверяем, если включен не датчиком движений PIR, то не трогаем    
		if (zigbee.value(ieee, par.."_activate_on") )=="PIR"    then 
  		zigbee.set(ieee, par, "OFF")
  		zigbee.set(ieee, par.."_activate_on", "")    
  		--telegram.send("Свет в комнате ".. Event.FriendlyName  .." выключили") 
		end
	end
end

  --на всякий случай чисти переменные
  p=nill
  ieee=nill
  par=nill
end
```  


### Уведомление в телеграм об открытии двери

```lua
if (Event.State.Value ~= Event.State.OldValue) then
  if (Event.State.Value == 'true') then
    telegram.send("Дверь закрыта") 
  else
    telegram.send("Дверь открыта")
  end 
end 
```

### Оповещение в телеграм при сработке датчика движения

```lua
local state =  zigbee.value(tostring(Event.ieeeAddr), "occupancy")
if (state) then
  telegram.send("Датчик движения ".. Event.ieeeAddr  .." обнаружил активность")
else
  telegram.send("Значение датчика ".. Event.FriendlyName .." движения нормализовалось")
end
```

###  Оповещение об изменении значения датчика температуры/влажности
```lua
local temp =  round2(zigbee.value(tostring(Event.ieeeAddr), "temperature"),1)
local hum =  round2(zigbee.value(tostring(Event.ieeeAddr), "humidity"),1)
telegram.send("Значение ДТВ ".. Event.FriendlyName .. " ".. temp.."° / " .. hum .. "%") 
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




### Преобразование показателей давления из кПа в мм.рт.ст.

Необходимо создать lua скрипт, который будет вызываться при изменении pressure:

```lua
local press = zigbee.value(tostring(Event.ieeeAddr), "pressure")
local pressmm = zigbee.value(tostring(Event.ieeeAddr), "pressure_mm")
zigbee.setState(Event.ieeeAddr, "pressure_mm", press * 7.5, "FLOAT")
```

### Включение звука дверного звонка по событию (звуковой файл лежит в открытой сети)

192.168.1.5 - адрес другого шлюза. Нельзя запускать на самом себе таким образом, используйте объект audio.

```lua
http.request("http://192.168.1.5/audio?action=setvolume&value=100")
http.request("http://192.168.1.5/audio?action=play&url=http://funny-dog.surge.sh/door_bell.mp3")
```

## Воспроизведение звука при нажатии кнопки (звонок)

```lua
--zvonok.lua   скрипт ставим на датчик открытия двери если кнопка ON меняем на Single (одиночное нажатие)
if Event.State.Value == "ON" then
audio.setvolume(100)
audio.playurl("http://funny-dog.surge.sh/door_bell.mp3")
end
```

## Управляем открытием/закрытием привода штор Tuya с помощью zigbee кнопки WXKG01LM

Создаем сценарий curtian.lua:
```lua
local str=Event.Param 
local p = {}
 
for  x in string.gmatch(str,'([^:]+)') do
  table.insert(p, x) 
end

local remoteieee=p[1] -- ieee адрес привода для штор
local minlevel=p[2] --зададим минимальный уровень
local maxlevel=p[3] --зададим максимальный уровень

local btn=zigbee.value(tostring(Event.ieeeAddr), "action") 


if (btn=="single") then --при однократном нажатии переключим шторы в противоположный режим
                 zigbee.get(remoteieee, "running")
local running =  zigbee.value(remoteieee, "running")

if (running==true) then 
      zigbee.set(remoteieee, "state", "STOP")
else 
local position =  zigbee.value(remoteieee, "position")

if (tonumber(position)<=tonumber(maxlevel)-10) then 
zigbee.set(remoteieee, "position", maxlevel)
else
zigbee.set(remoteieee, "position", minlevel)

  
 end
 end
 end

if (btn=="double") then  --при двукратном  нажатии откроем шторы
    zigbee.set(remoteieee, "position", maxlevel)
end

if (btn=="triple") then --при трехкратном  нажатии закроем шторы
    zigbee.set(remoteieee, "position", minlevel)
end

if (btn=="long_release") then --при длительном  нажатии остановим привод
    zigbee.set(remoteieee, "state", "STOP")
end
```

В разделе SB выключателя WXKG01LM в метрике action прописываем вызов сценария curtain.lua, ieee адрес привода Tuya, значение position при открытии и  значение при закрытии.

```curtain.lua,0x5C0272FFFECAAC69:0:75```

Теперь при однократном нажатии кнопки осуществляется переключение в противоположный режим, при двукратном - открытие, трекратном  - закрытие.

## Периодическое включение/отключение циркуляционного насоса по таймеру

onemintimer.lua:
```lua
--включаем цикруляцию ГВС каждые 10 минут
if (Event.Time.min == 0 ) or (Event.Time.min == 20 )   or (Event.Time.min == 40 ) then
  zigbee.set("0x00124B001EC823EC", "state_l1", "OFF")
telegram.send("Цикруляция ГВС выключена") 
end
if (Event.Time.min == 10 ) or (Event.Time.min == 30 )   or (Event.Time.min == 50 ) then
  zigbee.set("0x00124B001EC823EC", "state_l1", "ON") 
telegram.send("Цикруляция ГВС включена") end
```
## Управление адресными светодиодами, подключенными к контроллеру [WLED](https://github.com/Aircoookie/WLED)
WLED поддерживает множество вариантов управления, в том числе mqtt. Ниже собраны  примеры кода на lua для управления через mqtt.

Включение, переключение режима:
```lua
mqtt.pub('wled/f6dafd', 'toggle')
mqtt.pub('wled/f6dafd', 'on')
mqtt.pub('wled/f6dafd', 'off')
```
Установка  заданного цвета:
```lua
mqtt.pub('wled/f6dafd/col', '#36A615DD')
```
Установка  произвольного  цвета:
```lua
mqtt.pub('wled/f6dafd/col', '#'..math.random(0,16777215))  
```
Установка произвольного эффекта и отключение эффектов:
```lua
mqtt.pub('wled/f6dafd/api', 'win&A=128&FX='..math.random(0, 50)) -- установка произвольного эффекта
mqtt.pub('wled/f6dafd/api', 'win&A=128&FX=0') -- отключение  эффектов
```

Управление и переключение режимов теперь легко можно "повешать" на zigbee-кнопку, поддерживаеющие многократные нажатия. 

## Оповещение в telegram о сработке датчика протечки 
```lua
local state =  zigbee.value(tostring(Event.ieeeAddr), "water_leak")
if (state) then
telegram.send("Внимание!!! Сработал датчик протечки "..Event.FriendlyName)
zigbee.set("0x000D6F001314C316", "warning", 2)
else
telegram.send("Протечка на датчике  "..Event.FriendlyName .. " устранена")
end
```

## Обработка двойного, тройного и тд нажатия на выключателях, которые не поддерживают такие режимы
Данный сценарий тестировался для выключателей, которые подключены к [8-ми канальному реле modkam](https://modkam.ru/2020/06/24/zigbee-rele-na-8-kanalov/) и привода для штор от Aqara.  При первом нажатии создается таймер на 3 секунды, который инциирует действия. 

callback.lua (привязывается в интерфейсе к каналу, который будем считать)
```lua
function search_value (tbl, val)
    for i = 1, #tbl do
        if tbl[i][1] == val then
            return i
        end
    end
    return nil
end


if (Event.State.Value ~= Event.State.OldValue) then

  local ar = {
  {"0x00124B001EC84F3C.state_l8","0x00158D0002EE1285", 'cover'},  --спальня
  {"0x00124B001F7CA144.state_l2","0x50325FFFFEA65978", 'cover'},  --Анюта
  {"0x00124B001F7CA144.state_l8","0x50325FFFFEA457C4", 'cover'},  --Софа
  {"0x00124B001EC80F20.state_l7","0x5C0272FFFECAAC69", 'cover'},  --Гостиная    
  {"0x00124B001EC84F3C.state_l7","hello",'telega'}}
 

 myevent=Event.ieeeAddr .. "." .. Event.State.Name
  
 remotedev= ar[search_value(ar, myevent)][2]
 remotetype=ar[search_value(ar, myevent)][3] 

  
obj.setOpt(remotedev.. "_cnt","INT",true)
obj.setOpt(remotedev.. "_timer","BOOL",true)


timer=obj.get(remotedev.. "_timer")
obj.set(remotedev.."_cnt" ,obj.get(remotedev.."_cnt")+1)  

  
  
  --проверяем, если скрипт был запущен давно и не сбросился
  curr, prev = obj.getTime(remotedev.. "_timer")
  
  if  (timer==true and  os.time()- curr>60) then

     obj.set(remotedev.. "_timer",false) 
     obj.set(remotedev.."_cnt" ,0)  
 --    telegram.send("сбросили таймер и счетчик")
   end 
  
  
  --запускам таймер сброса на 3 сек
  if  (timer==false) then 
--telegram.send(" запускаю scripts.setTimer(clear_cnt)")

   scripts.setTimer("clear_cnt", os.time() + 3,remotedev) 
   obj.set(remotedev.. "_timer",true)   
   end
   end
  ``` 
  
 Сценарий, который выполняет сами действия clear_cnt.lua
  ```lua
  --telegram.send(Event.Param) 
remotedev=Event.Param
val=obj.get(remotedev.."_cnt")
if (val>1) then 
obj.set(remotedev.."_cnt" ,0) 
obj.set(remotedev.."_timer",false)
  
--telegram.send(val..", счетчик сброшен,"..remotedev)
scripts.setTimer("clear_cnt", 0)  
end

if (val==4) then 
--      telegram.send("val:"..val) 
  position=zigbee.value(remotedev, "position")
--    telegram.send("position:"..position) 
  if (position>6) then 
--   telegram.send("закрываю шторы") 
   zigbee.set(remotedev, "position", 0)
    else 
 --   telegram.send("открываю шторы")
    zigbee.set(remotedev, "position", 100)
    end 
    end
  ```
  
  
## Отключение света через 15 минут после включения

Данный сценарий тестировался для выключателей, которые подключены к [8-ми канальному реле modkam](https://modkam.ru/2020/06/24/zigbee-rele-na-8-kanalov/). Сценарий удобно применять в помещениях, где пребывание обычно недолгое, например гардеробная комната, прихожая и т.д., где дети всегда часто забывают выключать свет.  На всякий случай предусмотрим передачу параметров (если тригером будет не сам объект), для этого привяжем к управляемой линии вызов сценария toggle_timer

![toggle_timer](/img/toggle_timer.png)

Сценарий toggle_timer.lua:
```lua
local p = {}
local waittime=900
 
for  x in string.gmatch(Event.Param ,'([^:]+)') do
  table.insert(p, x) 
end

local ieee=p[1]
local parname=p[2]

local state =  zigbee.value(ieee, parname)
local timer=obj.get(ieee.. "_"..parname.."_timer") 
local  curr, prev = obj.getTime(ieee.. "_"..parname.."_timer")
obj.setOpt(ieee.. "_"..parname.."_timer","BOOL",true)


 --сброс таймера, если по какойто причине таймер просрочен
if (state=="ON" and timer==true and  os.time()- curr>waittime+10)  then 
     obj.set(ieee.. "_"..parname.."_timer",false) 
   end 
  
  --запускам таймер выключения
  if  (state=="ON" and timer==false) then 
   scripts.setTimer("toggle_timer2", os.time() + waittime,ieee..":"..parname) 
   obj.set(ieee.. "_"..parname.."_timer",true) 
   end
```
сценарий, который будет вызываться по таймеру (выключение света) toggle_timer2.lua:
```lua

local p = {}
 
for  x in string.gmatch(Event.Param,'([^:]+)') do
  table.insert(p, x) 
end

local ieee=p[1]
local parname=p[2]

zigbee.set(ieee, parname, "OFF")
obj.set(ieee.. "_"..parname.."_timer",false)
--telegram.send(ieee.."."..parname.." выключен по таймеру")
scripts.setTimer("toggle_timer2", 0) 
```
  
## Сохранение значений в json через lua
Пример сценария для записи значений в локальное [хранилище](/storage_rus.md) (int или sd), сценарий сохраняет файл с именем файла, равным дате. В виду того, что для преобразования записанного файла в json используется память SLS, не рекомендуется запускать часто. В случае переполнения памяти, запись готового json не будет выполнена.  Пример отображения [графиков](/ui_graph_rus.md) через ui.html.  
```lua 
local new_ust, prev_ust = obj.get('thermo.boiler.target_temperature') --получение текущего значения уставки 
local ul_ot, prev_ul_ot = obj.get('thermo.boiler.temperature_outside')--получение уличной темпетуры с котла по ОТ
local new_ds18, prev_ds18 = obj.get('1w.28-96A907D6013C/temperature') --получение  значения датчика температуры 
local ul_bt, prev_bt = obj.get('thermo.boiler.temperature')--получение температуры теплоносителя (отопления)
local new_dhwt, prev_dhwt = obj.get('thermo.dhw.temperature') --получение температуры бойлера
local dhwst, prev_dhwst = obj.get('thermo.dhw.status')       --нагрев воды
local flame, prev_flame = obj.get('thermo.boiler.flame') --нагрев отопления
local avr_temp,  avr_temp = obj.get('average_temp')       --средняя температура в доме


if (flame=="true") then flame_status=100 else flame_status=0 end  --переназнчаем, так как почему-то значения хранятся в STRING
if (dhwst=="true") then dhwst_status=100 else dhwst_status=0 end  --переназнчаем, так как почему-то значения хранятся в STRING


local cdate=string.format("%02d", Event.Time.day).."/"..string.format("%02d", Event.Time.month).."/"..Event.Time.year  --приводим дату в нужный формат
local ctime=string.format("%02d", Event.Time.hour)..":"..string.format("%02d", Event.Time.min)..":"..string.format("%02d", Event.Time.sec) --приводим время  в нужный формат
local ctimesh=string.format("%02d", Event.Time.hour)..":"..string.format("%02d", Event.Time.min) --приводим время  в краткий формат
--local storage='int'   --для записи во внутренню память
local storage='sd'      --для записи на карту памяти
local fn="/"..storage.."/!log_"..string.gsub(cdate, '/', '_')..".txt"
local fnjs="/"..storage.."/!log_"..string.gsub(cdate, '/', '_')..".json"

os.fileWrite(fn,'{"new_ust":'..new_ust..',"ul_ot":'.. ul_ot.. ',"new_ds18":'..new_ds18..',"ul_bt":'..ul_bt..',"new_dhwt":'.. new_dhwt .. ',"unixtime":'..os.time().. 
',"datetime":"'..cdate.." "..ctime..'","dhwt_status":'.. dhwst_status..',"flame_status":'.. flame_status..',"average_temp":'.. avr_temp..',"ctimesh":"'.. ctimesh..  '"},\n',true)

value = os.fileRead(fn)
local js='{"temp":['..value..']}'
js=string.gsub(js, ',\n]}', '\n]}')

os.fileWrite(fnjs,js)
print("Список файлов доступен тут http://"..net.localIP().."/api/storage?path=/"..storage.."/")

local free=http.request2("http://"..net.localIP().."/api/storage/info")

print("http://"..net.localIP().."/api/storage?path="..fnjs)

```
