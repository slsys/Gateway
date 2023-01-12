# Введение
Иногда требуется скопировать все файлы из хранилища SLS. Следующие примеры позволяют выполнить данную задачу различными способами.
## Windows 
### Powershell
Скрипт копирует все файлы внутреннего хранилища в подкаталог `.\_back\date_time` каталога, из которого запущен сценарий. Разрабатывался и тестировался на Windows 11, Powershell 5.1
```powershell
$pathBackup = ".\_back\" + (Get-Date).ToString("yyyyMMdd_HHmm") + "\"
$fileSLSBackup = "backup_" + (Get-Date).ToString("yyyyMMdd_HHmmss") + ".sls"
$url = "192.168.1.247/api/storage?path=/"
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
$url = "192.168.1.247/api/backup?action=create&config=1&zigbee=1"
$result = wget -Uri $url -Method Post -OutFile $($pathBackup + $fileSLSBackup)
if ((Test-Path -Path $($pathBackup + $fileSLSBackup) -PathType Leaf) -ne $false) {
	$fileSLSBackup
} else {
	Write-Host "Error request for native backup: File Not Found"
}
```