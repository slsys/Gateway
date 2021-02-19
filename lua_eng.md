# Support for lua scripts

The SLS gateway has support for automation based on the scripting programming language [lua](https://ru.wikipedia.org/wiki/Lua). The script editor is located in the Actions -> Scripts menu.

To write a script, you need to create a new file, for example, with the name script.lua and enter the code in the lua language into it.


The script stdout on the print command prints information to the screen of the Scripts page and to the system log of the gateway. You can start the test script by pressing the RUN button.

When the gateway starts, the /init.lua file is executed
![](/img/lua.png)


## Options for running scripts
1) Run the script when the state of the device changes. On the Zigbee tab, you need to go to the device parameters and in the SimpleBind window specify the name of the script file (prefix / optional).
2) Run the script on time. Expected.
3) Running the script by mqtt subscription. Expected.
4) Running the script when calling the http api. /api/scripts?action=evalFile&path=/test.lua.


## List of available functions and structures
1) [http.request ()](lua_eng.md#httprequest)
2) [zigbee.value ()](lua_eng.md#zigbeevalue)
3) [zigbee.get ()](lua_eng.md#zigbeeget)
4) [zigbee.set ()](lua_eng.md#zigbeeset)
5) [Event](lua_eng.md#event)
6) [os.time()](lua_eng.md#ostime)
7) [obj.get()/obj.set ()](lua_eng.md#objget-objset)
8) [mqtt.pub()](lua_eng.md#mqttpub)


### http.request
Calling the request URL http.request (url[:port],[method,headers, body])

Currently only the 'http://' protocol is supported.


Example switching gpio 12 for wifi-iot firmware
```
http.request ("http://192.168.1.34/gpio?st=2&pin=12")
```

An example of sending a POST request:
```
http.request ("http://postman-echo.com:80/post?foo1=bar1", "POST", "Content-Type:text/text; charset=utf-8\r\n", "body ")
```

Example of switching relay sw1 in espHome firmware:

``
  http.request ("http://192.168.1.71/switch/sw1/toggle", "POST")
``

An example of switching gpio for MegaD by pressing btn_2 once on the Jager remote
```
  if Event.State.Value == "btn_2_single" then
    http.request ("http://192.168.2.200/objects/?object=MegaD1-12&op=m&m=switch")
  end
```

Request for information from a third-party resource
```
local Response = http.request ("http://wtfismyip.com/text")
print ("My IP:" .. Response)
```


### zigbee.value ()
Getting device status value from cache zigbee.value ("ieeard", "temperature")

```
- We get the temperature value and round to whole
temp = zigbee.value ("0x00158D0001A2D2FE", "temperature")
temp = math.floor (temp)
print ("Current temperature:" .. temp .. "C °")
```

Instead of the device address, you can use FriendlyName (including Cyrillic), or the current device address on the network (0x9EC8).
```
- We get the temperature value and round to whole
temp = zigbee.value ("room sensor", "temperature")
temp = math.floor (temp)
print ("Current temperature:" .. temp .. "C °")
```

### zigbee.get ()
Calls a GET command in a carpet. Used to manually read states from devices.

Example:
```
  zigbee.get ("lamp1", "brightness")
```


### zigbee.join ()
Syntax: zigbee.join (duration, [target])

Opens the network for connecting new devices for duration seconds (max. 255), for the target device or for the entire network.

```
  zigbee.join (255, "plug1")
```


### zigbee.set ()
Setting device value zigbee.set (Ident, StateName, StateValue)

An example of a script that, when the lumi.sensor_switch button is pressed, turns on the lamp_1 lighting:
```
if zigbee.value ("lumi.sensor_switch", "click") == "single" then
  - toggle lamp
  current_brightness = zigbee.value ("lamp_1", "brightness")
  if current_brightness == 0 then
    zigbee.set ("lamp_1", "brightness", 255)
  else
    zigbee.set ("lamp_1", "brightness", 0)
  end
 


- switch 0x00124B0009FE36FC on single lumi.sensor_switch click
if Event.State.Value == "single" then
   zigbee.set ("0x00124B0009FE36FC", "state", "toggle")
  end

```

### Event
The Event structure, for example, allows you to use the same script for different states or devices.

Possible use cases:
Event.Name - The name of the script file
Event.nwkAddr - the nwkAddr of the device that called the script
Event.ieeeAddr - ieeeAddr of the device that invoked the script
Event.FriendlyName - FriendlyName of the device that called the script
Event.State.Name - The name of the state that caused the script
Event.State.Value - New state value

An example of a script to turn on the light:
```
if Event.State.Value == "single" then
  value = 255
elseif Event.State.Value == "double" then
  value = 0
else
  return
end
zigbee.set ("lamp_1", "brightness", value)
```


### os.time ()
os.time () returns Unix time.

An example of getting the current hour, time and seconds, for example, for a scheduler in a timer:
```
local gmt = 3
local time = os.time () + gmt * 3600;

local t1 = math.modf (time/60); local sec = time - t1 * 60;
local time = t1; local t1 = math.modf (time/60); local min = time - t1 * 60;
local time = t1; local t1 = math.modf (time/24); local hour = time - t1 * 24;
print (hour .. ":" .. min .. ":" .. sec)
```

### os.delay ()
Syntax: os.delay (ms)

Pause for ms milliseconds (1sec = 1000ms)


### os.millis ()
Returns the number of milliseconds since system boot


### os.save ()
Saves data


### os.restart ()
Reboots the OS

### os.ping (host [, count])
Sends ICMP PING requests, returns average time or -1 if unavailable.

### os.led (r, g, b [, mode])
Sets the LED color to 0-255, you can use -1 for the color if you don't need to change. Mode 0-2 - off, manual, auto

### obj.get () / obj.set ()
obj.get (ObjectName) / obj.set (ObjectName, ObjectValue) to save and get an object for exchanging data between scripts


Checking for the existence of an object:
```
local status = obj.get ("security.status")
if (status == nil) then status = 0 end
```

### mqtt.pub ()
Syntax: mqtt.pub (topic, payload)

Publishes the payload value to the MQTT server in the topic topic.


Example of relay control on Tasmota firmware - cmnd/device_name/relay_name
```
  mqtt.pub ('cmnd/sonoff5/power', 'toggle')
````

### Enabling "pairing mode" by pressing the side button of the gateway
When the button is clicked, the btn_sw1.lua script is called
Add the following code to your script:
```
zigbee.join (255, "0x0000")
```


### GPIO control
gpio.mode (pin, mode)

gpio.read (pin) - reading digital

gpio.read (PIN, true) - read ADC

gpio.write (pin, level)

### Sound Control
audio.playurl (url)

audio.geturl ()

audio.stop ()

audio.setvolume (volume_procent)

audio.getvolume ()

audio.getstatus ()


### Minute timer
Just create a script called OneMinTimer.lua, it will run every minute.

An example of sending data every minute to https://narodmon.ru
```
function SendNarodmon (name, value)
  local MAC = "BC: DD: C2: D7: 68: BC"
  http.request ("http://narodmon.ru/get?ID=" .. MAC .. "&" .. name .. "=" .. tostring (value))
end

local value = zigbee.value ("0x04CF8CDF3C771F6C", "illuminance")
SendNarodmon ("illuminance", value)
```


### Sending a message to telegram using your bot
```
local char_to_hex = function (c)
  return string.format ("%%% 02X", string.byte (c))
end

function round (exact, quantum)
    local quant, frac = math.modf (exact/quantum)
    return quantum * (quant + (frac> 0.5 and 1 or 0))
end
local function urlencode (url)
  if url == nil then
    return
  end
  url = url: gsub ("\n", "\r\n")
  url = url: gsub ("([^% w])", char_to_hex)
  url = url: gsub ("", "+")
  return url
end

local hex_to_char = function (x)
  return string.char (tonumber (x, 16))
end

function SendTelegram (text)
  local token = "5177 ...: AAG0b ...." -
  local chat_id = "38806 ....."
  --http.request ("https://api.telegram.org/bot" .. token .. "/sendMessage?chat_id =".. chat_id.."& text="..tostring (text)) - https doesn't work in lua yet
  http.request ("http://212.237.16.93/bot"..token.."/sendMessage?chat_id =" .. chat_id .. "& text="..urlencode (text))
 end




local value = zigbee.value ("0x00158D00036C1508", "temperature")
local text = "temperature:"..round(tostring(value), 2)
SendTelegram (text)

```

### Telegram notification about door opening
```
local char_to_hex = function (c)
  return string.format ("%%%02X", string.byte (c))
end

function round (exact, quantum)
    local quant, frac = math.modf (exact/quantum)
    return quantum * (quant + (frac>0.5 and 1 or 0))
end
local function urlencode (url)
  if url == nil then
    return
  end
  url = url: gsub ("\n", "\r\n")
  url = url: gsub ("([^% w])", char_to_hex)
  url = url: gsub ("", "+")
  return url
end

local hex_to_char = function (x)
  return string.char (tonumber (x, 16))
end

function SendTelegram (text)
  local token = "517781 ...: AAG0 ..."
  local chat_id = "38806 ...."
  --http.request ("https://api.telegram.org/bot" .. token .. "/sendMessage?chat_id ="..chat_id .. "&text =" .. tostring (text)) - https doesn't work in lua yet
  http.request ("http://212.237.16.93/bot" .. token .. "/sendMessage?chat_id ="..chat_id.."&text =" .. urlencode (text))
  end


local state = zigbee.value (tostring (Event.ieeeAddr), "contact")
if (state) then SendTelegram ("The door is open")
else SendTelegram ("Door closed") end
```
###
Notification in telegrams when the motion sensor is triggered
```
local char_to_hex = function (c)
  return string.format ("%%%02X", string.byte (c))
end

function round (exact, quantum)
    local quant, frac = math.modf (exact/quantum)
    return quantum * (quant + (frac> 0.5 and 1 or 0))
end
local function urlencode (url)
  if url == nil then
    return
  end
  url = url: gsub ("\n","\r\n")
  url = url: gsub ("([^% w])", char_to_hex)
  url = url: gsub ("", "+")
  return url
end

local hex_to_char = function (x)
  return string.char (tonumber (x, 16))
end

function SendTelegram (text)
  local token = "517781 ...: AAG0bv ...."
  local chat_id = "3880 ......"
  --http.request ("https://api.telegram.org/bot" .. token .. "/sendMessage?chat_id=" .. chat_id .. "&text =" .. tostring (text)) - https doesn't work in lua yet
  http.request ("http://212.237.16.93/bot" .. token.. "/sendMessage?chat_id=" .. chat_id .. "&text =" .. urlencode (text))
  end


local state = zigbee.value (tostring (Event.ieeeAddr), "occupancy")
if (state) then SendTelegram ("Motion sensor" .. Event.ieeeAddr .. "detected activity")
 else SendTelegram ("Sensor value" .. Event.FriendlyName .. "movement normalized")
  
end
```

### Alert about change of temperature / humidity sensor value
```
local char_to_hex = function (c)
  return string.format ("%%%02X", string.byte (c))
end



function round2 (num, numDecimalPlaces)
  local mult = 10 ^ (numDecimalPlaces or 0)
  return math.floor (num * mult + 0.5) / mult
end

local function urlencode (url)
  if url == nil then
    return
  end
  url = url: gsub ("\n", "\r\n")
  url = url: gsub ("([^%w])", char_to_hex)
  url = url: gsub ("", "+")
  return url
end

local hex_to_char = function (x)
  return string.char (tonumber (x, 16))
end

function SendTelegram (text)
    local token = "5177 ....: AAG0 ......"
  local chat_id = "3880 ..."
  --http.request ("https://api.telegram.org/bot" .. token .. "/ sendMessage? chat_id =" .. chat_id .. "& text =" .. tostring (text)) - https doesn't work in lua yet
  http.request ("http://212.237.16.93/bot" .. token .. "/ sendMessage? chat_id =" .. chat_id .. "& text =" .. urlencode (text))
  end

local temp = round2 (zigbee.value (tostring (Event.ieeeAddr), "temperature"), 1)
local hum = round2 (zigbee.value (tostring (Event.ieeeAddr), "humidity"), 1)
SendTelegram ("DTV value" .. Event.FriendlyName .. "" .. temp .. "° /" .. hum .. "%")
------------ sending value to narodmon
function SendNarodmon (name, value)
  local MAC = tostring (Event.ieeeAddr)
  http.request ("http://narodmon.ru/get?ID=" .. MAC .. "&" .. name .. "=" .. tostring (value))
end

SendNarodmon ("temperature", temp)
SendNarodmon ("humidity", hum)
```


### Simplified sending of messages in telegrams (starting from version 20200915)

You can register your bot at @BotFather

You can find out your ChatId from the @userinfobot bot

It is enough to write the token and ChatId once in init.lua, then use only telegram.send ()


```
telegram.settoken ("5961 ....: AAHJP4 ...")
telegram.setchat ("5748 .....")
telegram.send ("Temperature:" .. string.format ("%.2f", zigbee.value (tostring (Event.ieeeAddr), "temperature")) .. "° C, Humidity:" .. string.format ("% .2f", zigbee.value (tostring (Event.ieeeAddr), "humidity")) .. "%")
```

### Gateway illumination by motion sensor only at night from 22 to 6
Option via GPIO
```
 local gmt = 3
  local time = os.time ()
  local hour = (math.modf (time / 3600) + gmt)% 24
  if hour> = 22 or hour <6 then
         if Event.State.Value == "true" then
                gpio.pwm (0, 255)
                gpio.pwm (1, 255)
                gpio.pwm (2, 255)
         else
                gpio.pwm (0, 0)
                gpio.pwm (1, 0)
                gpio.pwm (2, 0)
         end
  end
 ```
 Option via MQTT:
 ```
 local gmt = 3
local time = os.time ()
local hour = (math.modf (time / 3600) + gmt)% 24
if hour> = 22 or hour <6 then
  if Event.State.Value == "true" then
        mqtt.pub ('ZigBeeSls/led', '{"mode": "manual", "hex": "# FF0000"}')
  else
        mqtt.pub ('ZigBeeSls/led', '{"mode": "off"}')
  end
end
```

### Creating a security mode

Staging
```
obj.set ("security_status", "armed")
```

Check
```
if obj.get ("security_status") == "armed" then
print ("Object is armed.")
else
print ("Object is not armed.")
```

### Turn on the sound of the doorbell on an event (the sound file is in an open network)

192.168.1.5 is the address of another gateway. You can't run on itself this way, use the audio object.

```
http.request ("http://192.168.1.5/audio?action=setvolume&value=100")

http.request ("http://192.168.1.5/audio?action=play&url=http://funny-dog.surge.sh/door_bell.mp3")
```

### Converting pressure readings from kPa to mmHg

You need to create a lua script that will be called when the pressure changes:
```
local press = zigbee.value (tostring (Event.ieeeAddr), "pressure")
local pressmm = zigbee.value (tostring (Event.ieeeAddr), "pressure_mm")
if pressmm == null then zigbee.add (tostring (Event.ieeeAddr), "pressure_mm", "FLOAT") end
zigbee.set (tostring (Event.ieeeAddr), "pressure_mm", press * 7.5)
```

### Requesting data from devices through a script, for example, requesting instant consumption, if the device itself does not notify
zigbee.get ("0x842E14FFFE05B8E2", "power") in the onemintimer.lua file where 0x842E14FFFE05B8E2 is the device identifier



### An example of working with an astrotimer

Astrotimer is a regular timer that is tied to the sunset / sunrise cycles.
Since at different latitudes the time of sunset and sunrise is different, then in such timers there is a longitude / latitude setting. Longitude / latitude parameters are set via the Web in the Settings-> Location tab.

Astrotimer is called by the OnMinTimer.lua script every minute:

```
local sunrise_add_min <const> = 15
local sunrise_hour, sunrise_min = os.sunrise ()
sunrise_min = sunrise_min + sunrise_add_min
if sunrise_min> 59 then
  sunrise_hour = sunrise_hour + 1
  sunrise_min = sunrise_min - 60
end
if Event.Time.hour == sunrise_hour and Event.Time.min == sunrise_min then
  print (sunrise_hour .. ":" .. sunrise_min)
end
```
This script will print the time of dawn, 15 minutes after the onset, i.e. if dawn comes 8:55, add 15 minutes, then the script will work at 9:10. You can ask
no more than 60 minutes.


### Example of using astrotimer

```
local sunset_add_min <const> = 20
local sunset_hour, sunset_min = os.sunset ()
sunset_min = sunset_min + sunset_add_min
if sunset_min> 59 then
  sunset_hour = sunset_hour + 1
  sunset_min = sunset_min - 60
end
if Event.Time.hour == sunset_hour and Event.Time.min == sunset_min then
 - Turns on street light 20 minutes after sunset
  telegram.send ("Street lights on")
  http.request ("http://192.168.2.200:8888/objects/?object=MegaD3-8&op=m&m=extended")
end
local sunrise_add_min <const> = 1
local sunrise_hour, sunrise_min = os.sunrise ()
sunrise_min = sunrise_min + sunrise_add_min
if sunrise_min> 59 then
  sunrise_hour = sunrise_hour + 1
  sunrise_min = sunrise_min - 60
end
if Event.Time.hour == sunrise_hour and Event.Time.min == sunrise_min then
  - Opens the curtains after dawn
  telegram.send ("The curtains in the living room are open")
  zigbee.set ("0x5C0272FFFEC8A21B", "position", 0)

end
```


### Execution of the script by time

An example of completing a task at the appointed time

```
if Event.Time.hour == 15 then
  if Event.Time.min == 0 then
    - turn on
  elseif Event.Time.min == 1 then
    - turn off
  end
end
```



## Useful links
1) On-line tutorial on [lua](https://zserge.wordpress.com/2012/02/23/lua-%D0%B7%D0%B0-60-%D0%BC%D0%B8%D0%BD%D1%83%D1%82/)

2) Generator of lua scripts based on [Blockly](https://blockly-demo.appspot.com/static/demos/code/index.html)
