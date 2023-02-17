# Хранилище
Шлюз использует хранилище для хранения конфигов, скриптов, звуков и прочих файлов. Может использовать как внутренняя флеш-память так и внешняя на SD-картах. Записывать также можно через сценарии, [пример](https://github.com/slsys/Gateway/blob/master/samples_rus.md#сохранение-значений-в-json-через-lua).  

## Структура
Хранилище использует префиксы для обозначения источника данных.
* /int - для внутренней файловой системы, его использование не обязательно
* /sd  - для SD-карты

## Файловые системы
Поддерживается несколько файловых систем для хранилища:
* FAT - классическая файловая система
* LFS - надежная файловая система для микроконтроллеров LittleFS, не повреждается при неожиданных отключениях питания (доступна с версии 2022.03.29d4)

Для выбора файловой системы используется разметка указанная в файле разделов при прошивке устройства.

Для перехода на другую файловую систему необходимо сделать бэкап всех файлов и перепрошить устройство с нужным файлом разделов. При этом хранилище будет отформатировано.

## HTTP API

Большая часть команд возвращает объект JSON:

При успехе:
```json
{"success":true,"result":[]|{}}
```

При ошибке
```json
{"success":false}
```

Пути могут обозначаться:
- / или /int - внутренняя файловая система
- /sd - SD-карта

###  Получить список файлов

```http
GET /api/storage?path=/
```
JSON result:
```json
[
  {"name":"test.txt","is_dir":false,"size":8},{"name":"testDir","is_dir":true}
]
```
- `name` - имя файла или каталога
- `is_dir` - true - каталог, false - файл 
- `size` - размер файла в байтах

### Чтение содержимого файла

Возвращает содержимое файла
```http
GET /api/storage?path=/sd/test.txt
```

### Запись в файл

Запись в файл. Если файла не существует - он будет создан. Файл будет перезаписан!

```http
POST /api/storage?path=/test.lua&plain=XXX
```
Возвращает
```json
{"success":true|false}
```

### Удаление файла

Удаляет файл
```http
DELETE /api/storage?path=/test.txt
```
Возвращает
```json
{"success":true|false}
```

###  Монтирование SD накопителя

```http
GET /api/storage/sd?action=mount 
GET /api/storage/sd?action=umount 
```
Возвращает
```json
{"success":true,"result":"mount|umount"}
```

### Информация о хранилище

Возвращает информацию о внутреннем хранилище и SD-карте
```http
GET /api/storage/info
```
JSON result:
```json
{
	"int": {
		"fs": "LFS",
		"total": 4194304,
		"free": 4030464
	},
	"sd": {
		"size": 30953963520,
		"total": 30918311936,
		"free": 30918262784,
		"status": "SDHC"
	}
}
```
- int - внутренний накопитель
  - fs - файловая система
  - total - размер флэш в байтах
  - free - свободно байт
- sd - SD-карта
  - status - тип карты
  - size - размер карты в байтах
  - total - размер раздела в байтах
  - free - свободно байт


### Переименование файлов

```http
GET /api/storage/rename?old=/file1.lua&new=/file2.lua
```
Возвращает
```json
{"success":true|false}
```

### Создать директорию
```http
GET /api/storage/mkdir?path=/int/mydir
```
Возвращает
```json
{"success":true|false}
```

### Удалить директорию
```http
GET /api/storage/rmdir?path=/int/mydir
```
Возвращает
```json
{"success":true|false}
```

## Скрипты [LUA](/lua_rus.md)

Во всех операциях с файлами под именем подразумевается путь:
- для int - `/file` или `/int/file`
- для SD - `/sd/file`

### os.mountSD()

Монтирует SD-карту
```lua
result = os.mountSD(mount)
-- mount - BOOL, примонтировать = true; размонтировать = false
-- result - BOOL, true - успех, false - что-то пошло не так
```

### os.fileExists()

Проверяет наличие файла, возвращает true/false
```lua
result = os.fileExists(fileName)
-- fileName - STR, имя проверяемого файла
-- result - BOOL, true - успех, false - файл не найден
```

### os.fileSize()

Возвращает размер файла
```lua
result = os.fileSize(fileName)
-- fileName - STR, имя проверяемого файла
-- result - INT, размер файла в байтах или NIL, если файл не найден
```

### os.fileRemove()

Удаляет файл
```lua
result = os.fileRemove(fileName)
-- fileName - STR, имя удаляемого файла
-- result - BOOL, true - успех, false - ошибка (например, нет файла)
```

### os.fileRename()

Переименовывает файл
```lua
result = os.fileRename(old, new)
-- old - STR, старое имя переимновываемого файла
-- new - STR, новое имя переимновываемого файла
-- result - BOOL, true - успех, false - ошибка (например, нет файла)
```

### os.fileRead()

Читает файл 
```lua
result = os.fileRead(fileName)
-- fileName - STR, имя целевого файла
-- result - содержимое файла или NIL, если файл пустой или не найден
```

### os.fileWrite()

Записывает данные в файл:
```lua
result = os.fileWrite(fileName,data[, overwrite])
-- fileName - STR, имя целевого файла
-- data - STR, данные
-- overwrite - BOOL, перезаписать файл (true)
-- result - BOOL, true - успех, false - ошибка (например, нет файла)
-- Пример:
os.fileWrite("/int/!file.db","привет\n",true)
-- Для карты памяти необходимо использовать путь "/sd/file.txt"
```
