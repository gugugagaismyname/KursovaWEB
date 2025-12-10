# =========================================================
# ЕТАП 1: Збірка ФРОНТЕНДУ (React/Vite) - ВИПРАВЛЕНО
# =========================================================
FROM node:20-alpine AS frontend-build
WORKDIR /app/client/simpletodolesson.client 

# Копіюємо package.json та встановлюємо залежності
COPY simpletodolesson.client/package*.json ./
RUN npm install 

# Копіюємо решту файлів клієнта 
COPY simpletodolesson.client/ ./
 
# Збираємо фронтенд. Шлях для виводу повинен бути абсолютним,
# щоб уникнути помилок шляху.
# Ми копіюємо в папку /app/server/wwwroot, яку створимо пізніше.
RUN npm run build --outDir /app/server/wwwroot 

# =========================================================
# ЕТАП 2: Збірка БЕКЕНДУ (.NET) - ТЕЖ ПОТРЕБУЄ ВИПРАВЛЕННЯ
# =========================================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Копіюємо файли рішення
COPY SimpleTODOLesson.Server/*.csproj SimpleTODOLesson.Server/
RUN dotnet restore SimpleTODOLesson.Server/SimpleTODOLesson.Server.csproj

COPY SimpleTODOLesson.Server/ SimpleTODOLesson.Server/

# *** ВИПРАВЛЕННЯ: Тепер копіюємо з абсолютного шляху, який вказали вище ***
COPY --from=frontend-build /app/server/wwwroot SimpleTODOLesson.Server/wwwroot

# Публікуємо
WORKDIR /src/SimpleTODOLesson.Server
RUN dotnet publish -c Release -o /app/publish
# ... (Фінальний етап залишаємо без змін)

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