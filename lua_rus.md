# Поддержка lua скриптов

В последних версиях прошивки SLS ZGW появилась поддержка автоматизаций на основе скриптового языка программирования [lua](https://ru.wikipedia.org/wiki/Lua). Редактор скриптов находится в меню Actions -> Scripts. Скриптовый stdout по команде print выводит информацию на экран вкладки Scripts и в системный лог шлюза.

## Варианты запуска скриптов
1)  Запуск скрипта при изменении параметров устройства. На вкладке zigbee необходимо зайти в параметры устройства и в окне SimpleBind указать имя скрипта.
2) Запуск скрипта по времени. Ожидается.
3) Запуск скрипта по подписке mqtt. Ожидается.
4) Запуск скрипта при вызове http api. Ожидается.


## Список доступных функций
1) [GetState](lua_rus.md#getstate)
2) [SetState](lua_rus.md#setstate)
3) [Event](lua_rus.md#events) 


### GetState
Получение параметра устройства GetState("ieeard", "temperature")

```
-- Получаем значение температуры и округляем до целых  
temp = GetState("0x00158D0001A2D2FE", "temperature")
temp = math.floor(temp)
print("Текущая температура: " .. temp .. " C°")
```

Вместо адреса устройства можно испрользовать FriendlyName (в том числе кириллицу), либо текущий адрес устройства в сети (0x9EC8).
```
-- Получаем значение температуры и округляем до целых  
temp = GetState("датчик в комнате", "temperature")
temp = math.floor(temp)
print("Текущая температура: " .. temp .. " C°")
```


### SetState
Установка значения  устройства SetState("lamp_1", "brightness", "0")

Пример скрипта, который при нажатии кнопки выключателя lumi.sensor_switch включает освещение lamp_1:
```
if GetState("lumi.sensor_switch", "click") == "single" then
  -- toggle lamp
  current_brightness = GetState("lamp_1", "brightness")
  if current_brightness == "0" then
    SetState("lamp_1", "brightness", "255")
  else
    SetState("lamp_1", "brightness", "0")
  end
 
  -- print current temperature
  temp = GetState("lumi.weather", "temperature")
  print("Current temperature: " .. temp)
end
```
### Event
Event.Name, Event.nwkAddr, Event.ieeeAddr, Event.FriendlyName, Event.State.Name, Event.State.Value)


## Полезные ссылки 
1) On-line учебник по [lua](https://zserge.wordpress.com/2012/02/23/lua-%D0%B7%D0%B0-60-%D0%BC%D0%B8%D0%BD%D1%83%D1%82/)

2) Генератор lua скриптов  на основе [Blockly](http://www.blockly-lua.appspot.com/static/apps/code/index.html)
