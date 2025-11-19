# Plausible Analytics Integration

> **📝 REMINDER**: Update progress checkboxes as tasks are completed
> **Current Status**: All Phases Complete ✅ | Production Ready 🚀
>
> **Next Steps**: Monitor analytics data and optimize based on insights
>
> **Focus**: Comprehensive tracking implemented with section highlighting, menu activation, and scroll milestones

## Overview

Implement comprehensive Plausible Analytics tracking for the HPS Aviation website with focus on language tracking, comprehensive event tracking, performance optimization, and ad-blocker bypass techniques. This feature will provide privacy-compliant analytics while maximizing data collection and maintaining site performance.

## Architecture

### Analytics Strategy

- **Language Tracking**: Complete language usage and switching patterns
- **Comprehensive Event Tracking**: Track all user interactions and behaviors
- **Performance Optimized**: Minimal impact on site speed
- **Ad-Blocker Resistant**: Multiple bypass techniques and fallback methods

### Key Components

- **Analytics Service**: Centralized tracking with batching and performance optimization
- **Language Tracking**: Detailed language detection and switching analytics
- **Event Service**: Comprehensive event tracking with session continuity
- **Performance Monitor**: Track analytics impact on site performance
- **Fallback System**: Multiple tracking methods when primary is blocked

## Implementation Plan

### Phase 1: Proxy Setup & Foundation

- [x] Configure nginx proxy for /js/script.js and /api/event endpoints (completed in prod.txt)
- [x] Install @plausible-analytics/tracker package
- [x] Add simplified Plausible configuration to environment schema (domain only)
- [x] Create comprehensive TypeScript interfaces for all analytics events
- [x] Configure basic page view tracking with TypeScript validation

**Success Criteria:**

- [x] Proxy configuration working and serving analytics from your domain (nginx configured and tested)
- [x] Basic page view tracking functional (analytics service implemented)
- [x] TypeScript interfaces defined for all event types (comprehensive interfaces created)
- [x] Environment configuration validated (simplified to domain only)
- [x] No ad-blocker issues with proxy setup (nginx proxy configured and tested)

**Phase 1 Progress: 5/5 tasks completed (100%) ✅**

### Phase 2: Core Analytics Service

- [x] Implement type-safe AnalyticsService with performance optimizations
- [x] Add strongly-typed event batching and queuing system
- [x] Create lazy loading for analytics with TypeScript guards
- [x] Implement offline event storage with type validation
- [x] Add retry logic with exponential backoff and error typing

**Success Criteria:**

- [x] Analytics service fully functional with type safety
- [x] Event batching working efficiently
- [x] Offline storage and replay functional
- [x] Performance impact < 50ms on page load
- [x] Error handling and retry logic working

**Phase 2 Progress: 5/5 tasks completed (100%) ✅**

### Phase 3: Language Tracking

- [x] Implement type-safe language detection tracking (auto vs manual)
- [x] Monitor language switching events with strict typing
- [x] Track language-specific interactions with TypeScript validation
- [x] Add language preference analytics with comprehensive typing

**Success Criteria:**

- [x] Language detection and switching fully tracked
- [x] Language-specific event context working
- [x] Language preference analytics functional
- [x] Cross-language user behavior visible in analytics
- [x] Language switching patterns documented

**Phase 3 Progress: 5/5 tasks completed (100%) ✅**

### Phase 4: Comprehensive Event Tracking

- [x] Implement comprehensive event tracking for all user interactions
- [x] Track button clicks, form interactions, and content engagement
- [x] Monitor scroll depth and time on page with strict typing
- [x] Implement section activation tracking with intersection observer
- [x] Add menu highlighting for active sections
- [x] Track section time spent and scroll milestones

**Success Criteria:**

- [x] All user interactions tracked comprehensively
- [x] Session-based tracking working across visits
- [x] Scroll depth and engagement metrics functional
- [x] Complete user behavior analytics available
- [x] Section activation events tracked with menu highlighting
- [x] Scroll depth milestones (25%, 50%, 75%, 100%) tracked
- [x] Time spent in each section tracked

**Phase 4 Progress: 7/7 tasks completed (100%) ✅**

## Technical Specifications

### Environment Configuration

**Environment-Based Setup:**

**Development Environment (`environment: "dev"`):**

- **Domain**: `dev.{domain}` (e.g., `dev.hpsaviation.com`)
- Load Plausible script directly from `https://plausible.io/js/script.js`
- Send events directly to Plausible API
- Include development toggle to enable/disable analytics sending
- Show clear status indicators for analytics state
- **Important**: Separate domain prevents mixing dev data with production

**Staging Environment (`environment: "staging"`):**

- Use nginx proxy configuration:
  - API endpoint: `/api/event` (proxied to Plausible)
  - Script endpoint: `/js/script.js` (proxied to Plausible)
- **Domain**: `staging.{domain}` (e.g., `staging.hpsaviation.com`)
- Analytics always enabled
- No development controls visible
- **Important**: Separate domain prevents mixing staging data with production

**Production Environment (`environment: "prod"`):**

- Use nginx proxy configuration:
  - API endpoint: `/api/event` (proxied to Plausible)
  - Script endpoint: `/js/script.js` (proxied to Plausible)
- Analytics always enabled
- No development controls visible

**Configuration Structure:**

- Environment variable: `"dev"`, `"staging"`, or `"prod"`
- Separate script and API endpoints per environment
- Development toggle only available in dev environment
- Minimal configuration with environment-specific defaults

**Plausible Setup Requirements:**

- **Production**: Add `hpsaviation.com` as a site in Plausible
- **Staging**: Add `staging.hpsaviation.com` as a separate site in Plausible
- **Development**: Add `dev.hpsaviation.com` as a separate site in Plausible

**Why Separate Domains for All Environments:**

Plausible Analytics doesn't differentiate by port numbers - it only tracks by domain name. If different environments use the same domain (even with different ports), analytics data will be mixed together. Using separate subdomains ensures clean separation:

- **Development**: `dev.hpsaviation.com` - tracks development activity
- **Staging**: `staging.hpsaviation.com` - tracks staging/testing activity
- **Production**: `hpsaviation.com` - tracks live user activity

This approach provides complete analytics visibility across all environments while maintaining data separation.

### Analytics Service Structure

**Core Methods:**

- `trackPageView()` - Basic page view tracking
- `trackEvent()` - Custom event tracking with type safety
- `trackLanguageSwitch()` - Language switching events
- `trackButtonClick()` - Button and interaction tracking
- `trackFormSubmission()` - Form completion tracking
- `trackScrollDepth()` - Scroll behavior tracking
- `trackSectionActivation()` - Section activation events
- `trackSectionTime()` - Time spent in sections
- `trackError()` - Error tracking and monitoring

**Key Principles:**

- Type-safe event tracking
- Automatic language context
- Persistent session tracking (no expiration)
- Performance optimized
- Cross-visit user identification

### Event Categories

**Language Events:**

- Language detection and switching
- Language-specific content engagement
- Language preference tracking

**Interaction Events:**

- Button clicks and user interactions
- Scroll depth and time on page
- Section activation and highlighting
- Menu item activation tracking
- Form field interactions
- Content engagement (videos, images, links)

**Business Events:**

- Presentation views and engagement
- Contact form submissions
- Investor inquiries
- File downloads

**Performance Events:**

- Page load times
- Performance metrics
- Error tracking

**Key Guidelines:**

- Every event includes language context
- All events are type-safe
- Focus on actionable business insights
- Keep event data minimal but meaningful
- Section activation provides visual feedback
- Menu highlighting shows current section
- Scroll milestones track engagement depth
- Session persistence enables cross-visit tracking
- No session expiration for complete user journey analysis

### Performance Optimizations

**Core Principles:**

- Batch events to reduce network requests
- Lazy load analytics after page load
- Store events offline when possible
- Use retry logic for failed requests
- Monitor performance impact

**Key Settings:**

- Batch size: 10 events per batch
- Batch timeout: 5 seconds
- Retry attempts: 3 times
- Offline storage: Enable for reliability

### Ad-Blocker Bypass Strategy

**Primary Method:**

- Use Apache/Nginx proxy to serve analytics from your domain
- Configure `/js/script.js` and `/api/event` endpoints
- Make requests appear as first-party connections

**Fallback Methods:**

- Multiple endpoint fallbacks
- Server-side tracking backup
- Local storage when blocked
- Pixel tracking as last resort

**Implementation:**

- Start with proxy configuration
- Test against common ad-blockers
- Monitor bypass success rates

### Apache Proxy Configuration

**Setup Steps:**

1. Enable proxy modules: `proxy`, `proxy_http`, `ssl`
2. Configure virtual host with proxy rules
3. Set up `/js/script.js` and `/api/event` endpoints
4. Test proxy functionality

**Nginx Alternative:**

- Use `proxy_pass` for both endpoints
- Set proper headers for Plausible
- Configure SSL if needed

**Script Update:**

- Change `data-api` to `/api/event`
- Change `src` to `/js/script.js`
- Keep `data-domain` as "hpsaviation.com"

## Dependencies

### Required Packages

```json
{
  "@plausible-analytics/tracker": "^1.0.0"
}
```

### Optional Enhancements (Future Phases)

```json
{
  "uuid": "^9.0.0", // Session ID generation
  "compression": "^1.7.4" // Event payload compression
}
```

## Performance Targets

- **Page Load Impact**: < 50ms additional load time
- **Memory Usage**: < 1MB additional memory footprint
- **Network Requests**: < 5KB per page view
- **Ad-Blocker Bypass**: > 80% success rate
- **Offline Support**: 100% event capture when offline
- **Error Rate**: < 1% failed tracking events

## Notes

- **Performance Priority**: Analytics should not impact user experience
- **Ad-Blocker Resistance**: Multiple techniques to maximize data collection
- **Language Focus**: Detailed tracking of language usage patterns
- **Event Tracking**: Comprehensive user interaction tracking
- **Self-Hosting Ready**: Option for complete data control
- **Incremental Implementation**: Each phase builds on the previous
- **Testing Strategy**: Manual testing with real ad-blockers
- **Proxy Implementation**: Use Apache/Nginx proxy for maximum ad-blocker bypass
- **TypeScript First**: All events, services, and configurations must be strictly typed
- **Research-Based**: All implementation decisions based on current best practices and proven techniques
