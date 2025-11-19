# Nginx Debug Logging Troubleshooting

## No Logs Appearing?

### 1. Check if debug logging is compiled in:

```bash
nginx -V 2>&1 | grep -o with-debug
```

If no output, nginx wasn't compiled with debug support.

### 2. Check log file permissions:

```bash
sudo ls -la /var/log/nginx/
sudo touch /var/log/nginx/debug.log
sudo chown www-data:adm /var/log/nginx/debug.log
sudo chmod 644 /var/log/nginx/debug.log
```

### 3. Test nginx config:

```bash
sudo nginx -t
```

### 4. Check if nginx reloaded:

```bash
sudo systemctl status nginx
sudo systemctl reload nginx
```

### 5. Alternative: Use existing error log with debug level:

```nginx
# In server block, replace the debug line with:
error_log /var/log/nginx/error.log debug;
```

### 6. Watch the right log:

```bash
# Try both:
sudo tail -f /var/log/nginx/debug.log
sudo tail -f /var/log/nginx/error.log
```

### 7. Make sure you're making requests:

```bash
curl -v https://hpsaviation.com/next/
```

### 8. Check main nginx.conf doesn't override:

Look for other `error_log` directives that might override your server-level setting.

## Quick Fix: Use Error Log Instead

Change the debug line in your server config to:

```nginx
error_log /var/log/nginx/error.log debug;
```

This uses the existing error log file with debug level.
