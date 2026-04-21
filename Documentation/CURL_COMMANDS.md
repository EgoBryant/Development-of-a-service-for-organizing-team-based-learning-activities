# CURL commands for current backend

Use `curl.exe` from PowerShell on Windows.

Base URL:

```bash
http://localhost:8080
```

## 1. Healthcheck

```powershell
curl.exe -i http://localhost:8080/health
```

## 2. Register

```powershell
curl.exe -i -X POST http://localhost:8080/api/auth/register -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{"userName":"testuser","email":"test@example.com","password":"password123"}'
```

## 3. Login

```powershell
curl.exe -i -X POST http://localhost:8080/api/auth/login -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{"email":"test@example.com","password":"password123"}'
```

## 4. Login demo student

```powershell
curl.exe -i -X POST http://localhost:8080/api/auth/login -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{"email":"student@teamexam.local","password":"Student123!"}'
```

## 5. Login demo admin

```powershell
curl.exe -i -X POST http://localhost:8080/api/auth/login -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{"email":"admin@teamexam.local","password":"Admin123!"}'
```

## 6. Current profile

```powershell
curl.exe -i http://localhost:8080/api/auth/me -H 'Accept: application/json' -H 'Authorization: Bearer <PASTE_JWT_HERE>'
```

## 7. List teams

```powershell
curl.exe -i http://localhost:8080/api/teams -H 'Accept: application/json' -H 'Authorization: Bearer <PASTE_JWT_HERE>'
```

## 8. Get team by id

```powershell
curl.exe -i http://localhost:8080/api/teams/1 -H 'Accept: application/json' -H 'Authorization: Bearer <PASTE_JWT_HERE>'
```

## 9. Create team

```powershell
curl.exe -i -X POST http://localhost:8080/api/teams -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Authorization: Bearer <PASTE_JWT_HERE>' -d '{"name":"Gamma"}'
```

## 10. Join team by invite code

```powershell
curl.exe -i -X POST http://localhost:8080/api/teams/join -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Authorization: Bearer <PASTE_JWT_HERE>' -d '{"inviteCode":"ALPHA1"}'
```

## 11. Get my team

```powershell
curl.exe -i http://localhost:8080/api/teams/me -H 'Accept: application/json' -H 'Authorization: Bearer <PASTE_JWT_HERE>'
```

## 12. Update team score as admin

```powershell
curl.exe -i -X PATCH http://localhost:8080/api/teams/1/score -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Authorization: Bearer <PASTE_ADMIN_JWT_HERE>' -d '{"score":150}'
```

## 13. Unauthorized score update example

```powershell
curl.exe -i -X PATCH http://localhost:8080/api/teams/1/score -H 'Content-Type: application/json' -H 'Accept: application/json' -H 'Authorization: Bearer <PASTE_JWT_HERE>' -d '{"score":200}'
```
