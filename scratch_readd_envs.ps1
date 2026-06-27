# Parallel re-add Vercel env vars to all environments (production, preview, development)

$vars = @{
    "DATABASE_URL" = "postgresql://neondb_owner:npg_N9uDnws4BGIE@ep-late-fog-at75gh6i-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    "UPSTASH_REDIS_REST_URL" = "https://learning-frog-154546.upstash.io"
    "UPSTASH_REDIS_REST_TOKEN" = "gQAAAAAAAluyAAIgcDI2YjExZWM5NTUwNWY0N2RjODdjMzM5Y2MxZmRjYWJkYg"
    "CLOUDINARY_CLOUD_NAME" = "dchqvrqgo"
    "CLOUDINARY_API_KEY" = "185555769861656"
    "CLOUDINARY_API_SECRET" = "SeAKmu4dYJXw7RWh3ztqIXdhZBU"
    "CLOUDINARY_URL" = "cloudinary://185555769861656:SeAKmu4dYJXw7RWh3ztqIXdhZBU@dchqvrqgo"
    "ANTHROPIC_API_KEY" = "sk-nry-ibaJFQl0uMLj1whNYe1Ns8NKqwFp2auxM93tOecpnu0"
    "JWT_SECRET" = "91eec001d248aa5b131303c14f8cc66a9fb5d17b7cb9d9240cc2d480fce60be0254bb377ac6c3ffd24c43c55cf45c32dd9e020acfaf63a0b254d22156d35b1bd"
    "ENV" = "production"
    "NEXT_PUBLIC_API_URL" = "https://qevora-api.onrender.com"
    "NEXT_PUBLIC_APP_URL" = "https://qevora-ai.vercel.app"
    "CORS_ORIGINS" = "https://qevora-ai.vercel.app"
}

$jobs = @()
foreach ($key in $vars.Keys) {
    $val = $vars[$key]
    Write-Host "Starting job for $key..."
    $jobs += Start-Job -ScriptBlock {
        param($k, $v)
        cd "c:\Users\A Al Malah\Desktop\Qevora\apps\web"
        # Suppress errors on removal if key doesn't exist
        npx vercel env rm $k --yes 2>$null
        npx vercel env add $k production --value "$v" --yes
        npx vercel env add $k preview --value "$v" --yes
        npx vercel env add $k development --value "$v" --yes
    } -ArgumentList $key, $val
}

Write-Host "Waiting for all parallel env updates to complete..."
$jobs | Wait-Job
$jobs | Receive-Job
Write-Host "All jobs done!"
