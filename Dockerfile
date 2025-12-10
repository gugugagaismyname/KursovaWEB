# =========================================================
# ЕТАП 1: Збірка ФРОНТЕНДУ (React/Vite) - ФІНАЛЬНЕ ВИПРАВЛЕННЯ ШЛЯХУ
# =========================================================
FROM node:20-alpine AS frontend-build

# Встановлюємо робочу директорію, де знаходиться package.json клієнта
WORKDIR /src/simpletodolesson.client 

# Копіюємо package.json та встановлюємо залежності
# (Це гарантує, що npm install пройде успішно)
COPY simpletodolesson.client/package*.json ./
RUN npm install 

# Копіюємо решту файлів клієнта (включаючи src/, public/ та vite.config.js)
COPY simpletodolesson.client/ ./
 
# Збираємо фронтенд. 
# ВИХІДНИЙ ШЛЯХ: /app/publish/wwwroot. Це має бути унікальна папка, 
# яку ми потім скопіюємо у wwwroot ASP.NET Core.
RUN npm run build

# =========================================================
# ЕТАП 2: Збірка БЕКЕНДУ (.NET) - КОРИГУВАННЯ КОПІЮВАННЯ ФРОНТЕНДУ
# =========================================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Копіюємо файли рішення
COPY SimpleTODOLesson.Server/*.csproj SimpleTODOLesson.Server/
RUN dotnet restore SimpleTODOLesson.Server/SimpleTODOLesson.Server.csproj

COPY SimpleTODOLesson.Server/ SimpleTODOLesson.Server/

# *** ВИПРАВЛЕННЯ: Копіюємо зібраний фронтенд з папки /app/publish/wwwroot ***
COPY --from=frontend-build /src/simpletodolesson.client/dist SimpleTODOLesson.Server/wwwroot

# Публікуємо
WORKDIR /src/SimpleTODOLesson.Server
RUN dotnet publish -c Release -o /app/publish

# ... (Етап 3: Фінальний образ - залишаємо без змін)

# =========================================================
# ЕТАП 3: ФІНАЛЬНИЙ ОБРАЗ (Запуск)
# =========================================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
# Копіюємо опубліковані файли
COPY --from=build /app/publish .

# Налаштовуємо порт: Render використовує змінну PORT, яка зазвичай має значення 10000,
# тому ми повинні встановити ASPNETCORE_URLS для прослуховування цього порту.
ENV ASPNETCORE_URLS=http://+:10000 
# Встановлюємо змінну середовища для бази даних SQLite
# Якщо ви не використовуєте змінну середовища в коді, це не обов'язково,
# але це гарна практика для розгортання
# ENV ConnectionStrings__DefaultConnection="Data Source=/app/app.db"

# Запускаємо додаток
ENTRYPOINT ["dotnet", "SimpleTODOLesson.Server.dll"]