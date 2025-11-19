<?php
/**
 * Odoo Opportunity Creator - Backend Script
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

// Load config
$config_file = __DIR__ . '/odoo-config.php';
if (!file_exists($config_file)) {
    http_response_code(500);
    echo json_encode(['error' => 'Config file missing']);
    exit;
}

$config = require $config_file;

function callOdooAPI($config, $model, $method, $data = []) {
    $url = rtrim($config['url'], '/') . "/json/2/$model/$method";
    
    // Use curl instead of file_get_contents for better error handling
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: bearer ' . $config['api_key']
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        throw new Exception("CURL error: $error");
    }
    
    curl_close($ch);
    
    // Log the response for debugging
    error_log("Odoo API HTTP Code: $http_code");
    error_log("Odoo API Response: $response");
    
    if ($http_code !== 200) {
        throw new Exception("HTTP $http_code: $response");
    }
    
    return json_decode($response, true);
}

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Debug: log input
        error_log("Opportunity input: " . json_encode($input));
        
        // Prepare opportunity data for JSON-2 API
        $opportunity_data = [
            'ids' => [],
            'context' => [],
            'vals_list' => [[
                'name' => $input['name'] ?? 'Test Opportunity - ' . date('Y-m-d H:i:s'),
                'email_from' => $input['email'] ?? '',
                'phone' => $input['phone'] ?? '',
                'description' => $input['message'] ?? '',
                'expected_revenue' => floatval($input['investment_amount'] ?? 0),
                'type' => 'opportunity',
                'stage_id' => 1
            ]]
        ];
        
        // Debug: log opportunity data
        error_log("Opportunity data: " . json_encode($opportunity_data));
        
        // Create opportunity
        $opportunity_result = callOdooAPI($config, 'crm.lead', 'create', $opportunity_data);
        
        // Extract the first (and only) ID from the result array
        $opportunity_id = is_array($opportunity_result) ? $opportunity_result[0] : $opportunity_result;
        
        // Debug: log result
        error_log("Created opportunity ID: " . $opportunity_id);
        
        echo json_encode([
            'success' => true,
            'message' => 'Thank you for your interest, we will contact you very soon!',
            'opportunity_id' => $opportunity_id
        ]);
        
    } catch (Exception $e) {
        error_log("Opportunity creation error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else {
    // Test GET request
    try {
        $test_data = [
            'name' => 'Test Opportunity - ' . date('Y-m-d H:i:s'),
            'email' => 'test@example.com',
            'phone' => '+1234567890',
            'message' => 'Test investment inquiry',
            'investment_amount' => 50000
        ];
        
        $opportunity_data = [
            'ids' => [],
            'context' => [],
            'vals_list' => [[
                'name' => $test_data['name'],
                'email_from' => $test_data['email'],
                'phone' => $test_data['phone'],
                'description' => $test_data['message'],
                'expected_revenue' => floatval($test_data['investment_amount']),
                'type' => 'opportunity',
                'stage_id' => 1
            ]]
        ];
        
        $opportunity_result = callOdooAPI($config, 'crm.lead', 'create', $opportunity_data);
        
        // Extract the first (and only) ID from the result array
        $opportunity_id = is_array($opportunity_result) ? $opportunity_result[0] : $opportunity_result;
        
        echo json_encode([
            'success' => true,
            'opportunity_id' => $opportunity_id,
            'test_data' => $test_data
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
}
?>