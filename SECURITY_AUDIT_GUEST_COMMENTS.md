# Security Audit Report - Guest Comment System

**Audit Date**: 2025-10-09
**Auditor**: Security Audit Specialist
**Scope**: Guest authentication system for comments
**Overall Security Rating**: 3/10 (CRITICAL ISSUES FOUND)

---

## Executive Summary

The guest comment system allows unauthenticated users to post comments using only a name and password. While the implementation uses bcrypt for password hashing, **multiple critical and high-severity vulnerabilities were identified** that could lead to:

- **Password exposure in browser history and server logs**
- **Brute-force attacks with no rate limiting**
- **Cross-Site Scripting (XSS) attacks**
- **Password hash exposure to all clients**
- **Authentication bypass through RLS policy flaws**
- **CSRF vulnerabilities**
- **Information leakage through error messages**

**IMMEDIATE ACTION REQUIRED**: This system should not be used in production without implementing the recommended fixes.

---

## CRITICAL Findings (Immediate Action Required)

### 1. PASSWORD IN URL QUERY STRING - DELETE ENDPOINT

**Location**: `src/components/CommentsSection.tsx` lines 169-171
**Risk Level**: CRITICAL
**CVSS Score**: 8.5

**Description**:
Guest passwords are transmitted in the URL query string when deleting comments:
```typescript
const url = isGuest
  ? `/api/comments?commentId=${commentId}&password=${encodeURIComponent(password)}`
  : `/api/comments?commentId=${commentId}`;
```

**Attack Scenario**:
1. User deletes a comment with password "MySecret123"
2. Browser stores URL in history: `/api/comments?commentId=5&password=MySecret123`
3. Password is logged in:
   - Browser history (accessible to malware, browser extensions)
   - Server access logs (visible to sysadmins, log aggregation tools)
   - Proxy servers / CDN logs
   - Referrer headers if user clicks external links after deletion
4. Attacker gains access to logs or browser history → can delete/modify all guest's comments

**Remediation**:
```typescript
// BEFORE (VULNERABLE):
const url = isGuest
  ? `/api/comments?commentId=${commentId}&password=${encodeURIComponent(password)}`
  : `/api/comments?commentId=${commentId}`;

const response = await fetch(url, {
  method: 'DELETE',
});

// AFTER (SECURE):
const url = `/api/comments?commentId=${commentId}`;

const response = await fetch(url, {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: isGuest ? JSON.stringify({ password }) : undefined,
});
```

**API Route Change Required** (`src/app/api/comments/route.ts` lines 210-284):
```typescript
// BEFORE:
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const commentId = searchParams.get('commentId');
  const password = searchParams.get('password'); // VULNERABLE!

// AFTER:
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const commentId = searchParams.get('commentId');

  // Read password from request body instead
  let password: string | undefined;
  try {
    const body = await request.json();
    password = body.password;
  } catch {
    // Body is optional for authenticated users
  }
```

**Verification**:
1. Delete a guest comment
2. Check browser DevTools → Network tab → Ensure password is in request body, NOT URL
3. Check server logs → Ensure password does not appear in access logs

---

### 2. PASSWORD HASH EXPOSURE TO ALL CLIENTS

**Location**:
- `src/app/api/comments/route.ts` line 30-35 (GET endpoint)
- Database RLS policy: "Anyone can view comments" with `qual=true`

**Risk Level**: CRITICAL
**CVSS Score**: 8.0

**Description**:
The `author_password` column (containing bcrypt hashes) is exposed to ALL users through the GET endpoint:

```typescript
const { data: comments, error } = await supabase
  .from('comments')
  .select('*')  // ← Returns ALL columns including author_password
  .eq('target_type', targetType)
  .eq('target_id', targetId)
  .order('created_at', { ascending: false });
```

Database query results show hashed passwords are returned:
```json
{
  "id": 3,
  "author_name": "테스트 사용자",
  "author_password": "$2b$10$2gQv8qaDFhWExN.P/QsWOeveK9.J35tS0iS4aOi7KrzvEqck3GbN2"
}
```

**Attack Scenario**:
1. Attacker loads any page with comments
2. Opens browser DevTools → Network tab
3. Inspects `/api/comments` response → obtains bcrypt hashes for all guest comments
4. Runs offline brute-force attack using hashcat/john on weak passwords
5. Successfully cracks passwords like "123456", "password", "qwerty"
6. Deletes/modifies victim's comments

**Attack Metrics**:
- bcrypt with cost=10 can be cracked at ~10,000 hashes/second on modern GPU
- Common passwords crackable in minutes to hours
- With no rate limiting, attacker can test cracked passwords immediately

**Remediation**:

**Step 1: Modify GET endpoint to exclude password hash**
```typescript
// BEFORE (VULNERABLE):
const { data: comments, error } = await supabase
  .from('comments')
  .select('*')
  .eq('target_type', targetType)
  .eq('target_id', targetId)
  .order('created_at', { ascending: false });

// AFTER (SECURE):
const { data: comments, error } = await supabase
  .from('comments')
  .select('id, user_id, target_type, target_id, content, parent_id, created_at, updated_at, author_name')
  // ← Explicitly exclude author_password
  .eq('target_type', targetType)
  .eq('target_id', targetId)
  .order('created_at', { ascending: false });
```

**Step 2: Create database view to hide password hash**
```sql
-- Create a secure view that excludes password
CREATE OR REPLACE VIEW comments_public AS
SELECT
  id,
  user_id,
  target_type,
  target_id,
  content,
  parent_id,
  created_at,
  updated_at,
  author_name
  -- author_password intentionally excluded
FROM comments;

-- Grant public access to view
GRANT SELECT ON comments_public TO anon, authenticated;

-- Enable RLS on view
ALTER VIEW comments_public SET (security_barrier = true);
```

**Step 3: Update frontend to use secure view**
```typescript
const { data: comments, error } = await supabase
  .from('comments_public')  // ← Use view instead of table
  .select('*')
  .eq('target_type', targetType)
  .eq('target_id', targetId)
  .order('created_at', { ascending: false });
```

**Verification**:
1. Load page with comments
2. Open DevTools → Network → Check `/api/comments` response
3. Verify `author_password` field is NOT present in response
4. Test edit/delete operations still work correctly

---

### 3. NO XSS SANITIZATION ON USER CONTENT

**Location**: `src/components/CommentsSection.tsx` line 283-284
**Risk Level**: CRITICAL
**CVSS Score**: 7.5

**Description**:
User-submitted content is rendered directly without sanitization:

```typescript
<p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
  {comment.content}  {/* ← No sanitization! */}
</p>
```

While React escapes HTML by default when rendering `{comment.content}`, attackers can still exploit:
- **Unicode/homograph attacks** (е vs e)
- **CSS injection** if content is ever used in style attributes
- **Content injection** for phishing

More critically, if `author_name` is used in any innerHTML context (not shown in current code but common mistake):
```typescript
// VULNERABLE if this pattern exists anywhere:
dangerouslySetInnerHTML={{ __html: comment.author_name }}
```

**Attack Scenario**:
1. Attacker posts comment with malicious content:
   ```
   Name: <script>steal_session()</script>
   Content: Click here: http://еvil.com (note Cyrillic 'е')
   ```
2. If admin panel or future feature uses innerHTML → XSS executed
3. If displayed as-is → users click phishing link

**Remediation**:

**Install DOMPurify**:
```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

**Sanitize on both client and server**:
```typescript
// src/lib/sanitize.ts
import DOMPurify from 'dompurify';

export function sanitizeComment(content: string): string {
  // Remove HTML tags, keep text only
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

export function sanitizeName(name: string): string {
  // More strict - alphanumeric + basic punctuation only
  return name
    .replace(/[<>\"']/g, '') // Remove dangerous chars
    .substring(0, 50) // Limit length
    .trim();
}
```

**Apply in API route** (`route.ts` line 56):
```typescript
import { sanitizeComment, sanitizeName } from '@/lib/sanitize';

export async function POST(request: NextRequest) {
  const body = await request.json();
  let { content, authorName } = body;

  // Sanitize inputs
  content = sanitizeComment(content);
  authorName = authorName ? sanitizeName(authorName) : null;

  // Validation
  if (!content.trim()) {
    return NextResponse.json(
      { error: 'Content cannot be empty after sanitization' },
      { status: 400 }
    );
  }
```

**Apply in frontend** (`CommentsSection.tsx` line 283):
```typescript
import { sanitizeComment } from '@/lib/sanitize';

// In render:
<p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
  {sanitizeComment(comment.content)}
</p>
```

**Verification**:
1. Try posting comment with HTML: `<script>alert('XSS')</script>`
2. Verify it's displayed as plain text, not executed
3. Try Unicode tricks: `http://еvil.com` (Cyrillic е)
4. Verify domain is displayed but sanitized

---

## HIGH Severity Findings

### 4. NO RATE LIMITING - BRUTE FORCE VULNERABILITY

**Location**: All API endpoints (`route.ts`)
**Risk Level**: HIGH
**CVSS Score**: 7.0

**Description**:
There is **zero rate limiting** on any endpoint. Combined with password hash exposure (#2), attackers can:
1. Download all password hashes
2. Crack weak passwords offline
3. Test cracked passwords with **unlimited attempts** on DELETE/PATCH endpoints
4. Successfully hijack comments with weak passwords

**Attack Scenario**:
```python
# Attacker script (runs in seconds):
import requests

comment_id = 5
password_list = ['123456', 'password', 'qwerty', '12345678']

for pwd in password_list:
    response = requests.delete(
        f'https://yoursite.com/api/comments?commentId={comment_id}&password={pwd}'
    )
    if response.status_code == 200:
        print(f"SUCCESS! Password is: {pwd}")
        break
```

**Current State**: Zero protection against this attack.

**Remediation**:

**Option 1: Use Upstash Rate Limit (Recommended in CLAUDE.md)**

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// src/lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Different rate limits for different operations
export const commentRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'), // 5 comments per minute
  prefix: 'ratelimit:comment',
});

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '60 s'), // 3 attempts per minute
  prefix: 'ratelimit:auth',
});

export const globalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '60 s'), // 100 requests per minute
  prefix: 'ratelimit:global',
});

// Get client identifier (IP + fingerprint)
export function getClientId(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${ip}:${userAgent.substring(0, 50)}`;
}
```

**Apply to DELETE endpoint** (most critical):
```typescript
import { authRateLimit, getClientId } from '@/lib/ratelimit';

export async function DELETE(request: NextRequest) {
  // Rate limit BEFORE any processing
  const clientId = getClientId(request);
  const { success, limit, remaining, reset } = await authRateLimit.limit(clientId);

  if (!success) {
    return NextResponse.json(
      {
        error: 'Too many attempts. Please try again later.',
        retryAfter: reset
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        }
      }
    );
  }

  // ... rest of DELETE logic
```

**Apply to ALL endpoints**:
- GET: `globalRateLimit` (100/min)
- POST: `commentRateLimit` (5/min)
- PATCH: `authRateLimit` (3/min)
- DELETE: `authRateLimit` (3/min)

**Option 2: Simple In-Memory Rate Limit (Quick Fix)**

If you can't set up Upstash immediately:

```typescript
// src/lib/simple-ratelimit.ts
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

**Verification**:
1. Make 4 DELETE requests rapidly → Should succeed
2. Make 5th request → Should return 429 Too Many Requests
3. Wait 60 seconds → Should work again

---

### 5. WEAK PASSWORD POLICY

**Location**: No password validation in `route.ts` or `CommentsSection.tsx`
**Risk Level**: HIGH
**CVSS Score**: 6.5

**Description**:
Guests can set passwords like "1", "a", "123" with zero validation. Combined with password hash exposure (#2) and no rate limiting (#4), this creates perfect conditions for brute-force attacks.

**Current State**:
```typescript
// No validation whatsoever
if (!authorName || !authorPassword) {
  return NextResponse.json(
    { error: 'Guest comments require authorName and authorPassword' },
    { status: 400 }
  );
}
// Password "1" is accepted! ←
```

**Remediation**:

```typescript
// src/lib/validation.ts
export function validateGuestPassword(password: string): {
  valid: boolean;
  error?: string
} {
  if (!password || password.length < 8) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters'
    };
  }

  if (password.length > 100) {
    return {
      valid: false,
      error: 'Password must be less than 100 characters'
    };
  }

  // Check for minimum complexity
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return {
      valid: false,
      error: 'Password must contain both letters and numbers'
    };
  }

  // Check against common passwords
  const commonPasswords = [
    '12345678', 'password', 'password1', 'qwerty123',
    'abc12345', '11111111', 'pass1234'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    return {
      valid: false,
      error: 'Password is too common. Please choose a stronger password'
    };
  }

  return { valid: true };
}

export function validateGuestName(name: string): {
  valid: boolean;
  error?: string
} {
  if (!name || name.trim().length < 2) {
    return {
      valid: false,
      error: 'Name must be at least 2 characters'
    };
  }

  if (name.length > 50) {
    return {
      valid: false,
      error: 'Name must be less than 50 characters'
    };
  }

  // Prevent impersonation
  const forbiddenNames = ['admin', 'administrator', 'moderator', 'system'];
  if (forbiddenNames.includes(name.toLowerCase())) {
    return {
      valid: false,
      error: 'This name is reserved'
    };
  }

  return { valid: true };
}
```

**Apply in API route**:
```typescript
import { validateGuestPassword, validateGuestName } from '@/lib/validation';

export async function POST(request: NextRequest) {
  // ... existing code

  if (!user) {
    // Guest comment validation
    if (!authorName || !authorPassword) {
      return NextResponse.json(
        { error: 'Guest comments require authorName and authorPassword' },
        { status: 400 }
      );
    }

    // Validate name
    const nameValidation = validateGuestName(authorName);
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validateGuestPassword(authorPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Hash password for security
    const hashedPassword = await bcrypt.hash(authorPassword, 10);
    // ... rest of code
```

**Apply in frontend with real-time feedback**:
```typescript
// CommentsSection.tsx
const [passwordError, setPasswordError] = useState('');

<input
  type="password"
  value={guestPassword}
  onChange={(e) => {
    setGuestPassword(e.target.value);
    // Real-time validation
    const validation = validateGuestPassword(e.target.value);
    setPasswordError(validation.valid ? '' : validation.error);
  }}
  placeholder="비밀번호 (최소 8자, 문자+숫자)"
  className="..."
/>
{passwordError && (
  <p className="text-sm text-red-600 mt-1">{passwordError}</p>
)}
```

**Verification**:
1. Try password "123" → Should show error
2. Try password "password" → Should show error (too common)
3. Try password "MyPass123" → Should succeed

---

### 6. AUTHENTICATION BYPASS - RLS POLICY FLAW

**Location**: Database RLS policies for UPDATE/DELETE
**Risk Level**: HIGH
**CVSS Score**: 7.5

**Description**:
The RLS policies have a critical flaw:

```sql
-- UPDATE policy
qual: "(((user_id IS NULL) AND (author_password IS NOT NULL)) OR (user_id = auth.uid()))"

-- DELETE policy
qual: "((user_id IS NULL) OR (user_id = auth.uid()))"
```

**Problem 1 - UPDATE**: Policy checks `author_password IS NOT NULL` but **does NOT verify the password is CORRECT**. The actual password verification happens in application code (line 174), but RLS policy allows the query through first.

**Problem 2 - DELETE**: Policy allows delete if `user_id IS NULL` **WITHOUT any password check**. Combined with the password-in-URL vulnerability (#1), an attacker who gets the URL can delete the comment even after the password is changed (until they lose the URL).

**Attack Scenario**:
1. Attacker knows a comment ID belongs to a guest (user_id IS NULL)
2. Attacker crafts UPDATE query directly to Supabase client:
   ```typescript
   await supabase
     .from('comments')
     .update({ content: 'HACKED!' })
     .eq('id', commentId);
   ```
3. RLS policy allows it through because `user_id IS NULL AND author_password IS NOT NULL`
4. Application-level password check (line 174) is bypassed because attacker isn't using the API route

**Remediation**:

**The correct approach is to NOT rely on RLS for guest password auth**. Instead:

1. **Disable UPDATE/DELETE for guest comments via RLS**:
```sql
-- Drop old policies
DROP POLICY IF EXISTS "Anyone can delete their comments with password" ON comments;
DROP POLICY IF EXISTS "Anyone can update their comments with password" ON comments;

-- NEW: Only authenticated users can update/delete via direct DB access
CREATE POLICY "Authenticated users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Guest comments can ONLY be updated/deleted via API with service role
-- (API route will verify password before using service role client)
```

2. **Use service role in API for guest operations**:

```typescript
// src/lib/supabase/server-admin.ts
import { createClient } from '@supabase/supabase-js';

// Service role client - bypasses RLS
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // ← Service role key
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
```

3. **Update DELETE endpoint**:
```typescript
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server-admin';

export async function DELETE(request: NextRequest) {
  // ... validation code ...

  // Get current user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch comment with regular client (respects RLS)
  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('user_id, author_password')
    .eq('id', commentId)
    .single();

  if (fetchError || !comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  }

  // Authorization check
  if (comment.user_id) {
    // Authenticated user comment - verify ownership
    if (!user || comment.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete with regular client (RLS allows it)
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

  } else {
    // Guest comment - verify password
    if (!password) {
      return NextResponse.json(
        { error: 'Password required' },
        { status: 400 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, comment.author_password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
    }

    // Use admin client to delete (bypasses RLS)
    const adminClient = createAdminClient();
    const { error: deleteError } = await adminClient
      .from('comments')
      .delete()
      .eq('id', commentId);
  }

  // ... rest of code
}
```

**Verification**:
1. Try updating guest comment directly via Supabase client → Should fail
2. Try updating via API with wrong password → Should fail
3. Try updating via API with correct password → Should succeed

---

### 7. NO CSRF PROTECTION

**Location**: All API routes
**Risk Level**: HIGH
**CVSS Score**: 6.5

**Description**:
The API has no CSRF (Cross-Site Request Forgery) protection. A malicious website can trigger actions on behalf of a logged-in user.

**Attack Scenario**:
1. User visits your site, logs in
2. User visits attacker's site `evil.com` (in another tab)
3. `evil.com` contains:
   ```html
   <script>
   // Delete user's comment
   fetch('https://yoursite.com/api/comments?commentId=123', {
     method: 'DELETE',
     credentials: 'include' // Sends cookies
   });
   </script>
   ```
4. Request succeeds because browser includes user's session cookie
5. User's comment deleted without their knowledge

**Remediation**:

**Option 1: SameSite Cookies (Quick Fix)**

Ensure Supabase cookies use SameSite=Lax or Strict:

```typescript
// src/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr';

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
            sameSite: 'lax', // ← Prevents CSRF
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  await supabase.auth.getUser();
  return response;
}
```

**Option 2: CSRF Token (More Secure)**

```typescript
// src/lib/csrf.ts
import { randomBytes } from 'crypto';

export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

export function verifyCsrfToken(token: string, expected: string): boolean {
  if (!token || !expected) return false;
  return token === expected;
}

// In API route:
export async function POST(request: NextRequest) {
  const csrfToken = request.headers.get('x-csrf-token');
  const expectedToken = request.cookies.get('csrf-token')?.value;

  if (!verifyCsrfToken(csrfToken, expectedToken)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }

  // ... rest of logic
}
```

**Option 3: Check Origin Header (Simplest)**

```typescript
// src/lib/csrf-check.ts
export function verifySameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (!origin || !host) {
    // Allow same-origin requests without Origin header (direct navigation)
    return true;
  }

  const originHost = new URL(origin).host;
  return originHost === host;
}

// Apply to all mutating endpoints (POST/PATCH/DELETE):
export async function POST(request: NextRequest) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json(
      { error: 'Invalid request origin' },
      { status: 403 }
    );
  }
  // ... rest of logic
}
```

**Verification**:
1. Create test HTML file with CSRF attack
2. Try to delete comment from external page → Should fail with 403
3. Delete from your site → Should succeed

---

## MEDIUM Severity Findings

### 8. INSUFFICIENT INPUT VALIDATION

**Location**: Multiple locations
**Risk Level**: MEDIUM
**CVSS Score**: 5.5

**Issues**:

1. **Content length not validated**:
   ```typescript
   // route.ts line 58 - No max length check
   if (!targetType || !targetId || !content) {
     return NextResponse.json(...);
   }
   // ← Missing: content.length <= 5000
   ```

2. **Target ID type not validated**:
   ```typescript
   // Could be "../../admin" or SQL injection attempt
   const targetId = searchParams.get('targetId');
   // ← Missing: parseInt validation for numeric IDs
   ```

3. **No HTML entity validation**:
   Comments can contain excessive HTML entities causing DoS

**Remediation**:

```typescript
// src/lib/validation.ts (add to existing file)

export function validateCommentContent(content: string): {
  valid: boolean;
  error?: string
} {
  if (!content || !content.trim()) {
    return { valid: false, error: 'Content cannot be empty' };
  }

  if (content.length > 5000) {
    return { valid: false, error: 'Content must be less than 5000 characters' };
  }

  // Check for excessive repeated characters (potential DoS)
  if (/(.)\1{50,}/.test(content)) {
    return { valid: false, error: 'Content contains too many repeated characters' };
  }

  return { valid: true };
}

export function validateTargetId(targetId: string, targetType: string): {
  valid: boolean;
  error?: string;
  parsed?: number | string;
} {
  if (!targetId) {
    return { valid: false, error: 'Target ID is required' };
  }

  // For posts/movies/gallery, expect UUID format
  if (['post', 'gallery', 'movie', 'news'].includes(targetType)) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(targetId)) {
      return { valid: false, error: 'Invalid target ID format' };
    }
    return { valid: true, parsed: targetId };
  }

  return { valid: false, error: 'Invalid target type' };
}

export function validateTargetType(targetType: string): boolean {
  return ['post', 'gallery', 'movie', 'news'].includes(targetType);
}
```

**Apply validation**:
```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { targetType, targetId, content, parentId, authorName, authorPassword } = body;

  // Validate target type
  if (!validateTargetType(targetType)) {
    return NextResponse.json(
      { error: 'Invalid target type' },
      { status: 400 }
    );
  }

  // Validate target ID
  const targetValidation = validateTargetId(targetId, targetType);
  if (!targetValidation.valid) {
    return NextResponse.json(
      { error: targetValidation.error },
      { status: 400 }
    );
  }

  // Validate content
  const contentValidation = validateCommentContent(content);
  if (!contentValidation.valid) {
    return NextResponse.json(
      { error: contentValidation.error },
      { status: 400 }
    );
  }

  // ... rest of logic
}
```

---

### 9. TIMING ATTACK ON PASSWORD COMPARISON

**Location**: `route.ts` lines 174, 256 (bcrypt.compare)
**Risk Level**: MEDIUM
**CVSS Score**: 4.5

**Description**:
While bcrypt is secure, the application logic creates timing differences:

```typescript
// Line 149-157: Fetch takes variable time based on comment existence
const { data: comment, error: fetchError } = await supabase
  .from('comments')
  .select('user_id, author_password')
  .eq('id', commentId)
  .single();

if (fetchError || !comment) {
  return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  // ← Returns fast if comment doesn't exist
}

// Line 174: bcrypt.compare takes ~100ms
const passwordMatch = await bcrypt.compare(password, comment.author_password);
if (!passwordMatch) {
  return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
  // ← Returns slow if comment exists but password wrong
}
```

Attacker can measure response time:
- Fast response (~10ms) = Comment doesn't exist
- Slow response (~100ms) = Comment exists, password wrong
- Success (~150ms) = Comment exists, password correct

This allows **comment ID enumeration** and confirms which IDs have guest comments.

**Remediation**:

**Add constant-time delay to failed attempts**:
```typescript
// src/lib/timing.ts
export async function constantTimeDelay(minMs: number = 100) {
  const randomDelay = Math.random() * 50; // 0-50ms random
  await new Promise(resolve => setTimeout(resolve, minMs + randomDelay));
}

// In DELETE/PATCH endpoints:
const { data: comment, error: fetchError } = await supabase
  .from('comments')
  .select('user_id, author_password')
  .eq('id', commentId)
  .single();

if (fetchError || !comment) {
  await constantTimeDelay(100); // ← Add delay
  return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
}

// ... password verification ...

if (!passwordMatch) {
  await constantTimeDelay(100); // ← Add delay
  return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
}
```

**Better: Use generic error message**:
```typescript
// Don't distinguish between "not found" and "wrong password"
if (fetchError || !comment) {
  await constantTimeDelay(100);
  return NextResponse.json(
    { error: 'Invalid comment ID or password' }, // ← Generic message
    { status: 403 }
  );
}

if (!passwordMatch) {
  await constantTimeDelay(100);
  return NextResponse.json(
    { error: 'Invalid comment ID or password' }, // ← Same message
    { status: 403 }
  );
}
```

---

### 10. MISSING SECURITY HEADERS

**Location**: Next.js configuration
**Risk Level**: MEDIUM
**CVSS Score**: 4.0

**Description**:
No security headers are configured in Next.js, leaving application vulnerable to clickjacking, MIME sniffing, XSS, etc.

**Remediation**:

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Enable XSS filter (legacy browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js needs unsafe-eval
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## LOW Severity Findings

### 11. NO COMMENT EDIT HISTORY

**Risk Level**: LOW
**Description**: When comments are edited, previous versions are lost. No audit trail.

**Remediation**: Create `comment_history` table to store previous versions.

---

### 12. EXCESSIVE ERROR INFORMATION

**Location**: Multiple `console.error()` calls
**Risk Level**: LOW
**Description**: Error messages may leak database schema or system info in production logs.

**Remediation**:
```typescript
// Use generic errors for production
const errorMessage = process.env.NODE_ENV === 'production'
  ? 'An error occurred'
  : error.message;

return NextResponse.json({ error: errorMessage }, { status: 500 });
```

---

### 13. NO COMMENT DELETION CASCADE WARNING

**Risk Level**: LOW
**Description**: Deleting parent comment deletes all replies without warning user.

**Remediation**: Check for replies before deletion and show confirmation.

---

## Additional Security Recommendations

### 1. Implement Honeypot Field
Add hidden field to catch bots:
```typescript
<input
  type="text"
  name="website"
  style={{ display: 'none' }}
  tabIndex={-1}
  autoComplete="off"
/>

// In API: reject if honeypot filled
if (body.website) {
  return NextResponse.json({ error: 'Spam detected' }, { status: 400 });
}
```

### 2. Add Email Verification for Guests (Optional)
Instead of just name+password, use email+OTP for better accountability.

### 3. Implement Comment Moderation
- Flagging system
- Admin approval for first-time guest commenters
- Profanity filter

### 4. Add IP Logging (GDPR Compliant)
Log IP addresses (hashed) for abuse tracking:
```typescript
const ip = request.headers.get('x-forwarded-for') || 'unknown';
const hashedIp = crypto.createHash('sha256').update(ip).digest('hex');
```

### 5. Set Up Monitoring
- Alert on multiple failed password attempts
- Alert on unusual comment volume
- Monitor for XSS/SQL injection patterns

---

## Compliance Checklist

- [ ] **No hardcoded secrets** - ✅ Pass (uses env vars)
- [ ] **API keys encrypted at rest** - ⚠️ N/A (Supabase handles this)
- [ ] **All inputs validated** - ❌ FAIL (missing validation)
- [ ] **Secure communication (HTTPS)** - ✅ Pass (Supabase uses HTTPS)
- [ ] **Proper error handling** - ⚠️ Partial (leaks too much info)
- [ ] **Audit logging enabled** - ❌ FAIL (no audit logs)
- [ ] **Dependencies up-to-date** - ⚠️ Unknown (check with `npm audit`)
- [ ] **Rate limiting** - ❌ FAIL (none implemented)
- [ ] **XSS protection** - ❌ FAIL (no sanitization)
- [ ] **CSRF protection** - ❌ FAIL (none implemented)
- [ ] **Password security** - ⚠️ Partial (bcrypt good, but weak policy)

**Overall: 2/11 checks passing**

---

## Priority Fix Order

### IMMEDIATE (This Week)
1. **Fix #1**: Move password from URL to body in DELETE
2. **Fix #2**: Hide password hash from GET responses
3. **Fix #4**: Implement rate limiting (at least simple in-memory)

### HIGH PRIORITY (Next Week)
4. **Fix #3**: Add XSS sanitization
5. **Fix #5**: Implement password policy
6. **Fix #6**: Fix RLS policies + use service role for guest operations

### MEDIUM PRIORITY (This Month)
7. **Fix #7**: Add CSRF protection
8. **Fix #8**: Add input validation
9. **Fix #10**: Add security headers

### LOWER PRIORITY
10. Remaining LOW severity issues

---

## Testing Checklist

After implementing fixes, verify:

- [ ] Password never appears in URLs or logs
- [ ] `/api/comments` response doesn't include `author_password`
- [ ] Cannot make >3 delete attempts per minute
- [ ] Cannot use password "123456" or "password"
- [ ] Cannot post HTML/JavaScript in comments
- [ ] Cannot delete guest comment without correct password
- [ ] Cannot update comment via direct Supabase client call
- [ ] CSRF attack from external site fails
- [ ] All inputs validated (length, format, type)
- [ ] Security headers present in response

---

## Conclusion

The guest comment system has **critical security vulnerabilities** that must be addressed before production use. The most severe issues are:

1. Password exposure in URLs
2. Password hash leakage to all clients
3. No rate limiting enabling brute-force attacks

**Estimated fix time**: 16-24 hours for all CRITICAL + HIGH issues.

**Risk if unfixed**: Account takeover, comment vandalism, user data exposure, potential legal liability under GDPR/privacy laws.

**Recommendation**: Implement at least the IMMEDIATE fixes (#1, #2, #4) before allowing public guest comments.

---

**Security Audit Specialist**
Date: 2025-10-09
