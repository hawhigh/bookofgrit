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

# 2. Prepare the deployment directory
echo "📂 Preparing $BUILD_DIR..."
cd $BUILD_DIR

# 3. Handle Git in the build directory
if [ -d ".git" ]; then
    echo "🔍 Found existing .git in $BUILD_DIR. Cleaning up..."
    rm -rf .git
fi

git init
git add .
git commit -m "Deploy: $(date +'%Y-%m-%d %H:%M:%S')"

# 4. Push to the deployment branch
echo "📤 Pushing to $REPO_OR_URL:$DEPLOY_BRANCH..."
git push -f "$REPO_OR_URL" HEAD:$DEPLOY_BRANCH

# 5. Clean up
cd ..
echo "✅ Deployment complete!"
