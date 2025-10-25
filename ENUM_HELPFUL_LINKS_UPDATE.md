# Enum Time Estimates & Helpful Links Feature

## Overview
This update adds:
1. **Enum-based time estimates** for categories and tasks (replacing free-text input)
2. **Helpful links feature** for tasks with clickable buttons for users

## 1. Enum Time Estimates

### Category: Estimated Time Frame
**7 predefined options:**
- Before departure
- First week
- First month
- 1-3 months
- 3-6 months
- 6+ months
- Ongoing

**Implementation:**
- Model: `lib/models/category.model.js`
- Admin UI: Dropdown in `AdminContentTab.jsx`
- API Validation: `app/api/admin/categories/route.js` and `[id]/route.js`

### Task: Estimated Duration
**10 predefined options:**
- 15-30 minutes
- 30-60 minutes
- 1-2 hours
- 2-4 hours
- Half day
- Full day
- 2-3 days
- 1 week
- 2-4 weeks
- 1-2 months

**Implementation:**
- Model: `lib/models/task.model.js`
- Admin UI: Dropdown in `AdminContentTab.jsx`
- API Validation: `app/api/admin/tasks/route.js` and `[id]/route.js`

## 2. Helpful Links Feature

### Data Structure
Tasks can have two types of links:

1. **External Links (Legacy)**: Original field from seed data
2. **Helpful Links (New)**: Additional field for more resources

Both have the same structure:
```javascript
{
  title: String,      // max 100 chars, e.g., "Official Guide"
  url: String,        // max 500 chars, full URL
  description: String // max 200 chars, optional brief description
}
```

**Note:** Both `externalLinks` and `helpfulLinks` can coexist on a task. This allows for:
- `externalLinks`: Official/primary resources (from seed data)
- `helpfulLinks`: Additional helpful resources added later

### Admin Features
**Location:** `AdminContentTab.jsx` - Task Edit Form

**Capabilities:**
- Manage both External Links and Helpful Links separately
- Add multiple links of each type per task
- Remove individual links
- Edit title, URL, and description for each link
- Real-time validation (maxLength constraints)

**UI Components:**
- Two separate sections: "External Links (Legacy)" and "Helpful Links"
- "Add External Link" and "Add Helpful Link" buttons
- Card-based layout for each link
- Individual remove buttons
- Input fields with character limits

### User Experience
**Location:** `TasksTab.jsx` - Task Details Section

**Display:**
- **External Links** shown under "� External Links" heading
- **Helpful Links** shown under "�🔗 Helpful Resources" heading
- Each link displayed in a card with:
  - Clickable button with title
  - External link icon
  - Optional description below button
- Opens in new tab (`target="_blank"`)
- Secure with `rel="noopener noreferrer"`

**Visual Distinction:**
- External Links use primary button style
- Both sections show description when available
- Clear separation between the two link types

## 3. Technical Implementation

### Database Models

#### Category Model
```javascript
estimatedTimeFrame: {
  type: String,
  enum: ['Before departure', 'First week', 'First month', '1-3 months', 
         '3-6 months', '6+ months', 'Ongoing']
}
```

#### Task Model
```javascript
estimatedDuration: {
  type: String,
  enum: ['15-30 minutes', '30-60 minutes', '1-2 hours', '2-4 hours', 
         'Half day', 'Full day', '2-3 days', '1 week', '2-4 weeks', '1-2 months']
},
helpfulLinks: [{
  title: { type: String, maxlength: 100 },
  url: { type: String, maxlength: 500 },
  description: { type: String, maxlength: 200 }
}]
```

### API Validation

#### Category Endpoints
**POST `/api/admin/categories`:**
- Validates `estimatedTimeFrame` against enum values
- Returns 400 error if invalid value provided

**PATCH `/api/admin/categories/[id]`:**
- Same validation as POST
- Only validates if `estimatedTimeFrame` is being updated

#### Task Endpoints
**POST `/api/admin/tasks`:**
- Validates `estimatedDuration` against enum values
- Validates `helpfulLinks` array structure:
  - Each link must have `title` and `url`
  - Validates field length constraints
  - Ensures valid URL format

**PATCH `/api/admin/tasks/[id]`:**
- Same validation as POST
- Includes validation in both:
  - Regular update flow
  - Task recreation flow (when title changes)

### UI Components

#### Admin Panel Updates
**Category Form:**
```jsx
<select className="select select-bordered" value={estimatedTimeFrame}>
  <option value="">Select time frame</option>
  <option value="Before departure">Before departure</option>
  <!-- ... other options ... -->
</select>
```

**Task Form:**
```jsx
<select className="select select-bordered" value={estimatedDuration}>
  <option value="">Select duration</option>
  <option value="15-30 minutes">15-30 minutes</option>
  <!-- ... other options ... -->
</select>

<!-- Helpful Links Management -->
<div className="form-control">
  {helpfulLinks.map((link, index) => (
    <div className="card bg-base-200 p-4 mb-3">
      <input placeholder="Title" maxLength={100} />
      <input type="url" placeholder="URL" maxLength={500} />
      <input placeholder="Description" maxLength={200} />
      <button onClick={removeLink}>Remove</button>
    </div>
  ))}
  <button onClick={addLink}>+ Add Helpful Link</button>
</div>
```

#### User Dashboard Updates
**TasksTab.jsx:**
```jsx
{task.helpfulLinks && task.helpfulLinks.length > 0 && (
  <div>
    <h5>🔗 Helpful Resources:</h5>
    {task.helpfulLinks.map((link, index) => (
      <div className="card bg-base-200 p-3">
        <a href={link.url} target="_blank" rel="noopener noreferrer">
          <svg><!-- External link icon --></svg>
          {link.title}
        </a>
        {link.description && <p>{link.description}</p>}
      </div>
    ))}
  </div>
)}
```

## 4. Benefits

### For Admins
- **Consistency:** Standardized time estimates across all content
- **Efficiency:** Dropdown selection faster than typing
- **No Typos:** Enum validation prevents mistakes
- **Rich Links:** Can provide context with link descriptions

### For Users
- **Clarity:** Consistent time frame terminology
- **Quick Access:** One-click access to helpful resources
- **Context:** Link descriptions help users understand relevance
- **Professional:** Clean, organized presentation of external resources

## 5. Migration Notes

### Existing Data
- Old free-text `estimatedTimeFrame` and `estimatedDuration` values will remain
- Admins should update existing entries to use new enum values
- No automatic migration needed - enum validation only applies to new/updated records

### Backward Compatibility
- Existing tasks without `helpfulLinks` display normally
- Empty `helpfulLinks` array is valid
- No breaking changes to existing functionality

## 6. Usage Examples

### Admin: Adding Helpful Links
1. Edit a task in AdminContentTab
2. Scroll to "Helpful Links" section
3. Click "+ Add Helpful Link"
4. Enter:
   - Title: "Government Immigration Portal"
   - URL: "https://immigration.govt.example"
   - Description: "Official resource for visa applications"
5. Add more links as needed
6. Save task

### User: Accessing Resources
1. Open task in TasksTab
2. Expand task details
3. Scroll to "🔗 Helpful Resources"
4. Click any link button
5. Resource opens in new tab

## 7. Files Modified

### Models
- `lib/models/category.model.js` - Added `estimatedTimeFrame` enum
- `lib/models/task.model.js` - Added `estimatedDuration` enum and `helpfulLinks` array

### API Routes
- `app/api/admin/categories/route.js` - Added enum validation for POST
- `app/api/admin/categories/[id]/route.js` - Added enum validation for PATCH
- `app/api/admin/tasks/route.js` - Added enum and helpfulLinks validation for POST
- `app/api/admin/tasks/[id]/route.js` - Added enum and helpfulLinks validation for PATCH

### UI Components
- `components/dashboard/admin/AdminContentTab.jsx`:
  - Changed text inputs to dropdowns for time estimates
  - Added helpful links management UI
- `components/dashboard/TasksTab.jsx`:
  - Added helpful links display section

## 8. Testing Checklist

### Category Time Frame
- [ ] Create new category with enum time frame
- [ ] Update existing category time frame
- [ ] Try invalid enum value (should fail)
- [ ] Verify dropdown displays all 7 options

### Task Duration
- [ ] Create new task with enum duration
- [ ] Update existing task duration
- [ ] Try invalid enum value (should fail)
- [ ] Verify dropdown displays all 10 options

### Helpful Links
- [ ] Add single helpful link to task
- [ ] Add multiple helpful links to task
- [ ] Edit link title, URL, description
- [ ] Remove individual links
- [ ] Save task with links
- [ ] Update task while preserving links
- [ ] Verify links display in user TasksTab
- [ ] Click link - should open in new tab
- [ ] Test with/without description
- [ ] Verify character limits enforced (100/500/200)

### Edge Cases
- [ ] Task with no helpful links displays normally
- [ ] Empty helpful link (only URL) validates correctly
- [ ] Invalid URL format rejected
- [ ] Links preserved during task title change (ID regeneration)

## 9. Future Enhancements

### Potential Improvements
1. **Link Analytics:** Track which links users click most
2. **Link Validation:** Periodic checks for broken links
3. **Link Categories:** Group links by type (official, community, tools)
4. **User Contributions:** Allow users to suggest helpful links
5. **Multilingual Support:** Localize time frame/duration labels
6. **Custom Enums:** Allow admins to add custom time options

---

**Status:** ✅ Fully Implemented
**Date:** 2024
**Version:** 1.0
