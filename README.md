# STALZONE 

![image](https://github.com/user-attachments/assets/914e18e3-f14c-4278-a493-89eb338c33c9)
![image](https://github.com/user-attachments/assets/ef45daea-ba51-4d50-bb53-5ed619362ccc)


Простой бот для выбросов, пробоев, перезапуска серверов.

Все настройки сохраняются в файле settings.json. Когда бот перезапускается, он будет использовать сохраненные данные в конфиге. Конфиг обновляется сразу, когда в боте что-то меняется

Время в боте установлено как московское, чтобы не было проблем со временем уведомлений

Команды 

 Доступ к командам /setaccess @user True/False [True дать доступ| False забрать]

Установить канал для уведомлений /setchannel [Пример /setchannel #test]

Установить расписание Пробоев /setproboi. [Пример /setproboi 10:35. Будет писать уведомление каждый час].

Установить расписание выбросов /setvibros [Пример /setvibros 10:35. Будет писать уведомление каждые 3 часа].

Также каждый день в 2:00 по московскому времени будет приходить уведомление о перезапуске серверов STALZONE

-------------------------------------------------------------

Для работы требуется node.js 

https://nodejs.org/en/

Далее установите 

npm install discord.js

npm install dotenv

Создайте файл *.env* рядом с файлом stalzone_bot.js

С текстом 

DISCORD_TOKEN= Токен бота
CLIENT_ID= Айди бота

Бот запускается node stalzone_bot.js

--------------------------------------------------------------

ДОБАВЛЕНИЕ БОТА НА СЕРВЕР

Перейдите на сайт https://discord.com/developers/applications

Нажмите на *New application* и введите имя вашего бота.

В разделе установки вы увидите ссылку на установку, скопируйте ее и вставьте в браузер или в чат Discord, чтобы добавить бота на сервер.


В разделе OAuth2 вы найдете идентификатор клиента, который нужно прописать в файле *.env*. 

CLIENT_ID=numbers

В разделе Bot вы должны получить Token, если он не виден, нажмите кнопку Reset Token, и он появится. Не давайте и не показывайте его никому.

Также введите его в файл *.env*.

DISCORD_TOKEN= Токен бота.

При желании вы можете отключить Public Bot, чтобы другие пользователи не могли добавить вашего бота к себе.

Найдите переключатели для Privileged Gateway Intents в разделе Bot

Включите

Message Content Intent

Server Members Intent

Затем просто сохраните настройки, и бот будет работать.

--------------------------------------------------------------


fgm.su
