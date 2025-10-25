# Package Expiry Middleware Implementation

## Overview

This document describes the automatic package expiry checking middleware that validates user subscriptions on each request. The middleware automatically downgrades users from paid plans to free plans when their subscription expires.

## Key Features

✅ **User-Specific**: Only applies to users with the "user" role (admins are skipped)  
✅ **Request-Based**: Checks expiry on individual user requests, NOT a database-wide scan  
✅ **Automatic Downgrade**: Automatically converts expired paid plans to free plans  
✅ **Non-Blocking**: Errors in the middleware don't block legitimate requests  
✅ **Efficient**: Only processes users with paid packages that have expiry dates

## Implementation

### Core Middleware File
**Location**: `lib/middleware/packageExpiryCheck.js`

### Main Functions

#### 1. `checkAndUpdatePackageExpiry(user)`

The core middleware function that checks and updates package status.

**Logic Flow**:
1. Check if user has "user" role (skip if admin)
2. Check if user has a paid package (skip if already free)
3. Check if package has an expiry date
4. Compare expiry date with current date
5. If expired:
   - Downgrade package to "free"
   - Clear `packageActivatedAt` and `packageExpiresAt` fields
   - Save changes to database
   - Log the downgrade
6. Return updated user object

**Parameters**:
- `user` (Object): Authenticated user object from `verifyUserAuth`

**Returns**: 
- Updated user object (with downgraded package if expired)

**Example**:
```javascript
const user = await verifyUserAuth(request);
const updatedUser = await checkAndUpdatePackageExpiry(user);

if (!hasActivePaidPlan(updatedUser)) {
  return NextResponse.json({ error: 'Paid plan required' }, { status: 403 });
}
```

#### 2. `verifyAuthAndCheckExpiry(req, verifyUserAuth)`

Convenience function combining authentication and expiry checking.

**Parameters**:
- `req` (Request): Next.js request object
- `verifyUserAuth` (Function): Authentication verification function

**Returns**:
- Authenticated and package-validated user object

## Integration Points

The middleware is integrated into the following API endpoints:

### 1. Tasks API
**File**: `app/api/dashboard/tasks/route.js`  
**Endpoints**: 
- `GET /api/dashboard/tasks` - Fetch all tasks

**Implementation**:
```javascript
let user = await verifyUserAuth(request);
user = await checkAndUpdatePackageExpiry(user);

if (!hasActivePaidPlan(user)) {
  return NextResponse.json({ 
    error: 'Access denied. Please upgrade to a paid plan to access tasks.',
    requiresPaidPlan: true 
  }, { status: 403 });
}
```

### 2. Categories API
**File**: `app/api/dashboard/categories/route.js`  
**Endpoints**: 
- `GET /api/dashboard/categories` - Fetch all categories

**Implementation**:
```javascript
let user = await verifyUserAuth(request);
user = await checkAndUpdatePackageExpiry(user);

if (!hasActivePaidPlan(user)) {
  return NextResponse.json({ 
    error: 'Access denied. Please upgrade to a paid plan to access categories.',
    requiresPaidPlan: true 
  }, { status: 403 });
}
```

### 3. User Progress API
**File**: `app/api/dashboard/progress/route.js`  
**Endpoints**: 
- `GET /api/dashboard/progress` - Fetch user progress
- `PUT /api/dashboard/progress` - Update task completion

**Implementation**:
```javascript
// GET endpoint
let user = await getUserFromToken(request);
user = await checkAndUpdatePackageExpiry(user);

// PUT endpoint (with additional check)
let user = await getUserFromToken(request);
user = await checkAndUpdatePackageExpiry(user);

if (!hasActivePaidPlan(user)) {
  return NextResponse.json({ 
    error: 'Access denied. Your plan has expired. Please upgrade to continue.',
    requiresPaidPlan: true 
  }, { status: 403 });
}
```

## User Experience Flow

### Scenario: User with Expired Package

1. **User Action**: User clicks on "Tasks" tab in dashboard
2. **API Request**: Frontend sends `GET /api/dashboard/tasks`
3. **Middleware Execution**:
   - Verify user authentication ✓
   - Check package expiry
   - Detect: `packageExpiresAt` (Oct 20, 2025) < Current Date (Oct 25, 2025)
   - Update: `package` = "free", clear expiry dates
   - Save to database
4. **Access Check**: `hasActivePaidPlan(user)` returns `false`
5. **Response**: 403 Forbidden with `requiresPaidPlan: true`
6. **Frontend**: Shows upgrade prompt to user

### Scenario: User with Active Package

1. **User Action**: User clicks on "Tasks" tab in dashboard
2. **API Request**: Frontend sends `GET /api/dashboard/tasks`
3. **Middleware Execution**:
   - Verify user authentication ✓
   - Check package expiry
   - Detect: `packageExpiresAt` (Nov 30, 2025) > Current Date (Oct 25, 2025)
   - No changes needed
4. **Access Check**: `hasActivePaidPlan(user)` returns `true`
5. **Response**: 200 OK with tasks data
6. **Frontend**: Displays tasks normally

### Scenario: Admin User

1. **User Action**: Admin accesses tasks
2. **API Request**: Frontend sends `GET /api/dashboard/tasks`
3. **Middleware Execution**:
   - Verify user authentication ✓
   - Check role: "admin"
   - **Skip expiry check** (middleware returns user immediately)
4. **Response**: Access granted (admins bypass paywall)

## Database Schema

The middleware relies on these User model fields:

```javascript
{
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  package: {
    type: String,
    enum: ["free", "basic", "plus"],
    default: "free"
  },
  packageActivatedAt: {
    type: Date,
  },
  packageExpiresAt: {
    type: Date,
  }
}
```

## Logging

The middleware logs important events:

```javascript
// On expiry detection and downgrade
console.log(`Package expired for user ${user.email}. Downgrading to free plan.`);

// On successful downgrade
console.log(`User ${user.email} downgraded to free plan successfully.`);

// On errors
console.error('Error in checkAndUpdatePackageExpiry:', error);
```

## Error Handling

The middleware is designed to be **fail-safe**:

- If an error occurs during the expiry check, it returns the original user object
- This prevents the middleware from blocking legitimate requests due to unexpected errors
- Errors are logged for monitoring and debugging

```javascript
try {
  // ... expiry check logic
} catch (error) {
  console.error('Error in checkAndUpdatePackageExpiry:', error);
  return user; // Return original user on error
}
```

## Testing Scenarios

### Test Case 1: Expired Package Downgrade

**Setup**:
```javascript
const user = {
  _id: "user123",
  email: "test@example.com",
  role: "user",
  package: "basic",
  packageActivatedAt: new Date("2025-09-25"),
  packageExpiresAt: new Date("2025-10-20")
};
```

**Current Date**: October 25, 2025

**Expected Result**:
- User package downgraded to "free"
- `packageActivatedAt` set to `null`
- `packageExpiresAt` set to `null`
- Changes saved to database
- Console log: "Package expired for user test@example.com. Downgrading to free plan."

### Test Case 2: Active Package (No Change)

**Setup**:
```javascript
const user = {
  _id: "user456",
  email: "active@example.com",
  role: "user",
  package: "plus",
  packageActivatedAt: new Date("2025-10-01"),
  packageExpiresAt: new Date("2025-11-30")
};
```

**Current Date**: October 25, 2025

**Expected Result**:
- No changes to user object
- User returned as-is
- No console logs

### Test Case 3: Admin User (Skip Check)

**Setup**:
```javascript
const user = {
  _id: "admin789",
  email: "admin@example.com",
  role: "admin",
  package: "basic",
  packageExpiresAt: new Date("2025-09-01") // Already expired
};
```

**Current Date**: October 25, 2025

**Expected Result**:
- Middleware skips check (admin role)
- No changes to user object
- User returned immediately

### Test Case 4: Free User (Skip Check)

**Setup**:
```javascript
const user = {
  _id: "free123",
  email: "free@example.com",
  role: "user",
  package: "free",
  packageActivatedAt: null,
  packageExpiresAt: null
};
```

**Expected Result**:
- Middleware skips check (already free)
- No database operations
- User returned as-is

## Performance Considerations

1. **No Database Scans**: The middleware only checks the current requesting user, never scans all users
2. **Conditional Processing**: Skips checks for admins and free users immediately
3. **Single Database Write**: Only writes to database when downgrade is necessary
4. **Efficient Date Comparison**: Uses native JavaScript Date comparison

## Future Enhancements

Potential improvements for future versions:

1. **Email Notifications**: Send email when package expires
2. **Grace Period**: Add a grace period before downgrading
3. **Expiry Warnings**: Notify users before expiry (e.g., 7 days, 3 days, 1 day)
4. **Auto-Renewal**: Support for automatic subscription renewal
5. **Analytics**: Track package expiry events for business intelligence

## Related Files

- `lib/models/user.model.js` - User schema definition
- `lib/middleware/userAuth.js` - Authentication middleware and `hasActivePaidPlan` function
- `app/api/dashboard/tasks/route.js` - Tasks API with middleware integration
- `app/api/dashboard/categories/route.js` - Categories API with middleware integration
- `app/api/dashboard/progress/route.js` - Progress API with middleware integration

## Support

For questions or issues related to this middleware, please refer to:
- `AUTH_SETUP.md` - Authentication system documentation
- `PACKAGE_EXPIRY_UPDATE.md` - Package expiry system overview
- `TESTING_PACKAGE_EXPIRY.md` - Testing procedures for expiry features
