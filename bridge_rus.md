# Подлючение шлюза SLS в качестве удаленного координатора

С помоью bridge прошивки  SLS шлюз можно использовать как беспроводной мост между для подключения к zigbee устройств к софтовому координатору [zigbee2mqtt](https://www.zigbee2mqtt.io/how_tos/how_to_connect_to_a_remote_adapter.html)

Сылка на прошивку [bridge](https://github.com/slsys/Gateway/tree/master/rom/2020.08.05d1-bridge.bin). Для подключения используйте порт 8881.

Пример файла конфигурации configuration.yaml

```
serial:
    port: 'tcp://192.168.1.13:8881'
```
