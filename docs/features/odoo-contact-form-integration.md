# Odoo CRM Contact Form Integration

## Overview

Integrate contact form with Odoo CRM to create opportunities for investment inquiries.

## Architecture

- **Frontend**: Angular contact form
- **Backend**: PHP script with Odoo JSON-2 API
- **Odoo CRM**: Opportunity management

## Status

### Completed ✅

- [x] Environment configuration
- [x] PHP/nginx server setup
- [x] Odoo API connection tested
- [x] CRM structure analysis
- [x] Field mapping confirmed

### Next Steps

- [ ] Create PHP integration script
- [ ] Update Angular form component
- [ ] Test end-to-end flow

## API Contract

```json
POST /scripts/odoo-integration.php
{
  "name": "Contact Name",
  "email": "contact@email.com",
  "phone": "+1234567890",
  "message": "Investment inquiry details",
  "investment_amount": 50000
}

Response:
{
  "success": true,
  "opportunity_id": 123
}
```

## Field Mapping

```
name → name (required)
email → email_from
phone → phone
message → description
investment_amount → expected_revenue
type → "opportunity" (required)
stage_id → 1 (New stage)
```

## CRM Stages

| ID  | Name         | Sequence |
| --- | ------------ | -------- |
| 1   | New          | 0        |
| 2   | تمت الموافقة | 1        |
| 3   | العقد مرسل   | 2        |
| 4   | جاهز للتحصيل | 3        |
| 5   | تم الإنضمام  | 4        |
