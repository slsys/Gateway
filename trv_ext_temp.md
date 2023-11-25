# Для термоголовки (Model TS0601) можно настроить использование внешнего датчика температуры.

Это позволит более точно поддерживать температуру в помещении.

1. Для внешнего датчика температуры в поле `temperature` в колонке `SB rule` задать имя объекта. Например: `room1.temperature`

2. В скрипте `init.lua` для этого объекта задать скрипт, который будет выполняться при изменении значения температуры. Например:

```lua
obj.onChange('room1.temperature', 'room1_trv_calibration.lua')
```

3. Добавить скрипт `room1_trv_calibration.lua`:

```lua
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

В строке `trv = "0x84FD27FFFE2Dxxxx"` задать ieeeAddr термоголовки.
В строке `ext_temperature = obj.get("room1.temperature")` исправить имя объекта, если оно другое.

4. Если вы используете [эту термоголовку](https://slsys.io/action/supported_devices.html?device=65), то на момент написания этой статьи (30.10.2021) она не обновляет сама текущую температуру (`local_temperature`).

Советую добавить в минутный таймер `OneMinTimer.lua` вызов скрипта каждые 15 минут:

```lua
if Event.Time.min % 15 == 0 then
  dofile("/int/room1_trv_calibration.lua")
end
```

Если термоголовка корректно рапортует текущую температуру (`local_temperature`), то не добавляйте ничего в таймер и удалите из `room1_trv_calibration.lua` эти 2 строки:

```lua
--[ Workaround: set local_temperature_calibration to update local_temperature ]
zigbee.set(trv, "local_temperature_calibration", local_temperature_calibration)
```
