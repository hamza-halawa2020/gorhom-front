# Environment Configuration Guide

## Overview

This project uses a type-safe, Zod-validated environment system with a gitignored `environment.ts` file. Both production and staging use the same build process and are served from different ports.

## Quick Setup

### 1. Create Environment File

In each workspace, create the same `src/environments/environment.ts`:

```typescript
import { validateEnvironment, type Environment } from "./environment.schema";

const environmentConfig: Environment = {
  contactFormEmail: "contact@hpsaviation.com",
  contactEmail: "info@hpsaviation.com",

  emailjsZoho: {
    serviceId: "service_zoho_dp9npsf",
    templateId: "template_contactus_info",
    publicKey: "UmgooZuYrsfY928ad",
    email: "info@hpsaviation.com",
  },
  emailjs: {
    serviceId: 'service_4t3o09d',
    templateId: 'template_zer4l4c',
    publicKey: 'yAg3nMfJBJNplDk7L',
  },
  emailjsZohoInvestors: {
    serviceId: "service_zoho_inv_x968lks",
    templateId: "template_inv_3umg6y9",
    publicKey: "UmgooZuYrsfY928ad",
    email: "investors@hpsaviation.com",
  },
};

export const environment = validateEnvironment(environmentConfig);
```

### 2. Build Process

**Both environments use the same build command**:

```bash
npm run build
# or: npm run build:staging (same thing)
```

**Access URLs**:

- **Production**: `https://hpsaviation.com/`
- **Staging**: `http://hpsaviation.com:8080/`

## Validation Schema

The environment is validated using Zod:

## Build Process

### Commands Available

- **`npm run build`** - Standard build for both environments
- **`npm run build:staging`** - Alias for standard build

The build automatically:

- ✅ Uses the local `environment.ts` configuration
- ✅ Validates configuration with Zod at build time
- ✅ Creates standard Angular SPA build
- ✅ Handles routing and asset paths automatically

## File Structure

```
src/environments/
├── environment.schema.ts     # Zod schema (committed)
├── environment.ts           # Your config (gitignored)
```

## Benefits

✅ **Type Safe**: Full TypeScript + Zod validation  
✅ **Same Config**: Identical environment.ts in both workspaces  
✅ **Same Build Process**: No special configuration needed  
✅ **Port-Based Separation**: Clean separation via different ports  
✅ **Clear Errors**: Descriptive validation messages  
✅ **Version Control**: Schema is committed, config is local

## Troubleshooting

### Build Errors

- Check that `environment.ts` exists in your workspace
- Verify all required fields are present
- Ensure email addresses contain '@'
- Ensure URLs start with 'http://' or 'https://'

### Port Access Issues

- **Production**: `https://hpsaviation.com/` (HTTPS, port 443)
- **Staging**: `http://hpsaviation.com:8080/` (HTTP, port 8080)
- Make sure port 8080 is open in firewall
- Staging uses HTTP Basic Auth (username/password)

### Simple Port-Based Setup

This approach eliminates complexity:

- Same environment.ts file in both workspaces
- Same build process for both environments
- Clean separation via different ports
- No subpath routing issues
