[Go to the english version of the site](/ui_eng.md)

# Создание собственной  визуализации

В SLS gateway можно создать собственные визуализации. Для этого через меню Actions-> Script нужно создать файл ui.html. Он будет доступен при обращении к /ui. Для управления устройствами можно использовать встроенные [http_api](/http_api_rus.md).


Следующий пример выводит значение температуры с датчика
```
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

## Пример dashboard с использованием [Bootstrap4](https://bootstrap-4.ru/docs/4.5/components/card/#content):
[![](/img/dashboard4.jpg)
скачать](https://raw.githubusercontent.com/slsys/Gateway/master/dashboard/bootstrap4/ui.html)

## Пример dashboard с использованием [Bootstrap4](https://bootstrap-4.ru/docs/4.5/components/card/#content):
[![](/img/dashboard41.jpg)
скачать](https://raw.githubusercontent.com/slsys/Gateway/master/dashboard/bootstrap41/ui.html)


## Пример dashboard с использованием [Bootstrap3](https://www.w3schools.com/bootstrap/bootstrap_panels.asp):
[![](/img/dashboard3.jpg)
скачать](https://raw.githubusercontent.com/slsys/Gateway/master/dashboard/bootstrap3/ui.html)


## Пример dashboard от Nick7zmail [Nick7zmail](https://www.w3schools.com/bootstrap/bootstrap_panels.asp):
![](/img/dash_n7z_3.jpg)
![](/img/dash_n7z_2.jpg)
![](/img/dash_n7z_1.jpg)
[скачать](https://raw.githubusercontent.com/slsys/Gateway/master/dashboard/nick7zmail/ui.html)
