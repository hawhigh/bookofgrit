<?php
// Prevent caching
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// Serves the React App
$html = file_get_contents('index.html');

// Create a unique version ID based on timestamp
$ver = time();

// Optional: Inject a cache-busting meta tag just to be sure
$html = str_replace('</head>', '<meta name="deploy-timestamp" content="' . $ver . '"></head>', $html);

echo $html;
?>