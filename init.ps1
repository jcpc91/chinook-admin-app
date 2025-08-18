# PowerShell version of init.sh script for Windows
npm install --loglevel verbose
# Navigate to database directory and setup
Set-Location database

npm run migrate-app --loglevel verbose
npm run migrate-auth --loglevel verbose
Write-Host "Database initialized"

# Navigate to web directory and setup
Set-Location ..
Set-Location web


# Create .env.development.local file
@"
VITE_MODE=local
VITE_BASE_URL= 
VITE_URL_AUTH=
"@ | Out-File -FilePath ".env.development.local" -Encoding UTF8

Write-Host "web install"

# Navigate to auth directory and setup
Set-Location ..
Set-Location auth


# Create .env file
@"
CORS_ORIGIN=
JWT_SECREAT_KEY=
PORT=3000
"@ | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "auth install"

# Navigate to app directory and setup
Set-Location ..
Set-Location app


# Create .env file
@"
CORS_ORIGIN=
JWT_SECREAT_KEY=
PORT=3001
"@ | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "app install"

# Install chance-cli globally
npm install -g chance-cli --loglevel verbose

# Configure git settings
git config --local user.name "jcpc91"
git config --local user.email "jcpc91@hotmail.com"

Write-Host "Initialization complete!"
