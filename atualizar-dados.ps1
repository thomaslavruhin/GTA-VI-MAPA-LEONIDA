# Atualiza locais e tiles a partir do repositório gtadb.org (CC BY 4.0)
# Uso: .\atualizar-dados.ps1
$ErrorActionPreference = 'Stop'
$raiz = $PSScriptRoot
$tmp = Join-Path $env:TEMP ("gtadb-" + [guid]::NewGuid().ToString('N'))

Write-Host "Baixando dados do gtadb.org (pode levar alguns minutos)..."
git clone --depth 1 --filter=blob:none --sparse https://github.com/rolux/gtadb.org $tmp
Push-Location $tmp
try {
    git sparse-checkout set --no-cone '/map/data/6/' '/maps/tiles/6/day/0/' '/maps/tiles/6/day/1/' '/maps/tiles/6/day/2/' '/maps/tiles/6/day/3/' '/maps/tiles/6/day/4/' '/maps/tiles/6/day/5/'
} finally { Pop-Location }

Copy-Item (Join-Path $tmp 'map/data/6/landmarks.json') (Join-Path $raiz 'data/landmarks.json') -Force
$destTiles = Join-Path $raiz 'tiles/day'
if (Test-Path $destTiles) { Remove-Item $destTiles -Recurse -Force }
New-Item -ItemType Directory -Force (Join-Path $raiz 'tiles') | Out-Null
Copy-Item (Join-Path $tmp 'maps/tiles/6/day') $destTiles -Recurse

Remove-Item $tmp -Recurse -Force
Write-Host "Pronto! Dados e tiles atualizados."
