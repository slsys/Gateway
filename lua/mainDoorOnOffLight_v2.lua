-- mainDoorOnOffLight.lua --
--[[
	Функции:
	- включение света по сработке датчика открытия
	- отключение по таймеру, для настройки которого не требуется править скрипт
	- при сработке датчика во время работы таймера, последний продлевается
	- включение света по кнопке. При этом можно также назначить свой таймер
	- выключение света и выключение таймера безусловно по кнопке
	- отключение таймера по длинному нажатию кнопки, с подтверждением подсветкой шлюза
	- отключение света внешним скриптом, например Peoples Tracker
	- все действия обрабатываются одним скриптом через рекурсивный вызов
	- ToDo - Если свет выключили кнопкой, то не включать свет при открытии двери в течение 1 минуты
--]]
-- Пример правил Simple Bind:
-- Датчик: mainDoorOnOffLight.lua,mag|false|0x4F61|state|ON|300
-- Кнопка: mainDoorOnOffLight.lua,btn|X|0x4F61|state|X|1800
-- формат вызова скрипта scriptName,caller|srcStateTarget|dstDevice|dstState|dstStateVal|timer
-- разбираю аргументы 
local arr = explode("|", Event.Param)
local caller = arr[1] -- кто вызвал: mag = СМК; btn = кнопка; timer = таймер; track = Трекер
local srcStateTarget = arr[2] --[[ целевое состояние вызывающего устройства, которое необходимо контролировать. 
					Например, для СМК скрипт вызывается по изменению состояния сенсора contact.
					Если нужно, чтобы скрипт сработал при размыкании СМК (открытие двери/окна)
					то прописать false]]
local dstDevice = arr[3] -- исполняющее устройство (реле/розетка/лампа), прописать ieeeAddr или nwkAddr или Friendly name
local dstState = arr[4] -- состояние исполняющего устройства, которым необходимо управлять. Как правило - state
local dstStateVal = arr[5] -- значение состояния исполняющего устройства, которое необходимо передать для получения результата. Как правило ON или OFF - вкл/выкл или TOGGLE - переключить
local timer = arr[6] -- таймер в сек
arr = nil -- cleanup
-- принимаю статус вызвавшего устройства
local srcStateCurr
if Event.State then
  srcStateCurr = Event.State.Value 
end
local scriptName = (explode(".", Event.Name))[1] -- имя данного скрипта
-- проверяю кто вызвал (а-ля switch-case)
if (caller == "mag") then -- датчик открытия - надо включить свет
  -- если srcStateCurr = srcStateTarget, значит открыли дверь
  if (srcStateCurr == srcStateTarget) then
    -- задать/продлить таймер на запуск скрипту себя через время timer
    local param = "timer|X|" .. dstDevice .. "|" .. dstState .. "|OFF" -- меняю целевое воздействие на OFF
    scripts.setTimer(scriptName, os.time() + timer, param)
    if (zigbee.value(dstDevice, dstState) ~= dstStateVal) then -- если свет (реле) выключен
      zigbee.set(dstDevice, dstState, dstStateVal) -- то включить
	end  
  end
elseif (caller == "btn") then -- кнопка: single - переключить свет; long - отключить таймер и TODO неплохо бы моргнуть шлюзом для подтверждения
  if (srcStateCurr == "single") then -- безусловно переключить свет и отключить таймер
	zigbee.set(dstDevice, dstState, "TOGGLE")
	scripts.setTimer(scriptName, 0)
  elseif (srcStateCurr == "long") then -- если свет включен, отключить таймер и моргнуть шлюзом
    if (zigbee.value(dstDevice, dstState) == "ON") then 
      scripts.setTimer(scriptName, 0)
	  -- моргнуть шлюзом для подтверждения
      os.led("ON",250,255,255,100)
	  os.delay(500)
	  os.led("OFF")
    end
  end
elseif (caller == "track") then -- вызов из трекера, вероятно для выключения. по таймеру тоже действие
  caller = "timer" -- а-ля goto timer :)
elseif (caller == "timer") then -- вернулся по окончанию таймера
  if (zigbee.value(dstDevice, dstState) ~= dstStateVal) then -- если свет (реле) включен
    zigbee.set(dstDevice, dstState, dstStateVal) -- то выключить
    -- обнулить таймер - по идее - удаление задачи планировщика
    scripts.setTimer(scriptName, 0)
  end
end 
