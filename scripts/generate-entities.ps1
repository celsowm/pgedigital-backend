## ⚙️ Entity Generation Script (PowerShell)

param(
    [string]$Schema = "dbo",
    [string]$Include = "nota_versao",
    [string]$Out = "src/entities/entities.ts"
)

## --- 1. Environment Variable Check ---

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

## --- 2. URL Construction ---

# Determine SSL/TLS parameters from environment variables (defaulting to 'false')
$encrypt = if ($env:PGE_DIGITAL_ENCRYPT -eq 'true') { 'true' } else { 'false' }
$trust = if ($env:PGE_DIGITAL_TRUST_CERT -eq 'true') { 'true' } else { 'false' }

# NOTE: We construct the URL without immediate quotes, but will ensure it is quoted
# in the final command string to correctly handle the '&' character in the query string.
$databaseUrl = "mssql://$($env:PGE_DIGITAL_USER):$($env:PGE_DIGITAL_PASSWORD)@$($env:PGE_DIGITAL_HOST)/PGE_DIGITAL?encrypt=$encrypt&trustServerCertificate=$trust"

Write-Host "Database URL (for review): mssql://$($env:PGE_DIGITAL_USER):***masked***@$($env:PGE_DIGITAL_HOST)/PGE_DIGITAL?encrypt=$encrypt&trustServerCertificate=$trust"
Write-Host "Generating entities for schema '$Schema' and table(s) '$Include'."

## --- 3. Command Execution (Corrected for PowerShell) ---

# Construct the full command as a single string.
# IMPORTANT: The database URL is wrapped in SINGLE QUOTES inside this string.
# This ensures that when the command is executed, the entire URL, including the '&',
# is passed as a single argument to npx, preventing the PowerShell parsing error.
$commandString = "npx metal-orm-gen --dialect=mssql --url=""$databaseUrl"" --schema=$Schema --include=$Include --out=$Out"
& cmd /c $commandString

Write-Host "`nExecuting command via cmd.exe for safe parsing:"
Write-Host $commandString
Write-Host "----------------------------------------------------"

# Use the Call Operator (&) with cmd /c to execute the command string reliably,
# bypassing PowerShell's interpretation of special characters like '&' within the argument.
& cmd /c $commandString

# Check the exit code of the last executed command
if ($LASTEXITCODE -ne 0) {
    Write-Error "The entity generation process failed with exit code $LASTEXITCODE."
    exit $LASTEXITCODE
} else {
    Write-Host "`n✅ Entity generation completed successfully."
}