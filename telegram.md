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

## Функции LUA 

### telegram.settoken()

Инициализирует API-токен бота.

```lua
telegram.settoken(token)
-- token - STR, API-токен вашего бота
```

### telegram.setchat()

Инициализирует ChatID, куда бот будет писать сообщения.

```lua
telegram.setchat(chat_id)
-- chat_id - STR, ChatID, куда бот будет писать сообщения
```

### telegram.receive()

Включает обработку входящих сообщений и настраивает частоту их приема. По умолчанию выключен. При включенной обработке, "никто" не должен больше использовать данный бот, иначе будет конфликт на получение данные.

```lua
telegram.receive(mode[, period])
-- mode - BOOL, true - вкл. обработку входящих сообщений
-- period - INT - задает частоту приема входящих сообщений в мс. Не менее 1000мс. Если опустить данный параметр - по умолчанию 1000мс.
```

### telegram.send()

Отправляет сообщение.

```lua
telegram.send(msg[[,chat_id],parse_mode])
-- msg - STR - текст сообщения
-- chat_id - STR - целевой chat id, если нужно отправить на chat id отличный от заданного telegram.setchat()
-- parse_mode - STR - для отправки кнопок ReplyKeyboard
```

### telegram.secure()

Включает, отключенную по умолчанию отправку данных на сервер Телеграм по протоколу HTTPS. 

```
telegram.secure(mode)
-- mode - BOOL, true - включить отправку по HTTPS
```

**Внимание! Включение этой опции отнимает большое количество свободной памяти, возможны частые перезагрузки  шлюза.**


## Настройка шлюза

Теперь требуется инициализировать бота в стартовом скрипте, для этого войдите в редактор скриптов `Actions -> Files` и если ранее не создавали, создайте стартовый скрипт `init.lua`. Пропишите строки инициализации токена телеграмм как в примере: 

```lua
telegram.settoken("597******444:AAG4Nxe27**********rXDUgy7U")   --API-токен вашего бота
telegram.setchat("1234567890") -- ChatID, куда бот будет писать сообщения
telegram.receive(true, 2000) -- обрабатывать входящие сообщения. Частота приема входящих сообщений 2 сек.
telegram.send("SLS  загружен "..net.localIP()) --отправит сообщение с локальным адресом SLS в вашей сети в телеграм
```

## Отправка сообщений

Сообщения отправляются из скриптов LUA командой `telegram.send()`

Например:

```lua
telegram.send('hello world')
```

## Обработка входящих сообщений

### События

В скрипте обработки доступны следующие события:

- `Event.Telegram.ChatId` - ID пользователя (chatid)
- `Event.Telegram.Username` - логин
- `Event.Telegram.Name` - Имя пользователя
- `Event.Telegram.MessageId` - ID сообщения 
- `Event.Telegram.Text` - текст сообщения

### Обработка

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



