# Использование GPIO на примерах решаемых задач

GPIO входы [6-ти канального модуля расширения](devices/din_mini_io_rus.md) [SLS DIN MINI](devices/din_mini_base_rus.md) легко могут быть использованы для решения типовых задач. Рассмотрим типовые методы использования на примерах.

## Концевик (геркон) ворот / калитки / датчика затопления емкости септика

В данном примере SLS DIN MINI считывает состояние GPIO, направляет уведомление об изменении состояния в telegram, отправляет измененное состояние объекта в mqtt, средствами Home-Assistant отправляет в telegram снапшот с камеры.

1. Убедимся, что DIP-перемычки нужных портов находятся в положении IN (нижнее положение). Порты модуля расширения в режиме IN срабатывают при замыкании входа на GND. Необходимые порты соединяем с GND (выходом "-") блока питания, второй полюс концевиков соединяем с соответствующими портами модуля ввода-вывода. В нашем примере подключены герконы калитки (вход 2) и откатных ворот (вход 4).
2. В [Web-интерфейсе SLS](/web.md) на вкладке Actions, если еще не создан, необходимо создать файл init.lua, этот скрипт выполняется при старте контроллера. Далее необходимо указать порты, которые будут в режиме чтения. Для интеграции с Home-Assistant, можно создать [объект](/objects.md), который при изменении gpio будет менять свое состояние.
   Пример скрипта init.lua

```lua
require "io"

io.addGPIOInput("input2", 25, gpio.INPUT, 2)     -- задаем режим работы входа 2 для GPIO32 контроллера (калитка)
io.addGPIOInput("input4", 27, gpio.INPUT, 2)     -- задаем режим работы входа 4 для GPIO32 контроллера (ворота)
obj.setType('vorota', 'STR')                     -- создаем объект с состоянием отслеживаемого объекта
obj.setType('kalitka', 'STR')                    -- создаем объект с состоянием отслеживаемого объекта
obj.setScript('io.input2.value', 'vorota.lua')   -- задаем имя скрипта, которое будет запускаться при изменении значения входа
obj.setScript('io.input4.value', 'vorota.lua')   -- задаем имя скрипта, которое будет запускаться при изменении значения входа
```

3. Пример скрипта vorota.lua

```lua
require "io"

if Event.Type == 2 then                             -- тип события, вызываемого при изменении объекта
  local Name = Event.Obj.Name                       -- имя объекта, который  вызвал скрипт
  local Value = Event.Obj.Value                     -- текущее значение объекта
  local OldValue = Event.Obj.OldValue               -- предыдущее значение объекта
  local vorota = io.get("input4", "value")          -- получим состояние GPIO в моменте
  local kalitka = io.get("input2", "value")         -- получим состояние GPIO в моменте
  local sunset_hour, sunset_min = os.sunset()       -- задаем время заката
  local sunrise_hour, sunrise_min = os.sunrise()    -- задаем время рассвета

  if vorota == 1 and Name== "io.input4.value" then
    telegram.send("Открываются уличные ворота")
    obj.set("vorota", "open")
  end
  if vorota == 0  and Name== "io.input4.value"then
    obj.set("vorota", "close")
    telegram.send("Уличные ворота закрыты") 
  end
  if kalitka == 1 and Name== "io.input2.value" then
    telegram.send("Калитка открыта")
    obj.set("kalitka", "open")
  end
  if kalitka == 0  and Name== "io.input2.value"then
    obj.set("kalitka", "close")
    telegram.send("Калитка закрыта") 
  end
  --свет включаем для любого из вариантов
  if (Event.Time.hour >= sunset_hour and Event.Time.min >= sunset_min) or (Event.Time.hour<= sunrise_hour and   Event.Time.min<=sunrise_min) then
    zigbee.set("0x00124B001EC83D62", "state_l5", "ON")
    zigbee.set("0x00124B001EC83D62", "state_l3", "ON")
  end
end
```
