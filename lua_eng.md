# Support for lua scripts

The SLS gateway has automation support based on the scripting programming language [lua](https://ru.wikipedia.org/wiki/Lua). The script editor is located in the menu Actions -> Scripts. To write a script, you need to create a new file, for example, with the name script.lua and enter the lua code into it.
Script stdout using the print command displays information on the screen of the Scripts page and in the system log of the gateway. You can run the test script by pressing the RUN button.
! [](/img/lua.png)


## Script launch options
1) Running the script when the device state changes. On the Zigbee tab, go to the device settings and specify the script file name (prefix / optional) in the SimpleBind window.
2) Running the script on time. Expected.
3) Running the script on a mqtt subscription. Expected.
4) Running the script when calling the http api. Expected.


## List of available functions and structures
1) [http.get()](lua_eng.md#http.get ())
2) [zigbee.value()](lua_eng.md#zigbee.value ())
3) [zigbee.get()](lua_eng.md#zigbee.get ())
4) [zigbee.set()](lua_eng.md#zigbee.set ())
5) [Event](lua_eng.md#event)
6) [os.time()](lua_eng.md#os.time())
7) [obj.get()/obj.set()](lua_eng.md#obj.get()/obj.set())
8) [mqtt.pub()](lua_eng.md#mqtt.pub())


### http.get()
Call the host server using the GET method at path http.get(host, path)


Example switching gpio 12 for wifi-iot firmware
```
http.get ("192.168.1.34", "/gpio?st=2&pin=12")
```

Example switching gpio for MegaD when pressing btn_2 of the Jager remote control once
```
if Event.State.Value == "btn_2_single" then
 http.get("192.168.2.200", "/objects/?object=MegaD1-12&op=m&m=switch")
end
```

Request for information from a third-party resource
```
local Response = http.get("wtfismyip.com", "/text")
print ("My IP:"..Response)
```

### zigbee.value()
Getting device status value from cache zigbee.value("ieeard", "temperature")

```
- We get the temperature value and round to the nearest
temp = zigbee.value("0x00158D0001A2D2FE", "temperature")
temp = math.floor(temp)
print ("Current temperature:"..temp.."C °")
```

Instead of the device address, you can use FriendlyName (including Cyrillic), or the current device address on the network (0x9EC8).
```
- We get the temperature value and round to the nearest
temp = zigbee.value("sensor in the room", "temperature")
temp = math.floor(temp)
print ("Current temperature:"..temp.."C °")
```

### zigbee.get()
Invokes the GET command on the cover. Used to manually read states from devices.
Example: zigbee.get("lamp1", "brightness")

### SetState
Setting device value zigbee.set(Ident, StateName, StateValue)

An example script that, when the lumi.sensor_switch switch button is pressed, turns on the lamp_1 lighting:
```
if zigbee.value("lumi.sensor_switch", "click") == "single" then
  - toggle lamp
  current_brightness = zigbee.value("lamp_1", "brightness")
  if current_brightness == 0 then
    zigbee.set("lamp_1", "brightness", 255)
  else
    zigbee.set("lamp_1", "brightness", 0)
  end
 
  - print current temperature
  temp = zigbee.value("lumi.weather", "temperature")
  print("Current temperature:" .. temp)
end
```
### Event
The Event structure, for example, allows you to use the same script for different states or devices.

Possible use cases:
Event.Name - Script file name
Event.nwkAddr - nwkAddr of the device that called the script
Event.ieeeAddr - ieeeAddr of the device that called the script
Event.FriendlyName - FriendlyName of the device that called the script
Event.State.Name - The name of the state that called the script
Event.State.Value - New state value

Example script for turning on the light:
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

### os.time()
os.time() returns Unix time.

### obj.get()/obj.set()
obj.get(ObjectName)/obj.set(ObjectName,ObjectValue) for saving and receiving an object for data exchange between scripts

### mqtt.pub()
mqtt.pub(topic, payload) publishes the payload value to the topic topic on the MQTT server.


## Useful links
1) On-line tutorial on [lua](https://zserge.wordpress.com/2012/02/23/lua-%D0%B7%D0%B0-60-%D0%BC%D0%B8%D0%BD%D1%83%D1%82)

2) lua script generator based on [Blockly](http://www.blockly-lua.appspot.com/static/apps/code/index.html)
