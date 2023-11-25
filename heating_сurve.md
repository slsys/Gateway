# Управление котлом по кривым отопления (DRAFT)

Это заготовка статьи.

Управление по заданному массиву ПЗА

Сценарий:

```lua
--функция для поиска уставки в кривой отопления
function getust(tbl, val)
    for i = 1, #tbl do
        if        (tbl[i][1] >= val )  then  return  tbl[i][2]  end 
    end return 30
end

--функция для получения значения температуры с другого контроллера SLS. В примере используется Zigbee датчик температуры, размещенный на веранде. 
function getrequest(url, ieee,name)
  return http.request2(url.."/api/zigbee?dev="..ieee.."&action=getStateValue&name="..name.."&token=e9d38bedb6412e.....ed9575","POST", "Content-Type: text/text; charset=utf-8\r\n", "body")
end

local url = "http://192.168.1.48"
local  temp_veranda = getrequest(url, "0xA4C138A5A7994B63","temperature")

--функция расчета среднего значения.
function math.average(t)
  local sum = 0
  for _,v in pairs(t) do -- Get the sum of all numbers in t
    sum = sum + v
  end
  return sum / #t
end

--кривая отопления, может быть изменена в зависимости от теплоемкости помещения
local krivaya = {    
 {-31,52},{-30,51},{-29,50},{-28,49},{-27,48.5},{-26,48},{-25,47.5}, {-24,47},{-23,46.5},{-22,46}, {-21,45.5},{-20,45},{-19,44.5},{-18,44}, {-17,43.5},{-16,43},{-15,42.5},{-14,42},{-13,41.5},{-12,41},{-11,40.5},
 {-10,40}, {-9,39.5}, {-8,39}, {-7,38.5},{-6,38}, {-5,37.5},{-4,37}, {-3,36.5},{-2,36},{-1,35.5},{0,34},{1,33.5},{2,33},{3,33},{4,33},{5,32.5},{6,32.5},{7,32},{8,32},{9,31.5},{10,31.5},{11,31},{12,31},{13,30},{14,25},
 {15,25},{16,25},{17,25},{18,25},{19,25}}

--
local ul  = '1w.28-96A907D6013C/temperature'  						  --датчик ds18b2, подключенный к SLS DIN MIN
local ul_temp, prev_ul_temp = obj.get(ul)    						  --получение старого и нового значения уличной температуры
local new_ust, prev_ust = obj.get('thermo.boiler.target_temperature') --получение текущего значения уставки 
local ul_ot, prev_ul_ot = obj.get('thermo.boiler.temperature_outside')--получение уличной темпетуры с котла по ОТ

--берем средние значения уличной температуры
local ul_average=math.average({ul_temp,ul_ot,temp_veranda})
local temp_average, prev_temp_average   	  = obj.get("average_temp")

--вводим коээфициент теплоекмости
local k=1.1
local ust=getust(krivaya, ul_temp)*k   --рассчет необходимой температуры для внесения уставки

--меняем уставку при необходимости 
if (ust~=new_ust) then
telegram.send("На улице ".. string.format ("%.2f", ul_average) .."("..ul_temp..","..ul_ot..","..temp_veranda.."), установлена уставка котла "..ust.." градусов, средняя температура в доме "..string.format ("%.2f", temp_average))
thermo.setBoilerTemperature(ust)
end
  
```

Управление по апроксимированным кривым отопления ПЗА от @Deimon9603 на основе [статьи](https://wdn.su/blog/1154)

```lua
local ul  = "1w.28-D16D2A4E2001/temperature"    --установленный на улице датчик температуры  
local ul_temp = obj.get(ul)  
local k = 0.4                                   --коэффициент отопительной кривой (изменяется в зависимости от теплового контура дома)
local a = -0.21 * k - 0.06
local b = 6.04 * k + 1.98
local c = -5.06 * k + 18.06
local x = -0.2 * ul_temp + 5     
local new_ust = math.floor ((a * x ^ 2) + (b * x) + c)
local ust = obj.get("thermo.boiler.target_temperature")
local min_temp = 35                             -- уставка минимальной температуры теплоносителя
if new_ust == min_temp then                     
  end
if new_ust < min_temp then
   thermo.setBoilerTemperature(min_temp)
end
if ust ~= new_ust then
   thermo.setBoilerTemperature(new_ust)
end
```

## Управление PID-регулированием

Это заготовка статьи.

## Полезные ссылки

[Логика управления котлом Vaillant](https://wdn.su/blog/1154)

[ПИД-регулятор своими руками](https://habr.com/ru/post/145991/)

[ПИД РЕГУЛЯТОР (урок от AlexGyver)](https://alexgyver.ru/lessons/pid)

[Кривая отопления. Что это и как ее настроить? (заметка на Дзене)](https://dzen.ru/a/X5J1nrKM8FGEFVn4)

[SLS: управление газовым котлом (заметка от Igor Kandaurov)](https://igorkandaurov.com/2022/10/12/sls-%D1%83%D0%BF%D1%80%D0%B0%D0%B2%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5-%D0%B3%D0%B0%D0%B7%D0%BE%D0%B2%D1%8B%D0%BC-%D0%BA%D0%BE%D1%82%D0%BB%D0%BE%D0%BC/)
