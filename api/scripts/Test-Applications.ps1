param(
    [string]$BaseUrl = 'http://localhost:5080',
    [Parameter(Mandatory)][SecureString]$Token
)

$ErrorActionPreference = 'Stop'

function Assert-True([bool]$Condition, [string]$Message) {
    if (-not $Condition) { throw $Message }
}

function Send-Request([string]$Method, [string]$Path, [int]$ExpectedStatus, $Body = $null) {
    $parameters = @{
        Uri = "$BaseUrl$Path"
        Method = $Method
        SkipHttpErrorCheck = $true
    }
    if ($null -ne $Body) {
        $parameters.ContentType = 'application/json'
        $parameters.Body = ConvertTo-Json -InputObject $Body -Depth 10
    }
    if ($Path.StartsWith('/api/')) {
        $parameters.Authentication = 'Bearer'
        $parameters.Token = $Token
        if ($BaseUrl.StartsWith('http://')) { $parameters.AllowUnencryptedAuthentication = $true }
    }
    $response = Invoke-WebRequest @parameters
    Assert-True ($response.StatusCode -eq $ExpectedStatus) "$Method $Path expected $ExpectedStatus, got $($response.StatusCode): $($response.Content)"
    return $response
}

$schema = (Send-Request GET '/swagger/v1/swagger.json' 200).Content | ConvertFrom-Json
Assert-True ($null -ne $schema.paths.'/api/applications'.post) 'OpenAPI must describe POST.'
Assert-True ($null -ne $schema.paths.'/api/applications/{id}'.put) 'OpenAPI must describe PUT.'

$body = @{
    companyName = ' CRUD smoke test '
    jobTitle = ' Backend Developer '
    jobUrl = 'https://example.com/jobs/123'
    location = 'Helsinki'
    source = 'Company website'
    status = 'Applied'
    appliedDate = '2026-09-16'
    deadline = '2026-09-30'
    salaryRange = '4000-5000 EUR'
    notes = 'Temporary test record'
    jobDescription = 'Build APIs'
    userId = 'must-not-be-used'
    createdAt = '2000-01-01T00:00:00Z'
}

$id = $null
try {
    $response = Send-Request POST '/api/applications' 201 $body
    $created = $response.Content | ConvertFrom-Json
    $id = $created.id
    Assert-True ($response.Headers.Location[0].EndsWith("/api/applications/$id")) 'Location must point to the created application.'
    Assert-True ($created.companyName -eq 'CRUD smoke test') 'Company name must be trimmed.'
    Assert-True ($created.jobTitle -eq 'Backend Developer') 'Job title must be trimmed.'
    Assert-True ($created.createdAt -eq $created.updatedAt) 'Initial timestamps must match.'
    Assert-True ($response.Content -match '"createdAt":"[^"]+Z"') 'CreatedAt must have UTC suffix.'
    Assert-True ($response.Content -notmatch '2000-01-01') 'Client cannot set timestamps.'
    Assert-True ($created.PSObject.Properties.Name -notcontains 'userId') 'Response must not expose internal UserId.'

    $readResponse = Send-Request GET "/api/applications/$id" 200
    $read = $readResponse.Content | ConvertFrom-Json
    Assert-True ($readResponse.Content -match '"createdAt":"[^"]+Z"') 'UTC kind must survive database reads.'
    foreach ($field in @('jobUrl', 'location', 'source', 'status', 'appliedDate', 'deadline', 'salaryRange', 'notes', 'jobDescription')) {
        Assert-True ($read.$field -eq $body[$field]) "Field $field must round-trip."
    }
    $list = (Send-Request GET '/api/applications' 200).Content | ConvertFrom-Json
    Assert-True ($id -in $list.id) 'Created application must appear in list despite spoofed UserId.'

    foreach ($invalid in @(
        @{},
        @{ companyName = ' '; jobTitle = 'Developer' },
        @{ companyName = 'Company'; jobTitle = '' },
        @{ companyName = $null; jobTitle = 'Developer' },
        @{ companyName = 'Company'; jobTitle = 'Developer'; status = 'Unknown' },
        @{ companyName = 'Company'; jobTitle = 'Developer'; status = 99 },
        @{ companyName = 'Company'; jobTitle = 'Developer'; appliedDate = 'invalid-date' }
    )) {
        $null = Send-Request POST '/api/applications' 400 $invalid
        $null = Send-Request PUT "/api/applications/$id" 400 $invalid
    }

    foreach ($status in @('Draft', 'ToApply', 'Applied', 'Interviewing', 'Assignment', 'Offer', 'Rejected', 'Ghosted', 'Withdrawn')) {
        $body.status = $status
        $updated = (Send-Request PUT "/api/applications/$id" 200 $body).Content | ConvertFrom-Json
        Assert-True ($updated.status -eq $status) "Status $status must be accepted."
        Assert-True ($updated.createdAt -eq $created.createdAt) 'CreatedAt must not change on edit.'
        Assert-True ($updated.updatedAt -gt $created.updatedAt) 'UpdatedAt must advance.'
    }

    $replacement = (Send-Request PUT "/api/applications/$id" 200 @{
        companyName = 'Changed company'; jobTitle = 'Changed title'
    }).Content | ConvertFrom-Json
    Assert-True ($replacement.notes -eq $null -and $replacement.appliedDate -eq $null) 'PUT must clear omitted optional fields.'
    Assert-True ($replacement.status -eq 'Draft') 'Omitted status defaults to Draft.'
    $null = Send-Request DELETE "/api/applications/$id" 204
    $null = Send-Request GET "/api/applications/$id" 404
    $null = Send-Request PUT "/api/applications/$id" 404 $body
    $null = Send-Request DELETE "/api/applications/$id" 404
    $id = $null
    Write-Output 'PASS: OpenAPI, CRUD, field round-trips, all statuses, validation, UTC timestamps, server-owned fields and 404 responses.'
}
finally {
    if ($id) {
        $null = Invoke-WebRequest -Uri "$BaseUrl/api/applications/$id" -Method DELETE -SkipHttpErrorCheck
    }
}
