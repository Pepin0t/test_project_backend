# Как это работает? (инструкция устарела)

#### Ниже представлено описание запуска приложения в режиме development!

**Для полноценной работы Вам потребуется установленная [MongoDB](https://www.mongodb.com/) или ее облачная альтернатива [mLab](https://mlab.com/welcome/).**

#### Порядок запуска:

1.  Клонируйте данный репозиторий в папку `some_dir/server`

2.  Клонируйте репозиторий [test_project_frontend](https://github.com/Pepin0t/test_project_frontend) в папку `some_dir/client`

3.  Установите все требуемые зависимости

4.  Установите [nodemon](https://github.com/remy/nodemon) глобально:

    ```sh
    npm i nodemon -g
    ```

5.  Запуск приложения (клиент + сервер) осуществляется через терминал из папки `some_dir/server` следующей командой:

    ```sh
    npm run dev
    ```

#### Переменные окружения:

```sh
PORT=5001

Собственно порт. Должен совпадать с портом, указанным в файле package.json на клиенте:

{
    ...
    proxy: http://localhost:5001
}
```

```sh
MONGO_URI=

Адрес БД.
Пример: mongodb://kuku:kuku1111@ds123456.mlab.com:12345/somedb
```

```sh
MONGO_URI2=

Дополнительный адрес адрес БД, если он Вам нужен. Не обязателен, так как используется только один.
Пример: mongodb://localhost:27017/somedb
```

#### Заполнение БД фэйковыми данными:

1.  Запустите приложение

2.  Раскомментируйте вызов функции `getFakes()` в файле `server.js` (строка 22)

3.  Сохраните изменения в файле `server.js`

4.  Дождитесь заполнения БД и папки `/img` фэйковыми данными

5.  Закомментируйте вызов функции `getFakes()` в файле `server.js`

6.  Сохраните изменения в файле `server.js`
