# Поддержка lua скриптов

В шлюзе SLS имеется  поддержка автоматизаций на основе скриптового языка программирования [lua](https://ru.wikipedia.org/wiki/Lua). Редактор скриптов находится в меню Actions -> Scripts.  

Для написания  скрипта необходимо  создать новый файл, например  с именем script.lua и в него ввести  код на языке lua. 


Скриптовый stdout по команде print выводит информацию на экран страницы Scripts и в системный лог шлюза. Запустить скипт для тестов можно нажатием кнопки RUN.

При запуске шлюза выполняется файл /init.lua
![](/img/lua.png)


## Варианты запуска скриптов
1) Запуск скрипта при изменении состояния устройства. На вкладке Zigbee необходимо зайти в параметры устройства и в окне SimpleBind указать имя файла скрипта (префикс / необязателен).
2) Запуск скрипта по времени. Ожидается.
3) Запуск скрипта по подписке mqtt. Ожидается.
4) Запуск скрипта при вызове http api. Ожидается.


## Список доступных функций и структур
1) [http.request()](lua_rus.md#http.request)
2) [zigbee.value()](lua_rus.md#zigbee.value())
3) [zigbee.get()](lua_rus.md#zigbee.get())
4) [zigbee.set()](lua_rus.md#zigbee.set())
5) [Event](lua_rus.md#event) 
6) [os.time()](lua_rus.md#os.time()) 
7) [obj.get()/obj.set()](lua_rus.md#obj.get()/obj.set()) 
8) [mqtt.pub()](lua_rus.md#mqtt.pub()) 


### http.request 
Вызов URL запроса http.request(url[:port], [method, headers, body])

В данным момент поддерживается только 'http://' протокол.


Пример переключение gpio 12 для прошивки wifi-iot
```
http.request("http://192.168.1.34/gpio?st=2&pin=12")
```

Пример отправки POST запроса:
```
http.request("http://postman-echo.com:80/post?foo1=bar1", "POST", "Content-Type: text/text; charset=utf-8\r\n", "body") 
```

Пример переключения реле sw1 в прошивке espHome:

```
  http.request("http://192.168.1.71/switch/sw1/toggle", "POST") 
```

Пример переключение gpio для MegaD при однократном нажатии btn_2 пульта Jager
```
  if Event.State.Value == "btn_2_single"  then
    http.request("http://192.168.2.200/objects/?object=MegaD1-12&op=m&m=switch")
  end
```

Запрос инфомации со стороннего ресурса
```
local Response = http.request("http://wtfismyip.com/text")
print("My IP: " .. Response)
```


### zigbee.value()
Получение значения состояния устройства из кэша zigbee.value("ieeard", "temperature")

```
-- Получаем значение температуры и округляем до целых  
temp = zigbee.value("0x00158D0001A2D2FE", "temperature")
temp = math.floor(temp)
print("Текущая температура: " .. temp .. " C°")
```

Вместо адреса устройства можно испрользовать FriendlyName (в том числе кириллицу), либо текущий адрес устройства в сети (0x9EC8).
```
-- Получаем значение температуры и округляем до целых  
temp = zigbee.value("датчик в комнате", "temperature")
temp = math.floor(temp)
print("Текущая температура: " .. temp .. " C°")
```

### zigbee.get()
Вызывает команду GET в ковертере. Используется для ручного чтения состояний из устройств.

Пример: 
```
  zigbee.get("lamp1", "brightness")
```


### zigbee.join()
Синтаксис: zigbee.join(duration, [target])

Открывает сеть для подключения новых устройств на duration секунд (макс. 255), для устройства target или для всей сети. 

```
  zigbee.join(255, "plug1")
```


### zigbee.set()
Установка значения  устройства zigbee.set(Ident, StateName, StateValue)

Пример скрипта, который при нажатии кнопки выключателя lumi.sensor_switch включает освещение lamp_1:
```
if zigbee.value("lumi.sensor_switch", "click") == "single" then
  -- toggle lamp
  current_brightness = zigbee.value("lamp_1", "brightness")
  if current_brightness == 0 then
    zigbee.set("lamp_1", "brightness", 255)
  else
    zigbee.set("lamp_1", "brightness", 0)
  end
 
  -- print current temperature
  temp = zigbee.value("lumi.weather", "temperature")
  print("Current temperature: " .. temp)
end
```

### Event
Структура Event например позволяет использовать один и тот же скрипт для разных состояний или устройств.

Возможные варианты использования:
Event.Name - Имя файла скрипта
Event.nwkAddr - nwkAddr устройства, которое вызывало скрипт
Event.ieeeAddr - ieeeAddr устройства, которое вызывало скрипт
Event.FriendlyName - FriendlyName устройства, которое вызывало скрипт
Event.State.Name - Имя состояния которое вызвало скрипт
Event.State.Value - Новое значение состояния

Пример скрипта для включения света:
```
if Event.State.Value == "single" then 
  value = 255 
elseif Event.State.Value == "double" then 
  value = 0 
else 
  return 
end
zigbee.set("lamp_1", "brightness", value)
```


### os.time()
os.time() возвращает Unix время.


### os.delay()
Синтаксис: os.delay(ms)

Пауза на ms миллисекунд (1сек = 1000 мс)


### os.millis()
Возвращает количество миллисекунд с момента загрузки системы


### os.save()
Сохраняет данные


### os.restart()
Перезагружает ОС


###  obj.get() / obj.set()
obj.get(ObjectName) / obj.set(ObjectName, ObjectValue) для сохранения и получения объекта для обмена данными между скриптами


### mqtt.pub()
mqtt.pub(topic, payload) публикует на MQTT сервер в топик topic значение payload. 


## Полезные ссылки 
1) On-line учебник по [lua](https://zserge.wordpress.com/2012/02/23/lua-%D0%B7%D0%B0-60-%D0%BC%D0%B8%D0%BD%D1%83%D1%82/)

2) Генератор lua скриптов  на основе [Blockly](http://www.blockly-lua.appspot.com/static/apps/code/index.html)
