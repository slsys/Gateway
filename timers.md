# Таймеры

## Введение

Шлюз может запускать скрипты с определенной периодичностью. Можно установить таймер запуска к любому скрипту, а так же отменить его. 

Одному скрипту можно назначить только один таймер. Поэтому, если выполнить подряд несколько установок таймера для одного целевого скрипта, то настройка применяется из последней итерации.

Тип таймера передается в скрипт событием `Event.Type`

## Типы таймеров

### Однократный
Выполняется однократно в UNIX время. Дискретность 1 секунда. `Event.Type = 4`.

В моделях шлюза без микросхемы RTC, не следует инициализировать данный тип таймера в `init.lua`, поскольку UNIX время на момент инициализации таймера может быть не синхронизировано с NTP. Особенно при холодном старте.

Инициализация:
```lua
scripts.setTimer(script, os.time() + t[, Param])
-- script - STR, имя файла скрипта, без расширения `lua`
-- os.time() - функциия LUA, возвращает UNIX время на текущий момент в сек.
-- t - INT, уставка времени в сек.
-- Param - STR, аргументы, передаваемые в скрипт
```

### Периодический

Выполняется с заданной периодичностью. Дискретность 1 секунда. `Event.Type = 5`

Инициализация:
```lua
scripts.setTimer(script, t[, Param])
-- script - STR, имя файла скрипта, без расширения `lua`
-- t - INT, уставка времени в сек.
-- Param - STR, аргументы, передаваемые в скрипт
```

### CRON

Таймер такой же и с таким же синтаксисом как [UNIX cron](https://ru.wikipedia.org/wiki/Cron). Единственное отличие: расписание может быть только одно для одного скрипта. Добавлен в версии прошивки 2022.04.24d11. `Event.Type = 6`. 
Инициализация:
```lua
scripts.setTimer(script, crontab[, Param])
-- script - STR, имя файла скрипта, без расширения `lua`
-- crontab - STR, уставка времени в формате UNIX CRON 
-- Param - STR, аргументы, передаваемые в скрипт
```

## Отмена таймеров

Для отмены любого типа таймера достаточно задать уставку времени равную 0:
```lua
scripts.setTimer(script, 0)
-- script - STR, имя файла скрипта, без расширения `lua`
```
## API для работы с таймерами

### [HTTP API](/http_api_rus.md#скрипты-lua)

Получить список скриптов с таймерами:
`/api/scripts`

Возвращает JSON объект вида:
```json
{
	"success": true,
	"result": [{
		"name": "tickOneMinute",
		"ts": 1676519822,
		"interval": 60,
		"timeout": 1676519822
	}, {
		"name": "alarmClock",
		"ts": 1676518562,
		"cron": "50 5 * * 1-5"
	}, {
		"name": "tables",
		"ts": 1676519836,
		"timeout": 1676519896
	}]
}
```
Здесь:
- `success` - результат выполнения API команды
- `result` - перечень скриптов с назначенными таймерами
  - `name` - имя скрипта
  - `interval` - интервал периодического таймера
  - `ts` - последнее время запуска скрипта
  - `timeout` - время последней сработки интервального таймера или время когда должен сработать фиксированный таймер


### [LUA](/lua_rus.md)

**scripts.getTimer()** 

Возвращает оставшееся время таймера для скрипта с помощью функции. Для таймеров, кроме CRON. 
```lua
scripts.getTimer(script)
-- script - STR, имя проверяемого скрипта
```

## Примеры
### Запуск скрипта getMoney.lua каждые 60 секунд
```lua
scripts.setTimer("getMoney", 60, "$")
```
### Запуск скрипта giveMoney.lua через 5 минут, однократно
```lua
scripts.setTimer("giveMoney", os.time() + 300)
```
###  Узнать когда запостится скрипт giveMoney.lua
```lua
print(scripts.getTimer("giveMoney"))
```
### Запуск скрипта earnMoney.lua каждый будний день в 01:05
```lua
scripts.setTimer("earnMoney", "5 1 * * 1-5")
```
### Сброс таймера для скрипта OneMinTimer.lua
```lua
scripts.setTimer("OneMinTimer", 0)
```
### Определить тип таймера
Допустим, скрипт action.lua может запускаться по таймерам разного типа. Определение типа:
```lua
-- action.lua
if (Event.Type == 4) then
  print("Однократный таймер")
elseif (Event.Type == 5) then
  print("Периодический таймер")
elseif (Event.Type == 6) then
  print("Таймер CRON")
end
```
### Отправка данных каждую минуту на narodmon.ru
```lua
function SendNarodmon(name, value)
  local MAC = "BC:DD:C2:D7:68:BC"
  http.request("http://narodmon.ru/get?ID=" .. MAC .. "&" .. name .. "=" .. tostring(value))
end  

local value = zigbee.value("0x04CF8CDF3C771F6C", "illuminance")
SendNarodmon("illuminance", value)
```
###  Включение, выключение света в аквариуме

Инициализация:
```lua
-- init.lua
-- Аквариум 
scripts.setTimer("aquarium", "0 6 * * 1-5", 16) -- Время включения 6:00 в будни. В параметр передаем число часов, через которое выключить
```
Вариант обработки таймера
```lua
-- aquarium.lua
if (Event.Type == 6) then -- скрипт вызван по CRON 
  zigbee.set("0xA4C138E56B96596D", "state", "ON") -- включить 
  scripts.setTimer("aquarium", os.time() + Event.Param * 3600) -- настроить скрипт на запуска через кол-во часов переданных аргументом
elseif (Event.Type == 4) then
  zigbee.set("0xA4C138E56B96596D", "state", "OFF") -- выключить
  scripts.setTimer("aquarium", "0 6 * * 1-5", 16) -- установить таймер для следующего включения света
end
```

### Будильник 

Алгоритм:
- в 5:50 включить ночник
- через 10 минут включить основной свет с небольшой яркостью
- еще через пару минут выключить ночник и поднять яркость основного света до 100%

Инициализация:
```lua
scripts.setTimer("alarmClock", 60, 0)
```
Обработка:
```lua
-- Будильник 
--[[ Формат вызова в init.lua: scripts.setTimer("alarmClock", 60, 0)
	Параметром передается тип будильника: 0 - инициализация; 1 - ночник; 2 - свет на 50%; 3 - свет на 100% ]] 
-- Настройки:
-- Время запуска будильника:
local cronMinutes = 50 -- минуты
local cronHours = 5 -- часы
local cronDaysOfWeek = "1-5" -- в какие дни недели: 1-5 = пн-пт; 1,2,3 = пн,вт,ср
-- "50 5 * * 1-5"
local cronTab = tostring(cronMinutes .. ' ' .. cronHours .. ' * * ' .. cronDaysOfWeek)
local timeLight1 = os.time() + 660 -- сек., таймаут до включения света на 50%
local timeLight2 = os.time() + 120 -- сек., таймаут до включения света на 100%
-- Main
local alarmType = tonumber(Event.Param)
if (alarmType == 0) then -- 0 = инициализация  
  scripts.setTimer("alarmClock", cronTab, 1) -- настройка на запуск по Cron на время cronTab 
elseif (alarmType == 1) then -- первый - включить ночник
  scripts.setTimer("alarmClock", timeLight1, 2) -- запуск данного скрипта через 10 минут на вкл света на 50%
  zigbee.set("lmp_bedroom-nightlight", "brightness", 1) -- включить ночник через якость = 1
elseif (alarmType == 2) then
  scripts.setTimer("alarmClock", timeLight2, 3) -- запуск данного скрипта через 10 минут на вкл света на max
  zigbee.set("lmp_bedroom", "brightness", 100) -- включить Люстру через якость = 50%
elseif (alarmType == 3) then
  scripts.setTimer("alarmClock", cronTab, 1) -- настройка на запуск по Cron на время cronTab
  zigbee.set("lmp_bedroom-nightlight", "state", "OFF") -- выключить ночник
  zigbee.set("lmp_bedroom", "brightness", 255) -- включить Люстру через якость = 100%
end
```

**Внимание, скрипты OneMinTimer.lua и OneSecTimer.lua, начиная с версии прошивки 2022.01.30d1, не запускаются автоматически!!!**