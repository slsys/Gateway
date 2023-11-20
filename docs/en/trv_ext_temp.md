It is possible to use an external temperature sensor for TRV thermostat (Model TS0601).

1. Set an object name in the `SB rule` column to the `temperature` state of the external temperature sensor. For example: `room1.temperature`

2. Set the onChange script for that object in `init.lua`. For example: 
```
obj.onChange('room1.temperature', 'room1_trv_calibration.lua')
```

3. Add the script `room1_trv_calibration.lua`:
```
trv = "0x84FD27FFFE2Dxxxx"
ext_temperature = obj.get("room1.temperature")
ext_temperature = math.floor(ext_temperature * 10 + 0.5) / 10
local_temperature_calibration = zigbee.value(trv, "local_temperature_calibration")
local_temperature_calibration = math.floor(local_temperature_calibration * 10 + 0.5) / 10
--[ Workaround: set local_temperature_calibration to update local_temperature ]
zigbee.set(trv, "local_temperature_calibration", local_temperature_calibration)
local_temperature = zigbee.value(trv, "local_temperature")
local_temperature = math.floor(local_temperature * 10 + 0.5) / 10
if ext_temperature ~= local_temperature then
  local_temperature_calibration = local_temperature_calibration + ext_temperature - local_temperature
  zigbee.set(trv, "local_temperature_calibration", local_temperature_calibration)
end
```
Note update `trv = "0x84FD27FFFE2Dxxxx"` with ieeeAddr of your thermostat.
Note update `ext_temperature = obj.get("room1.temperature")` with your object name.

4. If you are using [this thermostat](https://slsys.io/action/supported_devices.html?device=65) 
note it does not report the current temperature (`local_temperature`) itself for now (30.10.2021).
I recommend to add the following code to the minute timer `OneMinTimer.lua`:
```
if Event.Time.min % 15 == 0 then
  dofile("/int/room1_trv_calibration.lua")
end
```
If your thermostat reports the current temperature (`local_temperature`), then do not add the timer and remove the following 2 lines from `room1_trv_calibration.lua`:
```
--[ Workaround: set local_temperature_calibration to update local_temperature ]
zigbee.set(trv, "local_temperature_calibration", local_temperature_calibration)
```
