# HPS Aviation - Hosting Documentation

## Current Server Setup

### System Information

- **OS**: Ubuntu 24.04.2 LTS (Noble Numbat)
- **Server**: Hostinger VPS
- **Web Server**: Nginx (active and running)
- **Status**: Production environment live at hpsaviation.com

### Web Server Details

- **Service**: nginx.service

### Network Configuration

- **HTTP Port**: 80 (listening on 0.0.0.0:80)
- **HTTPS Port**: 443 (listening on 0.0.0.0:443)
- **Both ports managed by nginx master process (PID: 219985)**

### Website Files Location

- **Main Website**: `/var/www/html/index.html`
- **HPS Project Root**: `/var/www/hps/`
- **Angular Build Output**: `/var/www/hps/dist/app/browser/index.html`
- **Source Files**: `/var/www/hps/src/index.html`

### Nginx Configuration

- **Enabled Sites**:
  <!-- - `hpsaviation.com` → `/etc/nginx/sites-available/hpsaviation.com` -->
  - `hpsaviation.com` → `/etc/nginx/sites-available/hpsaviation.com`
- **Configuration Directory**: `/etc/nginx/sites-enabled/`

### Deployment Structure

```
/var/www/
├── hps/                    # Production workspace
│   ├── dist/app/browser/   # Production build → hpsaviation.com (port 443)
│   └── src/environments/environment.ts
└── hps_next/               # Staging workspace
    ├── dist/app/browser/   # Staging build → hpsaviation.com:8080 (port 8080)
    └── src/environments/environment.ts
```

## Build Commands

**Both workspaces use standard build**:

```bash
npm run build
# or: npm run build:staging (same thing)
```

## Access URLs

- **Production**: `https://hpsaviation.com/` (HTTPS, port 443)
- **Staging**: `http://hpsaviation.com:8080/` (HTTP, port 8080, password protected)

## Setup Instructions

1. **Clone repository to both workspaces**
2. **Create same environment.ts in both workspaces**
3. **Use same build command in both**:
   - Production: `npm run build`
   - Staging: `npm run build` (or `npm run build:staging`)
4. **Configure nginx** with separate server blocks for different ports
5. **Open port 8080** in firewall for staging access
