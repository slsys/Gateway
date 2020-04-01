# Поддержка lua скриптов

В последних версиях прошивки SLS ZGW появилась поддержка автоматизаций на основе скриптового языка программирования [lua](https://ru.wikipedia.org/wiki/Lua) 

## Возможности интеграции
Обращаться к устройствам шлюза можно по 
Числовые состояния можно без кавычек использовать.

Можно испрользовать кириллицу
```
-- Получаем значение температуры и округляем до целых  
temp = GetState("датчик в комнате", "temperature")
temp = math.floor(temp)
print("Текущая температура: " .. temp .. " C°")
```


## Список доступных функций
```GetState```
```SetState```


## Пример скрипта, который при нажатии кнопки выключателя lumi.sensor_switch включает освещение lamp_1
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








## Полезные ссылки 
1) On-line учебник по lua  https://zserge.wordpress.com/2012/02/23/lua-%D0%B7%D0%B0-60-%D0%BC%D0%B8%D0%BD%D1%83%D1%82/

2) Генераторы lua скриптов  на основе Blockly http://www.blockly-lua.appspot.com/static/apps/code/index.html
