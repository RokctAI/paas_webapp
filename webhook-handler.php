<?php
$logFile = '/var/www/fastuser/data/www/juvo.app/food/log/webhook-handler.log';
$secret = 'bwi';
$repoPath = '/var/www/fastuser/data/www/juvo.app/food';
$branch = 'refs/heads/release';

// Logging function
function logMessage($message) {
    global $logFile;
    file_put_contents($logFile, date('Y-m-d H:i:s') . ' ' . $message . PHP_EOL, FILE_APPEND);
}

// Get the payload and the signature from GitHub
$payload = file_get_contents('php://input');
$signature = isset($_SERVER['HTTP_X_HUB_SIGNATURE']) ? $_SERVER['HTTP_X_HUB_SIGNATURE'] : '';
$signature256 = isset($_SERVER['HTTP_X_HUB_SIGNATURE_256']) ? $_SERVER['HTTP_X_HUB_SIGNATURE_256'] : '';

// Log the received payload and signature
logMessage("Received payload: " . $payload);
logMessage("Received signature: " . $signature);
logMessage("Received signature256: " . $signature256);

// Verify the signature
$expectedSignature = 'sha1=' . hash_hmac('sha1', $payload, $secret);
$expectedSignature256 = 'sha256=' . hash_hmac('sha256', $payload, $secret);

if (!hash_equals($expectedSignature, $signature) && !hash_equals($expectedSignature256, $signature256)) {
    logMessage("Invalid secret or signature");
    http_response_code(403);
    exit('Invalid secret or signature');
}

// Decode the payload
$data = json_decode($payload, true);

// Check if the push is to the correct branch
if (isset($data['ref']) && $data['ref'] === $branch) {
    logMessage("Valid branch push detected");

    // Change to the repository directory
    chdir($repoPath);

    // Pull the latest changes from GitHub
    $output = shell_exec('git reset --hard 2>&1');
    logMessage("git reset output: " . $output);
    $output = shell_exec('git clean -fd 2>&1');
    logMessage("git clean output: " . $output);
    $output = shell_exec('git pull origin release 2>&1');
    logMessage("git pull output: " . $output);

    // Build your project
    // Add your build commands here, e.g., npm install, npm run build, etc.
    $output = shell_exec('your-build-command 2>&1');
    logMessage("Build output: " . $output);

    http_response_code(200);
} else {
    logMessage("No action required");
    http_response_code(200);
    exit('No action required');
}
?>