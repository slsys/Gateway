# Интеграция [telegram](https://www.telegram.org)

## Подключение нового бота

Шлюз SLS  позволяет напрямую подключать [ботов](https://core.telegram.org/bots/).  Один бот одновременно может использоваться только одним устройством, поэтому рекомендуется для каждого шлюза регистрировать отдельного бота. Прежде всего нужно получить токен. Для этого пишем боту [@BotFather](https://t.me/BotFather) команду `/newbot`, после этого даем боту имя и тэг. После этих действий бот отправит  токен, который никому давать нельзя.

![botfather](https://habrastorage.org/r/w1560/getpro/habr/upload_files/24f/392/57a/24f39257a7893fab12efc0bd92c7bed4.png)

Если вы желаете отправлять сообщения в Группу, необходимо в BotFather настроить режим конфиденциальности.  Отключение режима конфиденциальности (для работы  с группами):

```
/mybots
выбираете имя бота из списка
Bot settings
Group privacy
Disable
```

В итоге нужно получить такой ответ

```
Privacy mode (https://core.telegram.org/bots#privacy-mode) is disabled for your bot
```

## Chat ID

Отправка сообщений в группу Телеграмм или личные сообщения выполняется по идентификатору `chatid`, который имеет вид:
- `-1001234567890` - группа 
- `1234567890` - личные сообщения

Существует множество вариантов получения `chatid` пользователя, бота или группы (канала), начиная с использования различных специализированных ботов [getmyid_bot](https://t.me/getmyid_bot) или с использованием стандартного [API](https://core.telegram.org/api)

### ID группы

ID группы (канала, чата) можно получить как с помощью многочисленных ботов, так и с помощью стандартного API Телеграмм по [инструкции](https://it-stories.ru/blog/web-dev/kak-uznat-chat-id-dlja-kanala-gruppy-telegram/) 

```http
https://api.telegram.org/botBOT:TOKEN/getChat?chat_id=@имяканала
```

- здесь:
  - `BOT:TOKEN` - реквизиты Вашего бота
  - `@имяканала`- имя искомого чата, канала или группы

в ответ получим 

```json
{«ok»:true,»result»:{«id»:-1001234567890,»title»:………
```

- где `id` - `chatid` канала. 

### ID Пользователя

`chatid` пользователя проще получить с помощью бота [getmyid_bot](https://t.me/getmyid_bot)

Если нужно получить свой ID, достаточно просто написать боту. 

Если нужен ID другого пользователя, нужно переслать боту сообщение этого пользователя

Бот возвращает:
- `Your user ID` - Ваш ID 
- `Forwarded from` - ID пользователя, чата, группы или канала, из которого переслано сообщение

## Настройка шлюза

Теперь требуется инициализировать бота в стартовом скрипте, для этого войдите в редактор скриптов `Actions->Files` и если ранее не создавали, создайте стартовый скрипт `init.lua`. Пропишите строки инициализации токена телеграмм как в примере: 

```lua
telegram.settoken("597******444:AAG4Nxe27**********rXDUgy7U")   --API-токен вашего бота
telegram.setchat("1234567890")   -- ChatID, куда бот будет писать сообщения
telegram.receive(true[, period])   --обрабатывать входящие сообщения. По умолчанию выключен. Period - частота приема входящих сообщений в мс, не менее 1000. По умолчанию 1000мс.
telegram.send("SLS  загружен "..net.localIP()) --отправит сообщение с локальным адресом SLS в вашей сети в телеграм
```

## О безопасности

По умолчанию включена отправка на сервер по протоколу http. Если вы желаете использовать https, небходимо при инициализации указать: 

```
telegram.secure(true)
```

**Внимание! Включение этой опции отнимает большое количество свободной памяти, возможны частые перезагрузки  шлюза.**

## Отправка сообщений

Сообщения отправляются из скриптов LUA командой 

```lua
telegram.send(msg[, chatid, parse_mode])
-- msg - STR, сообщение 
-- chatid - STR, ID чата, куда бот будет писать сообщения
-- parse_mode - STR, можно использовать для отправки ReplyKeyboard
```

Например:

```lua
telegram.send('hello world')
```

## Обработка входящих сообщений

### События

В скрипте обработки доступны слкдующие события:

- `Event.Telegram.ChatId` - ID пользователя (chatid)
- `Event.Telegram.Username` - логин
- `Event.Telegram.Name` - Имя пользователя
- `Event.Telegram.MessageId` - ID сообщения 
- `Event.Telegram.Text` - текст сообщения

Для обработки входящих сообщений необходимо создать файл `tlg.lua`. Пример файла:

```lua
if (Event.Telegram.Text=="Info") then dofile("/int/info.lua") end   -- при получениие сообщения, содержащего "Info" запускать сценарий info.lua
```

Теперь при получении сообщения `Info` в просматриваемом чате будет запускаться скрипт /int/info.lua, в который можно поместить например отправку информации о шлюзе:

``` lua
local remip = http.request("http://wtfismyip.com/text")
uptime=os.millis()
uptime_s=math.floor(uptime/1000)%60
uptime_m=math.floor(uptime/1000/60)%60
uptime_h=math.floor(uptime/1000/60/60)%24
uptime_d=math.floor(uptime/1000/60/60/24)
msg="SLS XIAOMI  is working  "..net.localIP()..", "..remip
msg=msg.."\n\r".."Uptime: " .. uptime_d  .. "d ".. uptime_h .. ":" .. uptime_m..":"..uptime_s
msg=msg.."\n\r".."Free heap: "..os.freeMem('heap')
msg=msg.."\n\r".."Free psram: "..os.freeMem('psram')
telegram.send(msg)
```

Данный скрипт отправит локальный / внешний ip, количество свободной памяти и время работы шлюза. 

## Отправка кнопок ReplyKeyboard

Шлюз может отправить сообщение  [replyKeyboard](https://core.telegram.org/api/bots%2Fbuttons)

```lua
telegram.send("Главное меню", "chatid","parse_mode=MarkdownV2&reply_markup={\"keyboard\":[[\"Температуры\"],[\"Info\",\"cmd3\"]],\"resize_keyboard\":true,\"one_time_keyboard\":true}")
```  



