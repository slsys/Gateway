# Update firmware of CC2538 (SBL) with working ESP

It is possible to update the firmware of the Zigbee coordinator CC2538 without the programmer J-Link (J-Tag), if the previous firmware did not disable Serial Boot Loader (SBL).
Note the working ESP will interfere with the serial port.

Instruction:
1. Re-solder 2 ESP/MOD jumpers (between SW1 and U7 chip) to MOD position.
2. Disconnect the ESP power. The easiest way is to cut the power line as shown here.
![home](/img/disable_esp.jpg)
3. Connect USB while pressing the RESET button (BOOT_Z on some boards). If there is no such button, you need to connect PA7 pin of CC2538 to ground by wiring. Important - the shield of the USB connector is not ground, look for the ground elsewhere!
4. Test to read the existing firmware. Download [cc2538-bsl.py](https://github.com/JelmerT/cc2538-bsl), and run the following command in Windows 
	```
	python cc2538-bsl.py -p "\\.\COM2" -r old_firmware.bin
	```
	You may need to change COM2 to correct one - see the device manager.
5. If the firmware was read and nothing was interrupted, you can flash the new firmware [JH_2538_2592_ZNP_UART_20201010.hex](/rom/JH_2538_2592_ZNP_UART_20201010.hex) using the following command 
	```
	python cc2538-bsl.py -p "\\.\COM2" -e -w -v JH_2538_2592_ZNP_UART_20201010.hex
	```
6. Unsolder the wiring from PA7, re-solder the ESP/MOD jumpers back to ESP, restore the ESP power line.

After booting the gateway, the new Zigbee version should be displayed immediately. The list of Zigbee devices will remain unchanged, but you need to reconnect all devices.
