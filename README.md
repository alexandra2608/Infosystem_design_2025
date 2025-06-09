# Проектирование информационных систем
Репозиторий для реализации лабораторных работ по дисциплине.

## Команда
| Member | GitHub | ISU |
| --- | --- | --- |
| Ефимова Валерия Алексеевна | valerieefim | 336561 |
| Митряшкина Дарья Алексеевна | daryaami | 336829 |
| Шадрина Александра Валерьевна | alexandra2608 | 369035 |
| Шемелева Елизавета Сергеевна | shlmlv | 350653 |

## ЛР-1. k8s

Цель: ознакомиться с k8s, развернуть сервис с использованием minicube.

В ходе работы выполнено:

1. Запуск кластера Minikube.
2. Сборка Docker-образа приложения `hwboard`.
3. Создание Deployment и Service для приложения.
4. Развертывание Metrics Server для сбора метрик.
5. Настройка Horizontal Pod Autoscaler (HPA).
6. Установка Prometheus и Grafana с помощью Helm.
7. Создание дашборда в Grafana для мониторинга нагрузки приложения.

---

### Предварительные требования

- Установленный Docker (версия ≥ 20.10).
- Установленный Minikube (версия ≥ v1.30).
- Установленный kubectl (версия совместима с Kubernetes в Minikube).
- Установленный Helm (версия ≥ 3.0).

---

### Инструкция

#### Шаг 1. Запуск Minikube и окружения Docker

Запустите кластер Minikube с драйвером Docker:

```bash
minikube start --driver=docker
```

Настройте окружение Docker для работы внутри Minikube (PowerShell):

```bash
minikube -p minikube docker-env --shell powershell | Invoke-Expression
```

#### Шаг 2. Сборка Docker-образа приложения

В корне проекта должен находиться ваш Dockerfile:

```
FROM python:3.13-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY . /app/
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

Соберите локальный образ с тегом `hwboard:latest`:

```
docker build -t hwboard:latest .
```

#### Шаг 3. Деплой приложения

Создайте файл `deployment.yaml`:

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hwboard-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hwboard
  template:
    metadata:
      labels:
        app: hwboard
    spec:
      containers:
        - name: hwboard
          image: hwboard:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8000
```

Создайте файл `service.yaml`:

```
apiVersion: v1
kind: Service
metadata:
  name: hwboard-service
spec:
  type: NodePort
  selector:
    app: hwboard
  ports:
    - name: http
      port: 8000
      targetPort: 8000
      nodePort: 30008
```

Примените манифесты:

```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

Убедитесь, что поды и сервис запущены:

```bash
kubectl get pods
kubectl get svc
```

#### Шаг 4. Установка Metrics Server

Подтяните и примените последнюю версию Metrics Server. Перезапустите деплоймент Metrics Server (для обновления конфигурации).

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl -n kube-system rollout restart deployment metrics-server
```

Проверьте сбор метрик:

```bash
kubectl top nodes
kubectl top pods
```

#### Шаг 5. Настройка Horizontal Pod Autoscaler (HPA)

Настройте автоскейлинг для Deployment `hwboard-deployment`. Проверьте состояние HPA:

```bash
kubectl autoscale deployment hwboard-deployment --cpu-percent=50 --min=2 --max=5
kubectl get hpa
```

`Примечание`: HPA будет автоматически увеличивать/уменьшать количество подов в зависимости от загрузки CPU.

#### Шаг 6. Установка Prometheus и Grafana через Helm

Добавьте репозиторий Helm и обновите кеш:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

Установите `kube-prometheus-stack` в namespace `monitoring`:

```bash
helm install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace
```

Проверьте поды и сервисы в monitoring:

```bash
kubectl get pods -n monitoring | grep prometheus
kubectl get svc -n monitoring | grep grafana
```

Получите пароль для входа в Grafana:

(PowerShell)
```bash
kubectl -n monitoring get secret prometheus-grafana -o jsonpath="{.data.admin-password}" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }
```

Логин: `admin` 

Пароль: `<полученный пароль>`

Откройте UI Grafana в браузере:

```bash
minikube service prometheus-grafana -n monitoring
```

#### Шаг 7. Создание дашборда в Grafana

В левом меню Grafana выберите Dashboards → New → New Dashboard.
Нажмите Add a new panel.

**Добавление графика CPU**

Datasource: Prometheus

Query:
```
 sum(rate(container_cpu_usage_seconds_total{namespace="default", pod=~"hwboard-deployment-.*"}[2m])) by (pod)
```

Legend: {{pod}}

**Добавление графика памяти**
  
Query:
```
sum(container_memory_usage_bytes{namespace="default", pod=~"hwboard-deployment-.*"}) by (pod)
```

Legend: {{pod}}


**Отслеживание количества реплик**
  
Query:
```
kube_deployment_status_replicas{deployment="hwboard-deployment"}
```

#### Дополнительные команды

Проброс порта к приложению (если нужно локально):

```bash
kubectl port-forward service/hwboard-service 8000:8000
```

Просмотр логов пода:

```bash
kubectl logs -l app=hwboard
```

Удаление ресурсов после завершения работы:

```bash
helm uninstall prometheus -n monitoring
kubectl delete hpa hwboard-deployment
kubectl delete -f deployment.yaml
kubectl delete -f service.yaml
minikube stop
```

---

### Чему мы научились

* Устанавливать и настраивать Minikube для локального тестирования Kubernetes-кластера.
  
* Собирать Docker-образы приложений и деплойть их в Kubernetes.
  
* Создавать Deployment и Service, обеспечивающие высокую доступность и сетевой доступ.
  
* Интегрировать Metrics Server для сбора показателей использования ресурсов.
  
* Настраивать горизонтальное автоскейлирование (HPA) для динамического масштабирования подов на основе метрик CPU.
  
* Устанавливать Prometheus и Grafana через Helm-чарты для мониторинга инфраструктуры.

* Создавать пользовательские дашборды в Grafana и визуализировать ключевые метрики приложения.

---

### Демонстрация 

https://drive.google.com/file/d/1_lTfB5zFJjNnOQQYoOQuQPXZ9pxdZpDX/view?usp=drive_link

---

## ЛР-2. Разработка микросервисной архитектуры с GraphQL

Цель: ознакомиться с микросервисной архитектурой.

В ходе работы выполнено:

1. Реализация 3 микросервисов с помощью GraphQL.
3. Каждый микросервис реализует CRUD-операции над своей сущностью.
4. Настройка единого API Gateway с Apollo Gateway.
5. Клиентская часть с Apollo Client - рабочий интерфейс для CRUD-операций.

### Предварительные требования

- Установленный Node.js (версия ≥ 22.11.0).
- Установленная СУБД PostgreSQL (версия ≥ 14).

---

### Обзор

В рамках выполнения лабораторной работы была выбрана тема "Система управления библиотекой". Для ее реализации было создано 3 микросервиса - Книги, Пользователи и Выдачи.

![image](https://github.com/user-attachments/assets/b962b70f-4083-47b7-9002-27c8d7b80fad)

**Схема взаимодействия:**
Frontend (React + Apollo Client) → API Gateway (GraphQL Gateway) → Микросервисы (Books, Members, Loans) → База данных (PostgreSQL)

---

### Структура
- books-service - микросервис Books
- members-service - микросервис Members
- loans-service - микросервис Loans
- gateway - единый GraphQL Gateway, объединяющий схемы микросервисов с помощью Apollo Federation
- library-frontend - клиентская часть приложения
- db.js - подключение к базе данных

В папке каждого микросервиса находятся файлы `schema.js` (GraphQL-схема микросервиса), `resolvers.js`(функции-обработчики GraphQL-запросов) и `index.js`(запуск микросервиса). В папке gateway находится файл `index.js` - GraphQL API Gateway (Apollo Gateway).

---

### Инструкция

#### Шаг 1. Установка зависимостей
Установить зависимости для каждого микросервиса:

`cd library-service && npm install`

`cd gateway && npm install`

`cd ../books-service && npm install`

`cd ../members-service && npm install`

`cd ../loans-service && npm install`

`cd ../library-frontend && npm install`

#### Шаг 2. Создание БД
Создать базу данных, а затем таблички:
```sql
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  membership_date DATE DEFAULT CURRENT_DATE
);
```

```sql
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(20) NOT NULL,
  published_year INTEGER NOT NULL,
  copies_available INTEGER NOT NULL,
  genre VARCHAR(100)
);
```

```sql
CREATE TABLE loans (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    loan_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) NOT NULL,

    CONSTRAINT fk_member
        FOREIGN KEY (member_id)
        REFERENCES members(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE
);
```

Переменные подключения к БД необходимо указать в .env или db.js.

#### Шаг 3. Запуск

1. Для запуска Apollo Server необходимо перейти в разных окнах терминала в папки каждого микросервиса (books-service, members-service, loans-service) и запустить каждый из них: `node index.js`.
2. Для одновременной работы с микросервисами стоит перейти в папку gateway и запустить единый GraphQL Gateway аналогичной командой.
3. Чтобы протестировать приложение со стороны клиента, необходимо перейти в папку library-frontend и выполнить запуск с помощью команды `npm start`.

---

### Чему мы научились

* Инициализировать микросервисы и настраивать раздельный запуск каждого сервиса.
  
* Настраивать Apollo Gateway, который объединяет схемы всех сервисов.
  
* Применять Apollo Federation, что позволяет сервисам самостоятельно определять свои схемы, а Gateway — агрегировать их.
  
* Реализовывать CRUD в микросервисах и разделять логику по слоям.
  
* Создавать клиентское приложение на React и настраивать Apollo Client для общения с GraphQL Gateway.

---

### Демонстрация 

https://drive.google.com/file/d/1vxMlRH2uY47xELbGEXjifUOqKWOPnkJc/view?usp=sharing

---

## ЛР-3. Работа с Big Data

Цель: разработать простое приложение для работы с большими данными.

Технологии: FastAPI, Uvicorn, Jinja2, Pandas, Plotly, OMDb/TMDb API, Pickle  

### Предварительные требования

- Из раздела **ссылки** скачайте Data из гугл-диска, в которой содержится модель. Добавьте файл в директорию /app
- **Python 3.8+**  
- **Git**  
- Файлы CSV от Letterboxd:  
  ```
  ratings.csv  
  watched.csv  
  diary.csv  
  profile.csv  
  reviews.csv  
  ```  
- Файл `.env` в корне проекта с содержимым:
  ```
  DATA_DIR=app/data  
  OMDB_API_KEY=<ваш_OMDb_ключ>  
  TMDB_API_KEY=<ваш_TMDb_ключ>  
  ```

---

### Обзор проекта

Приложение **DashBoxd** позволяет:

- Загружать CSV-экспорт данных Letterboxd (`ratings.csv`, `watched.csv`, `diary.csv`, `profile.csv`, `reviews.csv`).  
- Считать основные метрики:  
  - films watched  
  - films rated  
  - average rating  
  - most active month  
- Отображать **топ-7 режиссёров** и **топ-3 актёров** с их фотографиями (через TMDb).  
- Строить **хлороплет-карту** стран-производителей фильмов (Plotly + GeoJSON).  
- Давать **5 рекомендаций** похожих фильмов (матрица similarity) и подтягивать их постеры из OMDb.

---

### Структура проекта

```
dashboxd/
├── app/
│   ├── main.py         # FastAPI-сервер  
│   ├── analytics.py    # расчёт метрик и enrichment данных  
│   ├── parsers.py      # загрузка и нормализация CSV  
│   ├── utils.py        # клиенты OMDb/TMDb + кеширование  
│   ├── templates/      # Jinja2 шаблоны (upload, dashboard)  
│   └── static/         # стили, фон, placeholder, иконки  
├── requirements.txt    # зависимости  
└── .env                # DATA_DIR, API ключи  
```

---

### Инструкция

#### Шаг 1. Загрузка данных

1. Перейдите на http://127.0.0.1:8000/.
2. Нажмите на кнопку **Get Started**.
3. Прочитайте инструкцию по экспорту файлов из Letterboxd по ссылке **Here's the instruction on how to do it**.
4. В соответствии с инструкцией, экспортируйте данные из профиля и вернитесь на страницу `/upload`, нажав на кнопку **Back to the uploading page**.
5. Загрузите файлы:
   ```
   ratings.csv, watched.csv, diary.csv, profile.csv, reviews.csv
   ```
6. Нажмите **Analyse** — после успешной загрузки откроется `/dashboard`.

#### Шаг 2. Дашборд

- **Метрики**: films watched, films rated, average rating, most active month  
- **Top Directors** и **Top-3 Actors**: списки с фото  
- **Film origin map**: чем темнее страна на карте, тем больше фильмов, снятых там, вы посмотрели; при наведении на страну вы увидите точное число фильмов из каждой страны

#### Шаг 3. Рекомендательная система

1. Введите в поле название фильма и его год выпуска в скобках (например, `Gladiator (2000)`).  
2. Нажмите на кнопку-лупу.  
3. Появятся 5 карточек рекомендаций:  
   - Название  
   - Постер

Или из терминала:

```bash
curl "http://127.0.0.1:8000/recommend?title=Gladiator%20(2000)"
```

#### Шаг 4. Запуск
```bash
git clone <репозиторий_URL> dashboxd  
cd dashboxd  
pip install -r requirements.txt  
```

Запуск самого приложения:

```bash
uvicorn app.main:app --reload
```

Откройте в браузере:

- http://127.0.0.1:8000 — первая страница
- http://127.0.0.1:8000/upload — страница для загрузки CSV  
- http://127.0.0.1:8000/dashboard — основной дашборд после загрузки

---

## Технические детали

- CSV-парсинг: Pandas + `parsers.py`.  
- Enrichment: OMDb/TMDb через `requests`, кеш в JSON.  
- Карта: Plotly Choropleth + GeoJSON.  
- Рекомендации: `movie_list.pkl`, `similarity.pkl`, `/recommend` делает бэкенд-запросы к OMDb.  
- Интерфейс: единая карта с секциями Метрики, Карта, Рекомендации, стили по дизайну.

---

### Чему мы научились

* Структурировать web-приложение на FastAPI + Jinja2.
  
* Загружать и парсить CSV-данные различной структуры.
  
* Обогащать данные сторонними APIs (OMDb, TMDb) с кешированием.
  
* Строить кастомную логику рекомендаций на основе similarity-матрицы.
  
* Визуализировать информацию: Plotly-карта, кастомный HTML/CSS-интерфейс.

---

### Ссылки

#### Data проекта

https://drive.google.com/file/d/1sdWcGl8fiCEueEXiU2WlAA0MzOvjp3dK/view?usp=sharing

#### Тренирока рекомендательной системы

https://colab.research.google.com/drive/19Rw5h_SKm05GAL7BY6Hrkb20Kztz35PX?usp=sharing

#### Документация: 

  - FastAPI: https://fastapi.tiangolo.com/  
  - Plotly: https://plotly.com/python/choropleth-maps/  
  - OMDb API: http://www.omdbapi.com/  
  - TMDb API: https://developers.themoviedb.org/  

---

### Демонстрация 

https://drive.google.com/file/d/1FyctvvOtnhzaMQjz0znAkPsKNMe7Ik4t/view?usp=sharing
