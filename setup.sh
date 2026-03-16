#!/bin/bash

# TrekDesk AI - Project Setup Script for Linux/macOS/Bash

echo "🚀 Starting TrekDesk AI Setup..."

# 1. Install Root dependencies
echo -e "\n📦 Installing root dependencies..."
npm install

# 2. Setup Backend
echo -e "\n🔧 Setting up Backend..."
cd trekdesk-backend-prod
npm install

if [ ! -f .env ]; then
    echo "📝 Creating .env from .env.example for Backend..."
    cp .env.example .env
    echo "⚠️  Please update trekdesk-backend-prod/.env with your actual credentials."
else
    echo "✅ Backend .env already exists."
fi
cd ..

# 3. Setup Frontend (Admin Dashboard)
echo -e "\n🎨 Setting up Admin Dashboard..."
cd trekdesk-admin-dashboard
npm install

if [ ! -f .env ]; then
    echo "📝 Creating .env from .env.example for Admin Dashboard..."
    cp .env.example .env
    echo "⚠️  Please update trekdesk-admin-dashboard/.env with your actual credentials."
else
    echo "✅ Admin Dashboard .env already exists."
fi
cd ..

echo -e "\n✨ Setup Complete!"
echo "----------------------------------------------------"
echo "To start the development environment:"
echo "1. Backend: cd trekdesk-backend-prod; npm run dev"
echo "2. Frontend: cd trekdesk-admin-dashboard; npm run dev"
echo "----------------------------------------------------"
