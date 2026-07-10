# Режимы моста

Проброс сериал портов через TCP (удаленный координатор).

Включить режим моста можно в меню `Settings -> Services`

![](/img/bridge.png)

С помощью режима `Zigbee TCP bridge` шлюз можно использовать как беспроводной мост для подключения zigbee устройств к софтовому координатору [zigbee2mqtt](https://www.zigbee2mqtt.io/how_tos/how_to_connect_to_a_remote_adapter.html). Также в этом режиме можно [бэкапить/восстанавливать nvram zigbee модуля и обновлять прошивку шлюза по воздуху](https://www.youtube.com/watch?v=5VKNBCV6M4U).

С помощью режима `Serial TCP bridge` шлюз можно использовать как беспроводной мост для использования, например [Modbus RTU over TCP](https://www.modbustools.com/)

![](/img/modbusTCP.jpg)

## Использование в zigbee2mqtt

Пример файла конфигурации `configuration.yaml`:

```yaml
homeassistant: true
permit_join: false
mqtt:
  base_topic: zigbee2mqtt
  server: 'mqtt://localhost'
serial:
  port: 'tcp://192.168.1.13:8881'
  adapter: zstack
frontend:
  host: 0.0.0.0
  port: 8090
advanced:
  network_key: GENERATE
  pan_id: GENERATE
  ext_pan_id: GENERATE
```


[Настройка в Majordomo](https://connect.smartliving.ru/profile/2784/blog716.html)
