--[[
Управление
https://slsUrl/api/scripts?token=slsToken&action=evalFile&path=/kuzia.lua&param=device|state|{value}
ответ НЕ ждать
param:	device - FN
		{value} - возвращается 1 - вкл; 0 - выкл

Статус
https://slsUrl/api/zigbee?token=slsToken&dev=lmp_bedroom&action=getStateValue&name=kuzia
ответ ждать

Люстра. Управление
https://slsUrl/api/scripts?token=slsToken&action=evalFile&path=/kuzia.lua&param=lmp_bedroom|state|{value}
Люстра. Статус
https://slsUrl/api/zigbee?token=slsToken&dev=lmp_bedroom&action=getStateValue&name=kuzia
Люстра. Яркость
https://slsUrl/api/scripts?token=slsToken&action=evalFile&path=/kuzia.lua&param=lmp_bedroom|brightness|{value}

--]]
-- параметры device|state|{value}
local t = explode("|", Event.Param)
local devName = t[1] -- устройство
local devState = t[2] -- состояние
local devStateVal = tonumber(t[3]) -- значение состояния
t = nil

if (devState == "state") then
  if (devStateVal == 0) then
    zigbee.set(devName, devState, "OFF")
  elseif (devStateVal == 1) then
    zigbee.set(devName, devState, "ON")
  end
elseif (devState == "brightness") then
  local multiplier = 2.55
  if not (devStateVal > 0 and devStateVal <= 5) then
    devStateVal = math.ceil(devStateVal * multiplier)
  end 
  zigbee.set(devName, devState, devStateVal)
end
