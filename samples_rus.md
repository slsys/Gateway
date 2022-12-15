# Примеры типовых сценариев

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
