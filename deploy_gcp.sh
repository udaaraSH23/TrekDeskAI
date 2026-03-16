#!/bin/bash

# TrekDesk AI — Automated Deployment Script (Google Cloud)
# Usage: ./deploy_gcp.sh

PROJECT_ID="trekdesk-ai" # Update with your actual GCP Project ID
REGION="us-central1"
BACKEND_SERVICE="trekdesk-backend"

echo "🚀 Starting automated deployment for TrekDesk AI..."

# 1. Deploy Backend to Cloud Run
echo "📦 Building and deploying Backend to Cloud Run..."
cd trekdesk-backend-prod
gcloud builds submit --tag gcr.io/$PROJECT_ID/$BACKEND_SERVICE
gcloud run deploy $BACKEND_SERVICE \
    --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE \
    --region $REGION \
    --platform managed \
    --allow-unauthenticated
cd ..

# 2. Deploy Frontend to Firebase
echo "🌐 Building and deploying Frontend to Firebase..."
cd trekdesk-admin-dashboard
npm install
npm run build
firebase deploy --only hosting
cd ..

echo "✅ Deployment complete!"
