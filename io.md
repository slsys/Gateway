# Работа с IO/GPIO

## IO

При работе с модулем `io` в LUA обязательно загружать библиотеку командой:

```lua
require "io"
```

### io.begin()

Инициализирует модуль `io`. Выполняется в `init.lua`

```lua
io.begin(use_mqtt)
-- use_mqtt: BOOL - использование MQTT:
  -- true - использовать
  -- false - не использовать
```

После инициализации в веб интерфейсе управления появится меню IO

![](/img/io_web.png)

Здесь:

- Ident - имя (ioName) пина, которое назначено при его создании
- Info - состояние пина
- Last Active Time - время, прошедшее с последнего изменения состояния пина

### io.addGPIOOutput()

Создает выход

```lua
io.addGPIOOutput(ioName, pin[, ioOutputType = 0[, power_on_behavior = "OFF"[, invert = false]]])
-- ioName - STR, имя выхода
-- pin - INT, номер контакта
-- ioOutputType - INT, тип выхода:
  -- SWITCH = 0
  -- PWM = 1
-- power_on_behavior - STR, состояние входа при инициализации
  -- OFF - выключено, по умолчанию
  -- ON - включен
-- invert - BOOL, инвертирование выхода, отключено по умолчанию
```

Типы выходов:

- SWITCH. В данном режиме пин имеет одно состояние `state` со значениями ON или OFF 
- PWM. В данном режиме пин имеет состояния:
  - brightness
  - state
  - pwm_freq = 3000 (100-15000)
  - pwm_res = 12 (8-12)
  - pwm_min = 1 (1-max)
  - pwm_max = 4096 (min-phys_max)
  - pwm_raw = 0
  - brightness_scale = 255
  - brightness_step = 10

### io.addGPIOInput()

Создает вход

```lua
io.addGPIOInput(ioName, pin, pinMode, pinType[, debounceDelay[, sendDelay[, holdDelay]]])
-- ioName - STR, имя входа
-- pin - INT, номер контакта
-- pinMode - STR, режим работы входа:
  -- gpio.INPUT: ввод
  -- gpio.INPUT_PULLUP: подтянуть к VCC
  -- gpio.INPUT_PULLDOWN: подтянуть к GND
-- pinType - INT, тип входа (см. далее в таблице)
-- debounceDelay - INT, защита от дребезга контакта. По умолчанию = 50 мс
-- sendDelay - INT, время ожидания второго/следующего клика. По умолчанию = 300 мс
-- holdDelay - INT, время когда фиксируется долгое удержание. По умолчанию = 1000 мс
```

| mode | Режим | Описание |
| - | - | - |
| 0 | SWITCH | В данном режиме шлюз контролирует текущее состояние входа, поэтому в этом режиме можно подключать датчики откр., движ., протечек, классические выкл. с фиксацией. |
| 1 | COUNTER | Простой подсчет событий, новое событие фиксируется по состоянию размыкания контакта, можно подключать например счетчики воды, газа и др. |
| 2 | MULTI_SWITCH | Предназначен для подключения выкл. без фиксации. Поддерживает следующие события: короткие (одиночное, двойное, тройное, четверное, и так до 255), длительное, короткое, а затем длительное, а так же завершение длительного нажатия. При завершении длительного фиксируется его длительность. Итого 767 разных событий. Можно строить очень сложную логику, имея всего 1 кнопку! |
| 3 | MOMENTARY | Режим фиксирует без задержки, присущей режиму MULTI_SWITCH события нажатия и отпускания кнопки без фиксации, при этом при отпускании фиксируется длительность нажатия. |
| 4 | TOGGLE | Для кнопок без фиксации, каждое нажатие переключает состояние входа. |   

Например, создание входа для геркона

```lua
io.addGPIOInput("gerkon", 28, gpio.INPUT_PULLUP, 2)
```

### io.addExtAnalogInput()

```lua
io.addExtAnalogInput(ioName, pin[, ioAnalogInputType = 0[, ioInterval = 5]])
-- ioName - STR, имя входа
-- pin - INT, номер контакта
```

### io.get()

```lua
value = io.get(ioName, stateName)
```

### io.set()

```lua
io.set(ioName, stateName, value)
```


## GPIO

Прямое управление контактами ввода/вывода (GPIO) чипа ESP32.

#### gpio.mode()

Управление режимом контакта:

- gpio.INPUT: ввод
- gpio.OUTPUT: вывод
- gpio.INPUT_PULLUP: подтянуть к VCC
- gpio.INPUT_PULLDOWN: подтянуть к GND

```lua
gpio.mode(pin, mode)
-- pin: номер контакта
-- mode: режим контакта - gpio.INPUT, gpio.INPUT_PULLUP, gpio.INPUT_PULLDOWN, gpio.OUTPUT
```

#### gpio.read()

Чтение сигнала с GPIO

```lua
gpio.read(pin[, ADC)
-- pin: номер контакта
-- ADC: true - чтение ADC; false - чтение цифрового сигнала
```

Задать каналу 2 режим входа, получить его значение:

```lua
gpio.mode(25, gpio.INPUT)
local value = gpio.read(25)
print(value)
```

#### gpio.write()

Запись уровня в GPIO

```lua
gpio.write(pin, level)
-- pin: номер контакта
-- level: уровень - gpio.HIGH - высокий, gpio.LOW - низкий
```

Например, задать каналу 4 режим выхода и включить его на 100мс:

```lua
gpio.mode(27, gpio.OUTPUT)
gpio.write(27, 1)
os.delay(100)
gpio.write(27, 0)
```

### PWM (ШИМ)

ШИМ-контроллер ESP32 имеет 16 независимых каналов, которые можно настроить для генерации ШИМ-сигналов с различными свойствами. Все выводы, которые могут выступать в качестве выходов, могут использоваться в качестве выводов ШИМ (GPIO с 34 по 39 не могут генерировать ШИМ).

#### gpio.pwmSetup()

Настройка ШИМ

```lua
gpio.pwmSetup(pin[, freq = 5000[, resolution = 8]])
-- pin: номер контакта
-- resolution: разрешение 1-16 bits
-- freq: частота
```

#### gpio.pwm()

Управление ШИМ

```lua
gpio.pwm(pin, value)
-- pin: номер контакта
-- value: значение ШИМ
```

Например, задать 32 пину режим выхода и включить ШИМ со скважностью 50%

```lua
gpio.mode(32, gpio.OUTPUT)
gpio.pwmSetup(32)
gpio.pwm(32, 255/100*50)
```
