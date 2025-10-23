# Security Fixes - Immediate Action Items

This document contains the CRITICAL fixes that must be implemented immediately.

---

## CRITICAL FIX #1: Password in URL (DELETE Endpoint)

**File**: `src/components/CommentsSection.tsx`
**Lines**: 169-171

### Current Code (VULNERABLE):
```typescript
const url = isGuest
  ? `/api/comments?commentId=${commentId}&password=${encodeURIComponent(password)}`
  : `/api/comments?commentId=${commentId}`;

const response = await fetch(url, {
  method: 'DELETE',
});
```

### Fixed Code:
```typescript
const url = `/api/comments?commentId=${commentId}`;

const response = await fetch(url, {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: isGuest ? JSON.stringify({ password }) : undefined,
});
```

### API Route Change Required:
**File**: `src/app/api/comments/route.ts`
**Lines**: 210-214

```typescript
// BEFORE:
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const commentId = searchParams.get('commentId');
  const password = searchParams.get('password'); // REMOVE THIS

// AFTER:
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const commentId = searchParams.get('commentId');

  // Read password from request body
  let password: string | undefined;
  try {
    const body = await request.json();
    password = body.password;
  } catch {
    // Body is optional for authenticated users
  }

  // ... rest stays the same
```

---

## CRITICAL FIX #2: Hide Password Hash from GET Response

**File**: `src/app/api/comments/route.ts`
**Lines**: 30-35

### Current Code (VULNERABLE):
```typescript
const { data: comments, error } = await supabase
  .from('comments')
  .select('*')  // ← Exposes author_password!
  .eq('target_type', targetType)
  .eq('target_id', targetId)
  .order('created_at', { ascending: false });
```

### Fixed Code:
```typescript
const { data: comments, error } = await supabase
  .from('comments')
  .select('id, user_id, target_type, target_id, content, parent_id, created_at, updated_at, author_name')
  // ← Explicitly exclude author_password
  .eq('target_type', targetType)
  .eq('target_id', targetId)
  .order('created_at', { ascending: false });
```

---

## CRITICAL FIX #3: Implement Basic Rate Limiting

### Step 1: Create Rate Limit Helper

**Create file**: `src/lib/simple-ratelimit.ts`

```typescript
// Simple in-memory rate limiter
const attempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  clientId: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = attempts.get(clientId);

  if (!record || now > record.resetAt) {
    attempts.set(clientId, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxAttempts) {
    return {
      allowed: false,
      retryAfter: Math.ceil((record.resetAt - now) / 1000)
    };
  }

  record.count++;
  return { allowed: true };
}

export function getClientId(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${ip}:${userAgent.substring(0, 50)}`;
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of attempts.entries()) {
    if (now > value.resetAt) {
      attempts.delete(key);
    }
  }
}, 5 * 60 * 1000);
```

### Step 2: Apply to DELETE Endpoint

**File**: `src/app/api/comments/route.ts`

```typescript
import { checkRateLimit, getClientId } from '@/lib/simple-ratelimit';

export async function DELETE(request: NextRequest) {
  // Rate limit: 3 attempts per minute
  const clientId = getClientId(request);
  const rateCheck = checkRateLimit(clientId, 3, 60 * 1000);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: 'Too many attempts. Please try again later.',
        retryAfter: rateCheck.retryAfter
      },
      {
        status: 429,
        headers: {
          'Retry-After': rateCheck.retryAfter?.toString() || '60',
        }
      }
    );
  }

  // ... rest of DELETE logic
```

### Step 3: Apply to PATCH Endpoint

Add the same rate limiting to PATCH (line 129):

```typescript
export async function PATCH(request: NextRequest) {
  // Rate limit: 3 attempts per minute
  const clientId = getClientId(request);
  const rateCheck = checkRateLimit(clientId, 3, 60 * 1000);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429 }
    );
  }

  // ... rest of PATCH logic
```

### Step 4: Apply to POST Endpoint

Add rate limiting to POST (line 53):

```typescript
export async function POST(request: NextRequest) {
  // Rate limit: 5 comments per minute
  const clientId = getClientId(request);
  const rateCheck = checkRateLimit(clientId, 5, 60 * 1000);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Too many comments. Please slow down.' },
      { status: 429 }
    );
  }

  // ... rest of POST logic
```

---

## Quick Test Commands

After implementing fixes, test:

### Test #1: Password not in URL
```bash
# Open browser DevTools → Network tab
# Delete a guest comment
# Check the DELETE request
# Verify: Password is in Request Body, NOT in URL
```

### Test #2: Password hash hidden
```bash
# Open browser DevTools → Network tab
# Load page with comments
# Check GET /api/comments response
# Verify: No "author_password" field in response
```

### Test #3: Rate limiting works
```bash
# Try deleting same comment 4 times rapidly
# Verify: 4th attempt returns 429 Too Many Requests
# Wait 60 seconds
# Verify: Can delete again
```

---

## Implementation Order

1. Fix #1 - Password in URL (30 minutes)
2. Fix #2 - Hide password hash (15 minutes)
3. Fix #3 - Rate limiting (45 minutes)

**Total time**: ~90 minutes

---

## After These Fixes

Your security rating will improve from 3/10 to 6/10.

Remaining HIGH priority issues:
- XSS sanitization
- Password policy
- RLS policy fixes
- CSRF protection

See full audit report: `SECURITY_AUDIT_GUEST_COMMENTS.md`
