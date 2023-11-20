# SimpleBind

SimpleBind allows you to configure local automation inside the gateway.

There are two recording formats:

1. DstDeviceId
2. Cond, DstDeviceId, DstStateName, DstStateValue (Separated by commas, spaces are allowed)

Where:

```
Cond - the value at which the rule will be executed
DstDeviceId - The identifier of the device to which we will send the command
DstStateName - The name of the state we will send
DstStateValue - The value we will send
```

You can use comparison signs in front of the value in the Cond field. (>, <, =,!,> =, <=,! =, <>)

You can use several rules, separating them with a semicolon.
Examples:

```
• single, lamp_1, state, TOGGLE - For a button, when pressed once, switches lamp_1 mode
• ON, 0x00158D00007350D9, state, OFF; OFF, 0xABCD, state, ON - For the switch, inverts the mode for the relay
• single, door_lock, state, LOCK; double, door_lock, state, UNLOCK - Closes a lock on a click, opens on a double
• torsher_lamp - Sends the current state to torsher_lamp
• <40, humidifier, state, ON; > 60, humidifier, state, OFF - For a humidity sensor, turns on the humidifier if humidity is less than 40% and turns off if more than 60%
```

Example:

```
left, PTVO, state_bottom_left, TOGGLE; right, PTVO, state_bottom_right, TOGGLE
```
