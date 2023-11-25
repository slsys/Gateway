# История изменений

## 2023.11.09d1

- *OS: Исправлена ошибка получения времени с NTP сервера при отсутствии интернета
- +Lua: Добавлена функция чтения произвольных данных из I2C устройств: os.readI2C(addr, offset)
- +Lua: Добавлена функция записи произвольных данных в I2C устройства: os.writeI2C(addr, offset, data)
- *Zigbee: Исправлено MQTT Discovery для presence
- *Zigbee: Исправлена отправка DefaultRsp
- *Zigbee: Полностью переработано конвертер для #272 Xiaomi Aqara Smart Radiator Thermostat E1 (SRTS-A01)
- *Zigbee: Переведен на новую систему конвертеров #318 Sonoff Wireless button (SNZB-01) (SONOFF / WB01)
- *Zigbee: Переведен на новую систему конвертеров #319 Sonoff Temperature and humidity sensor (SNZB-02) (SONOFF / TH01)
- *Zigbee: Переведен на новую систему конвертеров #320 Sonoff Motion sensor (SNZB-03) (SONOFF / MS01, SONOFF / MSO1, SONOFF / ms01, SONOFF / 66666)
- *Zigbee: Переведен на новую систему конвертеров #321 Sonoff Contact sensor (SNZB-04) (SONOFF / DS01)
- *Zigbee: Переведен на новую систему конвертеров #322 Sonoff Zigbee DIY Smart Switch (BASICZBR3) (SONOFF / BASICZBR3)
- *Zigbee: Переведен на новую систему конвертеров #323 Sonoff Zigbee smart plug (US version) (S31ZB) (SONOFF / S31 Lite zb)
- *Zigbee: Переведен на новую систему конвертеров #324 Sonoff Zigbee two way smart switch (ZBMINI) (SONOFF / 01MINIZB)
- *Zigbee: Переведен на новую систему конвертеров #329 Danalock BT/ZB smartlock (V3-BTZB/V3-BTZBE) (Danalock / V3-BTZB, Danalock / V3-BTZBE)
- +Zigbee: Новая модель для #211 Tuya Temperature & humidity sensor (IH-K009) (_TZ3000_zl1kmjqx / TS0201)
- +Zigbee: Поддержка для #325 Sonoff Wireless button (SNZB-01P) (SONOFF / SNZB-01P)
- +Zigbee: Поддержка для #326 Sonoff Temperature and humidity sensor (SNZB-02P) (SONOFF / SNZB-02P)
- +Zigbee: Поддержка для #327 Sonoff Smart curtain motor (ZBCurtain) (SONOFF / ZBCurtain)
- +Zigbee: Поддержка для #330 IKEA TRADFRI open/close remote (E1766) (IKEA of Sweden / TRADFRI open/close remote)
- +Zigbee: Поддержка для #331 IKEA FYRTUR block-out roller blind (E1757) (IKEA of Sweden / FYRTUR block-out roller blind)
- +Zigbee: Поддержка для #332 IKEA KADRILJ roller blind (E1926) (IKEA of Sweden / KADRILJ roller blind)

## 2023.10.25d1

- +OS: Добавлена базовая поддержка ИБП для SLS Hub
- *OS: Переработан протокол синхронизации времени
- +OS: Добавлена поддержка аппаратного сторожевого RTC таймера для SLS Hub
- *OS: Исправлено отображение времени аптайма больше 49 дней
- *OS: Улучшено автоматическое переключение WiFi/Ethernet при переподключении сетевого кабеля
- *Lua: Обновлен до версии 5.4.6
- *Lua: Ручное обновление NTP теперь работает, даже если автоматическое выключено
- +Lua: Добавлена возможность указать необязательный адрес сервера NTP: os.ntp([server])
- *Lua: Функция obj.setOpt() - теперь устаревшая, будет удалена в будущих версиях, заменена на obj.setType(name, type) и obj.setShare(name, mqtt) - управляет MQTT Notify
- *Obj: Исправлена ошибка сброса флага M при установки типа значения
- +MQTT: Добавлена возможность получать и задавать системный префикс: mqtt.prefix([topic])
- *MQTT: При переподключении к брокеру, восстанавливаются кастомные подписки
- *MQTT: Исправлено HA MQTT Discovery для термостатов
- *Zigbee: Улучшен процесс интервью для конечных устройств Tuya 
- *Zigbee: Исправлено отображение калибровки для #153 Tuya MOES TRV thermostat (HY369RT)
- *Zigbee: Добавлено чтение настроек и конвертация значений корректировок для #301 DIY Air sensor (DIYRuZ / DIYRuZ_AirSense)
- *Zigbee: Переведен на новую систему конвертеров #296 Philips Hue white A60 bulb E27/B22 (9290011370) (Plilips / LWB006, LWB014)
- *Zigbee: Переведен на новую систему конвертеров #299 OSRAM Smart plug (AB3257001NJ) (Osram / Plug 01)
- *Zigbee: Переведен на новую систему конвертеров #300 OSRAM LIGHTIFY LED Classic A60 clear (AC03641) (Osram / Classic A60 W Clear - LIGHTIFY)
- *Zigbee: Переведен на новую систему конвертеров #301 DIY Air sensor (DIYRuZ / DIYRuZ_AirSense)
- +Zigbee: Новая модель для #53 Tuya 4Ch relay (_TZ3000_u3oupgdy / TS0004)
- +Zigbee: Новая модель для #61 Tuya Avatto 2 gang switch module with N (_TZ3000_zmy4lslw / TS0002)
- +Zigbee: Новая модель для #53 Tuya 4Ch relay (_TZ3000_wkr3jqmr / TS0004)
- +Zigbee: Новая модель для #211 Tuya Temperature & humidity sensor (IH-K009) (_TZ3000_0s1izerx / TS0201)
- +Zigbee: Новая модель для #66 Tuya Smart Socket EU Plug 16A Adapter (BW SHP-15) (_TZ3000_okaz9tjs / TS011F)
- +Zigbee: Новая модель для #285 Heiman Gas sensor (HS1CG-E, HS3CG, SGPHM-I1, SGMHM-I1) (HEIMAN / GASSensor-EF-3.0)
- +Zigbee: Поддержка для #294 DIY Zigbee USB power control (@Novgorod73 / USBswitch)
- +Zigbee: Поддержка для #295 Philips Hue white E14 (9290020399) (Plilips / LWE002)
- +Zigbee: Поддержка для #297 Tuya Lellki Multiprise with 4 AC outlets and 2 USB super charging ports (16A) (WP33) (_TZ3000_air9m6af / TS011F)
- +Zigbee: Поддержка для #298 OSRAM DALI dimmer for DALI-based luminaires (only one device) (4062172044776_1) (Osram Sylvania / Zigbee 3.0 DALI CONV LI)
- +Zigbee: Поддержка для #302 Heiman Smart remote controller (HM1RC-2-E) (HEIMAN / RC-EF-3.0)
- +Zigbee: Поддержка для #303 Tuya Water leakage sensor (_TZ3000_k4ej3ww2 / TS0207)
- +Zigbee: Поддержка для #304 Tuya Avatto Wireless thermostat (ZWT198) (_TZE200_viy9ihs7 / TS0601)
- +Zigbee: Поддержка для #305 Tuya Water leakage sensor (YXZBW-1) (_TZ3000_js34cuma / TS0207)
- +Zigbee: Поддержка для #306 Tuya Din rail switch with power monitoring and threshold settings (SMKG-1KNL-EU-Z) (_TZ3000_qystbcjg / TS011F)
- +Zigbee: Поддержка для #307 DIY Xiaomi Temperature & humidity sensor with display (LYWSD03MMC) (Xiaomi / LYWSD03MMC)
- +Zigbee: Поддержка для #308 Tuya LoraTap Wireless switch with 6 buttons (SS9600ZB) (_TZ3000_iszegwpd / TS0046)
- +Zigbee: Поддержка для #309 Gledopto DIN Rail triac AC dimmer (GL-SD-003P) (GLEDOPTO / GL-SD-003P)
- +Zigbee: Поддержка для #310 Tuya Wireless switch with 6 buttons (SS9600ZB) (_TZE200_2m38mh6k / TS0601)
- +Zigbee: Поддержка для #311 Heiman Temperature & humidity sensor with display (HS3HT) (HEIMAN / HS3HT-EFA-3.0)
- +Zigbee: Поддержка для #312 Tuya EARU Din rail switch with power monitoring and threshold settings (EAKCB-T-M-Z) (_TZ3000_qystbcjg / TS011F)
- +Zigbee: Поддержка для #313 Tuya BSEED Wall Thermostat (_TZE204_5toc8efa / TS0601)
- +Zigbee: Поддержка для #314 Tuya iAlarm Infrared mtion sensor (SP02-ZB001) (_TZE200_mgxy2d9f / TS0601)
- +Zigbee: Поддержка для #315 Tuya Fingerbot plus (_TZ3210_dse8ogfy / TS0001, _TZ3210_j4pdtz9v / TS0001)
- +Zigbee: Поддержка для #316 DIY CO2 monitor with IPS display (efektalab / EFEKTA_iAQ2)
- +Zigbee: Поддержка для #317 DIY CO2 monitor with IPS display (efektalab / EFEKTA_iAQ3)

## 2023.07.23d1

- +Modbus: Базовая реализация шлюза Modbus TCP/RTU Master
- *Modbus: Улучшена стабильность работы Modbus RTU Slave
- +OpenTherm: Добавлена функция сброса ошибки из скриптов: thermo.resetErrors()
- +API: Добавлена HTTP API: /api/cloud
- +HVAC: Поддержка кондиционеров Haier
- *Cloud: Добавлена передача данных по Zigbee устройствам
- *OS: Исравлена ошибка (Failed to fetch) возникающая в веб-браузере 
- +Zigbee: Периодическая синхронизация времени для Tuya устройств
- +Zigbee: Поддержка стандартного представления датчиков для #228 DIY PTVO Universal switch (PTVO) (ptvo.info / ptvo.switch)
- *Zigbee: Исправлена работа #224 Tuya Temperature & humidity sensor with clock (_TZE200_locansqn / TS0601 )
- *Zigbee: Исправлена работа #282 Tuya Clamp meter (_TZE204_cjbofhxw / TS0601)
- +Zigbee: Новая модель для #284 Tuya Avatto 2CH dimmer module with N (_TZ3210_3mpwqzuu / TS110E)
- +Zigbee: Поддержка для #289 Tuya LELLKI Power cord 4 sockets EU (with power monitoring) (WP30) (_TZ3000_c7nc9w3c / TS011F)
- +Zigbee: Поддержка для #290 Tuya LoraTap Garage door opener with wireless sensor (GDC311ZBQ1) (_TZE200_wfxuhoea / TS0601)
- +Zigbee: Поддержка для #291 DIY Efekta Temperature sensor (EfektaLab / EFEKTA_T8, EFEKTA_T8_LR)
- +Zigbee: Поддержка для #292 DIY Efekta Plant Wattering Sensor with e-ink display (EfektaLab / EFEKTA_eFlora)
- +Zigbee: Поддержка для #293 Tuya GiEX Water irrigation valve (QT06) (_TZE200_a7sghmms / TS0601)

## 2023.05.09d2

- *Zigbee: Исправлено MQTT Discovery для power_on_behavior
- *Zigbee: Конвертер #47 удален, используйте #46 Heiman Smoke detector
- *Zigbee: Добавлено состояние voltage для #280 Xiaomi Aqara smart smoke detector (JY-GZ-01AQ)
- *Zigbee: Исправлено получение данных UART в #228 DIY PTVO Universal switch (PTVO) (ptvo.info / ptvo.switch)
- *Zigbee: Переведен на новую систему конвертеров #46 Heiman Smoke sensor (GS / SSHM-I1)
- *Zigbee: Переведен на новую систему конвертеров #193 Heiman Temperature & humidity sensor (HS1HT-N) (HEIMAN / HT-N)
- *Zigbee: Переведен на новую систему конвертеров #197 Heiman Contact sensor (HS3DS) (HEIMAN / DoorSensor-N-3.0)
- *Zigbee: Переведен на новую систему конвертеров #285 Heiman Gas sensor (HS3CG) (HEIMAN / GASSensor-N-3.0)
- *Zigbee: Переведен на новую систему конвертеров #286 Heiman Smart siren (SRHMP-I1) (GS / SRHMP-I1)
- *Zigbee: Переведен на новую систему конвертеров #287 Heiman Water leakage sensor (HS1WS-N) (HEIMAN / WaterSensor-N-3.0)
- +Zigbee: Новая модель для #15 Tuya Zigbee Smart Socket EU Plug 16A Adapter (_TZ3000_gznh2xla / TS011F)
- +Zigbee: Новая модель для #153 Tuya MOES TRV thermostat (HY369RT) (_TZE200_cpmgn2cf / TS0601)
- +Zigbee: Новая модель для #179 Tuya RGB+CCT light bulb (_TZ3210_r5afgmkl / TS0505B)
- +Zigbee: Новая модель для #193 Heiman Temperature & humidity sensor (HS1HT) (HEIMAN / TH-EM)
- +Zigbee: Новая модель для #197 Heiman Contact sensor (HS1DS) (HEIMAN / DoorSensor-EM)
- +Zigbee: Новая модель для #225 Tuya Avatto 1CH dimmer module with N (_TZ3210_k1msuvg6 / TS110E)
- +Zigbee: Новая модель для #285 Heiman Gas sensor (HS1CG-E) (HEIMAN / GASSensor-EM)
- +Zigbee: Новая модель для #285 Heiman Gas sensor (SGPHM-I1) (GS / SGPHM-I1)
- +Zigbee: Новая модель для #285 Heiman Gas sensor (SGMHM-I1) (GS / SGMHM-I1)
- +Zigbee: Новая модель для #286 Heiman Smart siren (HS2WD-E) (HEIMAN / WarningDevice)
- +Zigbee: Новая модель для #286 Heiman Smart siren (HS2WD-E) (HEIMAN / WarningDevice-EF-3.0)
- +Zigbee: Новая модель для #287 Heiman Water Leakage sensor (GS / SWHM-I1)
- +Zigbee: Поддержка для #283 Tuya Avatto 1 gang switch module with N (_TZ3000_tqlv4ug4 / TS0001)
- +Zigbee: Поддержка для #284 Tuya Avatto 2CH dimmer module with N (_TZ3210_wdexaypg / TS110E)
- +Zigbee: Поддержка для #288 Sonoff Temperature and humidity sensor with screen (SNZB-02D) (SONOFF / SNZB-02D)

## 2023.04.23d1

- +DALI: Доработана отправка обработка обратной связи в MQTT
- +HDL: Добавлена поддержка виртуального реле/диммера на 16 каналов
- +HDL: Добавлена поддержка DLP кондиционеров
- *KNX: Исправлена конвертация отрицательного значения для DPT_Value_Temp 
- *MQTT: Добавлено дефолтное значение топика для Discovery если нет конфига
- +OS: Добавлена HTTP API команда для перезагрузки: /api/reboot
- +OS: Добавлена проверка на ввод некорректных пинов
- +Lua: Добавлена функция определения оставшегося времени для таймера scripts.getTimer()
- +Lua: Добавлено управление Yeelight устройствами: yeelight.send()
- +Lua: Добавлена функция cloud.isConnected()
- *Audio: Переработана инициализация, увеличен приоритет потока воспроизведения
- *Audio: Добавлена возможность управлять включением усилителя: audio.amp()
- +Telegram: Добавлена возможность получения сообщений с каналов
- +Telegram: Добавлена команда сохранения, для избегания повтора входящего сообщения при перезагрузке: telegram.save()
- *Telegram: Исправлена ошибка при опросе наличия новых сообщений
- *Zigbee: Исправлена работа IAS кластера
- *Zigbee: Доработано MQTT Discovery для climate: preset & system_mode
- *Zigbee: Исправлено MQTT Discovery для color / color_temp
- *Zigbee: Добавлено состояние interval для #238 DIY PTVO Led Inform
- *Zigbee: Исправлен коэффициент для power в #90 Aqara power plug ZigBee EU (SP-EUC01)
- *Zigbee: Исправлена возможная некорректная температура в #44 Tuya Moes BHT series Thermostat
- +Zigbee: Новая модель для #201 TuYa Smart knob (ERS-10TZBVK-AA) (_TZ3000_qja6nq5z / TS004F)
- +Zigbee: Поддержка для #274 Tuya Wall Thermostat (_TZE200_u9bfwha0 / TS0601)
- +Zigbee: Поддержка для #275 DIY Temperature & humidity sensor (EfektaLab / EFEKTA_TH, EfektaLab / EFEKTA_TH_LR)
- +Zigbee: Поддержка для #276 Tuya Avatto 3 gang switch module w/o N (_TZ3000_ypgri8yz / TS0013)
- +Zigbee: Поддержка для #277 Tuya Illuminance sensor (_TZE200_khx7nnka / TS0601)
- +Zigbee: Поддержка для #278 Tuya RGB+CCT led controller (_TZ3210_klv2wul0 / TS0505B)
- +Zigbee: Поддержка для #280 Xiaomi Aqara smart smoke detector (JY-GZ-01AQ) (LUMI / lumi.sensor_smoke.acn03 )
- +Zigbee: Поддержка для #281 Xiaomi Aqara knob H1 (ZNXNKG02LM) (LUMI / lumi.remote.rkba01)
- +Zigbee: Поддержка для #282 Tuya Clamp meter (_TZE204_cjbofhxw / TS0601)

## 2023.02.15d7

- +Led: Добавлена индикация белым светом удержания сервисной кнопки в момент старта шлюза
- *Lua: Исправлена ошибка проверки Cron таймеров, когда их больше одного
- *API: Добавлен HTTP API для получения состояния таймеров: /api/scripts
- +Zigbee: Поддержка для #273 Tuya Soil moisture & temperature sensor (QT-07S) (_TZE200_myd45weu / TS0601)

## 2023.02.11d1

- +HDL: Добавлена базовая поддержка HDL SmartBus протокола, поддерживаются реле, диммеры, датчики температуры, DLP термостаты
- *MQTT: Добвлено отображение ошибки подключения на главной страницы
- *OS: Отключено сохранение состояния статусных светодиодов
- *OS: Команда os.setAssets(url) теперь перенаправляет запросы ко всем веб-ресурсам
- *OS: Для HTTP API Obj добавлен вывод флагов и привязанного скрипта
- +Obj: Добавлен тип данный JSON для объектов
- *Obj: Исправлена работа с объектами больше 254 символов
- +Lua: Добавлена возможнось выполнять код скрипта без записи его в файл, например из SimpleBind правила
- +Lua: Добавлена команда для запуска скрипта: scripts.run(name[, param])
- +Lua: Изменена функция привязки скрипта к объекту, старая (OnChange) будет удалена в ближайших версиях: obj.setScript(name[[, param], run_on_set])
- +Lua: Добавлена возможность указания периода опроса для telegram.receive(enable[, period = 1000])
- *Lua: При использовании explode больше не изменяется исходная строка
- *Lua: Исправлена передача параметра при запуске таймера
- *Lua: Теперь Obj.Value и Obj.OldValue в Event имеют корректный тип данных
- *Lua: Теперь State.Value и State.OldValue в Event имеют корректный тип данных
- +Zigbee: Добавлен тип данный JSON для состояний Zigbee устройств
- *Zigbee: Доработан интерфейс выбора и отображения конвертера
- +Zigbee: Новая модель для #5 Tuya Smart Valve Upgrade (TUYATEC-pf3wdnnk / TS0001) 
- *Zigbee: Исправлено автоопределение конвертера для #236 Tuya Avatto 2 gang switch module w/o N (_TZ3000_llfaquvp / TS0012, _TZ3000_jl7qyupf / TS0012)
- *Zigbee: Переработан конвертер для #67 Philips Hue motion sensor (9290012607) (Philips / SML001)
- *Zigbee: Переработан конвертер для #68 Philips Hue motion outdoor sensor (9290019758) (Philips / SML002)
- +Zigbee: Поддержка для #257 Xiaomi Aqara roller shade companion E1 (ZNJLBL01LM) (LUMI / lumi.curtain.acn002)
- +Zigbee: Поддержка для #258 DIY Relay 5Ch with PZEM monitor (Rele_5CH_PZEM) (zigbee-shop / Rele_5CH_PZEM)
- +Zigbee: Поддержка для #264 Tuya Wireless smart button (YSB22) (_TZ3000_ghqckvr8 / TS0041)
- +Zigbee: Поддержка для #265 Tuya Wireless smart button (ERS-10TZBVB-AA) (_TZ3000_ja5osu5g / TS004F)
- +Zigbee: Поддержка для #266 Tuya Luminance door sensor (ZG-102ZL) (_TZE200_pay2byax / TS0601)
- +Zigbee: Поддержка для #267 Tuya Water leakage sensor (_TZ3000_qhozxs2b / TS0207)
- +Zigbee: Поддержка для #268 Tuya Door sensor (_TZ3000_au1rjicn / TS0203)
- +Zigbee: Поддержка для #269 Tuya Motion sensor (ZM-40ZH-Q) (_TZ3000_msl6wxk9 / TS0202)
- +Zigbee: Поддержка для #270 DIY TVOC/eCO2 monitor with oled display (efektalab / EFEKTA_pixelAQ)
- +Zigbee: Поддержка для #271 DIY CO2 monitor with IPS display (efektalab / EFEKTA_iAQ)
- +Zigbee: Поддержка для #272 Xiaomi Aqara Smart Radiator Thermostat E1 (SRTS-A01) (LUMI / lumi.airrtc.agl001)

## 2023.01.08d1

- +OS: Управление эффектами статусных светодидов в HA
- *OS: Исправлена обратная связь при управлении стутусными светодиодами
- +Zigbee: Добавлено определение новых прошивок 20221214, 20221220, 20221226
- *Zigbee: Исправлена загрузка при отсутствии файла groups.json
- *Zigbee: Переработан конвертер для #153 Tuya MOES TRV thermostat (HY369RT)
- *Zigbee: Исправлена передача времени для #224 Tuya Temperature & humidity sensor with clock
- *Zigbee: Исправлено состояние action для #152 Aqara smart wall switch H1 EU (with neutral, double rocker) (WS-EUK04)
- *Zigbee: Добавлены состояния hooks_lock, hand_open и limits_calibration для #237 Xiaomi Aqara curtain driver E1 (ZNCLBL01LM)
- *Zigbee: Добавлено состояние power_outage_memory для #85 Aqara wireless relay controller (LLKZMK11LM)
- *Zigbee: Добавлено состояние flip_indicator_light для #142 Aqara E1 2 gang switch (with neutral) (QBKG41LM)
- *Zigbee: Добавлены состояния power_outage_memory, mode_switch, flip_indicator_light для #71 Xiaomi Aqara E1 1 gang switch (without neutral) (QBKG38LM)
- *Zigbee: Добавлены состояния power_outage_memory, mode_switch, flip_indicator_light для #51 Xiaomi Aqara E1 2 gang switch (without neutral) (QBKG39LM)
- *Zigbee: Добавлены состояния mode_switch, flip_indicator_light для #152 Aqara smart wall switch H1 EU (with neutral, double rocker) (WS-EUK04)
- +Zigbee: Поддержка для #253 Tuya Din smart relay (with power monitoring) (_TZ3000_qeuvnohg / TS011F)
- +Zigbee: Поддержка для #254 Aqara smart wall switch H1 EU (no neutral, double rocker) (WS-EUK02) (lumi.switch.l2aeu1)
- +Zigbee: Поддержка для #255 Aqara smart wall switch H1 EU (with neutral, single rocker) (WS-EUK03) (lumi.switch.n1aeu1)
- +Zigbee: Поддержка для #256 Aqara smart wall switch H1 EU (no neutral, single rocker) (WS-EUK01) (lumi.switch.l1aeu1)

## 2022.12.31d2

- +OS: Добавлена возможность передачи параметра page для UI
- +OS: Добавлена возможность отключения аутентификации для UI
- *OS: Исправлено HTTP API для управления светодиодом
- *OS: Возможность задать цвет для отображения входящих пакетов в режиме auto: os.ledReceive(r, g, b)
- *OpenTherm: Исправлены типы объектов
- +OpenTherm: Добавлено управление максимальным уровнем модуляции
- +OpenTherm: Добавлено получение максимальной уставки теплоносителя
- +Lua: Добавлена функция проверка существования файла: os.fileExists(fileName)
- +Lua: Добавлена функция удаления файла: os.fileRemove(fileName)
- +Lua: Добавлена функция переименования файла: os.fileRename(old, new)
- +Lua: Добавлена функция чтения размера файла: os.fileSize(fileName)
- +Zigbee: Добавлено состояние (команда) reset для всех устройств, для сброса на заводские настройки
- *Zigbee: Исправлено появление некорректных значений при получения данных по Tuya DP
- *Zigbee: Добавлены состояния sensitivity и selftest для #86 MiJia Honeywell smoke detector (JTYJ-GD-01LM/BW) (LUMI / lumi.sensor_smoke) 
- +Zigbee: Новая модель для #209 Tuya Smart Human Presense Sensor (_TZE204_ztc6ggyl / TS0601)
- +Zigbee: Поддержка для #251 Tuya MiBoxer Track RGB+CCT light (_TZB210_gdsxpa1z / TS0505B)
- +Zigbee: Поддержка для #252 DIY CO2 Mini Monitor with TFT Display, outdoor temperature, date and time. (efektalab / EFEKTA_iAQ_S)

## 2022.12.10d3

- +Telegram: Добавлена возможность форматировать текст и вставлять клавиатуру: telegram.send(text[, chat[, param]])
- +MQTT: Добавлена опция добавления FN в префикс Entity Name
- *MQTT: Теперь имя устройства Zigbee пробрасывается в HA независимо от настройки Use FN
- +Lua: Добавлена функция получения времени работы системы: os.getUptime([inSec])
- +Lua: Добавлена функция чтения файла в хранилище: os.fileRead(fileName)
- +Lua: Добавлена функция записи в файл в хранилище: os.fileWrite(fileName, value[, append])
- *Lua: Исправлена работа os.save()
- *Lua: Исправлена ошибка проверки диапазона CRON в scripts.setTimer()
- *Lua: Исправлена ошибка передачи пустого имя скрипта в obj.OnChange()
- *Zigbee: Добавлена поддержка EP 9-16 для #228 DIY PTVO Universal switch (PTVO) (ptvo.info / ptvo.switch)
- +Zigbee: Новая модель для #235 Tuya door sensor (_TZ3000_oxslv1c9 / TS0203)
- +Zigbee: Поддержка для #242 Tuya Temperature & humidity sensor with display (ZG-227ZL) (_TZE200_znbl8dj5 / TS0601, _TZE200_qoy0ekbd )
- +Zigbee: Поддержка для #243 Tuya Moes light switch - 2 gang (SR-ZS) (_TZ3000_18ejxno0 / TS0012)
- +Zigbee: Поддержка для #244 Tuya Motion sensor with scene switch (_TZ3210_cwamkvua / TS0202)
- +Zigbee: Поддержка для #245 Gledopto Zigbee 12W E26/E27 Bulb RGB+CCT (pro) (GLEDOPTO / GL-B-008P)
- +Zigbee: Поддержка для #246 Tuya Smoke sensor (_TZE200_ntcy3xu1 / TS0601)
- +Zigbee: Поддержка для #247 Tuya 3-phase clamp power meter (TS0601_3_phase_clamp_meter) (_TZE200_nslr42tt / TS0601)
- +Zigbee: Поддержка для #248 Tuya Led RGB-WW-CW Zigbee LED Spotlight (_TZ3210_leyz4rju / TS0505B)
- +Zigbee: Поддержка для #249 Tuya CO2 sensor with display (_TZE200_ogkdpgy2 / TS0601)
- +Zigbee: Поддержка для #250 Tuya Temperature & humidity external sensor with display (_TZE200_qyflbnbj / TS0601)

## 2022.11.26d1

- +OS: Добавлена возможность включить/отключить WiFi: os.wifi(true/false)
- *OS: Улучшена работа с WiFi Mesh сетями
- +MQTT: Discovery для шлюза
- +LED: Добавлена обратная связь
- +LED: Добавлена возможность управлять яркостью
- +Telegram: Поддержка получения сообщений: telegram.receive(true)
- *Zigbee: При сбросе Zigbee сети, так же меняется PanId на случайный
- +Zigbee: Новая модель для #66 Tuya Blitzwolf Smart Socket EU Plug 16A Adapter (BW SHP-15) (_TZ3000_cehuw1lw / TS011F)
- +Zigbee: Новая модель для #41 Tuya relay module 10A (_TZ3000_mx3vgyea / TS0001)
- +Zigbee: Новая модель для #41 Tuya relay module 10A (_TZ3000_46t1rvdu / TS0001)
- +Zigbee: Новая модель для #66 Tuya Blitzwolf Smart Socket EU Plug 16A Adapter (BW SHP-15) (_TZ3000_zloso4jk / TS011F)
- +Zigbee: Поддержка для #238 DIY PTVO Led Inform (modkam.ru / ptvo_led_inform)
- +Zigbee: Поддержка для #239 Tuya Temperature & Humidity Sensor (_TZ3000_fllyghyj / TS0201)
- +Zigbee: Поддержка для #240 Sonoff Zigbee smart switch (no neutral) (ZBMINIL2) (SONOFF / ZBMINI-L)
- +Zigbee: Поддержка для #241 Tuya Temperature & Humidity Sensor with display (_TZ2000_zsfvulde / TS0201, _TZ2000_a476raq2)

## 2022.11.14d2

- +Modbus: Добавлена поддержка Modbus RTU Slave
- +LED: Добавлена поддержка эффектов для адресных светодиодов
- *LED: Исправлена ошибка с адресными светодиодами, когда их больше 1шт
- *1-Wire: Исправлена проверка CRC
- *IO: Добавлена программная подтяжка для сервисной кнопки
- *Zigbee: Исправлен перезапуск интервью для Xiaomi устройств
- +Zigbee: Новая модель для #15 Tuya Zigbee Smart Socket EU Plug 16A Adapter (_TZ3000_hdopuwv6 / TS011F)
- +Zigbee: Поддержка для #235 Tuya door sensor (_TZ3000_26fmupbb / TS0203)
- +Zigbee: Поддержка для #236 Tuya Avatto 2 gang switch module w/o N (_TZ3000_llfaquvp / TS0012, _TZ3000_jl7qyupf / TS0012)
- +Zigbee: Поддержка для #237 Xiaomi Aqara curtain driver E1 (ZNCLBL01LM) (LUMI / lumi.curtain.acn003, LUMI / lumi.curtain.agl001)

## 2022.11.04d2

- +OS: Добавлен вывод RTC в /api/time
- *OS: Исправлена ошибка с галочкой DHCP после сброса настроек
- +MQTT: Возможность изменить Discovery топик, по умолчанию: homeassistant
- *MQTT: Если включен Friendly Name, то он используется в топике для HA MQTT Discovery
- *Zigbee: Переработан конвертер для #218 Tuya DIN Energy meter with Relay (DAC2161C) (_TZE200_eaac7dkw / TS0601)
- *Zigbee: Переработан конвертер для #229 Tuya Garage door opener (PJ-ZGD01) (_TZE200_nklqjk62 / TS0601)
- +Zigbee: Новая модель для #65 Tuya Moes TRV Thermostat (_TZE200_7yoranx2 / TS0601)
- +Zigbee: Новая модель для #157 Tuya Lellki Wall socket 16A (WK34) (_TZ3000_0yxeawjt / TS011F)
- +Zigbee: Поддержка для #221 Lytko 2 inch wall thermostat (Lytko / L101Z-SMI, Lytko / L101Z-DMI)
- +Zigbee: Поддержка для #222 Lytko 4 inch wall thermostat (Lytko / L101Z-SBI, Lytko / L101Z-DBI)
- +Zigbee: Поддержка для #224 Tuya Temperature & humidity sensor with clock (_TZE200_locansqn / TS0601)
- +Zigbee: Поддержка для #230 Tuya DIN Rail Energy meter with Relay (DDS238-2 v2) (_TZE200_bkkmqmyo / TS0601)
- +Zigbee: Поддержка для #231 Tuya Motion Illuminance sensor (ZG-204ZL) (_TZE200_3towulqd / TS0601)
- +Zigbee: Поддержка для #232 Lytko wall thermostat w/o display (Lytko / L101Z-SLI, Lytko / L101Z-DLI)
- +Zigbee: Поддержка для #234 Xiaomi Aqara wireless remote switch H1 (double rocker) (WXKG15LM) (LUMI / lumi.remote.b28ac1)

## 2022.08.13d8

- *OS: Уменьшено количество сообщений логирования в режиме VERBOSE
- *OS: В режиме авто изменена индикация в режиме точки доступа, добавлена индикация ошибки подключения к сети
- +KNX: Добавлена поддержка интеграции с MQTT
- +KNX: Добавлена поддержка группировки объектов
- *MQTT: Исправлена ошибка отправки в очередь MQTT, когда он отключен
- *Lua: Удалена функция zigbee.add()
- +Lua: Добавлена функция zigbee.setState(ident, name, value[[, type], events])
- +Lua: Добавлена функция zigbee.getStatus()
- *Zigbee: Переработан конвертер для #98 Aqara curtain motor (ZNCLDJ11LM) (LUMI / lumi.curtain)
- *Zigbee: Переработан конвертер для #84 Aqara High Precision Motion Sensor (RTCGQ13LM) (LUMI / lumi.motion.agl04)
- *Zigbee: Исправлен спам сообщениями для #44 Tuya Moes BHT series Thermostat (_TZE200_aoclfnxz / TS0601)
- +Zigbee: Новые модели для #18 Tuya DIN Rail Energy meter with Relay (DDS238-2) (_TZE200_fsb6zw01 / TS0601, _TZE200_ewxhg6o9 / TS0601)
- +Zigbee: Новая модель для #179 Tuya RGB+CCT light bulb (_TZ3000_kohbva1f, _TZ3210_jd3z4yig / TS0505B)
- +Zigbee: Поддержка для #201 TuYa Smart knob (ERS-10TZBVK-AA) (_TZ3000_4fjiwweb / TS004F)
- +Zigbee: Поддержка для #202 Fantem 4 in 1 multi sensor (ZB003-X) (_TZ3210_zmy9hjay / TS0202)
- +Zigbee: Поддержка для #203 Tuya Neo Water leak sensor (NAS-WS02) (_TZE200_qq9mpfhw / TS0601)
- +Zigbee: Поддержка для #204 Tuya Motion sensor (IH012-RT01) (_TZ3000_mcxw5ehu / TS0202)
- +Zigbee: Поддержка для #205 Tuya LoraTap Wireless switch with 3 buttons (SS600ZB) (_TZ3000_bi6lpsew / TS0043)
- +Zigbee: Поддержка для #206 Tuya Wireless wall switch with 3 buttons (ZBWS03A) (_TZ3000_uyjmm0et / TS0043, _TZ3000_w4thianr / TS0043)
- +Zigbee: Поддержка для #207 Tuya Avatto 3 gang switch module with N (_TZ3000_odzoiovu / TS0004)
- +Zigbee: Поддержка для #208 SLS Air Freshener (SLS / air.freshener)
- +Zigbee: Поддержка для #209 Tuya Smart Human Presense Sensor (_TZE200_ztc6ggyl / TS0601)
- +Zigbee: Поддержка для #210 Tuya Skydance 5 in 1 LED controller (WZ5) (_TZE200_6qoazbre, _TZE200_fcooykb4, _TZE200_gz3n0tzf, _TZE200_nthosjmx, _TZE200_9hghastn, _TZE200_9mt3kgn0, _TZE200_3thxjahu, _TZE200_g9jdneiu, _TZE200_mde0utnv, _TZE200_aa9awrng / TS0601)
- +Zigbee: Поддержка для #211 Tuya Temperature & humidity sensor (IH-K009) (_TZ3000_dowj6gyi / TS0201 )
- +Zigbee: Поддержка для #212 Tuya switch module with monitoring (_TZ3000_cjrngdr3 / TS011F)
- +Zigbee: Поддержка для #213 Tuya Neo alarm (NAS-AB02) (_TZE200_t1blo2bj / TS0601)
- +Zigbee: Поддержка для #214 Tuya Moes Smart Human Presense Sensor (_TZE200_ikvncluo / TS0601)
- +Zigbee: Поддержка для #215 Aqara E1 door & window contact sensor (MCCGQ14LM) (LUMI / lumi.magnet.acn001)

## 2022.06.06d3

- +OS: Поддержка Ethernet POE плат TTGO (для Pro версии)
- +OS: Возможность изменять параметры Serial портов (в конфиге)
- +OS: Поддержка Serial2TCP сервера
- *OS: Теперь система может загружаться без подключения к WiFi сети
- *OS: Редкая ошибка восстановления подключения к WiFi
- +Lua: Выводит локальный IP адрес: net.localIP()
- +Lua: Ввыводит внешний IP адрес (требутся интернет): net.remoteIP()
- +Lua: Поддержка CRON планировщика в команде script.setTimer()
- *Lua: Вычисление чисел с плавающей точкой
- *Lua: Запуск интервального таймера, когда не получено системное время
- *Lua: Теперь можно указать смещение в минутах для os.sunrise([offset]) и os.sunset([offset])
- +IO: Режимы бинарного входа MULTI_SWITCH, MOMENTARY, TOGGLE
- +Obj: Поддержка обратной связи (Ack)
- *Zigbee: Параметр switch_type для #42 Tuya relay module 16A
- *Zigbee: Полностью переработано конвертер доля #16 Aqara single switch module T1 (with neutral) (SSM-U01)
- +Zigbee: Новая модель для #41 Tuya relay module 10A (_TZ3000_mx3vgyea / TS0001)
- +Zigbee: Поддержка для #196 Heiman Smart switch - 2 gang with neutral wire (HS2SW2A/HS2SW2A-N) (HS2SW2L-EF-3.0, HS2SW2L-EFR-3.0, HS2SW2A-N, HS2SW2A-EF-3.0, HS2SW2A-EFR-3.0)
- +Zigbee: Поддержка для #197 Heiman contact sensor (SOHM-I1) (GS / SOHM-I1)
- +Zigbee: Поддержка для #198 Tuya LoraTap 2 gang switch module with N (RR620ZB) (_TZ3000_7ed9cqgi / TS0002)
- +Zigbee: Поддержка для #199 Heiman Motion sensor (SMHM-I1) (GS / SMHM-I1)
- +Zigbee: Поддержка для #200 Heiman Smart metering plug (SKHMP30-I1) (GS / SKHMP30-I1)

## 2022.04.09d8

- +OS: Добавлена Lua команда для монтирования SD-карты: result = os.mountSD(true/false)
- *OS: Исправлена инициализация I2C
- *Lua: Исправлена ошибка преобразования целых чисел в строки
- *Time: Исправлена ошибка синхронизации времени, приводящая к зависанию шлюза
- *DP: Исправлена ошибка при вызове метода Hangup
- +DP: Добавлена возможность изменения таймингов через dp.setTiming(idx, time_ms)
- +Zigbee: Поддержка для #194 OWON 32A/63A power circuit breaker (CB432) (OWON / CB432)
- *Zigbee: Исправлена обратная связь для #66 Tuya Blitzwolf Smart Socket EU Plug 16A Adapter (BW SHP-15)

## 2022.04.05d1

- *Lua: Исправлена инициализация при отсутствии PSRAM

## 2022.04.02d6

- *Lua: Исправлен запуск функции scripts.setTimer()
- *Zigbee: Исправлена выдача ошибки при загрузке устройств

## 2022.04.01d7

- +Storage: Добавлена поддержка SD карт
- +Storage: Добавлена поддержка файловой системы LFS
- *Storage: Исправлено отображение регистра имени файлов
- +Obj: Объекты теперь используют PSRAM
- +Time: Улучшена поддержка timezone, добавлен переход на летнее время
- *При работе через Ethernet не запрашивало аутентификацию
- *При работе через Ethernet некорректно передавался IP адрес в MQTT 
- *Zigbee: Исправлена конфигурация #29 Tuya Neo Temperature, Humidity And Light Intensity Sensor (_TZ3000_qaaysllp / TS0201)
- +Zigbee: Поддержка для #179 Tuya RGB+CCT light bulb (_TZ3210_remypqqm / TS0505B)
- +Zigbee: Исправлена работа #180 BYUN Smoke sensor (BYUN / Windows switch)
- +Zigbee: Исправлена работа #181 BYUN Gas sensor (BYUN / GAS  SENSOR)
- +Zigbee: Новая модель для #62 Tuya RGB led strip controller (_TZ3210_trm3l2aw / TS0503B)
- +Zigbee: Поддержка для #182 Tuya Moes Wall light switch w/o N (1 gang) (ZTS-EU_1gang) (_TZE200_amp6tsvy / TS0601)
- +Zigbee: Поддержка для #183 HEIMAN Smart scene switch (HS2SS) (HEIMAN / SceneSwitch-EM-3.0)
- +Zigbee: Поддержка для #184 Tuya Smart One-button switch (_TYZB01_trqoesc6 / TS0218)
- +Zigbee: Поддержка для #185 Tuya ELARI Smart Button (_TYZB01_0uwca9sz / TS0218)
- +Zigbee: Поддержка для #192 Tuya Moes RGB+CCT Zigbee LED Controller (ZLD-RCW) (_TZ3000_7hcgjxpc / TS0505B)
- +Zigbee: Поддержка для #193 Heiman GS temperature & humidity sensor (STHM-I1H) (GS / STHM-I1H)
- +Zigbee: Исправлена работа #186 Tuya SOS Button (_TYZB01_abtyryba / TS0218)
- +Zigbee: Добавлена новая модель для #1 Tuya Repeater (_TZ3000_m0vaazab / TS0207, _TZ3000_ufttklsz / TS0207, _TZ3000_5k5vh43t / TS0207)

## 2022.01.30d1

- +KNX: Реализована поддержка KNXnet/IP
- *Lua: Обновлен до версии 5.4.4
- +Lua: Реализованы гибкие таймеры скриптов: однократный и интервальный, старые скрипты OneMinTimer и OneSecTimer теперь не запускаются автоматически
- *Lua: Исправлено obj.set() для BOOL
- +Lua: Добавлено управление wdt: os.wdt(enable)
- +Lua: Добавлено чтение и запись атрибутов кластера: zigbee.readAttr() и zigbee.writeAttr()
- +Lua: Добавлено управление энергосбережением (по умолчанию выключена): os.setSleep(true/false/N)
- +Obj: Добавлена поддержка MQTT, оповещение, чтение и запись
- *Obj: Исправлено получение значения типа BOOL
- +Zigbee: Добавлена новая модель для #66 Tuya Blitzwolf Smart Socket EU Plug 16A Adapter (BW SHP-15) (_TZ3000_u5u4cakc / TS011F)
- +Zigbee: Добавлена новая модель для #61 Tuya Avatto 2 gang switch module with N (_TZ3000_bvrlqyj7 / TS0002)
- +Zigbee: Добавлена новая модель для #42 Tuya relay module 16A (_TZ3000_6axxqqi2 / TS0001)
- +Zigbee: Добавлена поддержка установки child_lock и local_temperature_calibration для #44 Tuya Moes BHT series Thermostat
- +Zigbee: Поддержка для #159 Gledopto Zigbee LED controller RGBW (GL-C-007 2 ID) (GL-C-007) (? / GL-C-007)
- +Zigbee: Поддержка для #160 Wiren Board 8 in 1 digital sensor (WB-MSW v.3 Zigbee) (Sprut.device / WBMSW3)
- +Zigbee: Поддержка для #161 JetHome 3-ch battery discrete input module (WS7) (JetHome / WS7)
- +Zigbee: Поддержка для #162 Tuya Human presence sensor (_TZE200_vrfecyku / TS0601)
- +Zigbee: Поддержка для #163 Tuya 1 gang switch module (without neutral) (_TZ3000_qmi1cfuq / TS0011)
- +Zigbee: Поддержка для #164 Tuya Avatto 4 gang switch module with N (_TZ3000_ltt60asa / TS0004)
- +Zigbee: Поддержка для #165 Tuya Zemismart Smart 6 key scene switch (ZM-RM02) (_TZE200_zqtiam4u / TS0601)
- +Zigbee: Поддержка для #166 Perenio Motion sensor (PECMS01) (LDS / ZHA-PirSensor)
- +Zigbee: Поддержка для #167 Perenio Door sensor (PECWS01) (LDS / ZHA-DoorLockSensor)
- +Zigbee: Поддержка для #168 Perenio Flood alarm device (PECLS01) (Perenio / PECLS01)
- +Zigbee: Поддержка для #169 Perenio Socket Plug (PEHPL0X) (Perenio / PEHPL0X)

## 2022.01.05d3

- *Zigbee: Исправлены таймеры устройств
- *Zigbee: Исправлена команды DataReq для Tuya
- +Zigbee: Поддержка для #157 Tuya Lellki Wall socket 16A (WK34) (_TZ3000_ps3dmato / TS011F)

## 2022.01.01d4

- *OpenTherm Lua: Исправлен баг включения/выключения отопления и нагрева ГВС
- +OpenTherm Lua: Добавлен строгий режим чтения данных
- +OpenTherm Lua: Добавлена возможность чтения/записи прозвольных команд
- +OpenTherm: Добавлено считывание температуры обратки
- +OpenTherm: Добавлена поддержка OTGW Monitor
- +DALI Lua: Добавлены команды querymax,querymin,storemax,storemin,storesystemfailure,querysystemfailure,querypoweron,queryscene,setdtr1,setdtr2,enabledevicetype,activate,setrgbdimlevel,setwafdimlevel
- +DALI: Переработана инициализация устройств
- +DALI: Реализован веб интерфейс, интеграция через MQTT
- +DALI: Добавлена поддержка DT8 устройств
- +IO: Входы теперь работают через прерывания, транслируют свое состояние в объекты
- *OS: При открытии веб интерфейса в режиме точки, сразу открываются настройки WiFi, а при сохранении выполняется перезагрузка
- +Zigbee: Добавлена конфигурация RST и BSL пинов модуля, выставляется высокий уровень, управление ими через веб-интерфейс 
- +Zigbee: При старте теперь перезагружается модуль через RST пин
- +Zigbee: Запуск координатора продолжается только если модуль ответил на Ping, отображение этого в веб-интерфейсе
- *Zigbee:  Небольшие исправления локальной температуры для Tuya trv
- *Zigbee: Небольшие исправления для Tuya SHP-15
- *Zigbee: Реализована отправка UART для PTVO
- *Zigbee: Исправлено отображение local_temperature_calibration для #74 Tuya Moes Thermostatic radiator valve (BRT-100)
- +Zigbee: Добавлена возможность чтения power для #97 Mi power plug ZigBee (ZNCZ02LM) (LUMI / lumi.plug)
- +Zigbee: Поддержка для #143 Tuya switch module w/o N (QS-Zigbee-S05-L) (_TZ3000_pmvbt5hh / TS0011 _TZ3000_sjpl9eg3 / TS0011)
- +Zigbee: Поддержка для #144 Aqara smart wall switch H1 Pro (with neutral, single rocker) (QBKG30LM) (lumi.switch.n1acn1)
- +Zigbee: Поддержка для #145 Aqara smart wall switch H1 Pro (with neutral, double rocker) (QBKG31LM) (lumi.switch.n2acn1)
- +Zigbee: Поддержка для #146 Aqara S1 smart touch panel (ZNCJMB14LM) (LUMI / lumi.switch.n4acn4)
- +Zigbee: Поддержка для #147 Tuya switch module w/o N (xabckq1v) (_TZ3000_xabckq1v / TS004F)
- +Zigbee: Поддержка для #148 Aqara Opple MX650 (XDD12LM) (lumi.light.cwopcn02)
- +Zigbee: Поддержка для #149 Aqara Opple MX960 (XDD11LM) (lumi.light.cwopcn01)
- +Zigbee: Поддержка для #150 Tuya BAC series thermostat (BAC-002-ALZB/ELZB) (_TZE200_dzuqwsyg / TS0601)
- +Zigbee: Поддержка для #151 Aqara smart wall switch H1 Pro (with neutral, three rocker) (QBKG32LM) (lumi.switch.n3acn1)
- +Zigbee: Поддержка для #152 Aqara smart wall switch H1 EU (with neutral, double rocker) (WS-EUK04) (lumi.switch.n2aeu1)
- +Zigbee: Поддержка для #153 Tuya MOES TRV thermostat (HY369RT) (_TZE200_cwnjrr72 / TS0601)
- +Zigbee: Поддержка для #154 Tuya Coolcam Smart Socket EU Plug 16A Adapter (NAS-WR01B) (_TZ3000_w0qqde0g / TS011F)
- +Zigbee: Поддержка для #156 eCozy Smart heating thermostat (1TST-EU) (Thermostat)

## 2021.11.02d3

- *Полностью переписаны конвертеры для проводных выключателей Xiaomi/Aqara
- +Все устройства Legrand переведены на новую систему конвертеров (https://slsys.io/action/supported_devices.html)
- +Поддержка для #136 Legrand Netatmo wired shutter switch (067776) (Legrand / Netatmo wired shutter switch)
- +Поддержка для #141 Aqara E1 1 gang switch (with neutral) (QBKG40LM) (lumi.switch.b1nc01)
- +Поддержка для #142 Aqara E1 2 gang switch (with neutral) (QBKG41LM) (lumi.switch.b2nc01)

## 2021.10.30d4

- *Запрещено создавать состояния без имени
- *Индикация нажатой сервисной кнопки в логе
- *Изменения MQTT Discovery для поддержки новых версий HA
- *Теперь pressure измеряется в hPa
- +Все устройства Xiaomi, Aqara, Life Control переведены на новую систему конвертеров (https://slsys.io/action/supported_devices.html)
- +Поддержка множителей для #19 DIY Impulse counter
- +Новая модель для #5 Tuya Smart Valve Upgrade (_TZ3000_rk2yzt0u / TS011F) 
- +Поддержка для #58 Xiaomi Aqara T1 human body movement and illuminance sensor (RTCGQ12LM) (lumi.motion.agl02)
- +Поддержка для #59 Aqara T1 temperature, humidity and pressure sensor (WSDCGQ12LM) (lumi.sensor_ht.agl02)
- +Поддержка для #60 Tuya Din smart relay (with power monitoring) (_TZ3000_8bxrzyxz / TS011F, _TZ3000_aigddb2b / TS0121)
- +Поддержка для #61 Tuya Avatto 2 gang switch module (_TZ3000_01gpyda5 / TS0002)
- +Поддержка для #62 Tuya RGB led strip controller (_TZ3000_i8l0nqdu / TS0503B)
- +Поддержка для #65 Tuya Moes TRV Thermostat (_TZE200_e9ba97vf / TS0601)
