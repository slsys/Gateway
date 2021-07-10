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
```
mb.startTCPSlave()

mb.addReg(1, 'room_temperature', 100)
```
где:

1 - номер регистра

room_temperature - объект

100 - множитель к значению
