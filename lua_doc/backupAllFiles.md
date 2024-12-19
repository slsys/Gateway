# Резервное копирование и восстановление файлов

Иногда требуется скопировать все файлы из хранилища SLS. Следующие примеры позволяют выполнить данную задачу различными способами.

## Windows 

### Powershell

Скрипт копирует все файлы внутреннего хранилища, а также родной backup SLS в подкаталог `.\_back\date_time` каталога, из которого запущен сценарий. Разрабатывался и тестировался на Windows 11, Powershell 5.1. **Внимание!** Обязательно указать token, даже при отключенной авторизации в шлюзе.

```powershell
$slsIP = "192.168.1.247"
$tokenSLS="e9d38bedb6412e.....ed9575"
$pathBackup = ".\_back\" + (Get-Date).ToString("yyyyMMdd_HHmm") + "\"
$fileSLSBackup = "backup_" + (Get-Date).ToString("yyyyMMdd_HHmmss") + ".sls"
$url = $slsIP + "/api/storage?token=" + $tokenSLS + "&path=/"
md $pathBackup
# bacup all Files
$result = wget $url
if ($result.StatusCode -eq 200) {
	$data = ConvertFrom-Json $([String]::new($result.Content))
	$data.result | % {
		if ($_.is_dir -eq $false) {
			wget $($url + $_.name) -OutFile $($pathBackup + $_.name)
			$_.name
		}
	}
} else {
	Write-Host "Error request for Files: $($result.StatusCode)"
}
# native backup
$url = $slsIP + "/api/backup?token=" + $tokenSLS + "&action=create&config=1&zigbee=1"
$result = wget -Uri $url -Method Post -OutFile $($pathBackup + $fileSLSBackup)
if ((Test-Path -Path $($pathBackup + $fileSLSBackup) -PathType Leaf) -ne $false) {
	$fileSLSBackup
} else {
	Write-Host "Error request for native backup: File Not Found"
}
```

## Linux

### Bash + JQ

Скрипт копирует все файлы внутреннего хранилища, а также родной backup SLS в подкаталог `./date_time` каталога, из которого запущен сценарий. Разрабатывался и тестировался на `Ubuntu 22.04.1 LTS` + `JQ 1.6`. **Внимание!** Обязательно указать token, даже при отключенной авторизации в шлюзе.

```shell
#!/bin/bash
slsIP=192.168.1.247
tokenSLS="e9d38bedb6412e.....ed9575"
backupPath="/var/backups/$slsIP/$(date +%Y%m%d_%H%M)"
fileSLSBackup=native.backup
mkdir -p $backupPath
# backup all Files
url="$slsIP/api/storage?token=$tokenSLS&path=/"
result=$(curl $url 2>/dev/null)
if [[ $(echo $result | jq ".success")  = "true" ]]; then 
	data=$(echo $result | jq -c -r ".result[]")
	for i in $data; do
		if [[ $(echo $i | jq -c -r ".is_dir") = "false" ]]; then
			f=$(echo $i | jq -c -r ".name")
			echo $f
			curl -o $backupPath/$f $url$f 2>/dev/null
			#break
		fi
	done
else
	echo Error request
fi
# native backup
url=$slsIP/api/backup
get="token=$tokenSLS&action=create&config=1&zigbee=1"
curl -d $get -o $backupPath/$fileSLSBackup $url 2>/dev/null
if [ -f "$backupPath/$fileSLSBackup" ]; then
	echo $fileSLSBackup
else
	echo Error request for native backup: File Not Found
fi

```

## Решения других пользователей

### Пользователь из чата @slsys с ником Юр Доценко

> Набор Python-скриптов для бэкапирования и восстановления всех или отдельных файлов SLS шлюза. В конце файла замените текстовые константы своими значениями token и URL шлюза. И раскоментируйте вызов нужной функции в зависимости от текущей задачи.

> Успешно гоняю файлы туда и обратно на SLS. Я отладил на MAC OS, то же самое, что и LINUX.

```python
import requests
import os
import json
import urllib.parse

def getFromSLS(urlSLS, tokenSLS, folder):
    r = requests.get(urlSLS + '/api/storage?path=/')
    print(r.status_code)
    dd = r.json()
    dir = dd["result"]

    for item in dir:
        name = item['name']
        print("==================" + name + "====================")
        r = requests.get(urlSLS + '/api/storage?token='+ tokenSLS + '&path=/' + name)
        content = r.text.encode("ISO-8859-1", errors = 'replace').decode("UTF-8")
        my_file = open(folder + name, "w")
        my_file.write(content)
        my_file.close()
    print("================== native backup ====================")
    r = requests.post(urlSLS + '/api/backup?token='+ tokenSLS + '&action=create&config=1&zigbee=1')
    content = r.text.encode("ISO-8859-1", errors='replace').decode("UTF-8")
    my_file = open(folder + 'native_backup', "w")
    my_file.write(content)
    my_file.close()

def pushToSLS(url, token, folder):
    for fName in os.listdir(folder):
        if fName.endswith(".json") or fName.endswith(".lua"):
            pushFile(url, token, folder, fName)


def pushFile(SLSurl, token, folder, name):
    my_file = open(folder + name, "r")
    content = my_file.read()
    my_file.close()

    print("===== " + name + " =====> " + SLSurl)
    query = {'token': token,
             'path': name,
             'plain': content}
    url = SLSurl + '/api/storage?' + urllib.parse.urlencode(query)
    r = requests.post(url)
    print(json.dumps(r.json()))


if name == "__main__":
    tokenSLS = "f6fxxxxxxxxxxxxxxxxxxxxx72"
    # Все файлы из SLS скопировать в указанную папку
    getFromSLS('https://sls.xxxxxxxxxxx.keenetic.pro', tokenSLS, "/Users/docn/Documents/SLS_files/test/")

    # Конкретный файл скопировать на SLS
    #pushFile("https://sls.xxxxxxxxxxx.keenetic.pro", tokenSLS, "/Users/docn/Documents/SLS_files/test/", "test.lua")

    # Перенести на SLS все LUA и JSON файлы из папки
    #pushToSLS("https://sls.xxxxxxxxxxx.keenetic.pro", tokenSLS, "/Users/docn/Documents/SLS_files/sls_sls_files/")
```
