# Notification System Documentation

## Overview

A comprehensive notification system that automatically notifies users when admins make changes to tasks or categories. The system intelligently manages notifications to prevent spam while keeping users informed.

## Key Features

### 1. **Automatic Notifications**
- Triggers when admin creates, updates, or deletes tasks or categories
- All regular users (non-admins) receive notifications
- No manual notification creation required

### 2. **Smart Notification Merging**
- Prevents multiple notifications for rapid edits
- Merges notifications made within 5-minute window
- Example: If admin edits task 3 times in 2 minutes, users get 1 notification

### 3. **7-Day TTL (Time To Live)**
- Notifications automatically expire after 7 days
- MongoDB TTL index handles cleanup automatically
- No database bloat from old notifications

### 4. **Read Status Management**
- Based on `lastNotificationReadAt` timestamp in User model
- When user opens dashboard, all notifications are marked as read
- New notifications since last visit show as unread
- No per-notification "mark as read" needed

### 5. **Zero Manual Marking**
- Users cannot mark individual notifications as read/unread
- All notifications up to dashboard open time are considered read
- Only new notifications since last dashboard visit show as unread

## Architecture

### Database Schema

#### User Model
```javascript
{
  // ... existing fields
  lastNotificationReadAt: {
    type: Date,
    default: null
  }
}
```

#### Notification Model
```javascript
{
  userId: ObjectId,
  title: String,
  message: String,
  type: 'info' | 'success' | 'warning' | 'error' | 'update',
  isRead: Boolean,
  priority: 'low' | 'medium' | 'high',
  metadata: {
    entityType: 'task' | 'category',
    entityId: String,
    action: 'created' | 'updated' | 'deleted',
    changes: [String] // e.g., ['title', 'description']
  },
  createdAt: Date (expires after 7 days)
}
```

#### Indexes
- `userId + createdAt` - Fast retrieval
- `userId + isRead` - Unread filtering
- `metadata.entityType + metadata.entityId + metadata.action` - Duplicate detection
- `createdAt` with TTL - Auto-expiry after 7 days

### Service Layer

**Location:** `lib/services/notification.service.js`

**Key Functions:**

```javascript
// Create or update notification for entity change
notifyEntityChange({
  entityType: 'task' | 'category',
  entityId: string,
  action: 'created' | 'updated' | 'deleted',
  entityName: string,
  changes: string[]
})
```

**Smart Merging Logic:**
1. Check for notification about same entity+action within last 5 minutes
2. If found: Update existing notification with merged changes
3. If not found: Create new notification

### API Integration

#### Admin Task APIs
**Files:**
- `app/api/admin/tasks/route.js` (POST)
- `app/api/admin/tasks/[id]/route.js` (PATCH, DELETE)

**Integration:**
```javascript
// After successful task creation
await notifyEntityChange({
  entityType: 'task',
  entityId: task.id,
  action: 'created',
  entityName: task.title
});

// After task update (with change tracking)
await notifyEntityChange({
  entityType: 'task',
  entityId: taskId,
  action: 'updated',
  entityName: task.title,
  changes: ['title', 'description', 'difficulty']
});

// After task deletion
await notifyEntityChange({
  entityType: 'task',
  entityId: taskId,
  action: 'deleted',
  entityName: taskTitle
});
```

#### Admin Category APIs
**Files:**
- `app/api/admin/categories/route.js` (POST)
- `app/api/admin/categories/[id]/route.js` (PATCH, DELETE)

**Same pattern as tasks**

#### Notification Retrieval API
**File:** `app/api/dashboard/notifications/route.js`

**GET /api/dashboard/notifications**

Query Parameters:
- `limit` (default: 10) - Number of notifications
- `unreadOnly` (true/false) - Filter unread only

**Behavior:**
1. Fetches notifications for current user
2. Calculates read status based on `lastNotificationReadAt`
3. Updates `lastNotificationReadAt` to current time
4. Returns notifications with computed `isRead` status
5. Returns unread count

Response:
```javascript
{
  success: true,
  data: {
    notifications: [...],
    unreadCount: 5,
    lastReadAt: '2025-10-25T12:00:00Z'
  }
}
```

### UI Components

#### NotificationBell Component
**Location:** `components/dashboard/NotificationBell.jsx`

**Features:**
- Bell icon with unread count badge
- Dropdown notification list
- Auto-fetches on dropdown open
- Color-coded icons by notification type
- Relative time display (e.g., "2h ago")

**Usage:**
```jsx
import NotificationBell from '@/components/dashboard/NotificationBell';

// In user dashboard header
<NotificationBell />
```

#### HomeTab Integration
**Location:** `components/dashboard/HomeTab.jsx`

**Features:**
- Displays recent notifications in main dashboard
- Read/unread visual distinction
- Alert styling by notification type
- Empty state for no notifications

## Notification Flow

### Creation Flow
1. Admin creates/updates/deletes task or category
2. API endpoint calls `notifyEntityChange()`
3. Service checks for recent similar notifications (5-min window)
4. Either merges with existing or creates new notification
5. Notification saved with 7-day TTL

### Read Flow
1. User opens dashboard
2. Dashboard fetches notifications via API
3. API updates user's `lastNotificationReadAt` to current time
4. API computes `isRead` based on notification `createdAt` vs `lastNotificationReadAt`
5. Returns notifications with read status
6. UI shows unread badge and styling

### Expiry Flow
1. MongoDB TTL index monitors `createdAt` field
2. Automatically deletes notifications older than 7 days
3. No manual cleanup needed

## Example Scenarios

### Scenario 1: Admin Rapid Edits
```
T+0:00 - Admin updates task "Register Address" (title)
T+0:30 - Admin updates same task (description)
T+1:00 - Admin updates same task (difficulty)

Result: Users see 1 notification with changes: "title, description, difficulty"
```

### Scenario 2: User Dashboard Visit
```
Last visit: Oct 24, 10:00 AM
Notifications created:
- Oct 24, 9:00 AM - Task created (WILL BE READ)
- Oct 24, 11:00 AM - Category updated (WAS UNREAD, NOW READ)
- Oct 25, 8:00 AM - Task deleted (UNREAD)

User opens dashboard Oct 25, 9:00 AM:
- All notifications up to 9:00 AM marked as read
- Only notifications after 9:00 AM will be unread next visit
```

### Scenario 3: 7-Day Expiry
```
Oct 18 - Notification created
Oct 25 - Still visible (6 days old)
Oct 26 - Automatically deleted by MongoDB
```

## Testing

### Manual Testing Steps

1. **Test Notification Creation:**
   - Login as admin
   - Create a new task
   - Login as user
   - Check notification bell for new notification

2. **Test Notification Merging:**
   - Login as admin
   - Edit same task 3 times within 2 minutes
   - Login as user
   - Should see 1 notification, not 3

3. **Test Read Status:**
   - Login as user, note notification count
   - Close/reopen dashboard
   - All previous notifications should be read
   - Create new notification (via admin)
   - Only new notification should be unread

4. **Test TTL (requires waiting):**
   - Create notification
   - Wait 7 days
   - Notification should auto-delete

### Database Queries

**Check notifications:**
```javascript
db.notifications.find({ userId: ObjectId('...') }).sort({ createdAt: -1 })
```

**Check user's last read time:**
```javascript
db.users.findOne({ email: 'user@example.com' }, { lastNotificationReadAt: 1 })
```

**Check for duplicates (should find merges):**
```javascript
db.notifications.find({
  'metadata.entityType': 'task',
  'metadata.entityId': 'some-task-id',
  'metadata.action': 'updated',
  createdAt: { $gte: new Date(Date.now() - 10*60*1000) }
})
```

## Performance Considerations

1. **Indexes:** All queries are indexed for fast retrieval
2. **TTL:** Automatic cleanup prevents database bloat
3. **Batching:** Creates notifications for all users in batch
4. **Async:** Notification creation doesn't block main API flow
5. **Caching:** Frontend caches notification count

## Future Enhancements

Potential improvements (not currently implemented):

1. **Email Notifications:** Send email digest of unread notifications
2. **Push Notifications:** Browser push for real-time updates
3. **Notification Preferences:** Let users choose notification types
4. **Category Filters:** Filter notifications by type (tasks only, categories only)
5. **Search:** Search notification history
6. **Export:** Download notification history

## Troubleshooting

### Notifications Not Appearing
- Check user role (only 'user' role receives notifications)
- Verify admin API calls include notification service import
- Check browser console for API errors
- Verify MongoDB TTL index is created

### Duplicate Notifications
- Check 5-minute merge window is working
- Verify metadata fields are populated correctly
- Check for timing issues in rapid succession

### Read Status Not Updating
- Verify `lastNotificationReadAt` is updating in User model
- Check API is being called on dashboard load
- Verify timezone/date calculations

### Old Notifications Not Deleting
- Check MongoDB TTL index exists: `db.notifications.getIndexes()`
- TTL runs every 60 seconds, may have delay
- Verify `createdAt` field exists and is Date type

## Migration Notes

If upgrading from previous notification system:

1. **Add User field:**
   ```javascript
   db.users.updateMany({}, { $set: { lastNotificationReadAt: null } })
   ```

2. **Update Notification schema:**
   - Add `metadata` field
   - Add TTL index on `createdAt`

3. **Remove old PATCH endpoint:**
   - No longer need individual mark-as-read functionality

4. **Update frontend:**
   - Remove mark-as-read button code
   - Update notification fetching logic
