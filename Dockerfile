# =========================================================
# ЕТАП 1: Збірка ФРОНТЕНДУ (React/Vite) - ФІНАЛЬНА КОНФІГУРАЦІЯ
# =========================================================
FROM node:20-alpine AS frontend-build

# Встановлюємо робочу директорію, де знаходиться package.json клієнта
WORKDIR /src/simpletodolesson.client 

# Копіюємо package.json та встановлюємо залежності
COPY simpletodolesson.client/package*.json ./
RUN npm install 

# Копіюємо решту файлів клієнта (включаючи src/, public/ та vite.config.js)
COPY simpletodolesson.client/ ./
 
# Збираємо фронтенд. Vite створить папку 'dist' у поточній робочій директорії.
# Зверніть увагу: ми використовуємо просту команду 'npm run build'.
ENV USE_HTTPS=false
RUN npm run build 

# =========================================================
# ЕТАП 2: Збірка БЕКЕНДУ (.NET) - КОРИГУВАННЯ КОПІЮВАННЯ
# =========================================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Копіюємо файли рішення
COPY SimpleTODOLesson.Server/*.csproj SimpleTODOLesson.Server/
RUN dotnet restore SimpleTODOLesson.Server/SimpleTODOLesson.Server.csproj

COPY SimpleTODOLesson.Server/ SimpleTODOLesson.Server/

# *** ВИПРАВЛЕННЯ: Копіюємо зібраний фронтенд з папки dist, створеної Vite ***
# Шлях до dist: /src/simpletodolesson.client/dist
COPY --from=frontend-build /src/simpletodolesson.client/dist SimpleTODOLesson.Server/wwwroot

# Публікуємо
WORKDIR /src/SimpleTODOLesson.Server
RUN dotnet publish -c Release -o /app/publish

# =========================================================
# ЕТАП 3: ФІНАЛЬНИЙ ОБРАЗ (Запуск)
# =========================================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
# Копіюємо опубліковані файли
COPY --from=build /app/publish .

# Налаштовуємо порт: Render використовує 10000
ENV ASPNETCORE_URLS=http://+:10000 
# Запускаємо додаток
ENTRYPOINT ["dotnet", "SimpleTODOLesson.Server.dll"]
