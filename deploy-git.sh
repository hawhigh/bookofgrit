#!/bin/bash

# Configuration
REPO_OR_URL="git@github.com:hawhigh/bookofgrit.git"
BUILD_DIR="dist_ready"
DEPLOY_BRANCH="deploy"

echo "🚧 Building Project..."
npm run build

echo "📂 Preparing Deployment Payload..."
rm -rf $BUILD_DIR
mkdir $BUILD_DIR

# 1. Copy over the built frontend
cp -r dist/* $BUILD_DIR/

# 2. Copy over all public PHP files
cp public/*.php $BUILD_DIR/
# Ensure secrets are NOT pushed to public GitHub (they should be on server)
rm $BUILD_DIR/stripe_secrets.php 2>/dev/null

# 3. Handle .htaccess
cp public/.htaccess $BUILD_DIR/ 2>/dev/null

# 4. Push to 'deploy' branch via a temporary git repo
echo "🚀 Pushing to GitHub [$DEPLOY_BRANCH] branch..."

cd $BUILD_DIR
git init
git checkout -b main
git add .
git commit -m "Build: $(date +'%Y-%m-%d %H:%M:%S')"
git remote add origin "$REPO_OR_URL"
git push -f origin main:$DEPLOY_BRANCH

echo "✅ Success! Pushed to $DEPLOY_BRANCH."
echo "🌐 Now go to Hostinger Panel -> Git -> Deploy to sync the live site."
