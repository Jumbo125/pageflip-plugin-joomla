param(
    [string]$OutputDir = "dist"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

# New-ZipFromDirectory is defined via Invoke-Expression so that
# the .NET type literals are resolved at runtime (after Add-Type),
# not at script parse time — which would fail in PowerShell 5.1.
Invoke-Expression @'
function New-ZipFromDirectory {
    param(
        [string]$SourceDir,
        [string]$DestinationZip
    )

    if (Test-Path -LiteralPath $DestinationZip) {
        Remove-Item -LiteralPath $DestinationZip -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 200
    }

    $sourceRoot = (Resolve-Path -LiteralPath $SourceDir).Path
    $zipArchive = [System.IO.Compression.ZipFile]::Open($DestinationZip, [System.IO.Compression.ZipArchiveMode]::Create)

    try {
        Get-ChildItem -LiteralPath $sourceRoot -Directory -Recurse | ForEach-Object {
            $rel = $_.FullName.Substring($sourceRoot.Length).TrimStart("\", "/")
            $null = $zipArchive.CreateEntry(($rel -replace "\\", "/") + "/")
        }
        Get-ChildItem -LiteralPath $sourceRoot -File -Recurse | ForEach-Object {
            $rel = $_.FullName.Substring($sourceRoot.Length).TrimStart("\", "/")
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                $zipArchive,
                $_.FullName,
                ($rel -replace "\\", "/"),
                [System.IO.Compression.CompressionLevel]::Optimal
            ) | Out-Null
        }
    }
    finally {
        $zipArchive.Dispose()
    }
}
'@

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$output = Join-Path $root $OutputDir
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("stpageflip_build_" + [guid]::NewGuid().ToString("N"))
$stage = Join-Path $tempRoot "stage"
$packageDir = Join-Path $stage "pkg_stpageflip"
$constituentsDir = Join-Path $packageDir "constituents"

function Ensure-CleanDirectory {
    param([string]$PathToCreate)

    if (Test-Path -LiteralPath $PathToCreate) {
        Remove-Item -LiteralPath $PathToCreate -Recurse -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 200
    }

    New-Item -ItemType Directory -Path $PathToCreate -Force | Out-Null
}

function New-PluginZip {
    param(
        [string]$SourceDir,
        [string[]]$Includes,
        [string]$ZipPath
    )

    $pluginStage = Join-Path $stage ([IO.Path]::GetFileNameWithoutExtension($ZipPath))
    Ensure-CleanDirectory -PathToCreate $pluginStage

    foreach ($include in $Includes) {
        Copy-Item -LiteralPath (Join-Path $SourceDir $include) -Destination $pluginStage -Recurse -Force
    }

    New-ZipFromDirectory -SourceDir $pluginStage -DestinationZip $ZipPath
}

Ensure-CleanDirectory -PathToCreate $output
Ensure-CleanDirectory -PathToCreate $constituentsDir

$contentZip = Join-Path $constituentsDir 'plg_content_stpageflip.zip'
$ajaxZip    = Join-Path $constituentsDir 'plg_ajax_stpageflip.zip'
$editorZip  = Join-Path $constituentsDir 'plg_editorsxtd_stpageflip.zip'

New-PluginZip -SourceDir (Join-Path $root 'plg_content_stpageflip') -Includes @(
    'language', 'media', 'script.php', 'services', 'src', 'stpageflip.php', 'stpageflip.xml'
) -ZipPath $contentZip

New-PluginZip -SourceDir (Join-Path $root 'plg_ajax_stpageflip') -Includes @(
    'language', 'services', 'src', 'stpageflip.php', 'stpageflip.xml'
) -ZipPath $ajaxZip

New-PluginZip -SourceDir (Join-Path $root 'plg_editorsxtd_stpageflip') -Includes @(
    'language', 'media', 'services', 'src', 'stpageflip.php', 'stpageflip.xml'
) -ZipPath $editorZip

Copy-Item -LiteralPath (Join-Path $root 'pkg_stpageflip\pkg_stpageflip.xml') -Destination $packageDir -Force

Copy-Item -LiteralPath $contentZip -Destination (Join-Path $output 'plg_content_stpageflip-2.0.zip') -Force
Copy-Item -LiteralPath $ajaxZip    -Destination (Join-Path $output 'plg_ajax_stpageflip-2.0.zip')    -Force
Copy-Item -LiteralPath $editorZip  -Destination (Join-Path $output 'plg_editorsxtd_stpageflip-2.0.zip') -Force

$packageZip = Join-Path $output 'pkg_stpageflip-2.0_full.zip'
New-ZipFromDirectory -SourceDir $packageDir -DestinationZip $packageZip

Write-Output $packageZip
