#!/bin/bash

# Configuration
REPO_OR_URL="git@github.com:hawhigh/bookofgrit.git"
BUILD_DIR="dist_ready"
DEPLOY_BRANCH="deploy"

echo "🚧 Building Project..."
npm run build

# Ensure we have a clean state but keep the .git history if possible
if [ ! -d "$BUILD_DIR/.git" ]; then
    echo "📂 Cloning $DEPLOY_BRANCH branch for persistent history..."
    rm -rf $BUILD_DIR
    git clone --branch $DEPLOY_BRANCH $REPO_OR_URL $BUILD_DIR || {
        echo "Creating fresh $BUILD_DIR..."
        mkdir $BUILD_DIR
        cd $BUILD_DIR
        git init
        git checkout -b main
        git remote add origin "$REPO_OR_URL"
        cd ..
    }
fi

echo "🧹 Cleaning old build files (preserving .git)..."
# Delete everything except the .git folder
find $BUILD_DIR -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

echo "📦 Preparing Deployment Payload..."
# 1. Copy over the built frontend
cp -r dist/* $BUILD_DIR/

# 2. Copy over all public PHP files
cp public/*.php $BUILD_DIR/
# Ensure secrets are NOT pushed to public GitHub
rm $BUILD_DIR/stripe_secrets.php 2>/dev/null
rm $BUILD_DIR/ops_config.php 2>/dev/null

# 3. Handle .htaccess
cp public/.htaccess $BUILD_DIR/ 2>/dev/null

# 4. Commit and Push
echo "🚀 Pushing to GitHub [$DEPLOY_BRANCH] branch..."

cd $BUILD_DIR
git add -A
# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    echo "✨ No changes to deploy."
else
    git commit -m "Build: $(date +'%Y-%m-%d %H:%M:%S')"
    git push origin main:$DEPLOY_BRANCH
fi

echo "✅ Success! Pushed to $DEPLOY_BRANCH."
echo "🌐 Now go to Hostinger Panel -> Git -> Deploy to sync the live site."
echo "💡 (If Hostinger still fails, use the 'Reset' button in the Hostinger Git UI once)"
