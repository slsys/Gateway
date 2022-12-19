# Интеграция [telegram](telegram.org)

## Подключение нового бота
Шлюз SLS  позволяет напрямую подключать [ботов](https://core.telegram.org/bots/).  Один бот одновременно может использоваться только одним устройством, поэтому рекомендуется для каждого шлюза регистрировать отдельного бота.(https://t.me/BotFather). Прежде всего нужно зарегистрировать бота. Для этого пишем боту [@BotFather](https://t.me/BotFather команду /newbot, после этого даем боту имя и тэг. После этих действий бот отправит  токен, который никому давать нельзя.

![botfather](https://habrastorage.org/r/w1560/getpro/habr/upload_files/24f/392/57a/24f39257a7893fab12efc0bd92c7bed4.png)

Если вы желаете отправлять в группу сообщения в Группу, необходимо в BotFather настроить режим конфиденциальности.   Отключение режима конфиденциальности (для работы  с группами):
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

Если у вас еще нет chatid, необходимо узнать, куда вы будете писать. Существует множество вариантов получения chatid бота или группы, начиная с использования различных специализованных ботов [getmyid_bot](https://t.me/getmyid_bot) или с использованием стандартного API по [инструкции](https://it-stories.ru/blog/web-dev/kak-uznat-chat-id-dlja-kanala-gruppy-telegram/) 
```
https://api.telegram.org/botBOT:TOKEN/getChat?chat_id=@имяканала
```
в ответ получим 
```
{«ok»:true,»result»:{«id»:-100ХХХХХХХХХ8,»title»:………
```
где id - будет как раз ваш chatid. 


Теперь требуется инициализовать бота в стартовом скрипте, для этого войдите в редактор скриптов Actions->Files и   если ранее не создавали, создайте стартовый скрипт init.lua. Пропишите строки инициализации токена телеграм как в примере: 
![initlua](/img/initlua.png)
```lua
telegram.settoken("597******444:AAG4Nxe27**********rXDUgy7U")   --API-токен вашего бота
telegram.setchat("-1001******01")   --номер чата, куда бот будет писать сообщения
telegram.receive(true)   --обрабатывать входящие сообщения
telegram.send("SLS  загружен "..net.localIP()) --отправит сообщение с локальным адресом SLS в вашей сети в телеграм
```

Как вы уже догадались, отправлять сообщения можно командой 
```lua
telegram.send('hello world')
```
## О безопасности
По умолчанию включена отправка на сервер по протоколу http. Если вы желаете использовать https, небходимо при инициализации указать 
```
telegram.secure(true)
```
**Внимаение! Включение этой опции отнимает большое количество свободной памяти, возможны частые перегазрузки шлюза.**
## Обработка входящих сообщений
Для обработки взодящий сообщений необходимо создать файл tlg.lua. Пример файла:
```
if ( Event.Telegram.Text=="Info") then dofile("/int/info.lua") end   -- при получениие сообщения, содержащего "Info" запускать сценарий info.lua
```
Теперь при получении сообщения "Info" в просматриваемом чате будет запускаться скрипт /int/info.lua, в который можно поместить например отправку информации о шлюзе:
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

## Отправка кнопок
## ReplyKeyboard
Шлюз может отправить сообщение  [replyKeyboard](https://core.telegram.org/api/bots%2Fbuttons)

```
telegram.send("Главное меню", "chatid","parse_mode=MarkdownV2&reply_markup={\"keyboard\":[[\"Температуры\"],[\"Info\",\"cmd3\"]],\"resize_keyboard\":true,\"one_time_keyboard\":true}")
```  
где chatid - ваш chatid для отправки

Теперь, если вы прописали запуск info.lua в  tlg.lua  как в примере выше, в ответ должно придти  сообщение с информацией о работе шлюза. 


