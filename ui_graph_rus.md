# Отрисовка графиков через UI
SLS с помощью библиотек позволяет отобразить график изменений параметров. Для сохранения значений требуется [периодическая запись значений](https://github.com/slsys/Gateway/blob/master/samples_rus.md#%D1%81%D0%BE%D1%85%D1%80%D0%B0%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5-%D0%B7%D0%BD%D0%B0%D1%87%D0%B5%D0%BD%D0%B8%D0%B9-%D0%B2-json-%D1%87%D0%B5%D1%80%D0%B5%D0%B7-lua) на карту памяти (рекомендуется) или во внутренюю память.

## Пример и использованием бибоиотеки [chart.js](https://www.chartjs.org/)
![График](/img/graph.jpg)

Сохраните файл с именем ui.html:
```lua
<html>

<head>
<link rel="icon" type="image/png" href="/favicon.png">


<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
	</script>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,
								initial-scale=1">
	<script src=
"https://cdn.jsdelivr.net/npm/chart.js@latest/dist/Chart.min.js">
	</script>
	<title>SLS OpenTherm graph</title>
</head>

<body>

	<canvas id="bar-chart" width="800" height="350">
	</canvas>
    
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
//				labels.push(data.temp[i].datetime);
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

## Пример и использованием бибоиотеки [highcharts](https://www.highcharts.com/)
```lua
wait
```
