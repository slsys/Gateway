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

```
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

```
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

zigbee.add(ieee, par.."_activate_on", "STR")  --добавляем переменную для хранения информации, что управляемый сенсор включен датчиком движения

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

```
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

zigbee.add(ieee, par.."_activate_on", "STR")  --добавляем переменную для хранения информации, что управляемый сенсор включен датчиком движения

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
## Воспроизведение звука при нажатии кнопки (звонок)

```
--zvonok.lua   скрипт ставим на датчик открытия двери если кнопка ON меняем на Single (одиночное нажатие)
if Event.State.Value == "ON" then
audio.setvolume(100)
audio.playurl("http://funny-dog.surge.sh/door_bell.mp3")
end
```

## Управляем открытием/закрытием привода штор Tuya с помощью zigbee кнопки WXKG01LM

Создаем сценарий curtian.lua:
```
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
```
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
WLED поддерживает множество вариантов управления, в том числе mqtt. Ниже собраны  примеры кода на lua для управления 

Включение, переключение режима
```
mqtt.pub('wled/f6dafd', 'toggle')
mqtt.pub('wled/f6dafd', 'on')
mqtt.pub('wled/f6dafd', 'off')
```
Установка  заданного цвета
```
mqtt.pub('wled/f6dafd/col', '#36A615DD')
```
Установка  произвольного  цвета
```
mqtt.pub('wled/f6dafd/col', '#'..math.random(0,16777215))  
```
Установка произвольного эффекта и отключение эффектов
```
mqtt.pub('wled/f6dafd/api', 'win&A=128&FX='..math.random(0, 50)) -- установка произвольного эффекта
mqtt.pub('wled/f6dafd/api', 'win&A=128&FX=0') -- отключение  эффектов
```
