[[toc]]
# SLS Device Tracker
## Введение
Решение позволяет отслеживать устройства, зарегистрированные на маршрутизаторе и выполнять какие-либо действия. Разрабатывалось и тестировалось на роутере Keenetic Speedster (KN-3010) с прошивкой 3.8.5 и SLS с прошивкой 2022.11.26d1. Его можно с легкостью адаптировать под практически любой современный роутер, имеющий HTTP API.

Для разработки данной автоматизации применено достаточно много функционала SLS. Её изучение может помочь новичкам лучше разобраться во внутренней кухне шлюза.

При отладке в своей среде необходимо следить за объемом получаемых с роутера данных и по возможности добиться их минимизации, поскольку при больших объемах может не хватать ОЗУ SLS для их обработки, особенно на старых версиях прошивки с `http.request` первой версии.

## Подготовка роутера
1. REST Core Interface маршрутизаторов Keenetic работает на `localhost:79` без авторизации. Кому не страшны слова rest, api, digest, смогут себе ее настроить при необходимости. Скажу только, что понадобится поддержка, отсутствующая нативно в SLS, шифрования md и sha. Настройка переадресации порта 79 rci с интерфейса домашней сети на localhost роутера:
![](/img/luaPersonesTrackerMap79Port.png)
2. Для минимизации циклов перебора массивов данных, дать отслеживаемым устройствам такие имена, которые разрешено использовать в названиях ключей таблиц LUA. Например:
![](../img/luaPersonesTrackerDevName.png)

## Основной скрипт
```lua
-- personesTracker.lua
-- устройства и их статус
local family = {
  IPhoneAlexey = { -- имя должно быть = имени в роутере
    name = "PAPA", -- на будущее, для UI 
    active = false -- статус обнуляю
  },
  IPhoneVera = {
    name = "MAMA",
    active = false
  },
  IPhoneGosha = {
    name = "Gosha",
    active = false
  },
  IPhoneVlad = {
    name = nil,
    active = false
  }
}
-- импорт модуля JSON -- https://github.com/rxi/json.lua
local json = (loadfile "/int/json.lua")()
-- получаю данные о зарегистрированных на роутере устройствах и полученный JSON конвертирую в table
local data = json.decode(http.request2("http://192.168.1.1:79/rci/show/ip/hotspot/summary?attribute=txspeed"))
-- полученные данные перебираю и если устройство в роутере active = true, записываю в таблицу устройств
local anyBodyHome = false -- флаг - дома кто-то есть
for i = 1, #data["host"] do
  if (data["host"][i]["active"] == true) then
    if family[data["host"][i]["name"]] then
      family[data["host"][i]["name"]]['active'] = true
      anyBodyHome = true
    end
  end
end
-- актуализированную таблицу устройств конвертирую в JSON
local fullHouseNow = json.encode(family)
-- получаю из памяти сохраненную таблицу устройств
local fullHouse = obj.get("fullHouse")
-- если таблица устройств есть в памяти
if fullHouse then
  -- если текущий статус устройств изменился
  if #fullHouse ~= #fullHouseNow then
    -- записываю в пямять
    obj.set("fullHouse", fullHouseNow, anyBodyHome)
  end
else
  -- иначе записываю в память в первый раз
  obj.set("fullHouse", fullHouseNow, anyBodyHome)
end
```
- В таблицу `family` необходимо внести данные отслеживаемых устройств, согласно комментариев. Поле `name` необязательно и предусмотрено для будущего информера с UI SLS. Также можно добавить и другие поля: mac, IP, etc... если это необходимо для решения текущих задач.
- для работы с JSON необходимо добавить в шлюз файл `json.lua` с указанного в листинге ресурса.
## Инициализация 
В скрипте инициализации `init.lua` необходимо добавить задачу планировщика для запуска основного скрипта с нужной периодичностью:
`scripts.setTimer("personesTracker.lua", 60)`
## Хранение данных в памяти шлюза
Для обмена между скриптами и для информеров, а также для передачи во внешние системы, результаты работы основного скрипта хранятся в ОЗУ SLS в виде объекта `fullHouse`. Данные хранятся в формате JSON. Содержат в себе как справочную информацию, так и текущий статус регистрации отслеживаемых устройств в домашней сети (поле `active`). Также хранится статус наличия или отсутствия  хоть кого в доме (в зоне покрытия Wi-Fi сети) в виде флага `ACK` объекта.
## Исполнительные скрипты или цели
Использовать результаты работы основного скрипта несколькими способами. Например:
- Выполнять действия непосредственно из него. Функция `dofile()`
- Запускать скрипт(ы) по изменению объекта `fullHose`. Функция `obj.onChange('fullHouse', 'kick2RTFM.lua')`
- Передавать данные при изменении объекта во внешние системы по MQTT. Для этого необходимо включить параметр объекта "Передача уведомлений MQTT" `obj.setOpt("fullHose", "STR", true)`
- Также данные можно передавать с помощью функции `http.request()`
- Другие скрипты в своей логике также могут использовать данные о присутствии людей в доме.
- etc
## Пример. Выключение света и уведомление в Телеграмм
ToDo. Добавить пример