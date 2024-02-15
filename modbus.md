# Шлюз ModBus

**Функционал поддерживается только для [Pro](/sls_pro.md) версии.**

## Поддержка протоколов:

- Modbus TCP Slave
- Modbus TCP Master
- Modbus RTU Master
- Modbus RTU Slave
- Modbus RTUoverTCP Master (в разработке)
- Modbus RTUoverTCP Slave (в разработке)

для RTU требуется адаптер RS485

## Функционал

- Поддержка RTU и TCP протоколов
- Поддержка всех типов регистров
- Настройка интервала опроса для каждого регистра
- Добавление устройств, регистров, чтение и запись значений из скриптов
- Настройка преобразований: множитель, смещение, округление, точность
- Поддержка разных форматов хранения: u16, s16, u32, s32, float
    
- Поддержка чтения массивов данных (в разработке)
- Поддержка word swap и byte swap (в разработке)

## Modbus Master

Постоянный автоматический опрос регистров устройств, передача значений при их изменении в MQTT, получение команд на изменение регистров из MQTT, веб-интерфейс для настройки и управления.

Запускается через команду LUA:

```lua
require("mb")
mb.startMaster()
```

После запуска команды появляется меню управления Modbus

Управление устройствами

![](/img/modbusSet.jpg)

Настройка устройства

![](/img/modbusSetDev.jpg)

Управление регистрами устройства

![](/img/modbusSetDevReg.jpg)

Настройка регистра

![](/img/modbusSetDevRegSet.jpg)

Также, управление устройствами и регистрами доступно из LUA. Перед использованием функций в скриптах необходимо объявлять библиотеку ModBus:

```lua
require("mb")
```

### mb.addDev()

Добавляет устройство. Существующее устройство изменяет. <!-- возвращает -->

```lua
result = mb.addDev(devName, slaveId, portName[,reqTimeout = 10[,readTimeout = 500]])
-- dev - STR, имя устройства
-- slaveId - INT, ID устройства 
-- portName - STR, Serial: s1 или s2; TCP: address[:502]
-- reqTimeout - INT, таймаут между запросами, по-умолчанию 10 сек.
-- readTimeout - INT, время ожидания ответа от устройства, по-умолчанию 500 мс.
```

```lua
require("mb")
mb.addDev("Датчик", 5, "10.0.1.10", 20, 1000)
```

### mb.addReg()

Добавляет регистр. Существующий регистр изменяет. <!-- возвращает -->

```lua
result = mb.addReg(devName, regName, regId[, regType[, interval[, format = 0[, count = 1[, scale[, offset[, precision]]]]]]])
-- devName - STR, имя устройства
-- regName - STR, имя регистра
-- regId - INT, ID регистра
-- regType - указывается без кавычек: mb.Holding, mb.Coil, mb.Discrete, mb.Input
-- format - пока доступен mb.u16
-- interval - FLOAT, интервал опроса в секундах, можно дробное число, например 0.5, по умолчанию 60
-- count - INT, по умолчанию 1
-- scale - FLOAT, множитель к значению, по умолчанию 1
-- offset - FLOAT, прибавляет к значению, по умолчанию 0
-- precision - INTб количество знаков после запятой, по умолчанию 1
```

```lua
require("mb")
mb.addReg("Датчик", "Сенсор", 100, mb.Holding, 30)
```

### mb.valueReg()

Получает значение регистра из кэша.

```lua
mb.valueReg(devName, regName)
-- devName - STR, имя устройства
-- regName - STR, имя регистра
```

```lua
require("mb")
local sensorVal = mb.valueReg("Датчик", "Сенсор")
print(sensorVal)
```

### mb.readReg()

Получает значение регистра чтением его немедленно.

```lua
mb.readReg(devName, regName)
-- devName - STR, имя устройства
-- regName - STR, имя регистра
```

```lua
require("mb")
local sensor = mb.readReg("Датчик", "Сенсор")
print(sensor)
```

###  mb.writeReg()

Записывает значение в регистр.

```lua
result = mb.writeReg(devName, regName, value)
-- devName - STR, имя устройства
-- regName - STR, имя регистра
-- value - записываемое значение
```

```lua
require("mb")
local result = mb.writeReg("Датчик", "Сенсор", 22.7)
print(sensor)
```

## Modbus Slave

Шлюз обеспечивает связь регистра Modbus с объектом в шлюзе, что позволяет обеспечить двухстороннюю передачу данных.

### TCP Slave

Используется стандартный TCP порт - 502. Запускается через команду LUA:

```lua
require("mb")
mb.startTCPSlave()
```

### RTU Slave

Запускается через команду LUA:

```lua
require("mb")
mb.startRTUSlave(SlaveId)
-- SlaveId - INT, идентификатор в сети Modbus RTU
```

Настройка параметров Serial интерфейса SLS производится в соответствующем [разделе](/bridge.md).

### Создание регистра

Регистр привязывается к объекту.

```lua
mb.addSlaveReg(regNum, object, scale)
-- regNum - INT, номер регистра
-- object - STR, объект SLS
-- scale - INT, множитель 
```

```lua
require("mb")
mb.startTCPSlave()
mb.addSlaveReg(1, 'room_temperature', 100)
```

## MQTT

### Чтение регистра

Топик `zgwXXXX/mb/{dev}/{reg}`

```bash
mosquitto_sub -h localhost -u mqtt -P mqtt -t ZigbeeSLS/mb/датчик/сенсор
```

### Запись в регистр

Записать значение в топик `zgwXXXX/mb/{dev}/set/{reg}` 

```bash
mosquitto_pub -h localhost -u mqtt -P mqtt -t ZigbeeSLS/mb/датчик/set/сенсор -m 123
```

## Примеры

### Конвертация значения регистра для управления Zigbee реле с обратной связью.

Добавить в init.lua:

```lua
require("mb")
mb.startTCPSlave()
mb.addSlaveReg(1, 'room_temperature', 100)
```

Конвертация значения регистра 0/1 в OFF/ON для управления Zigbee-реле с обратной связью.

```lua
require("mb")
--obj.onChange("relay1.state", "relay1.lua")
if Event.State ~= nil then -- on state change
  --local val = 0
  if (Event.State.Value == "ON") then val = 1 else val = 0 end
  obj.set("relay1.state", val)
elseif Event.Obj ~= nil then -- on obj change
  if (Event.Obj.Value == "1") then val = "ON" else val = "OFF" end
  zigbee.set("0x84FD27FFFECE981A", "state", val)
end
```
