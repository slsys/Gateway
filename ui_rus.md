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

## Другие примеры:
![](/img/dashboard.jpg)
[Дашборд](/dashboard/ui.html)
