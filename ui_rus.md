# Создание собственной  визуализации

В SLS Zigbee gateway можно создать собственные визуализации. Для этого через меню Actions-> Script нужно создать файл ui.hmtl. Он будет доступен при обращении к /ui. Для управления устройствами можно использовать встроенные [http_api](/http_api_rus.md).


Следующий пример выводит значение температуры с датчика
```
<link href="https://fonts.googleapis.com/icon?family=Material+Icons"
     rel="stylesheet">
         
 
<span class="material-icons">visibility </span>
<div id="lbl_temp"></div>
 
 
 
<script>
  fetch('/api/zigbee?action=getStateValue&dev=0x000D6F00106A67FD&name=temperature')
 .then((response) => {
   return response.json();
  })
  .then((data) => {
    //console.log(data);
    document.getElementById("lbl_temp").innerHTML = data;
  });
</script>
```
