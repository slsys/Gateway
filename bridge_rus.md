# Подключение шлюза SLS в качестве удаленного координатора

Включить режим моста можно в меню `Settings -> Services`

![](/img/bridge.png)

С помощью режима `Zigbee TCP bridge` шлюз можно использовать как беспроводной мост для подключения zigbee устройств к софтовому координатору [zigbee2mqtt](https://www.zigbee2mqtt.io/how_tos/how_to_connect_to_a_remote_adapter.html)

С помощью режима `Serial TCP bridge` шлюз можно использовать как беспроводной мост для использования, например [Modbus RTU over TCP](https://www.modbustools.com/)

![](/img/modbusTCP.jpg)

## Использование в HomeAssistant

Пример файла конфигурации `configuration.yaml`:

```yaml
serial:
  port: 'tcp://192.168.1.13:8881'
```
