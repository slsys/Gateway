# Additional message structure of the SLS Zigbee Gateway

The data are presented in the format ** topic {payload} **

## Reboot

```
ZigBeeXXXX/reboot {}
```

## Gateway backlight management

```
ZigBeeXXXX/led {“mode”: ”manual”, ”hex”: ”#FFFFFF”}
```

## Sensor friendly_name changing

```
ZigBeeXXXX/bridge/config/rename {"old": "0x00158D0001", "new": "water3"}
```
