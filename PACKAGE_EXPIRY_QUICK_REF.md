# Quick Reference: Package Expiry Middleware

## 🚀 Quick Start

### Add to Any Dashboard API Route

```javascript
// 1. Import the middleware
import { checkAndUpdatePackageExpiry } from '@/lib/middleware/packageExpiryCheck';

// 2. Use it after authentication
let user = await verifyUserAuth(request);
user = await checkAndUpdatePackageExpiry(user);

// 3. Check if plan is still active
if (!hasActivePaidPlan(user)) {
  return NextResponse.json({ 
    error: 'Paid plan required',
    requiresPaidPlan: true 
  }, { status: 403 });
}
```

## 📋 Complete Example

```javascript
import { NextResponse } from 'next/server';
import { verifyUserAuth, hasActivePaidPlan } from '@/lib/middleware/userAuth';
import { checkAndUpdatePackageExpiry } from '@/lib/middleware/packageExpiryCheck';

export async function GET(request) {
  try {
    // Authenticate user
    let user = await verifyUserAuth(request);
    
    // Check package expiry (auto-downgrades if expired)
    user = await checkAndUpdatePackageExpiry(user);
    
    // Validate access
    if (!hasActivePaidPlan(user)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Access denied. Please upgrade to a paid plan.',
          requiresPaidPlan: true 
        },
        { status: 403 }
      );
    }
    
    // Your API logic here
    return NextResponse.json({ success: true, data: yourData });
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## 🎯 When to Use

Use this middleware on endpoints that:
- ✅ Require paid plan access
- ✅ Are user-facing (not admin-only)
- ✅ Involve task/category/progress operations
- ✅ Need real-time subscription validation

## ⚡ Behavior

| User Type | Package | Expiry Status | Result |
|-----------|---------|---------------|--------|
| User | Basic/Plus | Expired | ⬇️ Downgrade to Free |
| User | Basic/Plus | Active | ✅ No change |
| User | Free | N/A | ⏩ Skip check |
| Admin | Any | Any | ⏩ Skip check |

## 📝 What It Does

1. **Checks** if user has USER role (skips admins)
2. **Validates** if package has expiry date
3. **Compares** expiry date with current date
4. **Downgrades** package to "free" if expired
5. **Saves** changes to database
6. **Returns** updated user object

## 🔍 Key Points

- ✨ Works per-request (no cron jobs)
- ✨ Only checks requesting user
- ✨ Automatically downgrades expired plans
- ✨ Fails safely (errors don't block requests)
- ✨ Logs all expiry events

## 📊 Testing

```bash
# Run automated tests
node scripts/testPackageExpiry.js
```

## 📚 Documentation

- Full docs: `PACKAGE_EXPIRY_MIDDLEWARE.md`
- Summary: `PACKAGE_EXPIRY_MIDDLEWARE_SUMMARY.md`

## 💡 Tips

- Always use `let` for user variable (it gets reassigned)
- Call middleware AFTER authentication
- Call middleware BEFORE access checks
- Admins bypass all checks automatically
