# Создание собственной визуализации

В SLS gateway можно создавать собственные визуализации - dashboards (панель управления), ui. Далее UI (user unterface, интерфейс пользователя). 

UI - это веб-страничка, которую пользователь SLS может написать сам используя технологии веб-дизайна. Начиная от простого html + javascript и заканчивая различными популярными движками типа React, Vue и т.д. За UI в SLS отвечает файлик `/ui.html` и соответвующий пункт меню веб-интерфейса SLS (UI).

Для разработки удобно подсмотреть как работает родной интерфейс SLS или UI, написанный энтузиастами, с помощью инструментов разработчика в современных браузерах.

## Информация об устройствах

Для вывода статической информации об устройствах достаточно считать файлик `devices.json` и распарсив его сформировать html страничку. В данный файлик сохраняется информация об устройствах каждые 30 минут и при ручном сохранении через меню `Actions` -> `Save`

Также, файлик с устройствами удобно использовать для первичной инициализации UI.

Пример `devices.json`

```json
{
    "13827": {
        "cid": 118,
        "DateCode": "20191205",
        "ep": {
            "1": {
                "devId": 770,
                "In": {
                    "0": true,
                    "3": true,
                    "1026": true,
                    "1027": true,
                    "1029": true,
                    "65535": true
                },
                "Out": {
                    "0": true,
                    "4": true,
                    "65535": true
                },
                "profId": 260
            }
        },
        "flags": 32,
        "friendly_name": "dht_bedroom-out",
        "ieeeAddr": "00158D00089762DB",
        "Interview": {
            "State": 4,
            "TS": 1671972416
        },
        "ManufCode": 0,
        "ManufName": "LUMI",
        "ModelId": "lumi.weather",
        "PS": 3,
        "Rtg": [],
        "SB": {
            "humidity": "espEasy.lua",
            "pressure": "#zigbee.setState(Event.ieeeAddr, \"pressure_mm\", zigbee.value(tostring(Event.ieeeAddr), \"pressure\") * 0.75, \"INT\")",
            "temperature": "espEasy.lua"
        },
        "st": {
            "battery": 92,
            "humidity": 69.7,
            "last_seen": 1706154914,
            "linkquality": 109,
            "pressure": 992.8,
            "pressure_mm": 744,
            "temperature": -12.98,
            "trSeqNum": 226,
            "voltage": 2.98
        },
        "supported": 1,
        "type": "EndDevice"
    }
}
```

Здесь, в удобном виде,  хранится вся информация об устройствах: состояния, адреса, кластеры. настроенные SimpleBind.

Пример получения устройств в переменную `allDevicesInfo`:

```javascript
const allDevicesInfo = await httpGet('/api/zigbee/devices');

async function httpGet(url) {
      console.log('starting http get');
      const response = await fetch(url);
      if (response.status !== 200) {
        throw new Error('Network response was not 200', response);
      }
      return response.json();
    }
```

## Обновление информации

Для динамического обновления информации в UI удобно использовать механизм веб-сокетов. SLS имеет свой WS сервер, который доступен по порту HTTP + 1. Например, если порт HTTP = 80, то порт WS = 81. Это следует учитывать при настройке маппинга портов для доступа к UI снаружи. Кстати, через веб-сокет обновляется и информация в родном веб-интефейсе SLS и работает страничка с логами.

Пример функций для работы с WS:

```javascript
let startedWebSockets = false;
let wsSocket;
let wsTimer = 0;
function startWebSockets() {
  // инициализация 
  let serverUrl = `ws://${window.location.hostname}:81/log`;
  try {
    console.log(`Connecting to ${serverUrl}`);
    wsSocket = new WebSocket(serverUrl)
  } catch (err) {
    console.error(`Failed connecting to ${serverUrl}`, err);
    return false;
  }
  wsSocket.binaryType = 'blob';
  // при успешной инициализации, подписаться на обновление zigbee устройств и/или объектов
  wsSocket.onopen = function (j) {
    console.log('WS connected');
    startedWebSockets = true;
    clearTimeout(wsTimer);
    subscribeToDevices();
    subscribeToObjects();
  };
  // обработчик, вызываемый при поступлении сообщения от WS
  wsSocket.onmessage = function (message) {
    console.log(`WS data`);
    const data = JSON.parse(message.data);
    console.log(`Action: ${data.category} Data: `, data);
    // ваша функция, котороя непосредственно обновляет ваш контент
    deviceUpdate(data);
  }
  // обработчик перезапуска WS при его закрытии
  wsSocket.onclose = function (j) {
    startedWebSockets = false;
    wsTimer = setTimeout('startWebSockets();', 5 * 1000);
    console.log('WS disconnected');
  }
}

// подписка на обновление устройств
function subscribeToDevices() {
  console.log('Sending menu subscription request...');
  wsSocket.send(JSON.stringify({
    action: 'subscribe',
    category: 'zigbee',
  }));
  return false;
}

// подписка на обновление объектов
function subscribeToObjects() {
  console.log('Sending menu subscription request...');
  wsSocket.send(JSON.stringify({
    action: 'subscribe',
    category: 'objects',
  }));
  return false;
}
```

Также, обновлять данные можно и статически с помощью  [http_api](/http_api.md). Следующий пример выводит значение температуры с датчика

```js
<script src="https://kit.fontawesome.com/a076d05399.js"></script>

<div id="lbl_temp"></div>

<script>
  fetch('/api/zigbee?action=getStateValue&dev=0x000D6F00106A67FD&name=temperature')
 .then((response) => {
   return response.json();
  })
  .then((data) => {
    document.getElementById("lbl_temp").innerHTML = '<i class="fa fa-thermometer-full" aria-hidden="true"></i> ' + data;
  });
</script>
```

Для управления устройствами также можно использовать встроенные [http_api](/http_api.md).

Пример функции для управления устройствами

```javascript
function setState(device, name, value) {
      return httpGet(`/api/zigbee?dev=${device}&action=setState&name=${name}&value=${value}`);
    }
```

---

## Примеры

Энтузиасты SLS разработали свои варианты UI и поделились с нами своими наработками. Можно использовать как в готовом виде, так и для разработки собственного варианта.

### Пример dashboard от [Nick7zmail](https://t.me/nick7zmail)

<!-- <img src="/img/dash_n7z_3.jpg" width="30%"> <img src="/img/dash_n7z_2.jpg" width="60%">
<img src="/img/dash_n7z_1.jpg" width="92%"> -->

![](/dashboard/nick7zmail/20220204.jpg)

Скачать

- [15.02.2022](https://github.com/slsys/Gateway/blob/master/dashboard/nick7zmail/ui_20220215.html). [Описание](https://t.me/slsys/91704)
- [11.01.2022](https://github.com/slsys/Gateway/blob/master/dashboard/nick7zmail/ui_20220111.html). [Описание](https://t.me/slsys/88314)
- [v1 ](https://github.com/slsys/Gateway/blob/master/dashboard/nick7zmail/ui.html)

---

### Пример dashboard от [BalagurovAV](https://t.me/BalagurovAV)

![](/dashboard/BalagurovAV/20231111.jpg)

[Скачать](https://github.com/BalagurOFF/sls_ui.html)

---

### Пример dashboard от [solominsn](https://t.me/solominsn)

> **solominsn**: Кстати, а кто-нибудь пользуется UI? Мне понравился Gateway/dashboard/nick7zmail/ui.html, хотел не много код подправить для себя, а там код обфускатором прошли.

> **solominsn**: я переписал не много этот код. Последняя версия bootstrap, свежий JS (думаю что все используют версию браузера не старше 2 лет). Не много упростил конфигурирование.

[Скачать](https://github.com/slsys/Gateway/blob/master/dashboard/solominsn/ui_20221004.html)

---

### Пример dashboard с использованием [Bootstrap4](https://bootstrap-4.ru/docs/4.5/components/card/#content)

![](/img/dashboard4.jpg)

[скачать](https://github.com/slsys/Gateway/blob/master/dashboard/bootstrap4/ui.html)

---

### Пример dashboard с использованием [Bootstrap4](https://bootstrap-4.ru/docs/4.5/components/card/#content)

![](/img/dashboard41.jpg)

[скачать](https://github.com/slsys/Gateway/blob/master/dashboard/bootstrap41/ui.html)

---

### Пример dashboard с использованием [Bootstrap3](https://www.w3schools.com/bootstrap/bootstrap_panels.asp)

![](/img/dashboard3.jpg)

[скачать](https://github.com/slsys/Gateway/blob/master/dashboard/bootstrap3/ui.html)
