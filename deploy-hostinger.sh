#!/bin/bash

# 1. Build the React App
echo "🚧 Building Project..."
npm run build

# 2. Prepare Deployment Directory
echo "📂 Preparing Deployment Payload..."
rm -rf dist_ready
mkdir dist_ready

# Copy the Build Artifacts (React)
cp -r dist/* dist_ready/

# Copy the PHP Backend Files (from public/)
cp public/*.php dist_ready/
rm dist_ready/stripe_secrets.php 2>/dev/null 

# 3. Securely Inject Stripe Secret (Read from .env)
echo "🔑 Injecting Production Secrets..."
# We explicitly get the value after the '=' sign
SECRET_KEY=$(grep "STRIPE_SECRET_KEY=" .env | cut -d '=' -f2)

if [ -z "$SECRET_KEY" ]; then
  echo "❌ Error: STRIPE_SECRET_KEY not found in .env"
  exit 1
fi

# Create the production stripe_secrets.php with the REAL key
# Note: This file lives ONLY in the 'build' branch, not 'main'.
cat <<EOF > dist_ready/stripe_secrets.php
<?php
\$stripeSecretKey = '$SECRET_KEY';
?>
EOF

# 4. Deploy via SCP (Direct Upload)
echo "🚀 Uploading to Server (Hostinger)..."

# Ensure removing old files first to avoid stale cache issues (except uploads folder)
# We move uploads to a temp location, wipe public_html, recreate uploads, restore uploads? 
# No, that's risky.
# Better: Upload new files, overwriting old ones.
# For cleanup, we might want to delete specific old files if needed.

# Upload everything in dist_ready to the actual domain directory
scp -P 65002 -r dist_ready/* u570721809@82.198.227.90:domains/thebookofgrit.com/public_html/

echo "✅ Success! Site Deployed."
echo "📚 (Note: If this was a fresh wipe, remember to restore books separately)."
