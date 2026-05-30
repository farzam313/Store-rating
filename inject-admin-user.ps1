# PowerShell Script to Inject Admin User into Database
# This script injects a user with admin role into the Store Rating database

# Color output helpers
function Write-Success {
    Write-Host $args[0] -ForegroundColor Green
}

function Write-Error-Custom {
    Write-Host $args[0] -ForegroundColor Red
}

function Write-Info {
    Write-Host $args[0] -ForegroundColor Cyan
}

# Set the backend directory
$backendDir = "C:\Users\aliya\OneDrive\Desktop\Store_ratingSystem\Store-rating"
$scriptPath = Join-Path $backendDir "inject-admin-user.js"

# Check if the script exists
if (-not (Test-Path $scriptPath)) {
    Write-Error-Custom "❌ Error: inject-admin-user.js not found at $scriptPath"
    exit 1
}

Write-Info "🔐 Injecting admin user into database..."
Write-Info "Database: store-rating"
Write-Info "Username: Karim"
Write-Info "Email: k@c.com"
Write-Info "Password: 1"
Write-Info "Role: admin"
Write-Host ""

# Change to backend directory
Push-Location $backendDir

# Run the injection script
Write-Info "📦 Running injection script..."
node $scriptPath

if ($LASTEXITCODE -eq 0) {
    Write-Success "✅ Admin user injection completed successfully!"
} else {
    Write-Error-Custom "❌ Failed to inject admin user. Check the error message above."
    exit 1
}

# Return to original directory
Pop-Location
