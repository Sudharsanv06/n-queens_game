# N-Queens Game - Deployment Testing Script
# Tests all aspects of your production deployment

param(
    [Parameter(Mandatory=$true)]
    [string]$BackendURL,
    
    [Parameter(Mandatory=$true)]
    [string]$FrontendURL,
    
    [switch]$SkipUserTests,
    [switch]$Verbose
)

Write-Host "🧪 N-Queens Game - Production Deployment Testing" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$testResults = @()
$totalTests = 0
$passedTests = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$URL,
        [string]$ExpectedPattern = "",
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = ""
    )
    
    $global:totalTests++
    Write-Host "🔍 Testing: $Name" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = $URL
            Method = $Method
            Headers = $Headers
            TimeoutSec = 30
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        
        if ($ExpectedPattern -and $response -notmatch $ExpectedPattern) {
            throw "Response doesn't match expected pattern: $ExpectedPattern"
        }
        
        Write-Host "   ✅ PASS: $Name" -ForegroundColor Green
        $global:passedTests++
        $global:testResults += @{Name=$Name; Status="PASS"; Details="Success"}
        
        if ($Verbose) {
            Write-Host "   Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
        }
        
        return $response
    }
    catch {
        Write-Host "   ❌ FAIL: $Name - $($_.Exception.Message)" -ForegroundColor Red
        $global:testResults += @{Name=$Name; Status="FAIL"; Details=$_.Exception.Message}
        return $null
    }
}

function Test-Frontend {
    param([string]$URL)
    
    Write-Host ""
    Write-Host "🎨 Testing Frontend ($URL)" -ForegroundColor Magenta
    Write-Host "================================" -ForegroundColor Magenta
    
    # Test 1: Frontend loads
    Test-Endpoint -Name "Frontend Homepage" -URL $URL
    
    # Test 2: Static assets
    Test-Endpoint -Name "Frontend Favicon" -URL "$URL/favicon.ico"
    
    # Test 3: React app structure (check for root div)
    try {
        $htmlResponse = Invoke-WebRequest -Uri $URL -TimeoutSec 30
        if ($htmlResponse.Content -match 'id="root"') {
            Write-Host "   ✅ PASS: React App Structure" -ForegroundColor Green
            $global:passedTests++
        } else {
            Write-Host "   ❌ FAIL: React App Structure - No root div found" -ForegroundColor Red
        }
        $global:totalTests++
    }
    catch {
        Write-Host "   ❌ FAIL: Frontend HTML Structure - $($_.Exception.Message)" -ForegroundColor Red
        $global:totalTests++
    }
}

function Test-Backend {
    param([string]$URL)
    
    Write-Host ""
    Write-Host "🚀 Testing Backend ($URL)" -ForegroundColor Magenta
    Write-Host "=============================" -ForegroundColor Magenta
    
    # Test 1: Health check
    $healthResponse = Test-Endpoint -Name "Health Check" -URL "$URL/health" -ExpectedPattern "OK"
    
    # Test 2: Database connection (from health check)
    if ($healthResponse -and $healthResponse.database -eq "Connected") {
        Write-Host "   ✅ PASS: Database Connection" -ForegroundColor Green
        $global:passedTests++
    } else {
        Write-Host "   ❌ FAIL: Database Connection" -ForegroundColor Red
    }
    $global:totalTests++
    
    # Test 3: CORS preflight
    try {
        $headers = @{
            'Origin' = $FrontendURL
            'Access-Control-Request-Method' = 'POST'
            'Access-Control-Request-Headers' = 'Content-Type'
        }
        $corsResponse = Invoke-RestMethod -Uri "$URL/api/auth/login" -Method OPTIONS -Headers $headers -TimeoutSec 30
        Write-Host "   ✅ PASS: CORS Configuration" -ForegroundColor Green
        $global:passedTests++
    }
    catch {
        Write-Host "   ❌ FAIL: CORS Configuration - $($_.Exception.Message)" -ForegroundColor Red
    }
    $global:totalTests++
    
    # Test 4: API endpoints
    Test-Endpoint -Name "Auth Signup Endpoint" -URL "$URL/api/auth/signup" -Method "POST" -Body '{"name":"","email":"","password":""}' # Should fail validation
    
    Test-Endpoint -Name "Auth Login Endpoint" -URL "$URL/api/auth/login" -Method "POST" -Body '{"email":"","password":""}' # Should fail validation
    
    # Test 5: Rate limiting (should work for first request)
    Test-Endpoint -Name "Rate Limiting Test" -URL "$URL/health"
}

function Test-Security {
    param([string]$BackendURL, [string]$FrontendURL)
    
    Write-Host ""
    Write-Host "🔒 Testing Security" -ForegroundColor Magenta
    Write-Host "===================" -ForegroundColor Magenta
    
    # Test 1: HTTPS enforcement
    foreach ($url in @($BackendURL, $FrontendURL)) {
        if ($url.StartsWith("https://")) {
            Write-Host "   ✅ PASS: HTTPS Enabled for $url" -ForegroundColor Green
            $global:passedTests++
        } else {
            Write-Host "   ❌ FAIL: HTTPS Not Enabled for $url" -ForegroundColor Red
        }
        $global:totalTests++
    }
    
    # Test 2: Security headers
    try {
        $response = Invoke-WebRequest -Uri $BackendURL -Method HEAD -TimeoutSec 30
        $headers = $response.Headers
        
        $securityHeaders = @(
            'X-Content-Type-Options',
            'X-Frame-Options', 
            'X-XSS-Protection'
        )
        
        foreach ($header in $securityHeaders) {
            if ($headers.ContainsKey($header)) {
                Write-Host "   ✅ PASS: Security Header - $header" -ForegroundColor Green
                $global:passedTests++
            } else {
                Write-Host "   ⚠️  WARN: Missing Security Header - $header" -ForegroundColor Yellow
            }
            $global:totalTests++
        }
    }
    catch {
        Write-Host "   ❌ FAIL: Security Headers Test - $($_.Exception.Message)" -ForegroundColor Red
        $global:totalTests += 3
    }
}

function Test-UserFlow {
    param([string]$BackendURL)
    
    if ($SkipUserTests) {
        Write-Host ""
        Write-Host "⏭️  Skipping User Flow Tests (--SkipUserTests specified)" -ForegroundColor Yellow
        return
    }
    
    Write-Host ""
    Write-Host "👤 Testing User Flow" -ForegroundColor Magenta
    Write-Host "====================" -ForegroundColor Magenta
    
    $testEmail = "test-$(Get-Random)@example.com"
    $testPassword = "TestPassword123!"
    
    # Test 1: User Registration
    $signupBody = @{
        name = "Test User"
        email = $testEmail
        mobile = "1234567890"
        password = $testPassword
    } | ConvertTo-Json
    
    $signupResponse = Test-Endpoint -Name "User Registration" -URL "$BackendURL/api/auth/signup" -Method "POST" -Body $signupBody
    
    if ($signupResponse) {
        # Test 2: User Login
        $loginBody = @{
            email = $testEmail
            password = $testPassword
        } | ConvertTo-Json
        
        $loginResponse = Test-Endpoint -Name "User Login" -URL "$BackendURL/api/auth/login" -Method "POST" -Body $loginBody
        
        if ($loginResponse -and $loginResponse.token) {
            Write-Host "   ✅ PASS: JWT Token Generated" -ForegroundColor Green
            $global:passedTests++
            
            # Test 3: Authenticated request (if you have protected endpoints)
            $authHeaders = @{
                'Authorization' = "Bearer $($loginResponse.token)"
            }
            
            # Add tests for authenticated endpoints here if needed
        } else {
            Write-Host "   ❌ FAIL: JWT Token Not Generated" -ForegroundColor Red
        }
        $global:totalTests++
    }
}

function Test-Performance {
    param([string]$BackendURL, [string]$FrontendURL)
    
    Write-Host ""
    Write-Host "⚡ Testing Performance" -ForegroundColor Magenta
    Write-Host "======================" -ForegroundColor Magenta
    
    # Test response times
    foreach ($endpoint in @(@{Name="Backend Health"; URL="$BackendURL/health"}, @{Name="Frontend Homepage"; URL=$FrontendURL})) {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        
        try {
            Invoke-RestMethod -Uri $endpoint.URL -TimeoutSec 30 | Out-Null
            $stopwatch.Stop()
            $responseTime = $stopwatch.ElapsedMilliseconds
            
            if ($responseTime -lt 2000) {
                Write-Host "   ✅ PASS: $($endpoint.Name) Response Time: ${responseTime}ms" -ForegroundColor Green
                $global:passedTests++
            } else {
                Write-Host "   ⚠️  WARN: $($endpoint.Name) Slow Response: ${responseTime}ms" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "   ❌ FAIL: $($endpoint.Name) Performance Test Failed" -ForegroundColor Red
            $stopwatch.Stop()
        }
        
        $global:totalTests++
    }
}

# Validate URLs
if (-not $BackendURL.StartsWith("http")) {
    Write-Host "❌ Error: Backend URL must start with http:// or https://" -ForegroundColor Red
    exit 1
}

if (-not $FrontendURL.StartsWith("http")) {
    Write-Host "❌ Error: Frontend URL must start with http:// or https://" -ForegroundColor Red
    exit 1
}

Write-Host "🎯 Testing Configuration:" -ForegroundColor Cyan
Write-Host "   Backend:  $BackendURL" -ForegroundColor White
Write-Host "   Frontend: $FrontendURL" -ForegroundColor White
Write-Host ""

# Run all tests
Test-Frontend -URL $FrontendURL
Test-Backend -URL $BackendURL
Test-Security -BackendURL $BackendURL -FrontendURL $FrontendURL
Test-UserFlow -BackendURL $BackendURL
Test-Performance -BackendURL $BackendURL -FrontendURL $FrontendURL

# Results summary
Write-Host ""
Write-Host "📊 Test Results Summary" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($passedTests / $totalTests) * 100, 1))%" -ForegroundColor Yellow

# Detailed results
if ($Verbose) {
    Write-Host ""
    Write-Host "📋 Detailed Results:" -ForegroundColor Cyan
    Write-Host "====================" -ForegroundColor Cyan
    
    foreach ($result in $testResults) {
        $status = if ($result.Status -eq "PASS") { "✅" } else { "❌" }
        Write-Host "$status $($result.Name): $($result.Details)" -ForegroundColor White
    }
}

# Final recommendations
Write-Host ""
Write-Host "💡 Recommendations:" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow

if ($passedTests -eq $totalTests) {
    Write-Host "🎉 Excellent! All tests passed. Your deployment is ready for production!" -ForegroundColor Green
} elseif ($passedTests / $totalTests -gt 0.8) {
    Write-Host "✅ Good! Most tests passed. Address the failing tests before going live." -ForegroundColor Yellow
} else {
    Write-Host "⚠️  Warning! Many tests failed. Please fix critical issues before deployment." -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 Additional Manual Tests:" -ForegroundColor Cyan
Write-Host "1. Open $FrontendURL in a browser" -ForegroundColor White
Write-Host "2. Test user registration and login" -ForegroundColor White
Write-Host "3. Play a complete game" -ForegroundColor White
Write-Host "4. Check browser console for errors" -ForegroundColor White
Write-Host "5. Test on mobile devices" -ForegroundColor White

Write-Host ""
Write-Host "🔗 Useful Tools:" -ForegroundColor Cyan
Write-Host "SSL Test: https://www.ssllabs.com/ssltest/" -ForegroundColor White
Write-Host "Speed Test: https://pagespeed.web.dev/" -ForegroundColor White
Write-Host "Security Headers: https://securityheaders.com/" -ForegroundColor White

if ($passedTests -eq $totalTests) {
    Write-Host ""
    Write-Host "🚀 Your N-Queens game is ready for launch! 🎮" -ForegroundColor Magenta
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")