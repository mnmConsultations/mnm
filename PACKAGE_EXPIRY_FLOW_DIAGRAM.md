# Package Expiry Middleware - Visual Flow Diagram

## Overall System Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        USER REQUEST                          │
│                  (Access Tasks/Categories)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   API ENDPOINT HANDLER                       │
│              (e.g., /api/dashboard/tasks)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  STEP 1: AUTHENTICATION                      │
│                  verifyUserAuth(request)                     │
│                                                              │
│  • Check JWT token from cookie/header                       │
│  • Verify signature                                         │
│  • Fetch user from database                                 │
│  • Return user object                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           STEP 2: PACKAGE EXPIRY CHECK (NEW!)               │
│           checkAndUpdatePackageExpiry(user)                 │
│                                                              │
│  ┌──────────────────────────────────────┐                  │
│  │  Is user.role === 'admin'?           │                  │
│  └───┬──YES────────────────────NO───┬───┘                  │
│      │                               │                      │
│      ▼                               ▼                      │
│  ┌────────┐                   ┌──────────────┐             │
│  │ SKIP   │                   │ Is package   │             │
│  │ CHECK  │                   │ === 'free'?  │             │
│  └───┬────┘                   └──┬──YES──NO──┬┘            │
│      │                            │          │              │
│      │                            ▼          ▼              │
│      │                        ┌────────┐ ┌────────────┐    │
│      │                        │ SKIP   │ │ Has expiry │    │
│      │                        │ CHECK  │ │ date?      │    │
│      │                        └───┬────┘ └──┬──YES─NO─┬┘   │
│      │                            │         │         │     │
│      │                            │         ▼         ▼     │
│      │                            │   ┌──────────┐ ┌────┐  │
│      │                            │   │ Compare  │ │SKIP│  │
│      │                            │   │ dates    │ └─┬──┘  │
│      │                            │   └────┬─────┘   │     │
│      │                            │        │         │     │
│      │                            │     EXPIRED?     │     │
│      │                            │    ┌──┴──┐       │     │
│      │                            │   YES    NO      │     │
│      │                            │    │     │       │     │
│      │                            │    ▼     ▼       │     │
│      │                            │ ┌────┐ ┌────┐   │     │
│      │                            │ │DOWN│ │KEEP│   │     │
│      │                            │ │GRD │ │AS  │   │     │
│      │                            │ └──┬─┘ │IS  │   │     │
│      │                            │    │   └─┬──┘   │     │
│      └────────────────────────────┴────┴─────┴──────┘     │
│                         │                                  │
│                         ▼                                  │
│              Return updated user                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               STEP 3: ACCESS VALIDATION                      │
│               hasActivePaidPlan(user)                        │
│                                                              │
│  • Check if user.package !== 'free'                         │
│  • Check if user.packageExpiresAt > now                     │
│  • Return true/false                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────┴────┐
                    │         │
                   YES       NO
                    │         │
                    ▼         ▼
            ┌───────────┐ ┌──────────────┐
            │  ALLOW    │ │   DENY       │
            │  ACCESS   │ │   ACCESS     │
            │           │ │              │
            │  Return   │ │  Return 403  │
            │  Data     │ │  with        │
            │           │ │  upgrade     │
            │           │ │  prompt      │
            └───────────┘ └──────────────┘
```

## Middleware Decision Tree

```
                    checkAndUpdatePackageExpiry(user)
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  user.role === 'admin'? │
                    └────────┬────────────────┘
                            YES│    │NO
                    ┌───────────┘    └──────────┐
                    ▼                            ▼
            ┌──────────────┐          ┌───────────────────┐
            │ Return user  │          │ user.package ==   │
            │  (unchanged) │          │     'free'?       │
            └──────────────┘          └─────┬─────────────┘
                                           YES│    │NO
                                   ┌───────────┘    └──────────┐
                                   ▼                            ▼
                          ┌──────────────┐          ┌────────────────────┐
                          │ Return user  │          │ Has packageExpires │
                          │  (unchanged) │          │      At date?      │
                          └──────────────┘          └──────┬─────────────┘
                                                           YES│    │NO
                                                   ┌───────────┘    └──────┐
                                                   ▼                        ▼
                                        ┌─────────────────┐      ┌──────────────┐
                                        │ packageExpiresAt│      │ Return user  │
                                        │   < current     │      │  (unchanged) │
                                        │     date?       │      └──────────────┘
                                        └────┬────────────┘
                                        YES  │    │ NO
                                    ┌────────┘    └────────┐
                                    ▼                      ▼
                        ┌────────────────────┐   ┌──────────────┐
                        │ Downgrade:         │   │ Return user  │
                        │ • package = 'free' │   │  (unchanged) │
                        │ • clear dates      │   └──────────────┘
                        │ • save to DB       │
                        │ • log event        │
                        └──────┬─────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Return updated     │
                    │  user (downgraded)  │
                    └─────────────────────┘
```

## Database State Changes

### Before Middleware Execution
```
User Document:
{
  _id: "abc123",
  email: "user@example.com",
  role: "user",
  package: "basic",                    ← PAID PACKAGE
  packageActivatedAt: "2025-09-25",    ← HAS DATES
  packageExpiresAt: "2025-10-20"       ← EXPIRED!
}
```

### After Middleware Execution (If Expired)
```
User Document:
{
  _id: "abc123",
  email: "user@example.com",
  role: "user",
  package: "free",                     ← DOWNGRADED!
  packageActivatedAt: null,            ← CLEARED
  packageExpiresAt: null               ← CLEARED
}

Console Log:
"Package expired for user user@example.com. Downgrading to free plan."
"User user@example.com downgraded to free plan successfully."
```

## Integration Pattern in API Routes

### Code Pattern
```javascript
┌─────────────────────────────────────────────────────────────┐
│  export async function GET(request) {                       │
│    try {                                                    │
│      // STEP 1: Authenticate                               │
│      let user = await verifyUserAuth(request);             │
│                                                             │
│      // STEP 2: Check expiry (NEW MIDDLEWARE)              │
│      user = await checkAndUpdatePackageExpiry(user);       │
│                                                             │
│      // STEP 3: Validate access                            │
│      if (!hasActivePaidPlan(user)) {                       │
│        return NextResponse.json({                          │
│          error: 'Paid plan required',                      │
│          requiresPaidPlan: true                            │
│        }, { status: 403 });                                │
│      }                                                      │
│                                                             │
│      // STEP 4: Process request                            │
│      const data = await fetchData();                       │
│      return NextResponse.json({ success: true, data });    │
│                                                             │
│    } catch (error) {                                       │
│      return NextResponse.json({ error: error.message });   │
│    }                                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

## Timeline Example

```
Day 1 (Sept 25):  User purchases "Basic" package
                  ├─ packageActivatedAt: Sept 25, 2025
                  └─ packageExpiresAt: Oct 25, 2025

Day 20 (Oct 14):  User accesses tasks
                  ├─ Middleware: Check expiry (Oct 25 > Oct 14) ✓ Active
                  └─ Access: GRANTED

Day 30 (Oct 24):  User accesses tasks  
                  ├─ Middleware: Check expiry (Oct 25 > Oct 24) ✓ Active
                  └─ Access: GRANTED

Day 31 (Oct 25):  User accesses tasks at 11:59 PM
                  ├─ Middleware: Check expiry (Oct 25 >= Oct 25)
                  ├─ Note: Depends on exact time
                  └─ Access: May expire

Day 32 (Oct 26):  User accesses tasks
                  ├─ Middleware: Check expiry (Oct 25 < Oct 26) ✗ EXPIRED!
                  ├─ Action: Auto-downgrade to "free"
                  ├─ Database: package = "free", dates cleared
                  └─ Access: DENIED (403 with upgrade prompt)
```

## Comparison: Before vs After

### Before Implementation
```
User with expired package → Accesses tasks → Still gets access ❌
(No expiry checking)        (No validation)   (Unauthorized access)
```

### After Implementation
```
User with expired package → Middleware checks → Auto-downgrade → Access denied ✓
(Package expired)           (Detects expiry)    (Save to DB)     (403 response)
                                                                  (Upgrade prompt)
```

## Error Handling Flow

```
Middleware Execution
       │
       ▼
   Try Block
       │
    ┌──┴──┐
    │     │
  Error   No Error
    │     │
    ▼     ▼
 Catch  Return
 Block  Updated
    │    User
    ▼
  Log Error
    │
    ▼
 Return Original
    User
 (Fail-Safe)
```

## Performance Optimization Points

```
┌─────────────────────────────────────┐
│  Request Received                   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Early Exit 1: Admin Role           │  ← Skip check immediately
│  if (role === 'admin') return user  │  ← No DB operations
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Early Exit 2: Free Package         │  ← Skip check immediately
│  if (package === 'free') return     │  ← No DB operations
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Early Exit 3: No Expiry Date       │  ← Skip check immediately
│  if (!packageExpiresAt) return      │  ← No DB operations
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Date Comparison (Fast)             │  ← Native JS comparison
│  currentDate > expiryDate ?         │  ← No DB query
└────────────┬────────────────────────┘
             │
          ┌──┴──┐
         YES    NO
          │     │
          ▼     ▼
  ┌──────────┐ ┌─────────────┐
  │ DB Save  │ │ Return user │  ← No DB write
  │ (1 write)│ │ (no change) │
  └──────────┘ └─────────────┘
```

## Success Indicators

```
✓ No database scans
✓ Only 1 user checked per request
✓ Maximum 1 database write per request
✓ 3 early exit points for optimization
✓ Fail-safe error handling
✓ Comprehensive logging
✓ No blocking of legitimate requests
```
