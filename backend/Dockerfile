# ---- Vite: production bundle (served from ASP.NET wwwroot) ----
FROM node:20-alpine AS webbuild
WORKDIR /web
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
ENV NODE_ENV=production
RUN npm run build

# ---- API publish ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY TeamExamProject.sln ./
COPY backend/Backend.csproj backend/
RUN dotnet restore backend/Backend.csproj

COPY backend/. backend/
COPY --from=webbuild /web/dist ./backend/wwwroot
RUN dotnet publish backend/Backend.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "TeamExamProject.dll"]
