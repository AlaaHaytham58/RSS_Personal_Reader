# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy everything
COPY . .

# Restore and publish using the specific csproj (avoids picking up Tests folder issues)
RUN dotnet restore RSS_Personal_Reader.csproj
RUN dotnet publish RSS_Personal_Reader.csproj -c Release -o /app --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .

ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "RSS_Personal_Reader.dll"]