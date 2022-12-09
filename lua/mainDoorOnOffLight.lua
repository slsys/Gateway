--[[--- Алгоритм ---
	Задача: 	1. При открывании входной двери, включать свет и выключать по таймеру
	Условия: 	1. Скрипт должен быть один, по возможности
				2. Не использовать ежеминутный таймер
				3. Уставка таймера должна настраивайться из web (в SB СМК)
				4. При сработке СМК во время работы таймера, его необходимо перезапустить
--]]
-- mainDoorOnOffLight.lua,false|0x4F61|state|ON|300
-- проверяю кто вызвал 
local srcStateCurr
if Event.State then
  srcStateCurr = Event.State.Value -- принимаю статус вызвавшего сенсора
end
local scriptName = (explode(".", Event.Name))[1] -- имя данного скрипта
-- разбираю аргументы 
local arr = explode("|", Event.Param)
-- формат вызова скрипта scriptName,srcStateVal|dstDevice|dstState|dstStateVal|timer
local srcStateVal = arr[1] --[[ состояние вызывающего устройства, которое необходимо контролировать. 
					Например, для СМК скрипт вызывается по изменению состояния сенсора contact.
					Если нужно, чтобы скрипт сработал при размыкании СМК (открытие двери/окна)
					то прописать false]]
local dstDevice = arr[2] -- исполняющее устройство (реле/розетка/лампа), прописать ieeeAddr или nwkAddr или Friendly name
local dstState = arr[3] -- состояние исполняющего устройства, которым необходимо управлять. Как правило - state
local dstStateVal = arr[4] -- значение состояния исполняющего устройства, которое необходимо передать для получения результата. Как правило ON или OFF - вкл/выкл или TOGGLE - переключить
local timer = arr[5] -- таймер в сек
arr = nil -- cleanup
-- если есть srcStateCurr, то вызвал SB, иначе вызвал таймер
if (srcStateCurr) then
  -- если srcStateCurr = srcStateVal, значит открыли дверь
  if (srcStateCurr == srcStateVal) then
    -- задать/продлить таймер на запуск скрипту себя через время timer
    local param = "X|" .. dstDevice .. "|" .. dstState .. "|OFF"
    scripts.setTimer(scriptName, os.time() + timer, param) -- передаю теже параметры для совместимости, меняю только целевое воздействие на OFF
    if (zigbee.value(dstDevice, dstState) ~= dstStateVal) then -- если свет (реле) выключен
      zigbee.set(dstDevice, dstState, dstStateVal) -- то включить
	end  
  end
-- если нет srcStateCurr, то вызвал таймер и надо свет выключить
else
  if (zigbee.value(dstDevice, dstState) ~= dstStateVal) then -- если свет (реле) включен
    zigbee.set(dstDevice, dstState, dstStateVal) -- то выключить
    -- обнулить таймер - по идее - удаление задачи планировщика
    scripts.setTimer(scriptName, 0)
  end
end
