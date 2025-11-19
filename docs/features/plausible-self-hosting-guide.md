# Plausible Analytics Self-Hosting Guide

> **Status**: Evaluation Complete ✅ | Implementation Ready 🚀
>
> **Purpose**: Complete data control and privacy compliance for HPS Aviation analytics

## Overview

This guide provides comprehensive instructions for self-hosting Plausible Analytics, ensuring complete data control and enhanced privacy compliance for the HPS Aviation website.

## Self-Hosting Benefits

### Data Control

- **Complete Ownership**: All analytics data remains on your infrastructure
- **Privacy Compliance**: Full control over data processing and storage
- **Customization**: Ability to modify tracking behavior and data collection
- **Cost Control**: No per-site fees or usage limits

### Technical Advantages

- **Performance**: Reduced latency with local analytics processing
- **Reliability**: No dependency on external services
- **Customization**: Full control over data processing pipeline
- **Integration**: Direct integration with existing infrastructure

## Implementation Options

### Option 1: Docker Deployment (Recommended)

**Prerequisites:**

- Docker and Docker Compose
- Domain with SSL certificate
- Server with minimum 2GB RAM, 1 CPU core

**Setup Steps:**

1. **Clone Plausible Repository**

```bash
git clone https://github.com/plausible/hosting.git
cd hosting
```

2. **Configure Environment**

```bash
cp .env.example .env
```

3. **Update Environment Variables**

```env
# Database
DATABASE_URL=postgres://plausible:password@localhost:5432/plausible

# Application
BASE_URL=https://analytics.hpsaviation.com
SECRET_KEY_BASE=your-secret-key-here

# Email (Optional)
SMTP_HOST_ADDRESS=smtp.hpsaviation.com
SMTP_HOST_PORT=587
SMTP_USER_NAME=analytics@hpsaviation.com
SMTP_USER_PASSWORD=your-email-password
SMTP_ADAPTER=SMTP.Adapter
SMTP_RETRIES=2
SMTP_MANDATORY_TLS=true
```

4. **Deploy with Docker Compose**

```bash
docker-compose up -d
```

### Option 2: Kubernetes Deployment

**Prerequisites:**

- Kubernetes cluster
- Helm package manager
- Ingress controller

**Setup Steps:**

1. **Add Plausible Helm Repository**

```bash
helm repo add plausible https://charts.plausible.io
helm repo update
```

2. **Create Values File**

```yaml
# values.yaml
image:
  repository: plausible/analytics
  tag: "latest"

ingress:
  enabled: true
  hosts:
    - host: analytics.hpsaviation.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: plausible-tls
      hosts:
        - analytics.hpsaviation.com

postgresql:
  enabled: true
  auth:
    postgresPassword: "your-postgres-password"
    database: "plausible"

redis:
  enabled: true
  auth:
    enabled: true
    password: "your-redis-password"
```

3. **Deploy to Kubernetes**

```bash
helm install plausible-analytics plausible/plausible -f values.yaml
```

### Option 3: Manual Installation

**Prerequisites:**

- Ubuntu 20.04+ or CentOS 8+
- PostgreSQL 12+
- Redis 6+
- Elixir 1.12+
- Node.js 16+

**Setup Steps:**

1. **Install Dependencies**

```bash
# Ubuntu
sudo apt update
sudo apt install postgresql postgresql-contrib redis-server nginx

# CentOS
sudo yum install postgresql-server postgresql-contrib redis nginx
```

2. **Configure Database**

```bash
sudo -u postgres createdb plausible
sudo -u postgres createuser plausible
sudo -u postgres psql -c "ALTER USER plausible PASSWORD 'your-password';"
```

3. **Install Plausible**

```bash
git clone https://github.com/plausible/analytics.git
cd analytics
mix deps.get
mix ecto.create
mix ecto.migrate
```

## Configuration for HPS Aviation

### Nginx Configuration

**File: `/etc/nginx/sites-available/analytics.hpsaviation.com`**

```nginx
server {
    listen 80;
    server_name analytics.hpsaviation.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name analytics.hpsaviation.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    # Proxy to Plausible
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Analytics script endpoint
    location /js/script.js {
        proxy_pass http://localhost:8000/js/script.js;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Analytics API endpoint
    location /api/event {
        proxy_pass http://localhost:8000/api/event;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Environment Configuration

**Update `src/environments/environment.ts`:**

```typescript
export const environment = {
  production: true,
  environment: "prod",
  domain: "hpsaviation.com",
  analytics: {
    enabled: true,
    selfHosted: true,
    baseUrl: "https://analytics.hpsaviation.com",
    apiEndpoint: "https://analytics.hpsaviation.com/api/event",
    scriptEndpoint: "https://analytics.hpsaviation.com/js/script.js",
  },
};
```

### Analytics Service Updates

**Update `src/app/services/analytics.service.ts`:**

```typescript
// Add self-hosting configuration
private getSelfHostedConfig(): AnalyticsServiceConfig {
  return {
    ...this.config,
    apiEndpoint: environment.analytics.apiEndpoint,
    scriptEndpoint: environment.analytics.scriptEndpoint,
    selfHosted: environment.analytics.selfHosted,
  };
}
```

## Security Considerations

### SSL/TLS Configuration

- **Strong Ciphers**: Use TLS 1.2+ with strong cipher suites
- **HSTS**: Enable HTTP Strict Transport Security
- **Certificate Management**: Use Let's Encrypt or commercial certificates

### Access Control

- **Authentication**: Implement strong authentication for admin access
- **IP Whitelisting**: Restrict admin access to specific IP ranges
- **Rate Limiting**: Implement rate limiting for API endpoints

### Data Protection

- **Encryption**: Encrypt data at rest and in transit
- **Backup**: Regular automated backups of database
- **Monitoring**: Implement comprehensive monitoring and alerting

## Monitoring and Maintenance

### Health Checks

```bash
# Check service status
curl -f https://analytics.hpsaviation.com/health || exit 1

# Check database connectivity
docker exec plausible_db psql -U plausible -d plausible -c "SELECT 1;"

# Check Redis connectivity
docker exec plausible_redis redis-cli ping
```

### Backup Strategy

```bash
# Database backup
docker exec plausible_db pg_dump -U plausible plausible > backup_$(date +%Y%m%d_%H%M%S).sql

# Configuration backup
tar -czf config_backup_$(date +%Y%m%d_%H%M%S).tar.gz /opt/plausible/
```

### Updates

```bash
# Update Plausible
cd /opt/plausible
git pull origin main
docker-compose down
docker-compose pull
docker-compose up -d
```

## Performance Optimization

### Database Optimization

- **Indexing**: Ensure proper database indexing
- **Connection Pooling**: Configure appropriate connection pool sizes
- **Query Optimization**: Monitor and optimize slow queries

### Caching Strategy

- **Redis Caching**: Implement Redis for session and data caching
- **CDN Integration**: Use CDN for static assets
- **Browser Caching**: Configure appropriate cache headers

### Scaling Considerations

- **Horizontal Scaling**: Plan for multiple application instances
- **Database Scaling**: Consider read replicas for analytics queries
- **Load Balancing**: Implement load balancing for high availability

## Cost Analysis

### Infrastructure Costs

- **Server**: $50-200/month (depending on traffic)
- **Database**: $30-100/month (managed PostgreSQL)
- **Storage**: $10-50/month (backup and logs)
- **SSL Certificate**: $0-100/year (Let's Encrypt free)

### Operational Costs

- **Maintenance**: 2-4 hours/month
- **Monitoring**: $20-50/month (optional)
- **Backup Storage**: $5-20/month

### Total Monthly Cost: $115-470

_Compared to Plausible Cloud: $9-19/month per site_

## Migration Strategy

### Phase 1: Preparation

1. Set up self-hosted instance
2. Configure domains and SSL
3. Test functionality with development environment

### Phase 2: Parallel Operation

1. Run both cloud and self-hosted versions
2. Compare data accuracy
3. Monitor performance and reliability

### Phase 3: Migration

1. Update production configuration
2. Migrate historical data (if needed)
3. Monitor for issues

### Phase 4: Cleanup

1. Decommission cloud instance
2. Update documentation
3. Train team on self-hosted management

## Troubleshooting

### Common Issues

**Database Connection Errors:**

```bash
# Check database status
docker logs plausible_db

# Restart database
docker-compose restart plausible_db
```

**Redis Connection Errors:**

```bash
# Check Redis status
docker logs plausible_redis

# Restart Redis
docker-compose restart plausible_redis
```

**Application Errors:**

```bash
# Check application logs
docker logs plausible_analytics

# Restart application
docker-compose restart plausible_analytics
```

### Performance Issues

- **High Memory Usage**: Increase server RAM or optimize queries
- **Slow Queries**: Check database indexes and query optimization
- **High CPU Usage**: Monitor for infinite loops or inefficient code

## Conclusion

Self-hosting Plausible Analytics provides complete data control and enhanced privacy compliance for HPS Aviation. The implementation offers:

- **Complete Data Ownership**: All analytics data remains on HPS infrastructure
- **Enhanced Privacy**: Full control over data processing and storage
- **Customization**: Ability to modify tracking behavior
- **Cost Control**: Predictable monthly costs vs. per-site fees

The recommended approach is Docker deployment with proper monitoring and backup strategies. This ensures reliability while maintaining the flexibility to scale as needed.

## Next Steps

1. **Evaluate Infrastructure**: Assess current server capacity and requirements
2. **Plan Migration**: Create detailed migration timeline
3. **Test Implementation**: Set up development environment for testing
4. **Deploy Production**: Implement with proper monitoring and backup
5. **Train Team**: Ensure team understands self-hosted management

This self-hosting solution provides the foundation for complete analytics data control while maintaining the performance and reliability required for HPS Aviation's analytics needs.
