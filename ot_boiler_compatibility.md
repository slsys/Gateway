# Совместимость котлов

Зачастую доступность отдаваемых отопительными котлами параметров можно проверить в таблице совместимости [OTGW](http://otgw.tclcode.com/matrix.cgi#boilers). С контроллером [SLS Boiler Shield](/devices/din_mini_boiler_rus.md) было протестировано следующее отопительное оборудование:

[boiler.status]: ## "thermo.boiler.status (bool)"
[dhw.status]: ## "thermo.dhw.status (bool)"
[ot.error_code]: ## "thermo.ot.error_code (int)"
[boiler.temperature]: ## "thermo.boiler.temperature (float) "
[dhw.temperature]: ## "thermo.dhw.temperature (float)"
[boiler.temperature_outside]: ## "thermo.boiler.temperature_outside (float)"
[boiler.return_temperature]: ## "thermo.boiler.return_temperature (float)"
[boiler.modulation]: ## "thermo.boiler.modulation (float)"
[boiler.pressure]: ## "thermo.boiler.pressure (float)"
[bus_error_count]: ## "thermo.ot.bus_error_count (float)"
[bus_state]: ## "thermo.ot.bus_state (float) "
[boiler.target_temperature]: ## "thermo.boiler.target_temperature (float)"
[dhw.target_temperature]: ## "thermo.dhw.target_temperature (float)"
[boiler.max_temperature]: ## "thermo.boiler.max_temperature (float)"

## Baxi (OpenTherm)

|<sup>Модель</sup> | <sup> [blrst][boiler.status] </sup>|<sup> [dhwst][dhw.status]</sup>| <sup>[errcd][ot.error_code]</sup>|<sup>[temp][boiler.temperature]</sup>| <sup>[dhwt][dhw.temperature]</sup>| <sup>[outs][boiler.temperature_outside]</sup>| <sup>[rett][boiler.return_temperature]</sup>|<sup>[modul][boiler.modulation]</sup>|<sup>[prss][boiler.pressure]</sup>|<sup>[state][bus_state]</sup>|<sup> [blrtarget][boiler.target_temperature]</sup>|<sup>[dhwtrg][dhw.target_temperature]</sup>|<sup>[maxtemp][boiler.max_temperature]</sup>|
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-|
|<sup>Slim</sup>|<ul><li>- [x] </li></ul>|<ul><li>- [x] </li></ul>|<ul><li>- [x] </li></ul>|<ul><li>- [x] </li></ul>|<ul><li>- [x] </li></ul>|<ul><li>- [x] </li></ul>|<ul><li>- [ ] </li></ul>|<ul><li>- [ ] </li></ul>|<ul><li>- [ ] </li></ul>|<ul><li>- [x] </li></ul>|<ul><li>- [x] </li></ul>|<ul><li>- [x] </li></ul>|<ul><li>- [x] </li></ul>|
|<sup>Luna 3 Comfort</sup>|<ul><li>- [x] </li></ul>|<ul><li>- [x] </li></ul>|<ul><li>- [x] </li></ul>|<ul><li>- [x] </li></ul>|<ul><li>- [x] </li></ul>|<ul><li>- [x] </li></ul>|<ul><li>- [ ] </li></ul>|<ul><li>- [x] </li></ul>|<ul><li>- [x] </li></ul>|<ul><li>- [x] </li></ul>|<ul><li>- [x] </li></ul>|<ul><li>- [x] </li></ul>|<ul><li>- [x] </li></ul>|

## Buderus (OpenTherm)

|<sup>Модель</sup> | <sup> [blrst][boiler.status] </sup>|<sup> [dhwst][dhw.status]</sup>| <sup>[errcd][ot.error_code]</sup>|<sup>[temp][boiler.temperature]</sup>| <sup>[dhwt][dhw.temperature]</sup>| <sup>[outs][boiler.temperature_outside]</sup>| <sup>[rett][boiler.return_temperature]</sup>|<sup>[modul][boiler.modulation]</sup>|<sup>[prss][boiler.pressure]</sup>|<sup>[state][bus_state]</sup>|<sup> [blrtarget][boiler.target_temperature]</sup>|<sup>[dhwtrg][dhw.target_temperature]</sup>|<sup>[maxtemp][boiler.max_temperature]</sup>|
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-|
|<sup>Logomax u072</sup>|<ul><li>- [ ] </li></ul>|<ul><li>- [ ] </li></ul>|<ul><li>- [ ] </li></ul>|<ul><li>- [ ] </li></ul>|<ul><li>- [ ] </li></ul>|<ul><li>- [ ] </li></ul>|<ul><li>- [ ] </li></ul>|<ul><li>- [ ] </li></ul>|<ul><li>- [ ] </li></ul>|<ul><li>- [ ] </li></ul>|<ul><li>- [ ] </li></ul>|<ul><li>- [ ] </li></ul>|<ul><li>- [ ] </li></ul>|

## Protherm (Ebus)
