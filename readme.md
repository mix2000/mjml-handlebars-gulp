# Mailer - mjml и handlebars

### Структура

    ├── config                          # Конфигурации
        ├── gulp.json                   # Конфигурации gulp, данные для загрузки на сервер и отправки 
        ├── variables.develop.json      # Конфигурации общая для разработки
        ├── variables.production.json   # Конфигурации для продакшена, наследуются от develop
        └── variables.test.json         # Конфигурации для тестовой отправки, наследуются от develop
    ├── static                          # Статические файлы - планируются для каждого письма mail-01 и т/д
    ├── templates                       # Шаблоны в формате .njml - обрабатываются с помощью handlebars и mjml
    ├── package.json                    # package.json  
    ├── gulpfile.js                     # Задачи для сборки
    └── README.md

### Общий механизм работы

Файл шаблона редактируется и основной папке templates.

Вся статика хранится в static.

Для старта работы запустить команду. Запуститься сервер, с хот релоудом.
```
yarn serve
```
Для сборки в продакшен 
```
yarn build
```
Для тестовой отправки на почту
```
yarn mail
```

Структура gulp.json
```json
{
  "email": {
    "login": "email@gmail.com", 
    "password": "1111111",      
    "host": "smtp.gmail.com",   
    "port": "465",
    "to": "email@gmail.com"
  },
  "server": {
    "host": "11.11.11.111",
    "port": "1234",
    "username": "root",
    "password": "password",
    "path": "/path/to/server"
  },
  "sendTemplate": "index.html"
}

```
