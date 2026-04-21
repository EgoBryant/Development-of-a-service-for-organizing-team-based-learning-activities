FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY TeamExamProject.sln ./
COPY TeamExamProject/TeamExamProject.csproj TeamExamProject/
RUN dotnet restore TeamExamProject/TeamExamProject.csproj

COPY TeamExamProject/. TeamExamProject/
RUN dotnet publish TeamExamProject/TeamExamProject.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish ./

EXPOSE 8080

ENTRYPOINT ["dotnet", "TeamExamProject.dll"]
