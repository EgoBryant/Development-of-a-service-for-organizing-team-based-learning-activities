# PowerShell curl.exe examples for TeamExamProject API

These examples are written for Windows PowerShell / PowerShell 7. Use `curl.exe`, not `curl`, because `curl` can be an alias for `Invoke-WebRequest` in Windows PowerShell.

Important: do not pass JSON to `curl.exe -d '{"x":"y"}'` directly in PowerShell. Native argument parsing can strip the JSON quotes before the request reaches ASP.NET. The examples below write JSON to a temporary file and send it with `--data-binary "@$BodyFile"`; this has been verified through PowerShell.

## 0. Start API

Docker compose exposes the API at `http://localhost:8080`:

```powershell
docker compose up -d --build
```

Set the base URL once per terminal session:

```powershell
$BaseUrl = 'http://localhost:8080'
```

If you run the ASP.NET profile directly instead of Docker, use:

```powershell
$BaseUrl = 'http://localhost:5141'
```

## Fast smoke test: register, login, call `/me`

Copy and run this whole block in one PowerShell session. It registers a new user, logs in with exactly the same email/password, then calls `/api/auth/me` with the login JWT.

```powershell
$BaseUrl = 'http://localhost:8080'
$Email = "smoke.$([guid]::NewGuid().ToString('N'))@example.com"
$Password = 'Password123!'

$BodyFile = New-TemporaryFile
@{ userName = 'Smoke User'; email = $Email; password = $Password } | ConvertTo-Json -Compress | Set-Content -Path $BodyFile -Encoding UTF8
$RegisterRaw = curl.exe -s -i -X POST "$BaseUrl/api/auth/register" -H 'Content-Type: application/json' -H 'Accept: application/json' --data-binary "@$BodyFile"
Remove-Item $BodyFile
$RegisterRaw

$BodyFile = New-TemporaryFile
@{ email = $Email; password = $Password } | ConvertTo-Json -Compress | Set-Content -Path $BodyFile -Encoding UTF8
$LoginRaw = curl.exe -s -i -X POST "$BaseUrl/api/auth/login" -H 'Content-Type: application/json' -H 'Accept: application/json' --data-binary "@$BodyFile"
Remove-Item $BodyFile
$LoginRaw

$LoginJson = ($LoginRaw -join "`n") -replace '(?s)^.*?\r?\n\r?\n', '' | ConvertFrom-Json
$Token = $LoginJson.token
curl.exe -i "$BaseUrl/api/auth/me" -H 'Accept: application/json' -H "Authorization: Bearer $Token"
```

If the login returns `401`, print the values you are actually sending:

```powershell
$Email
$Password
```

A `401` from `/api/auth/login` means the API did not find that email or the password did not match the stored hash. It is not a JWT/Auth-header issue yet; JWT is created only after successful login.

## 1. Healthcheck

```powershell
curl.exe -i "$BaseUrl/health"
```

Expected successful response: `HTTP/1.1 200 OK` and JSON with `status: "ok"`.

## 2. Register a user and save JWT

The email is generated dynamically, so this block can be run repeatedly against the same database.

```powershell
$UserEmail = "powershell.student.$([guid]::NewGuid().ToString('N'))@example.com"
$BodyFile = New-TemporaryFile
@{ userName = 'PowerShell Student'; email = $UserEmail; password = 'Password123!' } | ConvertTo-Json -Compress | Set-Content -Path $BodyFile -Encoding UTF8
$RegisterResponse = curl.exe -s -X POST "$BaseUrl/api/auth/register" -H 'Content-Type: application/json' -H 'Accept: application/json' --data-binary "@$BodyFile" | ConvertFrom-Json
Remove-Item $BodyFile
$UserToken = $RegisterResponse.token
$UserToken
```

## 3. Login registered user and save JWT

Use the same `$UserEmail` from section 2.

```powershell
$BodyFile = New-TemporaryFile
@{ email = $UserEmail; password = 'Password123!' } | ConvertTo-Json -Compress | Set-Content -Path $BodyFile -Encoding UTF8
$LoginResponse = curl.exe -s -X POST "$BaseUrl/api/auth/login" -H 'Content-Type: application/json' -H 'Accept: application/json' --data-binary "@$BodyFile" | ConvertFrom-Json
Remove-Item $BodyFile
$UserToken = $LoginResponse.token
$UserToken
```

## 4. Login seeded demo student and save JWT

Seeded credentials from `SeedData.cs` on a fresh database:

```powershell
$BodyFile = New-TemporaryFile
@{ email = 'student@teamexam.local'; password = 'Student123!' } | ConvertTo-Json -Compress | Set-Content -Path $BodyFile -Encoding UTF8
$StudentLogin = curl.exe -s -X POST "$BaseUrl/api/auth/login" -H 'Content-Type: application/json' -H 'Accept: application/json' --data-binary "@$BodyFile" | ConvertFrom-Json
Remove-Item $BodyFile
$StudentToken = $StudentLogin.token
$StudentToken
```

## 5. Login seeded admin and save JWT

Seeded credentials from `SeedData.cs` on a fresh database:

```powershell
$BodyFile = New-TemporaryFile
@{ email = 'admin@teamexam.local'; password = 'Admin123!' } | ConvertTo-Json -Compress | Set-Content -Path $BodyFile -Encoding UTF8
$AdminLogin = curl.exe -s -X POST "$BaseUrl/api/auth/login" -H 'Content-Type: application/json' -H 'Accept: application/json' --data-binary "@$BodyFile" | ConvertFrom-Json
Remove-Item $BodyFile
$AdminToken = $AdminLogin.token
$AdminToken
```

## 6. Current auth profile (`/api/auth/me`)

```powershell
curl.exe -i "$BaseUrl/api/auth/me" -H 'Accept: application/json' -H "Authorization: Bearer $StudentToken"
```

## 7. Current full profile (`/api/profile`)

```powershell
curl.exe -i "$BaseUrl/api/profile" -H 'Accept: application/json' -H "Authorization: Bearer $StudentToken"
```

## 8. Update profile (`/api/profile`)

```powershell
$BodyFile = New-TemporaryFile
@{
    bio = 'Backend-focused student in Team Exam MVP'
    avatarUrl = 'https://example.com/avatars/student.png'
    contactEmail = 'student.profile@example.com'
    telegramHandle = '@teamexam_student'
    phoneNumber = '+79001234567'
} | ConvertTo-Json -Compress | Set-Content -Path $BodyFile -Encoding UTF8
curl.exe -i -X PUT "$BaseUrl/api/profile" -H 'Content-Type: application/json' -H 'Accept: application/json' -H "Authorization: Bearer $StudentToken" --data-binary "@$BodyFile"
Remove-Item $BodyFile
```

## 9. List teams

```powershell
curl.exe -i "$BaseUrl/api/teams" -H 'Accept: application/json' -H "Authorization: Bearer $StudentToken"
```

## 10. Get team by id

Seed data creates teams `Alpha` and `Beta`. Their ids are usually `1` and `2` on a fresh database.

```powershell
curl.exe -i "$BaseUrl/api/teams/1" -H 'Accept: application/json' -H "Authorization: Bearer $StudentToken"
```

## 11. Get current user's team

```powershell
curl.exe -i "$BaseUrl/api/teams/me" -H 'Accept: application/json' -H "Authorization: Bearer $StudentToken"
```

## 12. Create a team with a new user through `/api/teams/create`

A user can belong to only one team. After successful creation, the user's role becomes `Captain`.

```powershell
$NewEmail = "team.owner.$([guid]::NewGuid().ToString('N'))@example.com"
$BodyFile = New-TemporaryFile
@{ userName = 'Team Owner'; email = $NewEmail; password = 'Password123!' } | ConvertTo-Json -Compress | Set-Content -Path $BodyFile -Encoding UTF8
$OwnerLogin = curl.exe -s -X POST "$BaseUrl/api/auth/register" -H 'Content-Type: application/json' -H 'Accept: application/json' --data-binary "@$BodyFile" | ConvertFrom-Json
Remove-Item $BodyFile
$OwnerToken = $OwnerLogin.token

$BodyFile = New-TemporaryFile
@{ name = 'Gamma' } | ConvertTo-Json -Compress | Set-Content -Path $BodyFile -Encoding UTF8
curl.exe -i -X POST "$BaseUrl/api/teams/create" -H 'Content-Type: application/json' -H 'Accept: application/json' -H "Authorization: Bearer $OwnerToken" --data-binary "@$BodyFile"
Remove-Item $BodyFile
```

## 13. Legacy create team route `/api/teams`

```powershell
$NewEmail = "team.legacy.$([guid]::NewGuid().ToString('N'))@example.com"
$BodyFile = New-TemporaryFile
@{ userName = 'Legacy Owner'; email = $NewEmail; password = 'Password123!' } | ConvertTo-Json -Compress | Set-Content -Path $BodyFile -Encoding UTF8
$OwnerLogin = curl.exe -s -X POST "$BaseUrl/api/auth/register" -H 'Content-Type: application/json' -H 'Accept: application/json' --data-binary "@$BodyFile" | ConvertFrom-Json
Remove-Item $BodyFile
$OwnerToken = $OwnerLogin.token

$BodyFile = New-TemporaryFile
@{ name = 'Legacy Gamma' } | ConvertTo-Json -Compress | Set-Content -Path $BodyFile -Encoding UTF8
curl.exe -i -X POST "$BaseUrl/api/teams" -H 'Content-Type: application/json' -H 'Accept: application/json' -H "Authorization: Bearer $OwnerToken" --data-binary "@$BodyFile"
Remove-Item $BodyFile
```

## 14. Join team by invite code with a new user

A user can join only if they are not already in a team.

```powershell
$JoinerEmail = "team.joiner.$([guid]::NewGuid().ToString('N'))@example.com"
$BodyFile = New-TemporaryFile
@{ userName = 'Team Joiner'; email = $JoinerEmail; password = 'Password123!' } | ConvertTo-Json -Compress | Set-Content -Path $BodyFile -Encoding UTF8
$JoinerLogin = curl.exe -s -X POST "$BaseUrl/api/auth/register" -H 'Content-Type: application/json' -H 'Accept: application/json' --data-binary "@$BodyFile" | ConvertFrom-Json
Remove-Item $BodyFile
$JoinerToken = $JoinerLogin.token

$BodyFile = New-TemporaryFile
@{ inviteCode = 'ALPHA1' } | ConvertTo-Json -Compress | Set-Content -Path $BodyFile -Encoding UTF8
curl.exe -i -X POST "$BaseUrl/api/teams/join" -H 'Content-Type: application/json' -H 'Accept: application/json' -H "Authorization: Bearer $JoinerToken" --data-binary "@$BodyFile"
Remove-Item $BodyFile
```

## 15. Update team score as admin

Only users with role `Admin` can call this endpoint.

```powershell
$BodyFile = New-TemporaryFile
@{ score = 150 } | ConvertTo-Json -Compress | Set-Content -Path $BodyFile -Encoding UTF8
curl.exe -i -X PATCH "$BaseUrl/api/teams/1/score" -H 'Content-Type: application/json' -H 'Accept: application/json' -H "Authorization: Bearer $AdminToken" --data-binary "@$BodyFile"
Remove-Item $BodyFile
```

## 16. Forbidden score update as student

This should return `403 Forbidden` for a normal student token.

```powershell
$BodyFile = New-TemporaryFile
@{ score = 200 } | ConvertTo-Json -Compress | Set-Content -Path $BodyFile -Encoding UTF8
curl.exe -i -X PATCH "$BaseUrl/api/teams/1/score" -H 'Content-Type: application/json' -H 'Accept: application/json' -H "Authorization: Bearer $StudentToken" --data-binary "@$BodyFile"
Remove-Item $BodyFile
```

## 17. Unauthorized request without JWT

This should return `401 Unauthorized`.

```powershell
curl.exe -i "$BaseUrl/api/teams" -H 'Accept: application/json'
```

## Troubleshooting

If `curl` opens `Invoke-WebRequest` behavior or fails on `-H` / `--data-binary`, you are not using the real curl binary. Use `curl.exe` exactly.

If `ConvertFrom-Json` fails, print the raw response first:

```powershell
$BodyFile = New-TemporaryFile
@{ email = 'student@teamexam.local'; password = 'Student123!' } | ConvertTo-Json -Compress | Set-Content -Path $BodyFile -Encoding UTF8
curl.exe -i -X POST "$BaseUrl/api/auth/login" -H 'Content-Type: application/json' -H 'Accept: application/json' --data-binary "@$BodyFile"
Remove-Item $BodyFile
```
