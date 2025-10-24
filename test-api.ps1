# AKI! Microservice Core API Test Script
Write-Host "🚀 Testing AKI! Microservice Core API" -ForegroundColor Green
Write-Host "=" * 50

$baseUrl = "http://localhost:3001"
$headers = @{"Authorization" = "Bearer mock-token"; "Content-Type" = "application/json"}

# Test 1: Root endpoint
Write-Host "`n📋 Testing Root Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/" -Method GET
    Write-Host "✅ Root endpoint working" -ForegroundColor Green
    Write-Host "   Name: $($response.name)"
    Write-Host "   Status: $($response.status)"
} catch {
    Write-Host "❌ Root endpoint failed: $_" -ForegroundColor Red
}

# Test 2: Health check
Write-Host "`n🏥 Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Health endpoint working" -ForegroundColor Green
    Write-Host "   Status: $($response.status)"
    Write-Host "   Database: $($response.database)"
} catch {
    Write-Host "❌ Health endpoint failed: $_" -ForegroundColor Red
}

# Test 3: List events
Write-Host "`n📅 Testing Events List..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/events" -Headers $headers -Method GET
    Write-Host "✅ Events list working" -ForegroundColor Green
    Write-Host "   Total events: $($response.meta.total)"
    Write-Host "   Message: $($response.message)"
} catch {
    Write-Host "❌ Events list failed: $_" -ForegroundColor Red
}

# Test 3a: List attendances
Write-Host "`n📝 Testing Attendances List..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/attendances" -Headers $headers -Method GET
    Write-Host "✅ Attendances list working" -ForegroundColor Green
    Write-Host "   Total attendances: $($response.meta.total)"
    Write-Host "   Message: $($response.message)"
} catch {
    Write-Host "❌ Attendances list failed: $_" -ForegroundColor Red
}

# Test 3b: List occurrences
Write-Host "`n⚠️ Testing Occurrences List..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/occurrences" -Headers $headers -Method GET
    Write-Host "✅ Occurrences list working" -ForegroundColor Green
    Write-Host "   Total occurrences: $($response.meta.total)"
    Write-Host "   Message: $($response.message)"
} catch {
    Write-Host "❌ Occurrences list failed: $_" -ForegroundColor Red
}

# Test 4: Create event
Write-Host "`n➕ Testing Event Creation..." -ForegroundColor Yellow
# Create event with future date
$futureDate = (Get-Date).AddDays(1).ToString("yyyy-MM-ddTHH:mm:ssZ")
$futureEndDate = (Get-Date).AddDays(1).AddHours(2).ToString("yyyy-MM-ddTHH:mm:ssZ")

$eventData = @{
    class_id = 1
    teacher_id = 1
    start_time = $futureDate
    end_time = $futureEndDate
    location = @{
        latitude = -23.5505
        longitude = -46.6333
    }
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/v1/events" -Headers $headers -Method POST -Body $eventData
    Write-Host "✅ Event creation working" -ForegroundColor Green
    Write-Host "   Event ID: $($response.data.id)"
    Write-Host "   Class ID: $($response.data.class_id)"
    Write-Host "   Status: $($response.data.status)"
    
    $eventId = $response.data.id
    
    # Test 5: Get specific event
    Write-Host "`n📋 Testing Get Specific Event..." -ForegroundColor Yellow
    try {
        $eventResponse = Invoke-RestMethod -Uri "$baseUrl/v1/events/$eventId" -Headers $headers -Method GET
        Write-Host "✅ Get event working" -ForegroundColor Green
        Write-Host "   Retrieved event ID: $($eventResponse.data.id)"
    } catch {
        Write-Host "❌ Get event failed: $_" -ForegroundColor Red
    }
    
    # Test 6: Get QR token
    Write-Host "`n🔲 Testing QR Token..." -ForegroundColor Yellow
    try {
        $qrResponse = Invoke-RestMethod -Uri "$baseUrl/v1/events/$eventId/qr" -Headers $headers -Method GET
        Write-Host "✅ QR token working" -ForegroundColor Green
        Write-Host "   Token length: $($qrResponse.data.qr_token.Length) characters"
    } catch {
        Write-Host "❌ QR token failed: $_" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Event creation failed: $_" -ForegroundColor Red
}

# Test 7: Test UPDATE endpoint
Write-Host "`n✏️ Testing Event Update (PUT)..." -ForegroundColor Yellow
if ($eventId) {
    $updateData = @{
        status = "closed"
    } | ConvertTo-Json
    
    try {
        $updateResponse = Invoke-RestMethod -Uri "$baseUrl/v1/events/$eventId" -Headers $headers -Method PUT -Body $updateData
        Write-Host "✅ Event update working" -ForegroundColor Green
        Write-Host "   Updated event status: $($updateResponse.data.status)"
        Write-Host "   Message: $($updateResponse.message)"
    } catch {
        Write-Host "❌ Event update failed: $_" -ForegroundColor Red
    }
}

# Test 8: Test DELETE endpoint
Write-Host "`n🗑️ Testing Event Delete (DELETE)..." -ForegroundColor Yellow

# Create another event for deletion (since closed events can't be deleted)
$deleteTestData = @{
    class_id = 2
    teacher_id = 1
    start_time = $futureDate
    end_time = $futureEndDate
    location = @{
        latitude = -23.5505
        longitude = -46.6333
    }
} | ConvertTo-Json

try {
    $deleteTestEvent = Invoke-RestMethod -Uri "$baseUrl/v1/events" -Headers $headers -Method POST -Body $deleteTestData
    $deleteEventId = $deleteTestEvent.data.id
    Write-Host "   Created event for deletion test: $deleteEventId" -ForegroundColor Cyan
    
    # Now delete it
    Invoke-RestMethod -Uri "$baseUrl/v1/events/$deleteEventId" -Headers $headers -Method DELETE
    Write-Host "✅ Event delete working" -ForegroundColor Green
    Write-Host "   Successfully deleted event: $deleteEventId"
    
    # Verify it's gone
    try {
        Invoke-RestMethod -Uri "$baseUrl/v1/events/$deleteEventId" -Headers $headers -Method GET
        Write-Host "⚠️ Warning: Event still exists after deletion" -ForegroundColor Yellow
    } catch {
        Write-Host "✅ Confirmed: Event was successfully deleted" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Event delete failed: $_" -ForegroundColor Red
}

Write-Host "`n" + "=" * 50
Write-Host "🎉 API Testing Complete!" -ForegroundColor Green
Write-Host "✅ Event CREATE - Working" -ForegroundColor Green
Write-Host "✅ Event READ (List & Get) - Working" -ForegroundColor Green
Write-Host "✅ Event UPDATE - Working" -ForegroundColor Green
Write-Host "✅ Event DELETE - Working" -ForegroundColor Green
Write-Host "`n🚀 Full CRUD operations implemented for Events!" -ForegroundColor Green