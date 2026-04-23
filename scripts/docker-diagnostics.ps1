$ErrorActionPreference = "Continue"

function Write-Step {
    param([string] $Message)

    Write-Host ""
    Write-Host "============================================================"
    Write-Host $Message
    Write-Host "============================================================"
}

function Run-Step {
    param(
        [string] $Title,
        [scriptblock] $Command
    )

    Write-Step $Title
    try {
        & $Command
        if ($LASTEXITCODE -ne $null -and $LASTEXITCODE -ne 0) {
            Write-Host "Command exit code: $LASTEXITCODE" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Step "TeamExamProject Docker diagnostics"
Write-Host "Repo: $repoRoot"
Write-Host "Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

Run-Step "1. Tool versions" {
    docker --version
    docker compose version
    dotnet --version
}

Run-Step "2. Docker engine availability" {
    docker info
}

Run-Step "3. Git working tree status" {
    git status --short
}

Run-Step "4. Environment files" {
    if (Test-Path ".env") {
        Write-Host ".env exists"
        $jwtLine = Get-Content ".env" | Where-Object { $_ -match "^JWT_KEY=" } | Select-Object -First 1
        if ($jwtLine) {
            $jwtValue = $jwtLine.Substring("JWT_KEY=".Length)
            Write-Host "JWT_KEY exists, length: $($jwtValue.Length)"
        }
        else {
            Write-Host "JWT_KEY is missing in .env" -ForegroundColor Yellow
        }
    }
    else {
        Write-Host ".env does not exist; docker-compose.yml fallback values will be used" -ForegroundColor Yellow
    }

    if (Test-Path ".env.example") {
        Write-Host ".env.example exists"
    }
    else {
        Write-Host ".env.example is missing" -ForegroundColor Yellow
    }
}

Run-Step "5. Compose file validation" {
    docker compose config
}

Run-Step "6. Local .NET build" {
    dotnet build TeamExamProject.sln
}

Run-Step "7. Docker compose build without cache" {
    docker compose build --no-cache api
}

Run-Step "8. Start containers" {
    docker compose up -d
}

Run-Step "9. Wait for healthchecks" {
    Start-Sleep -Seconds 30
    docker compose ps
}

Run-Step "10. API health endpoint" {
    Invoke-WebRequest -UseBasicParsing http://localhost:8080/health |
        Select-Object StatusCode, Content
}

Run-Step "11. Swagger endpoint" {
    Invoke-WebRequest -UseBasicParsing http://localhost:8080/swagger/index.html |
        Select-Object StatusCode, StatusDescription
}

Run-Step "12. API logs" {
    docker compose logs --no-color --tail=160 api
}

Run-Step "13. Postgres logs" {
    docker compose logs --no-color --tail=120 postgres
}

Run-Step "14. API healthcheck details" {
    docker inspect --format='{{json .State.Health}}' teamexam-api
}

Write-Step "Done"
Write-Host "Useful URLs:"
Write-Host "  Health:  http://localhost:8080/health"
Write-Host "  Swagger: http://localhost:8080/swagger/index.html"
Write-Host ""
Write-Host "If something failed, copy the section above with the first red/yellow error."
