# Xiaomi MFKZQ01LM

| Model: | MFKZQ01LM  |
|-|-|
| Vendor:  | Xiaomi  |
| Description: | Mi/Aqara smart home cube |
| Supports: | shake, wakeup, fall, tap, slide, flip180, flip90, rotate_left and rotate_right |
| Picture: | ![Xiaomi MFKZQ01LM](png2/MFKZQ01LM.png) |
---

* Zigbee2MQTT (https://www.zigbee2mqtt.io/devices/MFKZQ01LM.html)

# LUA Example for SLS Gateway

```lua
angle    = zigbee.value("Cube", "angle")
action   = zigbee.value("Cube", "action")
side     = zigbee.value("Cube", "side")
position = zigbee.value("CurtainBigRoom", "position")

next_position = math.floor(position + (angle / 2))
if next_position > 100 then next_position = 100 end
if next_position < 0 then next_position = 0 end

if side == 0 then
  if action == "rotate_right" and position < 100 then
    zigbee.set("CurtainBigRoom", "position", next_position)
  end

  if action == "rotate_left" and position > 0 then
    zigbee.set("CurtainBigRoom", "position", next_position)
  end

  if action == "tap" then
    -- close
    if side == 0 then next_position = 0 end
    zigbee.set("CurtainBigRoom", "position", next_position)
  end
end

-- open
if side == 3 and action == "tap" then
  zigbee.set("CurtainBigRoom", "position", 100)
end


print("Позиция штор: " .. position)
print("Следующая позиция: " .. next_position)
```