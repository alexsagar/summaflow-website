<#
    validate.ps1 — LOCAL VALIDATION for the website_summaflow module.

    LOCAL checks only. This does NOT install into Odoo and does NOT reproduce
    the Odoo server-side manifest loader. Real install/update/removal must be
    verified separately in the Odoo TEST DATABASE (sumflow-redesign-test) via
    Apps > Import Module. See README.md and docs/QA.md.

    Usage (from repo root):
        powershell -ExecutionPolicy Bypass -File scripts\validate.ps1
#>
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$Module = 'website_summaflow'          # this repo builds exactly one module
$root   = Split-Path -Parent $PSScriptRoot
$modDir = Join-Path $root $Module
$fail   = 0

function Check($ok, $msg) {
    if ($ok) { Write-Host "  [PASS] $msg" -ForegroundColor Green }
    else { Write-Host "  [FAIL] $msg" -ForegroundColor Red; $script:fail++ }
}

Write-Host "LOCAL VALIDATION: $Module" -ForegroundColor Cyan
Write-Host "(LOCAL checks only - NOT an Odoo installation)`n"

# --- Source checks -----------------------------------------------------------

$manifest = Join-Path $modDir '__manifest__.py'
Check (Test-Path $manifest) "manifest exists: $Module/__manifest__.py"
Check (Test-Path (Join-Path $modDir '__init__.py')) "__init__.py exists"
$scss = Join-Path $modDir 'static\src\scss\summaflow.scss'
Check (Test-Path $scss) "asset exists: static/src/scss/summaflow.scss"

if (Test-Path $manifest) {
    $m = Get-Content $manifest -Raw

    # Intended format for THIS project: a numeric 2- or 3-part semantic version
    # (e.g. 1.0 or 1.0.0). The saas loader prefixes the Odoo series itself.
    # Reject hard-coded Odoo prefixes like 19.0.x.x.x / 19.4.x.x.x.
    $vm = [regex]::Match($m, "'version'\s*:\s*'([^']+)'")
    if ($vm.Success) {
        $ver = $vm.Groups[1].Value
        $okVer = $ver -match '^\d+\.\d+(\.\d+)?$'
        Check $okVer "manifest version is a numeric 2-3 part semantic version: '$ver'"
        if ($ver -match '^(19|19\.4|19\.0)\.\d+\.\d+\.\d+$' -or ($ver -split '\.').Count -ge 4) {
            Check $false "manifest version must NOT hard-code an Odoo/SaaS prefix (got '$ver')"
        }
    } else { Check $false "manifest declares a 'version'" }

    Check ($m -match 'web\.assets_frontend') "manifest declares web.assets_frontend bundle"
    foreach ($ref in [regex]::Matches($m, "'($Module/[^']+\.(scss|css|js|xml))'")) {
        $rel = $ref.Groups[1].Value -replace "^$Module/", '' -replace '/', '\'
        Check (Test-Path (Join-Path $modDir $rel)) "asset referenced in manifest exists on disk: $($ref.Groups[1].Value)"
    }
}

# Odoo Online SaaS forbids local @import/@use between custom SCSS files:
#   "Local import '...' is forbidden for security reasons."
# Every SummaFlow SCSS file must be declared explicitly in the manifest bundle.
$scssFiles = @()
$scssDirAll = Join-Path $modDir 'static\src\scss'
if (Test-Path $scssDirAll) { $scssFiles = Get-ChildItem $scssDirAll -Recurse -File -Filter *.scss }

foreach ($f in $scssFiles) {
    $body = Get-Content $f.FullName -Raw
    # Match @import / @use whose target is a local path (not an absolute URL).
    $localImp = [regex]::Matches($body, "@(import|use)\s+['""](?!https?:|url\()[^'""]+['""]")
    Check ($localImp.Count -eq 0) "no local @import/@use in SCSS: $($f.Name) ($($localImp.Count) found)"

    # ODOO ONLINE COMPATIBILITY GUARD (not a general CSS rule): Odoo's Sass
    # compiler evaluates clamp()/min()/max() and errors on mixed units
    # ("Incompatible units: 'vw' and 'rem'", "'%' and 'px'"). Conservative
    # project rule: any clamp()/min()/max() argument list may contain at most
    # ONE CSS unit family. minmax() is exempt (negative lookbehind). calc() and
    # single-unit clamp/min/max are allowed.
    $unitRe = '(?i)\d\s*(rem|em|vmin|vmax|vw|vh|px|%|ch|ex|pt|pc|cm|mm|in|q)(?![\w%])'
    foreach ($mm in [regex]::Matches($body, "(?<![\w-])(clamp|min|max)\(([^()]*)\)")) {
        $fn    = $mm.Groups[1].Value
        $inner = $mm.Groups[2].Value
        $units = @([regex]::Matches($inner, $unitRe) | ForEach-Object { $_.Groups[1].Value.ToLower() } | Sort-Object -Unique)
        Check ($units.Count -le 1) "Odoo-safe single unit family in $fn(): $($f.Name) -> '$($mm.Value)' (units: $($units -join ','))"
    }
}

# Every SummaFlow SCSS file intended for deployment must be declared explicitly
# in web.assets_frontend, each file must exist, and the bundle order must be the
# Odoo-compatible dependency order.
if (Test-Path $manifest) {
    $mraw = Get-Content $manifest -Raw
    $declared = @([regex]::Matches($mraw, "'($Module/static/src/scss/[^']+\.scss)'") | ForEach-Object { $_.Groups[1].Value })

    foreach ($f in $scssFiles) {
        $rel = "$Module/" + ($f.FullName.Substring($modDir.Length + 1) -replace '\\', '/')
        Check ($declared -contains $rel) "SCSS file declared explicitly in manifest: $rel"
    }
    foreach ($d in $declared) {
        $disk = $d -replace "^$Module/", '' -replace '/', '\'
        Check (Test-Path (Join-Path $modDir $disk)) "manifest-declared SCSS exists on disk: $d"
    }

    # Foundation partials load first, then section-specific partials, then the
    # summaflow.scss entry (marker) LAST. Section partials sit between
    # '_responsive' and 'summaflow'; order among them is not significant (refs
    # are runtime CSS custom properties), so only the fixed endpoints are
    # enforced strictly.
    $head = @('_tokens','_typography','_layout','_buttons','_utilities','_responsive') |
        ForEach-Object { "$Module/static/src/scss/$_.scss" }
    $entry = "$Module/static/src/scss/summaflow.scss"
    $orderOk = ($declared.Count -ge ($head.Count + 1))
    if ($orderOk) {
        for ($i = 0; $i -lt $head.Count; $i++) { if ($declared[$i] -ne $head[$i]) { $orderOk = $false } }
        if ($declared[-1] -ne $entry) { $orderOk = $false }
    }
    Check $orderOk "manifest SCSS order: foundation first (tokens..responsive), summaflow.scss last"
}

# --- Frontend JS checks ------------------------------------------------------
# Every module JS file must be declared explicitly in the manifest, be
# syntactically valid, and be self-contained: no imports, no network access,
# no external URLs (Odoo Online frontend; no third-party dependencies).
$jsDir = Join-Path $modDir 'static\src\js'
$jsFiles = @()
if (Test-Path $jsDir) { $jsFiles = @(Get-ChildItem $jsDir -Recurse -File -Filter *.js) }
if ($jsFiles.Count -eq 0) {
    Write-Host "  [SKIP] no JS files" -ForegroundColor DarkGray
} else {
    $mjs = if (Test-Path $manifest) { Get-Content $manifest -Raw } else { '' }
    $node = Get-Command node -ErrorAction SilentlyContinue
    foreach ($f in $jsFiles) {
        $rel = "$Module/" + ($f.FullName.Substring($modDir.Length + 1) -replace '\\', '/')
        Check ($mjs -match [regex]::Escape("'$rel'")) "JS file declared explicitly in manifest: $rel"

        $src = Get-Content $f.FullName -Raw
        $net = [regex]::Matches($src, '(?im)\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource|\bimport\s*\(|^\s*import\s|^\s*export\s|\brequire\s*\(|https?://|<script')
        Check ($net.Count -eq 0) "JS has no imports/network/external URLs: $($f.Name) ($($net.Count) found)"

        if ($node) {
            & node --check $f.FullName
            Check ($LASTEXITCODE -eq 0) "JS syntax valid (node --check): $($f.Name)"
        } else {
            Write-Host "  [SKIP] node not found; JS syntax not checked: $($f.Name)" -ForegroundColor DarkGray
        }
    }
}

# XML well-formedness (only if XML exists)
$xml = Get-ChildItem $modDir -Recurse -Filter *.xml -ErrorAction SilentlyContinue
if ($xml) {
    foreach ($f in $xml) {
        try { [xml](Get-Content $f.FullName -Raw) | Out-Null; Check $true "XML well-formed: $($f.Name)" }
        catch { Check $false "XML malformed: $($f.Name) - $($_.Exception.Message)" }
    }
} else { Write-Host "  [SKIP] no XML files yet" -ForegroundColor DarkGray }

# Secrets must not live inside the module source
$bad = Get-ChildItem $modDir -Recurse -File -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match '(?i)(^\.env|\.pem$|\.key$|secret|credential|password)' }
Check (-not $bad) "no secret-like files inside module source ($(@($bad).Count) found)"

# --- ZIP checks (only if a build artifact exists) ----------------------------

$zip = Join-Path $root "release\$Module.zip"
if (-not (Test-Path $zip)) {
    Write-Host "  [SKIP] no release ZIP yet (run scripts\build.ps1)" -ForegroundColor DarkGray
} else {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead($zip)
    try {
        $names = @($archive.Entries | ForEach-Object { $_.FullName })

        # Separator / path-safety
        Check (-not ($names | Where-Object { $_ -match '\\' }))      "ZIP entries use forward slashes (no backslashes)"
        Check (-not ($names | Where-Object { $_ -match '^([A-Za-z]:|/)' })) "ZIP has no absolute paths"
        Check (-not ($names | Where-Object { $_ -match '(^|/)\.\.(/|$)' })) "ZIP has no path traversal (../)"

        # Duplicates
        $dupe = $names | Group-Object | Where-Object { $_.Count -gt 1 }
        Check (-not $dupe) "ZIP has no duplicate entry names ($(@($dupe).Count) dup)"

        # Exactly one top-level dir, and it is the module
        $tops = @($names | ForEach-Object { ($_ -split '/')[0] } | Sort-Object -Unique)
        Check ($tops.Count -eq 1 -and $tops[0] -eq $Module) "ZIP single top-level dir == $Module (found: $($tops -join ', '))"

        # Forbidden content anywhere in the archive
        $forbidden = $names | Where-Object {
            $_ -match '(?i)(^|/)\.gitkeep$' -or
            $_ -match '(?i)(^|/)\.git(/|$)' -or
            $_ -match '(?i)(^|/)\.agents(/|$)' -or
            $_ -match '(?i)(^|/)\.claude(/|$)' -or
            $_ -match '(?i)(^|/)docs(/|$)' -or
            $_ -match '(?i)(^|/)node_modules(/|$)' -or
            $_ -match '(?i)(^|/)\.env($|\.)' -or
            $_ -match '(?i)(\.pem|\.key|secret|credential|password)'
        }
        Check (-not $forbidden) "ZIP excludes .gitkeep/.git/.agents/.claude/docs/node_modules/.env/secrets ($(@($forbidden).Count) found)"

        # Required files, derived from the module structure (NOT hardcoded).
        # Always: manifest + __init__. Plus every asset path declared in the
        # manifest. Plus every .scss on disk under static/src/scss so SCSS
        # partials imported by the entry file are guaranteed to ship (the
        # manifest lists only the entry; Odoo compiles the bundle together).
        $required = [System.Collections.Generic.List[string]]::new()
        $required.Add("$Module/__manifest__.py")
        $required.Add("$Module/__init__.py")

        if (Test-Path $manifest) {
            foreach ($ref in [regex]::Matches((Get-Content $manifest -Raw), "'($Module/[^']+\.(scss|css|js|xml))'")) {
                $required.Add($ref.Groups[1].Value)
            }
        }
        $scssDir = Join-Path $modDir 'static\src\scss'
        if (Test-Path $scssDir) {
            Get-ChildItem $scssDir -Recurse -File -Filter *.scss | ForEach-Object {
                $rel = $_.FullName.Substring($modDir.Length + 1) -replace '\\', '/'
                $required.Add("$Module/$rel")
            }
        }

        foreach ($req in ($required | Sort-Object -Unique)) {
            $n = @($names | Where-Object { $_ -eq $req }).Count
            Check ($n -eq 1) "ZIP contains exactly once: $req (count=$n)"
        }
    } finally { $archive.Dispose() }
}

Write-Host ""
if ($fail -eq 0) { Write-Host "LOCAL VALIDATION PASSED" -ForegroundColor Green; exit 0 }
else { Write-Host "LOCAL VALIDATION FAILED ($fail check(s))" -ForegroundColor Red; exit 1 }
