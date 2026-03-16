# TrekDesk AI - Project Setup Script for Windows

Write-Host "🚀 Starting TrekDesk AI Setup..." -ForegroundColor Cyan

# 1. Install Root dependencies
Write-Host "`n📦 Installing root dependencies..." -ForegroundColor Green
npm install

# 2. Setup Backend
Write-Host "`n🔧 Setting up Backend..." -ForegroundColor Green
cd trekdesk-backend-prod
npm install

if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env from .env.example for Backend..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Please update trekdesk-backend-prod/.env with your actual credentials." -ForegroundColor Red
} else {
    Write-Host "✅ Backend .env already exists." -ForegroundColor Gray
}
cd ..

# 3. Setup Frontend (Admin Dashboard)
Write-Host "`n🎨 Setting up Admin Dashboard..." -ForegroundColor Green
cd trekdesk-admin-dashboard
npm install

if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env from .env.example for Admin Dashboard..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Please update trekdesk-admin-dashboard/.env with your actual credentials." -ForegroundColor Red
} else {
    Write-Host "✅ Admin Dashboard .env already exists." -ForegroundColor Gray
}
cd ..

Write-Host "`n✨ Setup Complete!" -ForegroundColor Cyan
Write-Host "----------------------------------------------------"
Write-Host "To start the development environment:"
Write-Host "1. Backend: cd trekdesk-backend-prod; npm run dev"
Write-Host "2. Frontend: cd trekdesk-admin-dashboard; npm run dev"
Write-Host "----------------------------------------------------"
