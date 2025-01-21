# STALZONE 

![image](https://github.com/user-attachments/assets/914e18e3-f14c-4278-a493-89eb338c33c9)
![image](https://github.com/user-attachments/assets/6c82cba1-5334-4f6b-87ea-6558a060411b)



Простой бот для выбросов, пробоев, перезапуска серверов.

Все настройки сохраняются в файле settings.json. Когда бот перезапускается, он будет использовать сохраненные данные в конфиге. Конфиг обновляется сразу, когда в боте что-то меняется

Время в боте установлено как московское, чтобы не было проблем со временем уведомлений

Команды 

 Доступ к командам /setaccess @user True/False [True дать доступ| False забрать]

Установить канал для уведомлений /setchannel [Пример /setchannel #test]

Установить расписание  /settime [Пример /settime выброс/пробой 13:35. Будет писать уведомление каждые 3 часа. Для пробоя 1 час]

Установить пинг при уведомлении /setping [Пример /setping выброс/пробой @роль true/false True - пинг роли. False - отключить пинг роли]

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
