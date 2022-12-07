--[[--- Алгоритм ---
	Задача: 	1. При открывании входной двери, включать свет и выключать по таймеру
				2. Свет также включается умной кнопкой
	Условия: 	1. Скрипт должен быть один, по возможности
				2. Не использовать ежеминутный таймер
				3. Уставка таймера должна настраивайться из web (в SB СМК)
				4. При сработке СМК во время работы таймера, его необходимо перезапустить
				5. Если свет горит и включен через СМК, то по дабл-клику отключить таймер
				6. Если свет выключили кнопкой, то не включать свет при открытии двери в течение 1 минуты
	Решение:
		- при открывании/закрывании двери меняет состояние СМК state: contact = true: дверь закрыта, false: дверь открыта
			- соответсвенно на state: contact вешаем скрипт
--]]

-- rel_tambur/0xA4C138D8A539DB0F/0x4F61
-- mainDoorOnLight_v2.lua,false|0x4F61|state|ON|300|sbMag

-- local scriptName = Event.Name -- имя данного скрипта (TODO вроде не работает)
-- разбираю аргументы 
local arr = explode("|", Event.Param)
-- формат вызова скрипта scriptName,srcStateVal|dstDevice|dstState|dstStateVal|timer|whoCalled
local srcStateVal = arr[1] --[[ состояние вызывающего устройства, которое необходимо контролировать. 
					Например, для СМК скрипт вызывается по изменению состояния сенсора contact.
					Если нужно, чтобы скрипт сработал при размыкании СМК (открытие двери/окна)
					то прописать false]]
local dstDevice = arr[2] -- исполняющее устройство (реле/розетка/лампа), прописать ieeeAddr или nwkAddr или Friendly name
local dstState = arr[3] -- состояние исполняющего устройства, которым необходимо управлять. Как правило - state
local dstStateVal = arr[4] -- значение состояния исполняющего устройства, которое необходимо передать для получения результата. Как правило ON или OFF - вкл/выкл или TOGGLE - переключить
local timer = arr[5] -- таймер в сек
local whoCalled = arr[6] -- кто вызвал
--[[
SB СМК = sbMag				mainDoorOnOffLight.lua,false|0x4F61|state|ON|300|sbMag
SB кнопки = sbBtn			ToDo mainDoorOnOffLight.lua,double|0|0|0|0|sbMag
Таймер = timer				mainDoorOnOffLight.lua,false|0x4F61|state|OFF|300|timer
deviceTracker = devTrack	mainDoorOnOffLight.lua,0|0x4F61|state|OFF|0|devTrack
--]]
arr = nil -- cleanup
-- проверяю кто вызвал: SB, deviceTracker, Timer
local srcStateCurr = Event.State.Value -- принимаю статус вызвавшего сенсора
-- если есть srcStateCurr, то вызвал SB
if (srcStateCurr) then
  -- если srcStateCurr = srcStateVal, значит открыли дверь
  if (srcStateCurr == srcStateVal) then
    if (zigbee.value(dstDevice, dstState) ~= dstStateVal) then -- если свет (реле) выключен
      zigbee.set(dstDevice, dstState, dstStateVal) -- то включить
	  -- задать таймер на запуск скрипту себя через время timer
	  script.setTimer("mainDoorOnOffLight", os.time() + timer, "false|0x4F61|state|OFF|300|timer") -- передаю теже параметры для совместимости, меняю только целевое воздействие на OFF
	  -- TODO проверить со scriptName
	end  
  end
-- если нет srcStateCurr, то вызвал таймер и надо свет выключить
-- TODO - проверить - должен быть nil
elseif 


end
else -- иначе вызвал таймер
  if (zigbee.value(dstDevice, dstState) ~= dstStateVal) then -- если свет (реле) включен
    zigbee.set(dstDevice, dstState, dstStateVal) -- то выключить
    -- обнулить таймер - по идее - удаление задачи планировщика
    script.setTimer("mainDoorOnOffLight", 0)
  end
end

