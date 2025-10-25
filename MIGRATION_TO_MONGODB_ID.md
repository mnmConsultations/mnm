# Migration to MongoDB _id System

## ⚠️ CRITICAL: Breaking Change

This migration removes custom ID generation and uses MongoDB's auto-generated `_id` for all CRUD operations on Categories and Tasks.

## 🎯 Problem Being Solved

**Current Issues:**
1. Custom ID generation from names causes conflicts when names change
2. Cascading updates needed when category names change
3. Complex ID synchronization across tasks and progress tracking
4. String-based IDs vs ObjectId references cause type mismatches
5. Manual ID generation prone to collisions

**Solution:**
Use MongoDB's built-in `_id` field (ObjectId) for all entity identification.

## 📊 Models Updated

### 1. Category Model
**BEFORE:**
```javascript
{
  id: String (unique, required, camelCase from displayName),
  name: String (same as id),
  displayName: String,
  // ...other fields
}
```

**AFTER:**
```javascript
{
  _id: ObjectId (MongoDB auto-generated),
  name: String (same as displayName),
  displayName: String,
  // ...other fields
}
```

### 2. Task Model
**BEFORE:**
```javascript
{
  id: String (unique, required, kebab-case from title),
  title: String,
  category: String (references Category.id),
  // ...other fields
}
```

**AFTER:**
```javascript
{
  _id: ObjectId (MongoDB auto-generated),
  title: String,
  category: ObjectId (references Category._id),
  // ...other fields
}
```

### 3. UserProgress Model
**BEFORE:**
```javascript
{
  completedTasks: [{
    taskId: String (references Task.id),
    completedAt: Date
  }],
  categoryProgress: {
    [categoryId: string]: Number
  }
}
```

**AFTER:**
```javascript
{
  completedTasks: [{
    taskId: ObjectId (references Task._id),
    completedAt: Date
  }],
  categoryProgress: {
    [categoryId: string]: Number  // Uses _id.toString()
  }
}
```

## 🔄 API Routes Changed

### Category Routes

#### `/api/admin/categories` (GET, POST)
- ✅ GET: No changes in response structure
- ✅ POST: Removed ID generation logic, uses MongoDB _id

#### `/api/admin/categories/[id]` (GET, PATCH, DELETE)
- ✅ GET: Uses `findById()` instead of `findOne({ id })`
- ✅ PATCH: Removed cascading ID update logic, direct update
- ✅ DELETE: Uses `findByIdAndDelete()` instead of `deleteOne({ id })`

#### `/api/dashboard/categories` (GET, POST)
- ✅ Updated to use _id

### Task Routes

#### `/api/admin/tasks` (GET, POST)
- 🚧 POST: Remove ID generation, update category reference to ObjectId
- 🚧 GET: Update to populate category properly

#### `/api/admin/tasks/[id]` (GET, PATCH, DELETE)
- 🚧 All methods: Use `findById()` and ObjectId references

#### `/api/dashboard/tasks` (GET)
- 🚧 Update to use ObjectId references and populate categories

### Progress Routes

#### `/api/dashboard/progress` (GET, PUT)
- 🚧 Update task ID comparisons to use ObjectId
- 🚧 Update category progress keys to use _id.toString()

## 📁 Frontend Components to Update

### Admin Dashboard
- 🚧 `components/dashboard/admin/AdminContentTab.jsx`
  - Update all `category.id` → `category._id`
  - Update all `task.id` → `task._id`
  - Update edit/delete handlers

### User Dashboard
- 🚧 `components/dashboard/HomeTab.jsx`
  - Update `category.id` → `category._id` for progress display
  
- 🚧 `components/dashboard/TasksTab.jsx`
  - Update `task.id` → `task._id` for completion tracking
  - Update `category.id` → `category._id` for filtering

## 🗄️ Database Migration Required

### Migration Script Needed

```javascript
// scripts/migrateToMongoId.js
// This script will:
// 1. Create backup of existing data
// 2. Update all category references in tasks
// 3. Update all task references in userProgress
// 4. Remove old 'id' fields from categories and tasks
```

### Migration Steps

1. **Backup Database** ⚠️ CRITICAL
   ```bash
   mongodump --uri="your_mongodb_uri" --out=./backup_before_id_migration
   ```

2. **Run Migration Script**
   ```bash
   node scripts/migrateToMongoId.js
   ```

3. **Verify Data Integrity**
   - Check all tasks have valid category ObjectId references
   - Check all userProgress has valid task ObjectId references
   - Check no orphaned references

4. **Test Thoroughly**
   - Create new category
   - Create new task
   - Complete task as user
   - Check progress calculations
   - Update category/task
   - Delete category/task

## ⚠️ Breaking Changes

### API Response Changes

**Category Response:**
```json
// Before
{
  "id": "beforeArrival",
  "_id": "507f1f77bcf86cd799439011",
  "name": "beforeArrival",
  "displayName": "Before Arrival"
}

// After
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Before Arrival",
  "displayName": "Before Arrival"
}
```

**Task Response:**
```json
// Before
{
  "id": "apply-for-visa",
  "_id": "507f191e810c19729de860ea",
  "category": "beforeArrival",
  "title": "Apply for Visa"
}

// After
{
  "_id": "507f191e810c19729de860ea",
  "category": "507f1f77bcf86cd799439011",  // ObjectId reference
  "title": "Apply for Visa"
}
```

### Frontend Code Changes

**Before:**
```javascript
// Category selection
setSelectedCategory(category.id);
fetchTasks(category.id);

// Task completion
handleTaskToggle(task.id, completed);

// Progress display
const progress = userProgress?.categoryProgress?.[category.id];
```

**After:**
```javascript
// Category selection
setSelectedCategory(category._id);
fetchTasks(category._id);

// Task completion
handleTaskToggle(task._id, completed);

// Progress display
const progress = userProgress?.categoryProgress?.[category._id];
```

## 📝 Files Modified (Current Status)

### ✅ Completed
1. `lib/models/category.model.js` - Removed custom id field
2. `lib/models/task.model.js` - Changed category to ObjectId reference
3. `lib/models/userProgress.model.js` - Changed taskId to ObjectId reference
4. `app/api/admin/categories/route.js` - Updated to use _id
5. `app/api/admin/categories/[id]/route.js` - Updated to use _id
6. `app/api/dashboard/categories/route.js` - Updated to use _id

### 🚧 Remaining
7. `app/api/admin/tasks/route.js`
8. `app/api/admin/tasks/[id]/route.js`
9. `app/api/admin/tasks/reorder/route.js`
10. `app/api/dashboard/tasks/route.js`
11. `app/api/dashboard/progress/route.js`
12. `components/dashboard/admin/AdminContentTab.jsx`
13. `components/dashboard/HomeTab.jsx`
14. `components/dashboard/TasksTab.jsx`
15. `lib/data/seedData.js`
16. `scripts/seedDatabase.js`

## 🧪 Testing Checklist

- [ ] Category CRUD operations work with _id
- [ ] Task CRUD operations work with _id
- [ ] Task-category relationship maintained
- [ ] Progress tracking works with ObjectId references
- [ ] Frontend displays categories correctly
- [ ] Frontend displays tasks correctly
- [ ] Completing tasks updates progress
- [ ] Category deletion prevents orphan tasks
- [ ] Seed data works without custom IDs

## 🚀 Deployment Plan

1. **Development Testing** (Current Phase)
   - Complete all code changes
   - Test locally with seed data
   - Verify all CRUD operations

2. **Create Migration Script**
   - Write data migration utility
   - Test on copy of production database
   - Document rollback procedure

3. **Staging Deployment**
   - Deploy changes to staging
   - Run migration script
   - Run full test suite
   - Verify with real-world scenarios

4. **Production Deployment**
   - Schedule maintenance window
   - Backup production database
   - Deploy code changes
   - Run migration script
   - Monitor for errors
   - Have rollback plan ready

## 🔙 Rollback Plan

If issues occur:
1. Stop application
2. Restore database from backup
3. Revert code to previous version
4. Restart application
5. Investigate issues

## 💡 Benefits After Migration

✅ **Simplified Code:** No custom ID generation logic  
✅ **Better Performance:** ObjectId indexes are optimized  
✅ **Data Integrity:** Built-in referential integrity with populate()  
✅ **No Name Conflicts:** Names can change without ID conflicts  
✅ **Standard Practice:** Follows MongoDB best practices  
✅ **Easier Debugging:** ObjectIds are unique and traceable  

---

**Status:** 🚧 IN PROGRESS (6/16 files updated)  
**Risk Level:** 🔴 HIGH (Breaking changes, database migration required)  
**Estimated Completion:** Need to complete remaining 10 files + migration script
