[Перейти на русскую версию сайта](/README_rus.md)

# Zigbee + BLE Gateway

This product is designed to work with common ZigBee, BLE devices. The gateway is based on the controller [ESP32 from Espressif](https://www.espressif.com/sites/default/files/documentation/esp32-wrover_datasheet_en.pdf). The tandem of chips from Texas Instruments [ZIgbee CC2538](https://www.ti.com/product/CC2538?utm_source=google&utm_medium=cpc&utm_campaign=epd-null-null-GPN_EN-cpc-pfgo-wwe&utm_content=CC2538&ds_k=%7b_dssearchterm%7d&DCM=yes&gclid=CjwKCAiA35rxBRAWEiwADqB37x__0Gm1rR2TUfCBETyuqrLjOtof6TuYSD3ZHzINYdNAbrXqfDxrwRoCpToQAvD_BwE&gclsrc=aw.ds) and amplifier [CC2592](https://www.ti.com/product/CC2592utm_source=google&utm_medium=cpc&utm_campaign=epd-null-null-GPN_EN-cpc-pf-google-wwe&utm_content=CC2592&ds_k=%7b_dssearchterm%7d&DCM=yes&gclid=CjwKCAiA35rxBRAWEiwADqB3776CVlMD1GHdk-unOn9R0YeMtlwAnjUvCIPuWvjhNqZRbiq6zy-ExoCxjYQAvD_BwE&gclsrc=aw.ds), either ready chip [NXP JN5168](https://www.nxp.com/products/wireless/zigbee/zigbee-and-ieee802.15.4-wireless-microcontroller-with-256-kb-flash-32-kb-ram:JN5168). To communicate with devices using the BLE protocol, the built-in capabilities of ESP32 are used.

Support for BLE and the NXP JN5168/JN5169 module is currently undergoing testing and is expected soon.

# General information
The gateway acts as the coordinator of Zigbee and allows you to:

1) Use most of the available Zigbee equipment. A list of supported and tested equipment is available at [link](/devices/devices.md). New equipment may be added after discussion with us.

2) Abandon the need to use cloud device manufacturers. As an alternative, it is proposed to use the cloud service [Smart Logic System](https://cloud.slsys.io), or native applications for Android and Apple iPhone (under development).

3) Use common local automation systems, such as [MajorDomo](https://majordomohome.com/), [ioBroker Smarthome](https://www.iobroker.net), [HomeAssistant](https://www.home-assistant.io), [Node-Red](https://nodered.org), etc. For integration with these systems, the MQTT protocol is used. The structure of the MQTT protocol topics is identical to the [zigbee2mqtt project](https://www.zigbee2mqtt.io), therefore, to use and integrate the gateway, there is no need to learn the scripting languages ​​of the above systems, since the protocol is basically already available using extension modules.


# Additional gateway features via the web interface
1. Management and viewing of device information through the Web interface of the gateway at http://ipadress (port 80). The ability to display the power source, battery level, available [EndPoint devices](https://community.nxp.com/thread/332332) in the web interface.

2. Creation of local automation within the gateway [SimpleBind](/simpleBind_eng.md).

3. The ability to write scripts in [Lua](https://ru.wikipedia.org/wiki/Lua). 

4. The ability to create groups to manage multiple devices at the same time (in development).

5. The ability to name the device. If you plan to use the gateway with local automation systems, it is recommended to check the box for sending addresses instead of devices.

5. Ability to remove the device.

6. The ability to display routes in the web-interface (in development).

8. The ability to establish direct connections [Bind](/bind_eng.md) between ZigBee devices without the participation of a coordinator to manage end devices.

9. Ability to control hardware [LEDs (address or RGB)] (/faq_eng.md).

10. The ability to control sound (in the presence of a soldered amplifier) (in development)

11. Ability to change PanId and channel number.

12. The ability to specify the name of the gateway on the network.

13. The ability to switch the gateway to the AP mode when the hardware button is pressed for 2-5 seconds after power is supplied.

14. The list of supported devices is constantly updated (information is in the converters.txt file in the archive with firmware)



# Hardware
The device can be [assembled independently](https://modkam.ru/?p=1342), or purchased on the site [Smart Logic System](slsys.io)

![home](/img/Mi_Gateway_Shield12.jpg)



# Device firmware
[Permanent link to device firmware](https://github.com/slsys/Gateway/tree/master/rom)

[History of firmware changes](/rom/history.md)

For firmware, run the appropriate batch file from the archive.
At the first start, an access point is created with a name of the form zgwABCD, without a password.
After connecting to it, the settings page automatically opens (if it didn’t open, you can go to the address 192.168.1.1) and register the connection to the access point and to the MQTT server (but you can also specify it later), press reboot and the gateway will connect to the access point and will start sending messages to MQTT. In case of problems with access to the captive portal, it is recommended to disable GPRS on Android smartphones. Firmware update can be done through the Web interface of the application.

Note: there are two firmware versions, for chips with 4mb and 16mb FLASH RAM. Versions are distinguished by the ability to update via OTA.


# Useful links:


## [First run](/firststart_eng.md)

## [Web interface](/web_eng.md)


## [SimpleBind](/simplebind_eng.md)

## [Touchlink](/touchlink_eng.md)

## [Binding](/bind_eng.md)


## [Support for Lua scripts](/lua_eng.md)


## [FAQ (Frequently Asked Questions)](/faq_eng.md)

## [zigbee2mqtt message structure](https://www.zigbee2mqtt.io/information/mqtt_topics_and_message_structure.html) (most commands supported)

## [SLS zigbee2mqtt message structure](/slscommand_eng.md)



# Integrations

Thanks to the use of the MQTT protocol, the SLS ZG gateway can be integrated with any local or cloud automation system. The structure of topics almost completely repeats [zigbee2mqtt](https://www.zigbee2mqtt.io/information/mqtt_topics_and_message_structure.html). For ease of use, many drivers or integration modules have been developed for many systems.


## [Integration with Majordomo](/int_majordomo_eng.md)

## [Integration with HomeAssistant](/int_has_eng.md) (under development)

## [Integration with Node-Red](/int_nodered_eng.md) (under development)

## [Integration with IObroker](/int_iob_eng.md) (under development)

## [Integration with Alice Yandex](/int_yandex_eng.md) (under development)

## [Integration with Google Home](/int_google_eng.md) (under construction)

## [Integration with HomeKit](/int_homekit_eng.md) (under development)

## [Integration with Domoticz](/int_domoticz_eng.md) (under development)
