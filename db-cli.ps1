# Database CLI Helper Script for LuminaTrace
# Usage: .\db-cli.ps1 [command] [args]

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    
    [Parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$Args
)

$DB_CONTAINER = "luminatrace_db"
$DB_USER = "luminatrace"
$DB_NAME = "luminatrace"

function Show-Help {
    Write-Host "LuminaTrace Database CLI Helper" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\db-cli.ps1 [command] [args]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Green
    Write-Host "  tables              - List all tables"
    Write-Host "  describe <table>    - Show table structure"
    Write-Host "  query <sql>         - Run a SQL query"
    Write-Host "  shell               - Open interactive psql shell"
    Write-Host "  users               - List all users"
    Write-Host "  projects            - List all projects"
    Write-Host "  status              - Show database status"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\db-cli.ps1 tables"
    Write-Host "  .\db-cli.ps1 describe users"
    Write-Host '  .\db-cli.ps1 query "SELECT * FROM users LIMIT 5;"'
    Write-Host "  .\db-cli.ps1 shell"
}

function Invoke-DbCommand {
    param([string]$Sql)
    docker exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -c $Sql
}

switch ($Command.ToLower()) {
    "help" {
        Show-Help
    }
    "tables" {
        Invoke-DbCommand "\dt"
    }
    "describe" {
        if ($Args.Count -eq 0) {
            Write-Host "Error: Please specify a table name" -ForegroundColor Red
            Write-Host "Usage: .\db-cli.ps1 describe <table_name>" -ForegroundColor Yellow
            exit 1
        }
        Invoke-DbCommand "\d $($Args[0])"
    }
    "query" {
        if ($Args.Count -eq 0) {
            Write-Host "Error: Please specify a SQL query" -ForegroundColor Red
            Write-Host 'Usage: .\db-cli.ps1 query "SELECT * FROM users;"' -ForegroundColor Yellow
            exit 1
        }
        $sql = $Args -join " "
        Invoke-DbCommand $sql
    }
    "shell" {
        Write-Host "Opening interactive PostgreSQL shell..." -ForegroundColor Green
        Write-Host "Type \q to exit" -ForegroundColor Yellow
        docker exec -it $DB_CONTAINER psql -U $DB_USER -d $DB_NAME
    }
    "users" {
        Invoke-DbCommand "SELECT id, full_name, email, is_email_verified, created_at FROM users;"
    }
    "projects" {
        Invoke-DbCommand "SELECT id, name, slug, retention_days, created_at FROM projects;"
    }
    "status" {
        Write-Host "Database Status:" -ForegroundColor Cyan
        Write-Host "================" -ForegroundColor Cyan
        Invoke-DbCommand "SELECT version();"
        Write-Host ""
        Invoke-DbCommand "\conninfo"
        Write-Host ""
        Invoke-DbCommand "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';"
    }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
        exit 1
    }
}
