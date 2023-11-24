# Создание собственной визуализации

В SLS gateway можно создать собственные визуализации. Для этого через меню `Actions -> Script` нужно создать файл `ui.html`. Он будет доступен при обращении к `/ui`. Для управления устройствами можно использовать встроенные [http_api](/http_api.md).

Следующий пример выводит значение температуры с датчика

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

---

## Пример dashboard от [Nick7zmail](https://t.me/nick7zmail)

<!-- <img src="/img/dash_n7z_3.jpg" width="30%"> <img src="/img/dash_n7z_2.jpg" width="60%">
<img src="/img/dash_n7z_1.jpg" width="92%"> -->

![](/dashboard/nick7zmail/20220204.jpg)

Скачать

- [15.02.2022](https://github.com/slsys/Gateway/dashboard/nick7zmail/ui_20220215.html). [Описание](https://t.me/slsys/91704)
- [11.01.2022](https://github.com/slsys/Gateway/dashboard/nick7zmail/ui_20220111.html). [Описание](https://t.me/slsys/88314)
- [v1 ](https://github.com/slsys/Gateway/dashboard/nick7zmail/ui.html)

---

## Пример dashboard от [BalagurovAV](https://t.me/BalagurovAV)

![](/dashboard/BalagurovAV/20231111.jpg)

[Скачать](https://github.com/BalagurOFF/sls_ui.html)

---

## Пример dashboard от [solominsn](https://t.me/solominsn)

> **solominsn**: Кстати, а кто-нибудь пользуется UI? Мне понравился Gateway/dashboard/nick7zmail/ui.html, хотел не много код подправить для себя, а там код обфускатором прошли.

> **solominsn**: я переписал не много этот код. Последняя версия bootstrap, свежий JS (думаю что все используют версию браузера не старше 2 лет). Не много упростил конфигурирование.

[Скачать](https://github.com/slsys/Gateway/dashboard/solominsn/ui_20221004.html)

---

## Пример dashboard с использованием [Bootstrap4](https://bootstrap-4.ru/docs/4.5/components/card/#content)

![](/img/dashboard4.jpg)

[скачать](https://github.com/slsys/Gateway/dashboard/bootstrap4/ui.html)

---

## Пример dashboard с использованием [Bootstrap4](https://bootstrap-4.ru/docs/4.5/components/card/#content)

![](/img/dashboard41.jpg)

[скачать](https://github.com/slsys/Gateway/dashboard/bootstrap41/ui.html)

---

## Пример dashboard с использованием [Bootstrap3](https://www.w3schools.com/bootstrap/bootstrap_panels.asp)

![](/img/dashboard3.jpg)

[скачать](https://github.com/slsys/Gateway/dashboard/bootstrap3/ui.html)
