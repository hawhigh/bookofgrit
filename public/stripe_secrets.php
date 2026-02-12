<?php
// This file should not contain the secret in the repo.
// On the server, this file should be updated manually or the env var set.
$stripeSecretKey = getenv('STRIPE_SECRET_KEY') ?: 'SK_PLACEHOLDER_FOR_REPO';
?>