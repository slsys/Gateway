# SimpleBind

 SimpleBind позволяет настроить локальные  автоматизации внутри шлюза.

Есть два формата записи:
1.	DstDeviceId
2.	Cond, DstDeviceId, DstStateName, DstStateValue (Разделение запятыми, пробелы допускаются)

где:
```
Cond - значение при котором будет выполняться правило
DstDeviceId - Идентификатор устройства которому будем отправлять команду
DstStateName - Имя состояния которое будем отправлять
DstStateValue - Значение которое будем отправлять
```
Перед значением в поле Cond можно использовать знаки сравнения. (>, <, =, !, >=, <=, !=, <>)

Можно использовать несколько правил, разделяя их точкой с запятой.
Примеры:
```
•	single, lamp_1, state, TOGGLE - Для кнопки, при одиночном нажатии переключает режим lamp_1
•	ON, 0x00158D00007350D9, state, OFF; OFF, 0xABCD, state, ON - Для выключателя, инвертирует режим для реле
•	single, door_lock, state, LOCK; double, door_lock, state, UNLOCK - Закрывает замок при клике, открывает при двойном
•	torsher_lamp - Передает в torsher_lamp текущее состояние
•	<40, humidifier, state, ON; >60, humidifier, state, OFF - Для датчика влажности, включает увлажнитель если влажность меньше 40% и выключает если больше 60%
```

Пример:
```
left, PTVO, state_bottom_left, TOGGLE; right, PTVO, state_bottom_right, TOGGLE
```
