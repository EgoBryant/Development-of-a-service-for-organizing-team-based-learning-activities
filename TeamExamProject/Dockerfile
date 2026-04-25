# ---- Vite: production bundle (served from ASP.NET wwwroot) ----
FROM node:20-alpine AS webbuild
WORKDIR /web
COPY website/package.json website/package-lock.json ./
RUN npm ci
COPY website/ ./
ENV NODE_ENV=production
RUN npm run build

# ---- API publish ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY TeamExamProject.sln ./
COPY TeamExamProject/TeamExamProject.csproj TeamExamProject/
RUN dotnet restore TeamExamProject/TeamExamProject.csproj

COPY TeamExamProject/. TeamExamProject/
COPY --from=webbuild /web/dist ./TeamExamProject/wwwroot
RUN dotnet publish TeamExamProject/TeamExamProject.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "TeamExamProject.dll"]
