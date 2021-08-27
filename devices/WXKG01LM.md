# Xiaomi WXKG01LM

| Model | WXKG01LM  |
|-|-|
| Vendor  | Xiaomi  |
| Description | MiJia wireless switch |
| Supports | single, double, triple, quadruple, many, long, long_release click |
| Picture | ![Xiaomi WXKG01LM](png2/WXKG01LM.png) |
---

* Zigbee2MQTT (https://www.zigbee2mqtt.io/devices/WXKG01LM.html)

# LUA Example for SLS Gateway

```lua
local action = zigbee.value("Button01", "action")
-- single
if action == "single" then
end

-- double
if action == "double" then
    zigbee.set("CurtainBigRoom", "position", 100)
end

-- triple
if action == "triple" then
    zigbee.set("CurtainBigRoom", "position", 0)
end

-- quadruple
if action == "quadruple" then
end

-- many
if action == "many" then
end

-- long
-- Attention always follows this event long_release
if action == "long" then
end

-- long_release
if action == "long_release" then
end
```