# 02 - API Redesign Strategy

## Current State Analysis

### Problems with Current API

**From:** https://femdjango-production.up.railway.app/api/redoc/

Current endpoint count: **80+**

#### Anti-Patterns Identified:

1. **Endpoint Explosion**
```
❌ /api/business/{id}/update/
❌ /api/business/{id}/quick-update/
❌ /api/business/{id}/update-logo/
❌ /api/business/{id}/upload-logo/
❌ /api/business/{id}/update-profile-image/
❌ /api/business/{id}/upload-profile-image/
```
One PATCH endpoint can handle all of this.

2. **Nested Resource Duplication**
```
❌ /api/business/{business_id}/products/
❌ /api/business/{business_id}/services/
❌ /api/business/products/
❌ /api/business/services/
```
Should be unified under `/catalog` with filters.

3. **UI-Driven Design**
```
❌ /api/business/{id}/summary/
❌ /api/business/{id}/capabilities/
```
These are UI concerns, not domain concepts.

4. **Upload Chaos**
```
❌ 7 different upload endpoints
❌ No upload token pattern
❌ Direct file handling in routes
```

---

## New API Architecture

### Design Principles

1. **Domain-First:** Resources represent business domains, not UI views
2. **Unified Updates:** One PATCH per resource, accepts partial updates
3. **Token-Based Uploads:** Separate upload orchestration from business logic
4. **Query-Driven Filtering:** Use query params instead of dedicated endpoints
5. **Event Sourcing:** Analytics from events, not computed fields

### New Domain Structure

```
/auth           → Authentication & tokens
/users          → User profiles
/businesses     → Business listings
/catalog        → Products + Services (unified)
/reviews        → Reviews (can attach to any entity)
/media          → Upload tokens + management
/engagement     → Likes, favorites, follows
/verification   → Trust & verification workflows
/analytics      → Business metrics & stats
/system         → Categories, health, metadata
```

---

## Complete Endpoint Map

### 1. Authentication (5 endpoints)

```
POST   /auth/login
POST   /auth/otp/verify
POST   /auth/refresh
POST   /auth/logout
GET    /auth/validate
```

**Login Example:**
```json
// Request
POST /auth/login
{
  "identifier": "0748104057",  // Phone or partnership number
  "method": "phone"             // or "partnership"
}

// Response
{
  "session_id": "abc123",
  "otp_sent": true,
  "expires_in": 300
}
```

**OTP Verify:**
```json
POST /auth/otp/verify
{
  "session_id": "abc123",
  "otp": "123456"
}

// Response
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": { ... }
}
```

---

### 2. Users (2 endpoints)

```
GET    /users/me
PATCH  /users/me
```

**Profile Update:**
```json
PATCH /users/me
{
  "first_name": "Emmanuel",
  "profile_photo_id": "media-uuid",  // Reference to uploaded media
  "preferences": {
    "notifications": true
  }
}
```

---

### 3. Businesses (5 endpoints)

```
GET    /businesses
GET    /businesses/{id}
POST   /businesses
PATCH  /businesses/{id}
DELETE /businesses/{id}
```

**List with Filters:**
```
GET /businesses?category=transportation&city=Nairobi&verified=true&search=auto
```

**Create Business:**
```json
POST /businesses
{
  "name": "Kitisons Auto Spares",
  "slug": "kitisons-auto",           // Auto-generated if not provided
  "category_id": 16,
  "description": "...",
  "location": {
    "city": "Wangige",
    "address": "49-00614",
    "coordinates": [-1.2345, 36.7890]
  },
  "contact": {
    "phone": "0748104057",
    "email": "contact@kitisons.co.ke",
    "website": "https://kitisons.co.ke"
  },
  "logo_id": "media-uuid",           // Uploaded separately via /media
  "gallery_ids": ["media-uuid-1", "media-uuid-2"]
}
```

**Update Business (Partial):**
```json
PATCH /businesses/{id}
{
  "contact": {
    "phone": "0700000000"            // Only update phone
  }
}
```

**Response Format:**
```json
{
  "id": "d74241dc-cd94-4f04-9798-5e4a3cedb842",
  "name": "Kitisons Auto Spares",
  "slug": "kitisons-auto",
  "category": {
    "id": 16,
    "name": "Transportation",
    "slug": "transportation"
  },
  "logo": {
    "id": "media-uuid",
    "url": "https://cdn.faithconnect.biz/media/logo.png",
    "thumbnail_url": "https://cdn.faithconnect.biz/media/logo-thumb.png"
  },
  "location": {
    "city": "Wangige",
    "address": "49-00614",
    "coordinates": [-1.2345, 36.7890]
  },
  "contact": {
    "phone": "0748104057",
    "email": "contact@kitisons.co.ke",
    "website": "https://kitisons.co.ke"
  },
  "trust": {
    "verification_status": "verified",
    "trust_score": 85,
    "badges": [
      {
        "type": "church_verified",
        "issued_at": "2024-12-20T10:00:00Z"
      }
    ]
  },
  "stats": {
    "views": 1234,
    "likes": 45,
    "reviews": 12,
    "avg_rating": 4.5
  },
  "owner_id": "user-uuid",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-12-20T14:30:00Z"
}
```

---

### 4. Catalog - Products & Services Unified (5 endpoints)

```
GET    /catalog
GET    /catalog/{id}
POST   /catalog
PATCH  /catalog/{id}
DELETE /catalog/{id}
```

**List Catalog Items:**
```
GET /catalog?business_id=xxx&type=service&search=welding
```

**Create Catalog Item:**
```json
POST /catalog
{
  "type": "service",                    // or "product"
  "business_id": "business-uuid",
  "name": "Car Battery Replacement",
  "description": "Professional battery installation",
  "price": {
    "amount": 5000,
    "currency": "KES",
    "type": "fixed"                     // or "range", "quote"
  },
  "duration": "2 hours",                // For services
  "image_ids": ["media-uuid"],
  "metadata": {
    "warranty": "6 months",
    "brands": ["AC Delco", "Chloride"]
  }
}
```

**Response:**
```json
{
  "id": "catalog-uuid",
  "type": "service",
  "business": {
    "id": "business-uuid",
    "name": "Kitisons Auto Spares",
    "slug": "kitisons-auto"
  },
  "name": "Car Battery Replacement",
  "description": "Professional battery installation",
  "price": {
    "amount": 5000,
    "currency": "KES",
    "type": "fixed",
    "display": "KSh 5,000"
  },
  "duration": "2 hours",
  "images": [
    {
      "id": "media-uuid",
      "url": "https://cdn.faithconnect.biz/..."
    }
  ],
  "stats": {
    "reviews": 5,
    "avg_rating": 4.8
  },
  "created_at": "2024-12-01T10:00:00Z"
}
```

---

### 5. Media - Token-Based Uploads (3 endpoints)

```
POST   /media/upload-token
POST   /media/attach
DELETE /media/{id}
```

**Upload Flow:**

**Step 1: Get Upload Token**
```json
POST /media/upload-token
{
  "filename": "logo.png",
  "content_type": "image/png",
  "size_bytes": 52431
}

// Response
{
  "media_id": "media-uuid",
  "upload_url": "https://cdn.faithconnect.biz/upload/signed-url",
  "expires_in": 3600,
  "max_size_bytes": 5242880  // 5MB
}
```

**Step 2: Upload to Signed URL (Client-side)**
```javascript
// Client uploads directly to CDN
await fetch(uploadUrl, {
  method: 'PUT',
  body: fileBlob,
  headers: { 'Content-Type': 'image/png' }
})
```

**Step 3: Attach to Entity**
```json
POST /media/attach
{
  "media_id": "media-uuid",
  "entity_type": "business",
  "entity_id": "business-uuid",
  "media_type": "logo"  // or "gallery", "profile", "product"
}

// Response
{
  "media_id": "media-uuid",
  "url": "https://cdn.faithconnect.biz/media/final-url.png",
  "attached_to": {
    "entity_type": "business",
    "entity_id": "business-uuid"
  }
}
```

---

### 6. Reviews (4 endpoints)

```
GET    /reviews
POST   /reviews
PATCH  /reviews/{id}
DELETE /reviews/{id}
```

**Query Reviews:**
```
GET /reviews?entity_type=business&entity_id=xxx
GET /reviews?entity_type=catalog&entity_id=xxx
GET /reviews?user_id=xxx
```

**Create Review:**
```json
POST /reviews
{
  "entity_type": "business",  // or "catalog"
  "entity_id": "business-uuid",
  "rating": 5,
  "title": "Excellent Service",
  "content": "Very professional and fast.",
  "image_ids": ["media-uuid"]
}
```

---

### 7. Engagement (2 endpoints)

```
POST   /engagement
GET    /engagement/activity
```

**Unified Engagement:**
```json
POST /engagement
{
  "action": "like",           // or "favorite", "follow"
  "entity_type": "business",  // or "review", "catalog"
  "entity_id": "business-uuid"
}

// Toggle behavior: POST again to unlike
```

**Get Activity:**
```
GET /engagement/activity?user_id=me&action=favorite
```

---

### 8. Verification & Trust (2 endpoints)

```
POST   /verification/request
GET    /verification/status/{business_id}
```

**Request Verification:**
```json
POST /verification/request
{
  "business_id": "business-uuid",
  "documents": ["media-uuid-1", "media-uuid-2"],  // Church membership proof
  "notes": "Pastor Muturi can verify"
}
```

---

### 9. Analytics (2 endpoints)

```
GET    /analytics/business/{id}
GET    /analytics/system
```

**Business Analytics:**
```json
GET /analytics/business/{id}?range=30d

{
  "views": {
    "total": 1234,
    "trend": "+15%",
    "chart": [...]
  },
  "engagement": {
    "likes": 45,
    "favorites": 12
  },
  "reviews": {
    "count": 8,
    "avg_rating": 4.6,
    "recent": [...]
  }
}
```

---

### 10. System (2 endpoints)

```
GET    /system/categories
GET    /system/health
```

---

## Migration Strategy

### Phase 1: Parallel APIs (Week 1-2)
- Keep existing Django API running
- Deploy new FastAPI alongside at `/v3/`
- No user impact

### Phase 2: Data Sync (Week 3)
- Write migration scripts
- Sync existing data to new schema
- Add `trust_score` calculation
- Generate verification records

### Phase 3: Frontend Cutover (Week 4-6)
- Update frontend to use `/v3/` endpoints
- Remove old endpoint calls one by one
- Keep fallback to v2 for 2 weeks

### Phase 4: Deprecation (Week 7-8)
- Monitor v2 usage
- Notify any remaining integrations
- Sunset v2 API

---

## Implementation Checklist

### Backend Setup
- [ ] FastAPI project structure
- [ ] Database models with trust layer
- [ ] JWT authentication
- [ ] Upload token generation
- [ ] Event bus for analytics
- [ ] Rate limiting
- [ ] CORS configuration

### API Implementation
- [ ] Auth endpoints (5)
- [ ] User endpoints (2)
- [ ] Business CRUD (5)
- [ ] Catalog CRUD (5)
- [ ] Media upload flow (3)
- [ ] Reviews (4)
- [ ] Engagement (2)
- [ ] Verification (2)
- [ ] Analytics (2)
- [ ] System (2)

### Documentation
- [ ] OpenAPI schema generation
- [ ] Interactive docs at `/docs`
- [ ] Example requests for each endpoint
- [ ] Error response documentation
- [ ] Rate limit documentation

### Testing
- [ ] Unit tests for each endpoint
- [ ] Integration tests for flows
- [ ] Load testing (1000 req/s target)
- [ ] Security audit

---

## Benefits Summary

### Reduced Complexity
- 80+ endpoints → 32 endpoints (60% reduction)
- Easier to learn and document
- Less code to maintain

### Better Performance
- Fewer round trips
- Easier to cache
- Token-based uploads offload backend

### Scalability
- Domain-driven = easy to split into microservices later
- Event system = async analytics
- Media CDN = no backend bottleneck

### Developer Experience
- Clear resource boundaries
- Predictable patterns
- Auto-generated TypeScript types

---

## Next Steps

1. Review this document with team
2. Generate OpenAPI spec (doc 03)
3. Set up FastAPI project structure (doc 09)
4. Begin implementation with Auth endpoints

---

_This API design supports 10,000+ businesses and 100,000+ users without refactoring._