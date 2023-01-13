# Введение
Иногда требуется скопировать все файлы из хранилища SLS. Следующие примеры позволяют выполнить данную задачу различными способами.
## Windows 
### Powershell
Скрипт копирует все файлы внутреннего хранилища, а также родной backup SLS в подкаталог `.\_back\date_time` каталога, из которого запущен сценарий. Разрабатывался и тестировался на Windows 11, Powershell 5.1
```powershell
$slsIP = "192.168.1.247"
$pathBackup = ".\_back\" + (Get-Date).ToString("yyyyMMdd_HHmm") + "\"
$fileSLSBackup = "backup_" + (Get-Date).ToString("yyyyMMdd_HHmmss") + ".sls"
$url = $slsIP + "/api/storage?path=/"
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
$url = $slsIP + "/api/backup?action=create&config=1&zigbee=1"
$result = wget -Uri $url -Method Post -OutFile $($pathBackup + $fileSLSBackup)
if ((Test-Path -Path $($pathBackup + $fileSLSBackup) -PathType Leaf) -ne $false) {
	$fileSLSBackup
} else {
	Write-Host "Error request for native backup: File Not Found"
}
```
## Linux
### Bash + JQ
Скрипт копирует все файлы внутреннего хранилища, а также родной backup SLS в подкаталог `./date_time` каталога, из которого запущен сценарий. Разрабатывался и тестировался на `Ubuntu 22.04.1 LTS` + `JQ 1.6`
```shell
slsIP=192.168.1.247
backupPath=$(date +%Y%m%d_%H%M)
fileSLSBackup=backup_$backupPath.sls
mkdir $backupPath
# bakcup all Files
url=$slsIP/api/storage?path=/
result=$(curl $url 2>/dev/null)
if [[ $(echo $result | jq ".success")  = "true" ]]; then 
	data=$(echo $result | jq -c -r ".result[]")
	for i in $data; do
		if [[ $(echo $i | jq -c -r ".is_dir") = "false" ]]; then
			f=$(echo $i | jq -c -r ".name")
			echo $f
			curl -o ./$backupPath/$f $url$f 2>/dev/null
			#break
		fi
	done
else
	echo Error request
fi
# native backup
url=$slsIP/api/backup
curl -d "action=create&config=1&zigbee=1" -o ./$backupPath/$fileSLSBackup $url 2>/dev/null
if [ -f "./$backupPath/$fileSLSBackup" ]; then
	echo $fileSLSBackup
else
	echo Error request for native backup: File Not Found
fi

```
