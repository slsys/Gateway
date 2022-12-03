- [Главная (LUA)](/lua_doc/intro.md)

[[toc]]
# Примеры скриптов
### Скрипт инициализации
```lua
-- init.lua --
-- Уведомление в Telegram о старте шлюза --
telegram.settoken("51778***5:AAG0bvK***")
telegram.setchat("-3348***")
telegram.send("SLS загружен!!!")
--[[
  Уведомление в Telegram о времени восхода и заката солнца.
  Для правильной работы необходимо в системных настройках
  заполнить данные о координатах шлюза в меню Settings -> Time & Location
--]]
local sunset_hour, sunset_min = os.sunset()
local sunrise_hour, sunrise_min = os.sunrise()
telegram.send("sunrise " .. sunset_hour .. ":" .. sunset_min)
-- Запуск скрипта для каких-либо ежеминутных проверок/действий --
scripts.setTimer("flush", 60, "bowl")
-- Инициализация объектов для обмена между скриптами --
obj.setOpt("there.is.no.spoon", "BOOL")
obj.set("there.is.no.spoon", true, true)
-- Привязка скрипта btn_sw1.lua к событию нажатия аппаратной кнопки шлюза --
obj.onChange("io.input0.value", "btn_sw1.lua")
```
### Включение режима сопряжения по нажатию на кнопку шлюза
По нажатию на аппаратную кнопку будет включаться режим сопряжения (Join) Zigbee устройств. 
1. в `init.lua` добавить код: `obj.onChange("io.input0.value", "btn_sw1.lua")`
2. создать `btn_sw1.lua` с кодом: `zigbee.join(255, "0x0000")`
