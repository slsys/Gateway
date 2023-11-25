# Настроить постоянное логирование SLS

Для удобства будем ротировать журналы:

- ежедневно
- размер от 10М
- старые журналы сжимать
- хранить до 30 дней

## Включение UDP LOG

В lua необходимо выполнить команду

```lua
os.udplogenable(true)
```

## Логирование в Linux

`nc -ulnk 45678`

### Постоянный лог в файл с ротацией в Linux

#### Запуск логирования при старте ОС

##### Способ с CRON

В crontab добавить строку `@reboot nc -ulnk 45678 >> /var/log/sls/debug.log`

#### Ротация лога с помощью logrotate

Создать конфиг в `/etc/logrotate.d`

```json
/var/log/sls/debug.log {
    rotate 30
    daily
    minsize=10M
    missingok
    notifempty
    compress
    delaycompress
    maxage 30
    copytruncate
}
```
