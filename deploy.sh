#!/bin/bash

# Configuration
REPO_OR_URL="git@github.com:hawhigh/bookofgrit.git"
BUILD_DIR="dist"
DEPLOY_BRANCH="deploy"

echo "🚀 Starting deployment to $DEPLOY_BRANCH branch..."

# 1. Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Aborting."
    exit 1
fi

# 2. Add extra files to dist if needed (Vite's public/ usually handles this)
# Ensuring .htaccess is there
if [ ! -f "$BUILD_DIR/.htaccess" ]; then
    echo "⚠️ .htaccess missing in $BUILD_DIR! Copying from public..."
    cp public/.htaccess $BUILD_DIR/
fi

# 3. Deploy
echo "📤 Deploying contents of $BUILD_DIR to $DEPLOY_BRANCH branch..."

# Create a temporary directory for the deployment repo
TEMP_DEPLOY_DIR="/tmp/bookofgrit_deploy_$(date +%s)"
mkdir -p "$TEMP_DEPLOY_DIR"

# Copy build artifacts to temp dir
cp -r $BUILD_DIR/* "$TEMP_DEPLOY_DIR/"
# Copy hidden files like .htaccess
cp $BUILD_DIR/.htaccess "$TEMP_DEPLOY_DIR/" 2>/dev/null

# REMOVE SECRETS TO AVOID GITHUB BLOCKS
rm "$TEMP_DEPLOY_DIR/stripe_secrets.php" 2>/dev/null

cd "$TEMP_DEPLOY_DIR"
git init
git checkout -b main
git add .
git commit -m "Deploy: $(date +'%Y-%m-%d %H:%M:%S')"

# Add remote and push
git remote add origin "$REPO_OR_URL"
# Push to 'deploy' branch
git push -f origin main:deploy

# Push to 'main' branch (just in case Hostinger is listening there)
git push -f origin main

# 4. Clean up
cd -
rm -rf "$TEMP_DEPLOY_DIR"

echo "✅ Deployment complete!"
