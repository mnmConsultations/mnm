# Next.js 15 Dynamic Params Fix

## Issue
Next.js 15 requires that dynamic route `params` must be awaited before accessing their properties.

## Error Message
```
Error: Route "/api/admin/tasks/[id]" used `params.id`. `params` should be awaited before using its properties.
```

## Root Cause
In Next.js 15, the `params` object in dynamic routes is now a Promise and must be awaited. This is a breaking change from Next.js 14.

## Files Fixed

### 1. `/app/api/admin/tasks/[id]/route.js`
**Functions Updated:** GET, PATCH, DELETE

**Before:**
```javascript
export async function GET(req, { params }) {
  const taskId = params.id;
  // ...
}
```

**After:**
```javascript
export async function GET(req, { params }) {
  const { id: taskId } = await params;
  // ...
}
```

### 2. `/app/api/admin/categories/[id]/route.js`
**Functions Updated:** GET, PATCH, DELETE

**Before:**
```javascript
export async function PATCH(req, { params }) {
  const categoryId = params.id;
  // ...
}
```

**After:**
```javascript
export async function PATCH(req, { params }) {
  const { id: categoryId } = await params;
  // ...
}
```

### 3. `/app/api/admin/categories/[id]/order/route.js`
**Function Updated:** PATCH

**Before:**
```javascript
export async function PATCH(req, { params }) {
  const categoryId = params.id;
  // ...
}
```

**After:**
```javascript
export async function PATCH(req, { params }) {
  const { id: categoryId } = await params;
  // ...
}
```

### 4. `/app/api/admin/tasks/[id]/order/route.js`
**Function Updated:** PATCH

**Before:**
```javascript
export async function PATCH(req, { params }) {
  const taskId = params.id;
  // ...
}
```

**After:**
```javascript
export async function PATCH(req, { params }) {
  const { id: taskId } = await params;
  // ...
}
```

## Pattern Used
We use destructuring with await for clean, idiomatic code:

```javascript
const { id: variableName } = await params;
```

This is equivalent to:
```javascript
const awaitedParams = await params;
const variableName = awaitedParams.id;
```

## Additional Fix: Mongoose Duplicate Index Warning

### Issue
```
Warning: Duplicate schema index on {"createdAt":1} found. This is often due to declaring an index using both "index: true" and "schema.index()".
```

### File Fixed: `/lib/models/notification.model.js`

**Before:**
```javascript
createdAt: {
  type: Date,
  default: Date.now,
  expires: 604800, // Creates an implicit index
},
// ...
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 }); // Explicit index
```

**After:**
```javascript
createdAt: {
  type: Date,
  default: Date.now,
  // Removed 'expires' property
},
// ...
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 }); // Single explicit TTL index
```

The `expires` property on the field creates an implicit TTL index, which conflicts with the explicit index definition. We removed the field-level `expires` and kept only the explicit index.

## Testing
✅ All dynamic route operations working:
- GET /api/admin/tasks/[id]
- PATCH /api/admin/tasks/[id]
- DELETE /api/admin/tasks/[id]
- PATCH /api/admin/tasks/[id]/order
- GET /api/admin/categories/[id]
- PATCH /api/admin/categories/[id]
- DELETE /api/admin/categories/[id]
- PATCH /api/admin/categories/[id]/order

✅ No more Mongoose duplicate index warning

## Resources
- [Next.js 15 Dynamic APIs Documentation](https://nextjs.org/docs/messages/sync-dynamic-apis)
- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)

## Date
Fixed: October 25, 2025
