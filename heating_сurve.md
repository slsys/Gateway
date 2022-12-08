# Управление котлом по кривым отопления
Это заготовка статьи.

Сценарий:
```lua
function getust(tbl, val)
    for i = 1, #tbl do
        if        (tbl[i][1] >= val )  then  return  tbl[i][2]  end 
    end return 30
end

function getrequest(url, ieee,name)
  return http.request2(url.."/api/zigbee?dev="..ieee.."&action=getStateValue&name="..name.."&token=e9d3......f49476a2ed9575","POST", "Content-Type: text/text; charset=utf-8\r\n", "body")
end

local url = "http://192.168.1.48"
local  temp_veranda = getrequest(url, "0xA4C138A5A7994B63","temperature")

function math.average(t)
  local sum = 0
  for _,v in pairs(t) do -- Get the sum of all numbers in t
    sum = sum + v
  end
  return sum / #t
end


local krivaya = {    
 {-31,52},{-30,51},{-29,50},{-28,49},{-27,48.5},{-26,48},{-25,47.5}, {-24,47},{-23,46.5},{-22,46}, {-21,45.5},{-20,45},{-19,44.5},{-18,44}, {-17,43.5},{-16,43},{-15,42.5},{-14,42},{-13,41.5},{-12,41},{-11,40.5},
 {-10,40}, {-9,39.5}, {-8,39}, {-7,38.5},{-6,38}, {-5,37.5},{-4,37}, {-3,36.5},{-2,36},{-1,35.5},{0,34},{1,33.5},{2,33},{3,33},{4,33},{5,32.5},{6,32.5},{7,32},{8,32},{9,31.5},{10,31.5},{11,31},{12,31},{13,30},{14,25},
 {15,25},{16,25},{17,25},{18,25},{19,25}}

--
local ul  = '1w.28-96A907D6013C/temperature' 
local ul_temp, prev_ul_temp = obj.get(ul)
local ul_ot, prev_ul_ot = obj.get('thermo.boiler.temperature_outside')


local ul_average=math.average({ul_temp,ul_ot,temp_veranda})
local temp_average, prev_temp_average   	  = obj.get("average_temp")


local k=1.1
local ust=getust(krivaya, ul_temp)*k


print (ust)


telegram.send("На улице ".. string.format ("%.2f", ul_average) .."("..ul_temp..","..ul_ot..","..temp_veranda.."), установлена уставка котла "..ust.." градусов, средняя температура в доме "..string.format ("%.2f", temp_average))
thermo.setBoilerTemperature(ust)
--thermo.setDHWTemperature(65);
```


Полезные ссылки: 

[Логика управления котлом Vaillant](https://wdn.su/blog/1154)

[ПИД-регулятор своими руками](https://habr.com/ru/post/145991/)

[ПИД РЕГУЛЯТОР урок от AlexGyver](https://alexgyver.ru/lessons/pid/])

[Кривая отопления. Что это и как ее настроить?](https://dzen.ru/a/X5J1nrKM8FGEFVn4)
