# Arabic Translation & RTL Support

> **📝 REMINDER**: Update progress checkboxes as tasks are completed
> **Current Status**: Phase 5 Complete ✅ | All Phases Complete 🎉
>
> **Completed**: Dependencies, services, RTL CSS, Tailwind config, translations, language selector, routing, nginx config
>
> **Next Steps**: Deploy and test the complete multilingual system

## Overview

Implement comprehensive Arabic translation with RTL (Right-to-Left) layout support for the HPS Aviation website. This feature will provide full TypeScript support, single source of truth for translations, and intelligent language detection with user override capabilities.

## Architecture

### Angular i18n Strategy

- **Hybrid Approach**: URL-based language detection with runtime switching
- **Translation Files**: Single JSON file per language with flat keys
- **RTL Support**: CSS logical properties and Angular RTL utilities
- **Language Detection**: Multi-level detection (URL → browser → stored preference → manual override)
- **SEO Optimization**: Language-specific URLs for better search engine visibility

### Key Components

- **Translation Service**: Centralized translation management
- **Language Service**: Detection, storage, and switching logic
- **RTL Service**: Direction and layout management
- **Language Selector**: UI component matching current design
- **Language Guard**: Route guard for language validation
- **SEO Service**: Meta tags and structured data management

## Implementation Plan

### Phase 1: Foundation Setup

- [x] Install Angular i18n dependencies
- [x] Configure Angular i18n in angular.json
- [x] Create single translation file structure
- [x] Set up TypeScript interfaces for flat translation keys
- [x] Create base translation service

### Phase 2: Core Services

- [x] Implement LanguageService with detection logic
- [x] Create RTLService for direction management
- [x] Build TranslationService with type safety
- [x] Add language persistence (localStorage/sessionStorage)

### Phase 3: UI Preparation for RTL

- [x] Audit existing CSS for RTL compatibility
- [x] Convert hardcoded directions to logical properties
- [x] Update Tailwind classes for RTL support
- [x] Test component layouts in RTL mode

### Phase 4: Translation Implementation

- [x] Extract all text content to translation files
- [x] Create Arabic translations
- [x] Implement translation pipes and directives
- [x] Update components to use translations

### Phase 5: Language Selector & Routing

- [x] Design language selector matching current navbar
- [x] Implement language switching logic
- [x] Add visual indicators for current language
- [x] Implement URL-based language routing
- [x] Create language guard for route validation
- [x] Update nginx configuration for language URLs

## Technical Specifications

### Translation File Structure

```
src/assets/i18n/
├── en.json
└── ar.json
```

### TypeScript Interfaces

```typescript
interface TranslationKeys {
  // Navigation
  nav_vision: string;
  nav_innovation: string;
  nav_crow_aircraft: string;
  nav_connect: string;
  nav_invest: string;

  // Hero Section
  hero_title: string;
  hero_subtitle: string;
  hero_cta_discover: string;
  hero_cta_meet_crow: string;

  // Common
  loading: string;
  error: string;
  success: string;
}
```

### Language Detection Logic

1. **URL Parameter**: Detect from route parameter (`:lang`)
2. **Browser Language**: Detect from navigator.language
3. **Stored Preference**: Check localStorage for user choice
4. **Manual Override**: Allow user to explicitly set language
5. **Fallback**: Default to English if detection fails

### URL Structure

```
hpsaviation.com/          → Redirect to /en
hpsaviation.com/en        → English content
hpsaviation.com/ar        → Arabic content
hpsaviation.com/en/presentation → English presentation
hpsaviation.com/ar/presentation → Arabic presentation
```

### Route Configuration

```typescript
export const routes: Routes = [
  {path: "", redirectTo: "/en", pathMatch: "full"},
  {
    path: ":lang",
    component: IndexComponent,
    canActivate: [LanguageGuard],
  },
  {
    path: ":lang/presentation",
    component: PresentationComponent,
    canActivate: [LanguageGuard],
  },
];
```

### RTL Implementation Strategy

- Use CSS logical properties (`margin-inline-start` vs `margin-left`)
- Implement Angular's `@angular/cdk/bidi` for programmatic RTL
- Update Tailwind configuration for RTL support
- Create RTL-specific component variants where needed
- **Dynamic RTL CSS loading** - RTL CSS only loads for Arabic language
- **Optimized RTL CSS** - Essential RTL changes only, minimal file size
- **Logical property utilities** - Tailwind utilities that work in both LTR and RTL

## Dependencies

### Required Packages

```json
{
  "@angular/localize": "^19.0.0",
  "@angular/cdk": "^19.2.18" // Already installed
}
```

### Optional Enhancements

```json
{
  "ngx-translate": "^15.0.0", // Alternative to Angular i18n
  "date-fns": "^3.0.0" // Date localization
}
```

## Success Criteria

- [x] Seamless language switching without page reload
- [x] Perfect RTL layout for Arabic content
- [x] Type-safe translation system with flat keys
- [x] Language detection working correctly (URL → browser → stored → manual)
- [x] Language selector integrated with current design
- [x] All text content translated
- [x] Performance maintained
- [x] Mobile responsiveness preserved
- [x] SEO-optimized URLs for both languages
- [x] Proper meta tags and hreflang implementation
- [x] Nginx configuration updated for language routing

## Notes

- Maintain existing design aesthetic
- Ensure accessibility compliance
- Consider SEO implications for Arabic content
- Plan for future language additions
- Document translation key naming conventions
- Keep implementation flexible to adapt as we progress
- **URL Structure**: Use `:lang` parameter for language detection
- **Route Guards**: Implement language validation for all routes
- **Nginx Updates**: Update configuration to handle language URLs
- **SEO Benefits**: Language-specific URLs improve search engine visibility
- **Migration Strategy**: Implement incrementally to avoid breaking changes
- **Testing**: Manual testing approach - no automated tests for now
