# Dynamic Progress Bar Fix

## Issue Description

The progress bar in the user dashboard's Home Tab was not showing correct progress for newly created categories. Even though tasks in new categories were being marked as complete (showing 100% in the Tasks tab), the Home Tab displayed 0% progress for those categories.

## Root Cause

The progress calculation system was hardcoded to only handle 4 specific categories:
- `beforeArrival`
- `uponArrival`
- `firstWeeks`
- `ongoing`

When admins created new categories with different IDs (based on their `displayName`), the progress calculation system ignored them because:

1. **UserProgress Model** - Had a strict schema that only allowed the 4 hardcoded category fields
2. **Progress API** - Only calculated progress for the 4 hardcoded categories, ignoring any new ones

## Files Modified

### 1. `lib/models/userProgress.model.js`
**Change:** Made `categoryProgress` field dynamic using `Schema.Types.Mixed`

**Before:**
```javascript
categoryProgress: {
  beforeArrival: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  uponArrival: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  firstWeeks: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  ongoing: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
}
```

**After:**
```javascript
categoryProgress: {
  type: Schema.Types.Mixed,
  default: {},
}
```

**Impact:** Now `categoryProgress` can store any number of categories with any category ID.

### 2. `app/api/dashboard/progress/route.js`
**Changes:**
- Added import for `Category` model
- Made progress calculation dynamic by fetching all active categories
- Applied changes to both `GET` and `PUT` endpoints

**Key Changes:**

#### GET Endpoint - Initial Progress Creation
```javascript
// Before: Hardcoded 4 categories
categoryProgress: {
  beforeArrival: 0,
  uponArrival: 0,
  firstWeeks: 0,
  ongoing: 0
}

// After: Dynamic categories from database
const categories = await Category.find({ isActive: true });
const categoryProgress = {};
categories.forEach(cat => {
  categoryProgress[cat.id] = 0;
});
```

#### GET Endpoint - Progress Recalculation on Fetch
Added automatic recalculation when fetching progress to ensure it's always up-to-date with current categories:
```javascript
// Recalculate progress to ensure it's up-to-date with current tasks and categories
const allTasks = await Task.find({ isActive: true });
const categories = await Category.find({ isActive: true });

// Calculate overall progress
const totalTasks = allTasks.length;
const completedCount = userProgress.completedTasks.length;
userProgress.overallProgress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

// Calculate progress for each category
const categoryProgress = {};
categories.forEach(category => {
  const categoryTasks = allTasks.filter(task => task.category === category.id);
  const completedCategoryTasks = userProgress.completedTasks.filter(completed => 
    categoryTasks.some(task => task.id === completed.taskId)
  );
  
  categoryProgress[category.id] = categoryTasks.length > 0 ? 
    Math.round((completedCategoryTasks.length / categoryTasks.length) * 100) : 0;
});

userProgress.categoryProgress = categoryProgress;
await userProgress.save();
```

#### PUT Endpoint - Progress Recalculation on Task Update
```javascript
// Before: Hardcoded category list
const categories = ['beforeArrival', 'uponArrival', 'firstWeeks', 'ongoing'];

for (const category of categories) {
  const categoryTasks = allTasks.filter(task => task.category === category);
  // ...
  userProgress.categoryProgress[category] = categoryProgress;
}

// After: Dynamic categories from database
const categories = await Category.find({ isActive: true });
const categoryProgress = {};

for (const category of categories) {
  const categoryTasks = allTasks.filter(task => task.category === category.id);
  const completedCategoryTasks = userProgress.completedTasks.filter(completed => 
    categoryTasks.some(task => task.id === completed.taskId)
  );
  
  categoryProgress[category.id] = categoryTasks.length > 0 ? 
    Math.round((completedCategoryTasks.length / categoryTasks.length) * 100) : 0;
}

userProgress.categoryProgress = categoryProgress;
```

## How It Works Now

1. **Category Creation:** When admin creates a new category, it gets a unique ID based on its display name
2. **Task Assignment:** Tasks can be assigned to any category (including new ones)
3. **Progress Tracking:** 
   - When user completes a task, the PUT endpoint recalculates progress for ALL active categories
   - When user views progress (GET endpoint), it recalculates to ensure sync with current categories
4. **Display:** HomeTab and TasksTab dynamically read progress using `userProgress.categoryProgress[category.id]`

## Benefits

✅ **Fully Dynamic:** No more hardcoded category limits  
✅ **Auto-Sync:** Progress automatically updates when categories are added/removed  
✅ **Backward Compatible:** Existing categories and progress still work  
✅ **Real-time Updates:** Progress recalculates on every fetch to stay current  
✅ **Scalable:** Can support unlimited categories  

## Testing Checklist

- [x] New categories show correct progress (0% when no tasks completed)
- [x] Completing tasks in new categories updates progress correctly
- [x] Overall progress includes tasks from all categories
- [x] Old categories (beforeArrival, etc.) still work correctly
- [x] Progress persists across page refreshes
- [x] HomeTab displays all categories with correct progress
- [x] TasksTab shows correct progress per category

## Migration Notes

**Existing Data:** 
- Old user progress records with hardcoded categories will be automatically updated on next fetch
- The GET endpoint now recalculates and saves progress with all current categories
- No manual migration needed - happens automatically when users access dashboard

**New Users:**
- Will get progress initialized with all active categories at 0%

## Related Files (No Changes Needed)

These files already use dynamic category IDs and work correctly:
- `components/dashboard/HomeTab.jsx` - Uses `userProgress?.categoryProgress?.[category.id]`
- `components/dashboard/TasksTab.jsx` - Uses `userProgress?.categoryProgress?.[category.id]`
