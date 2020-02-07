# FAQ

## Question: What equipment is needed for the 2530 gateway

Answer: A selection from Aliexpress for assembling a gateway without soldering:
1. [ESP32 module 16Mb Flash 8Mb SRAM for firmware via OTA or ESP32 module with 4Mb flash for firmware without OTA](http://ali.pub/3sy77r)
2. [CC2530 module without an amplifier but with an external antenna](http://ali.pub/3sy5g6)
3. [Debugger CC debugger for CC2530 module firmware](http://ali.pub/3sy6nx)
4. [A set of wires](http://ali.pub/3sy6y1)

## Question: What equipment is needed for the 2538 gateway?
Answer: A selection from Aliexpress for assembling a gateway with a minimum of soldering (wiring only):
1. [ESP32 16Mb Flash 8Mb SRAM module for OTA firmware or ESP32 module with 4Mb flash for OTA-free firmware](http://ali.pub/485yaa)
2. [CC2538 module with CC2592 amplifier](http://ali.pub/485zeq)
3. [J-Link V9 Programmer](http://ali.pub/485zyk)
4. [A set of wires](http://ali.pub/3sy6y1)

## Question: Why is a ss2538-based gateway better than ss2530?
Answer: Modules based on ss2530 have a limit on the number of direct connections (up to 10pcs, depending on the firmware). The ss2530 also has a limited amount of available memory. Chika SDK is out of date. These problems are solved on the new chips [ss2538] (https://github.com/Koenkk/zigbee2mqtt/issues/1568) and [ss2652r] (https://github.com/Koenkk/zigbee2mqtt/issues/1429)

## Question: Are there any differences in the operation of the gateway on chips from TI and NXP?
Answer: The SDK is significantly different.


## Question: Is it possible to purchase finished equipment?
Answer: At present, prototypes for individual applications are being distributed. After debugging the whole process, it will be possible to purchase finished equipment in the online store.


## Question: What firmware to choose for the ZigBee module
Answer: It all depends on what module and amplifier you have.
The firmware must necessarily be based on Z-Stack 3.0.

For firmware via CC Debugger:

[Firmware for CC2530 module without amplifier](https://github.com/Koenkk/Z-Stack-firmware/raw/master/coordinator/Z-Stack_3.0.x/bin/CC2530_20190523.zip)

[Firmware for CC2530 module with CC2591 amplifier](https://github.com/Koenkk/Z-Stack-firmware/raw/master/coordinator/Z-Stack_3.0.x/bin/CC2530_CC2591_20190523.zip)

[Firmware for CC2530 module with CC2592 amplifier](https://github.com/Koenkk/Z-Stack-firmware/raw/master/coordinator/Z-Stack_3.0.x/bin/CC2530_CC2592_20190523.zip)

For firmware via J-Link:
[Firmware for CC2538 module with CC2592 amplifier](https://github.com/antst/CC2538-ZNP-Coordinator-firmware/files/3678300/CC2538ZNP-UART-without-SBL-cc2592.hex.zip)

## Question: How to flash ESP32

For initial firmware:
```
1. Download the archive with the flasher (full)
2. Connect the ESP32 to the computer via USB
3. Run the firmware via Flash.bat
4. Sometimes the batch file does not correctly determine the port, then it can be added to the batch file --port COM7
```
For further updates:
```
1. Download the archive with the current firmware version
2. Unzip it to any folder
3. In the web interface, select the firmware.bin file on the Update page
4. Click Start update.
```

## Question: How to flash CC2530

Answer:
[Instruction 1](https://modkam.ru/?p=1188)



## Question: How to flash CC2538

Answer:
[Instruction 1](https://modkam.ru/?p=1188)
[Instruction 2](https://myzigbee.ru/books/%D0%BF%D1%80%D0%BE%D1%88%D0%B8%D0%B2%D0%BA%D0%B8/page/ % D0% BF% D1% 80% D0% BE% D1% 88% D0% B8% D0% B2% D0% B0% D0% B5% D0% BC-% D1% 81% D1% 812538-% D1% 81 -% D0% BF% D0% BE% D0% BC% D0% BE% D1% 89% D1% 8C% D1% 8E-j-link)



## Question: How to add devices.

Answer: There are two ways:
1. Enable the join mode on the ZigBee page in the web interface (Start Join button)
2. You can send the value true/false to the topic ZigBeeGW/bridge/config/permit_join

## Question: How to add new Zigbee devices.

Answer: SLS Zigbee BLE Gateway automatically pairs with Zigbee devices. After pairing, it appears in the list of devices on the Zigbee tab. Green color indicates devices that already have a converter, and with which work has already been tested. Devices for which the converter is not yet available are marked in red. You can help with adding a device by providing screenshots of the device’s page and the pairing log on the [ISSUE] page (https://github.com/slsys/Gateway/issues) of the project. Open a new topic adding a new device with the name of the device.

## Question: How to add new BLE devices.

Answer: SLS Zigbee BLE Gateway can also work with BLE devices. Adding BLE devices requires immediate device availability. To help with the addition of new ones, you can only send the necessary equipment.


## Question: How to set the rules [SimpleBind] (/ simplebind.md)

Answer: There are two recording formats:
1. DstDeviceId
2. Cond, DstDeviceId, DstStateName, DstStateValue (Separated by commas, spaces are allowed)
Where:
• Cond - the value at which the rule will be executed
• DstDeviceId - the identifier of the device to which we will send the command
• DstStateName - The name of the state we will send
• DstStateValue - The value we will send
You can use comparison signs in front of the value in the Cond field. (>, <, =,!,> =, <=,! =, <>)
You can use several rules, separating them with a semicolon.
Examples:
• single, lamp_1, state, TOGGLE - For a button, when pressed once, switches lamp_1 mode
• ON, 0x00158D00007350D9, state, OFF; OFF, 0xABCD, state, ON - For the switch, inverts the mode for the relay
• single, door_lock, state, LOCK; double, door_lock, state, UNLOCK - Closes a lock on a click, opens on a double
• torsher_lamp - Sends the current state to torsher_lamp
• <40, humidifier, state, ON; > 60, humidifier, state, OFF - For a humidity sensor, turns on the humidifier if humidity is less than 40% and turns off if more than 60%

Example:
left, PTVO, state_bottom_left, TOGGLE; right, PTVO, state_bottom_right, TOGGLE

## Question: How to set the color of a light bulb or RGB controller
Answer:
It is necessary to send an object containing one of the options for setting the color to the color json state:
1. In the native CIE 1931 format: {"x": 0.8, "y": 0.04}
2. In RGB format: {"r": 0, "g": 255, "b": 0}
3. In RGB HEX format: {"hex": "#RRGGBB"}
4. Tone, Saturation: {"hue": 23525, "saturation": 80}
5. Tone: {"hue": 1665}
6. Saturation: {"saturation": 220}

Example:
Sending to the topic ZigBeeGW/0x00158D00011D8CB1/set values: {"color": {"r": 0, "g": 255, "b": 0}}

## Question: How to set the color temperature of a light bulb

Answer:
You must send the value in Mired units to the color_temp state.
The formula for the conversion: M = 1,000,000 / K where K is the temperature in Kelvin.

Example:
Color temperature 4000K, set the value ZigBeeGW / lamp_1 / set / color_temp to 250

## Question: How to control hardware LEDs?
Answer:
It is necessary to send the following content to the ZigBeeGW / led topic in JSON:
{"mode": "manual", "hex": "# FFFFFF"}

mode - sets the mode; valid values ​​are off, manual and auto
hex - color value in RGB Hex format.


## Question: What do the numbers in the pairing stages mean?
Answer:

0 - announcement received, interview starts

1 - received device description

2 - the number of active endpoints is received

3 - received device clusters

4- received model


Many Xiaomi devices will report the model themselves, so they work without completing the entire interview cycle.

## Question: How to add a new unsupported Zigbee device?

Answer: Many devices can be added remotely by the developers of the SLS ZGW project. The likelihood of adding new devices increases if there is a converter in [zigbee2mqtt](https://github.com/Koenkk/zigbee-herdsman-converters/blob/master/converters/fromZigbee.js)

Also an indisputable advantage for adding a new device is the interaction protocol in z2m. It can be obtained from zigbee2mqtt in zigbee debug mode with the following combination:

```
cd/opt/zigbee2mqtt
DEBUG = zigbee-herdsman: zStack: * npm start
```

Next, you need to perform the necessary actions with the device and save the screen output. These messages can be added to [issue](https://github.com/slsys/Gateway/issues) or using the [pastebin] service (https://pastebin.com)
