# Failed Nginx Attempts - DO NOT REPEAT

## Attempt 1: Basic alias + try_files

```nginx
location /next/ {
    alias /var/www/hps_next/dist/app/browser/;
    try_files $uri $uri/ /next/index.html;
}
```

**RESULT**: Redirect loop - `/next/index.html` matches `/next/` location again

## Attempt 2: Root + rewrite

```nginx
location /next/ {
    root /var/www/hps_next/dist/app/browser;
    rewrite ^/next/(.*)$ /$1 break;
    try_files $uri $uri/ /index.html;
}
```

**RESULT**: Redirects to `/` instead of staying on `/next/`

## Attempt 3: Separate static files regex

```nginx
location ~* ^/next/.*\.(js|css|...)$ {
    alias /var/www/hps_next/dist/app/browser/;
}
location /next/ {
    alias /var/www/hps_next/dist/app/browser/;
    try_files $uri $uri/ /next/index.html;
}
```

**RESULT**: MIME type issues, redirect loops

## Attempt 4: Root + rewrite for both locations

```nginx
location ~* ^/next/.*\.(js|css|...)$ {
    root /var/www/hps_next/dist/app/browser;
    rewrite ^/next/(.*)$ /$1 break;
}
location /next/ {
    root /var/www/hps_next/dist/app/browser;
    rewrite ^/next/(.*)$ /$1 break;
    try_files $uri /index.html;
}
```

**RESULT**: Redirects to `/`

## Attempt 5: Named location with alias

```nginx
location /next/ {
    alias /var/www/hps_next/dist/app/browser/;
    try_files $uri $uri/ @staging_fallback;
}
location @staging_fallback {
    alias /var/www/hps_next/dist/app/browser/index.html;  # INVALID
}
```

**RESULT**: Nginx config error - can't use alias in named location

## Attempt 6: Named location with root + rewrite (CURRENT)

```nginx
location /next/ {
    alias /var/www/hps_next/dist/app/browser/;
    try_files $uri $uri/ @staging_fallback;
}
location @staging_fallback {
    root /var/www/hps_next/dist/app/browser;
    rewrite ^.*$ /index.html break;
}
```

**STATUS**: Testing...

## LESSON LEARNED

The core issue is that nginx subpath serving for SPAs is complex. Need to use the EXACT same pattern as production but with different paths.
