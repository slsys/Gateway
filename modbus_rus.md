# Шлюз ModBus
Поддержка протоколов:
* Modbus TCP Slave (с версии 2021.05.26d6 регистры хранения (holdings))
* Modbus TCP Master (в разработке)
* Modbus RTU Master (в разработке)
* Modbus RTU Slave (в разработке)
* Modbus RTUoverTCP Master (в разработке)
* Modbus RTUoverTCP Slave (в разработке)

# Как работает
Шлюз обеспечивает связь регистра Modbus с объектом в шлюзе, что позволяет обеспечить двухстороннюю передачу данных.

# Примеры
Добавить в init.lua:
```lua
mb.startTCPSlave()

mb.addReg(1, 'room_temperature', 100)
```
где:

1 - номер регистра

room_temperature - объект

100 - множитель к значению

Конвертация значения регистра 0/1 в OFF/ON для управления Zigbee-реле с обратной связью:
```lua
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
