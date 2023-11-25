# Отрисовка графиков через UI

SLS с помощью библиотек позволяет отобразить график изменений параметров. Для сохранения значений требуется [периодическая запись значений](https://github.com/slsys/Gateway/blob/master/samples_rus.md#%D1%81%D0%BE%D1%85%D1%80%D0%B0%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5-%D0%B7%D0%BD%D0%B0%D1%87%D0%B5%D0%BD%D0%B8%D0%B9-%D0%B2-json-%D1%87%D0%B5%D1%80%D0%B5%D0%B7-lua) на карту памяти (рекомендуется) или во внутреннюю память.

## Пример и использованием библиотеки chart.js

[chart.js](https://www.chartjs.org/)

![График](/img/graph.jpg)

Сохраните файл с именем ui.html:

```html
<html>

<head>
<link rel="icon" type="image/png" href="/favicon.png">


<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    </script>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@latest/dist/Chart.min.js"></script>
    <title>SLS OpenTherm graph</title>
</head>

<body>
    <canvas id="bar-chart" width="800" height="350"></canvas>
    <script>
        getData();
        async function getData() {
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();
            logfile = '!log_'+dd + '_' + mm + '_' + yyyy+'.json';
            //var logfile='!log_13_12_2022.json'
            const response = await fetch('/api/storage?path=/sd/'+logfile);
            console.log('------');
            console.log(response);
            const data = await response.json();
            console.log(data);
            console.log('------');
            length = data.temp.length;
            console.log('------');
            console.log(length);
            labels = [];
            ul_ot = [];
            new_ust = [];
            new_ds18 = [];
            ul_bt = [];
            new_dhwt = [];
            average_temp = [];
            dhwt_status = [];
            flame_status = [];
            for (i = 0; i < length; i++) {
            //labels.push(data.temp[i].datetime);
                labels.push(data.temp[i].ctimesh);
                ul_ot.push(data.temp[i].ul_ot);
                new_ds18.push(data.temp[i].new_ds18);
                new_ust.push(data.temp[i].new_ust);
                new_dhwt.push(data.temp[i].new_dhwt);
                ul_bt.push(data.temp[i].ul_bt);
                average_temp.push(data.temp[i].average_temp);
                dhwt_status.push(data.temp[i].dhwt_status);
                flame_status.push(data.temp[i].flame_status);
            }
            new Chart(document.getElementById("bar-chart"), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: "Уличная температура OT",
                            backgroundColor: ["#3e95cd"],
                            data: ul_ot
                        },
                        {
                            label: "Уставка",
                            backgroundColor: ["#8e5ea2"],
                            data: new_ust
                  
                        },
                        {
                            label: "Температура теплоносителя",
                            backgroundColor: ["#c45850"],                           
                            data: ul_bt
                        },
                        {
                            label: "Средняя температура в доме",
                            backgroundColor: ["#eeebc9"],
                            data: average_temp
                        },
                        {
                            label: "Температура бойлера",
                            backgroundColor: ["#e8c3b9"],
                            data: new_dhwt
                        },
                        {
                            label: "Нагрев бойлера",
                            backgroundColor: ["#14bfbf"], 
                            type: 'bar',
                            data: dhwt_status
                        },
                        {
                            label: "Включена горелка",
                            backgroundColor: ["#11bf4f"], 
                            type: 'bar',
                            data: flame_status
                        },
                        {
                            label: "Уличная ds18b2",
                            backgroundColor: ["#11bfbf"],                            
                            data: new_ds18
                        }
                    ]
                },
                options: {
                    legend: { display: true },
                    title: {
                        display: true,
                        text: 'SLS OpenTherm graph'
                    }
                }
            });
        }
    </script>
</body>
</html>

```

## Пример с использованием библиотеки highcharts

[highcharts](https://www.highcharts.com/)

Пример позволяет проводить масштабирование графика.

![График highcharts](/img/highcharts.png)

```html
<html>
   <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"> 
    <title>SLS OpenTherm graphics привет</title>
    <script src = "https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    <script src = "https://code.highcharts.com/highcharts.js"></script> 
   </head>
   
   <body>
      <div id = "container" style = "height: 100%; margin: 0 auto"></div>
      <script language = "JavaScript">
         $(document).ready(function() {
         
         var today = new Date();
  		 var dd = String(today.getDate()).padStart(2, '0');
		 var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
		 var yyyy = today.getFullYear();

      logfile = '!log_'+dd + '_' + mm + '_' + yyyy+'.json';
      let xhr = new XMLHttpRequest();
      
      var filename='/api/storage?path=/sd/'+logfile;

      xhr.responseType = 'json';
      xhr.open('GET', filename);
      // 3. Отсылаем запрос
xhr.send();
// 4. Этот код сработает после того, как мы получим ответ сервера
xhr.onload = function() {
  if (xhr.status != 200) { // анализируем HTTP-статус ответа, если статус не 200, то произошла ошибка
    alert(`Ошибка ${xhr.status}: ${xhr.statusText}`); // Например, 404: Not Found
  } else { // если всё прошло гладко, выводим результат
//    alert(`good! ${xhr.response.length} байт`); // response -- это ответ сервера
  }
};

xhr.onerror = function() {
  alert("error");
};

  xhr.onload = function() {
  let responseObj = xhr.response;
  length = responseObj.temp.length;
    
    	    labels = [];
			ul_ot = [];
            new_ust = [];
            new_ds18 = [];
            ul_bt = [];
            new_dhwt = [];
   			average_temp = [];
            dhwt_status = [];
            flame_status = [];
            ctimesh = [];
            
          			for (i = 0; i < length; i++) {
                ctimesh.push(responseObj.temp[i].ctimesh);
                labels.push(responseObj.temp[i].datetime);
				ul_ot.push(responseObj.temp[i].ul_ot);
                new_ds18.push(responseObj.temp[i].new_ds18);
                new_ust.push(responseObj.temp[i].new_ust);
                new_dhwt.push(responseObj.temp[i].new_dhwt);
                ul_bt.push(responseObj.temp[i].ul_bt);
                average_temp.push(responseObj.temp[i].average_temp);
                dhwt_status.push(responseObj.temp[i].dhwt_status);
                flame_status.push(responseObj.temp[i].flame_status);
    	     	}
            

    var title = {
               text: 'SLS OpenTherm'   
            };
            var subtitle = {
               text: 'daily temp'
            };
             
    var chart = {
             zoomType: 'x'
			};


  var xAxis = {
  categories:ctimesh,
    type: 'datetime',
     minRange: 1
   };
            var yAxis = {
               title: {
                  text: 'Temperature (\xB0C)'
               },
               plotLines: [{
                  value: 0,
                  width: 1,
                  color: '#808080'
               }]
            };   

            var tooltip = {
               valueSuffix: '\xB0C'
            }
            var legend = {
//               layout: 'vertical',
               align: 'center',
 //               itemWidth: 290,
               verticalAlign: 'top',
               borderWidth: 0
            };

				var series =  [{
				name: 'Уличный ds18b2',
				data: new_ds18},
                
               {
			 	name: 'Уличный термометр по OpenTherm',
				data: ul_ot
                },
                   {
			 	name: 'Уставка отопления',
				data: new_ust
                },
                   {
			 	name: 'Температура ГВС',
				data: new_dhwt
                },
                   {
			 	name: 'Средняя температура в доме',
				data: average_temp,

                },
                
//                         {
//			 	name: 'dhwt_status',
//				data: dhwt_status
//                },
                
                          {
			 	name: 'Горелка',
				data: flame_status,
                type: 'area',
                color: '#FFCF73',
                   step: 'left'
                },
  {
			 	name: 'Температура теплоносителя',
				data: ul_bt,
                type: 'areaspline'
                }


            ];
          

            var json = {};
            json.title = title;
 //           json.subtitle = subtitle;
            json.xAxis = xAxis;
            json.yAxis = yAxis;
 //           json.tooltip = tooltip;
            json.legend = legend;
            json.series = series;
            json.chart =  chart;
         

            $('#container').highcharts(json);
               };
         });
      
         
      </script>
   </body>
   
</html>
```
