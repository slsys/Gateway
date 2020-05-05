# Support for lua scripts

The SLS gateway has automation support based on the scripting programming language [lua](https://ru.wikipedia.org/wiki/Lua). The script editor is located in the menu Actions -> Scripts. To write a script, you need to create a new file, for example, with the name script.lua and enter lua code into it.
Script stdout using the print command displays information on the screen of the Scripts page and in the system log of the gateway. You can run the test script by pressing the RUN button.
![](/img/lua.png)

## Script launch options
1) Running the script when the device state changes. On the Zigbee tab, go to the device settings and specify the script file name (prefix / optional) in the SimpleBind window.
2) Running the script on time. Expected.
3) Running the script on a mqtt subscription. Expected.
4) Running the script when calling the http api. Expected.


## List of available functions and structures
1) [GetURL](lua_rus.md#geturl)
2) [GetState](lua_rus.md#getstate)
3) [SetState](lua_rus.md#setstate)
4) [Event](lua_rus.md#event)
5) [GetUnixTime](lua_rus.md#GetUnixTime)
6) [GetObj/SetObj](lua_rus.md#GetObj/SetObj)
7) [MQTTPub](lua_rus.md#MQTTPub)


### GetURL
Call the host server using the GET method at path GetURL (host, path)

Example switching gpio 12 for wifi-iot firmware
``` 
GetURL ("192.168.1.34", "/gpio?St=2&pin=12")
```
Example switching gpio for MegaD when pressing btn_2 of the Jager remote control once
```
if Event.State.Value == "btn_2_single" then
GetURL ("192.168.2.200", "/objects/?Object=MegaD1-12&op=m&m=switch")
end
```


### GetState
Getting a GetState Device Parameter ("ieeard", "temperature")

```
- We get the temperature value and round to the nearest
temp = GetState ("0x00158D0001A2D2FE", "temperature")
temp = math.floor (temp)
print ("Current temperature:" .. temp .. "C °")
```

Instead of the device address, you can use FriendlyName (including Cyrillic), or the current device address on the network (0x9EC8).
```
- We get the temperature value and round to the nearest
temp = GetState ("sensor in the room", "temperature")
temp = math.floor (temp)
print ("Current temperature:" .. temp .. "C °")
```


### SetState
SetState device value (Ident, StateName, StateValue)

An example script that, when the lumi.sensor_switch switch button is pressed, turns on the lamp_1 lighting:
```
if GetState ("lumi.sensor_switch", "click") == "single" then
  - toggle lamp
  current_brightness = GetState ("lamp_1", "brightness")
  if current_brightness == 0 then
    SetState ("lamp_1", "brightness", 255)
  else
    SetState ("lamp_1", "brightness", 0)
  end
 
  - print current temperature
  temp = GetState ("lumi.weather", "temperature")
  print ("Current temperature:" .. temp)
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
if Event.State.Value == "single" then value = 255 elseif Event.State.Value == "double" then value = 0 else return end
SetState ("lamp_1", "brightness", value)
```

### GetUnixTime
GetUnixTime () returns Unix time.

### GetObj / SetObj
GetObj () / SetObj () for saving and receiving an object for data exchange between scripts,

### MQTTPub (topic, payload)
Publishes payload value on MQTT server in topic topic


## Useful links
1) On-line tutorial on [lua](https://zserge.wordpress.com/2012/02/23/lua-%D0%B7%D0%B0-60-%D0%BC%D0%B8%D0%BD%D1%83%D1%82)

2) lua script generator based on [Blockly](http://www.blockly-lua.appspot.com/static/apps/code/index.html)
