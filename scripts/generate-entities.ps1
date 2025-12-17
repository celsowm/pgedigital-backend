## ?? Entity Generation Script (PowerShell)

param(
    [string]$Schema = "dbo",
    [string]$Include,
    [string]$Exclude,
    [string]$Out = "src/entities/entities.ts"
)

## --- 1. URL Construction ---

$defaultDatabaseName = "PGE_DIGITAL"

# Prefer a fully-qualified DATABASE_URL, otherwise fall back to the legacy env vars.
if ($env:DATABASE_URL) {
    $databaseUrl = $env:DATABASE_URL
    Write-Host "Database URL (from DATABASE_URL): $databaseUrl"
} else {
    ## --- Legacy env var check (only when DATABASE_URL is absent) ---
    $requiredEnv = @(
        "PGE_DIGITAL_HOST",
        "PGE_DIGITAL_USER",
        "PGE_DIGITAL_PASSWORD"
    )

    foreach ($var in $requiredEnv) {
        if (-not [System.Environment]::GetEnvironmentVariable($var)) {
            Write-Error "Environment variable '$var' is required but was not set."
            exit 1
        }
    }

    # Determine SSL/TLS parameters from environment variables (defaulting to 'false')
    $encrypt = if ($env:PGE_DIGITAL_ENCRYPT -eq 'true') { 'true' } else { 'false' }
    $trust = if ($env:PGE_DIGITAL_TRUST_CERT -eq 'true') { 'true' } else { 'false' }

    $databaseName = if ($env:PGE_DIGITAL_DATABASE) { $env:PGE_DIGITAL_DATABASE } else { $defaultDatabaseName }
    $encodedUser = [System.Uri]::EscapeDataString($env:PGE_DIGITAL_USER)
    $encodedPassword = [System.Uri]::EscapeDataString($env:PGE_DIGITAL_PASSWORD)
    $encodedDatabase = [System.Uri]::EscapeDataString($databaseName)

    $databaseUrl = ("mssql://{0}:{1}@{2}/{3}?encrypt={4}&trustServerCertificate={5}" -f $encodedUser, $encodedPassword, $env:PGE_DIGITAL_HOST, $encodedDatabase, $encrypt, $trust)
    Write-Host ("Database URL (for review): mssql://{0}:***masked***@{1}/{2}?encrypt={3}&trustServerCertificate={4}" -f $encodedUser, $env:PGE_DIGITAL_HOST, $databaseName, $encrypt, $trust)
}

Write-Host "Generating entities for schema '$Schema'." + ($(if ($Include) { " Include: '$Include'." } elseif ($Exclude) { " Exclude: '$Exclude'." } else { "" }))

## --- 3. Command Execution (Corrected for PowerShell) ---

# Construct the full command as a single string.
# The database URL is wrapped in DOUBLE QUOTES so that cmd.exe treats '&' as part of the argument.
$argList = @(
    "npx metal-orm-gen",
    "--dialect=mssql",
    "--url=""$databaseUrl""",
    "--schema=$Schema"
)

if ($Include -and $Include.Trim()) {
    $argList += "--include=$Include"
}

if ($Exclude -and $Exclude.Trim()) {
    $argList += "--exclude=$Exclude"
}

$argList += "--out=$Out"

$commandString = $argList -join " "

Write-Host "`nExecuting command via cmd.exe for safe parsing:"
Write-Host $commandString
Write-Host "----------------------------------------------------"

# Execute the command once via cmd /c to avoid PowerShell interpreting '&' inside the URL.
& cmd /c $commandString

# Check the exit code of the last executed command
if ($LASTEXITCODE -ne 0) {
    Write-Error "The entity generation process failed with exit code $LASTEXITCODE."
    exit $LASTEXITCODE
} else {
    Write-Host "`nEntity generation completed successfully."
}
