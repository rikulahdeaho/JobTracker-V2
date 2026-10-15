$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$env:NODE_OPTIONS = '--use-system-ca'
npx expo start --lan --port 5173
