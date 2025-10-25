# Notification System Quick Reference

## For Developers

### Adding Notifications to New Admin Actions

If you add new admin functionality that should notify users, follow this pattern:

```javascript
// 1. Import the service
import { notifyEntityChange } from '@/lib/services/notification.service';

// 2. After your successful database operation, call:
await notifyEntityChange({
  entityType: 'task',        // or 'category'
  entityId: task.id,         // the entity's ID
  action: 'created',         // 'created', 'updated', or 'deleted'
  entityName: task.title,    // user-friendly name
  changes: ['title', 'desc'] // optional: list of changed fields
});
```

### Change Tracking Example

```javascript
// Track changes before updating
const changes = [];
if (newTitle !== oldTitle) changes.push('title');
if (newDesc !== oldDesc) changes.push('description');
if (newDifficulty !== oldDifficulty) changes.push('difficulty');

// Include in notification
await notifyEntityChange({
  entityType: 'task',
  entityId: taskId,
  action: 'updated',
  entityName: newTitle,
  changes: changes  // This will appear in notification message
});
```

## For Admins

### When You'll See Notifications Sent

Users are automatically notified when you:

**Tasks:**
- ✅ Create a new task
- ✅ Update any task details (title, description, difficulty, etc.)
- ✅ Delete a task

**Categories:**
- ✅ Create a new category
- ✅ Update category details (name, description, icon, etc.)
- ✅ Delete a category

**Multiple Quick Edits:**
- If you edit the same task/category multiple times within 5 minutes
- Users will receive 1 merged notification instead of multiple

## For Users

### How Notifications Work

1. **Bell Icon** - Shows unread count badge
2. **Click Bell** - See recent notifications in dropdown
3. **Open Dashboard** - All notifications automatically marked as read
4. **New Notifications** - Only those created since your last dashboard visit show as unread

### Notification Types

- 🟢 **Green (Success)** - New task/category added
- 🔵 **Blue (Update)** - Task/category modified
- 🟡 **Yellow (Warning)** - Task/category removed
- ℹ️ **Info** - General information

### Auto-Expiry

- Notifications automatically delete after 7 days
- Keeps your notification list clean and relevant

## API Endpoints

### GET /api/dashboard/notifications

Fetch user's notifications

**Query Parameters:**
- `limit` (optional, default: 10) - Number to return
- `unreadOnly` (optional, default: false) - Filter only unread

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "unreadCount": 5,
    "lastReadAt": "2025-10-25T12:00:00Z"
  }
}
```

**Side Effect:** Updates user's `lastNotificationReadAt` timestamp

### POST /api/dashboard/notifications

Create notification (typically not used directly - use service instead)

**Request Body:**
```json
{
  "title": "Notification Title",
  "message": "Notification message",
  "type": "info",
  "priority": "medium"
}
```

## Database Fields

### User Model
```javascript
lastNotificationReadAt: Date  // When user last opened dashboard
```

### Notification Model
```javascript
{
  userId: ObjectId,
  title: String,
  message: String,
  type: 'info' | 'success' | 'warning' | 'error' | 'update',
  isRead: Boolean,  // Computed, not stored
  priority: 'low' | 'medium' | 'high',
  metadata: {
    entityType: 'task' | 'category',
    entityId: String,
    action: 'created' | 'updated' | 'deleted',
    changes: [String]
  },
  createdAt: Date  // Auto-expires after 7 days
}
```

## UI Components

### NotificationBell
```jsx
import NotificationBell from '@/components/dashboard/NotificationBell';

<NotificationBell />
```

**Features:**
- Shows unread count
- Dropdown notification list
- Auto-refreshes on open
- Relative time display

### HomeTab Notifications Section
Already integrated - displays notifications in user dashboard home tab

## Configuration

### Merge Window
Change in `lib/services/notification.service.js`:
```javascript
const mergeWindow = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes
```

### TTL Duration
Change in `lib/models/notification.model.js`:
```javascript
expires: 604800  // 7 days in seconds (7 * 24 * 60 * 60)
```

## Troubleshooting

### Users Not Receiving Notifications
1. Check user role is 'user' not 'admin'
2. Verify `notifyEntityChange()` is being called
3. Check browser console for errors
4. Verify MongoDB connection

### Notifications Not Expiring
1. Check TTL index exists: `db.notifications.getIndexes()`
2. TTL background task runs every 60 seconds
3. Verify `createdAt` field is Date type

### Duplicate Notifications
1. Verify 5-minute merge window is working
2. Check metadata fields are identical for merging
3. Review rapid succession timing

## Best Practices

✅ **DO:**
- Call `notifyEntityChange()` after successful DB operations
- Track specific changes for updated entities
- Use descriptive entity names
- Let the service handle notification text generation

❌ **DON'T:**
- Create notifications manually in database
- Call notification service before DB operation succeeds
- Modify notification service without understanding merge logic
- Remove TTL index (causes database bloat)

## Testing Checklist

- [ ] Create task → Users receive notification
- [ ] Update task → Users receive notification with changes
- [ ] Delete task → Users receive notification
- [ ] Multiple quick edits → Users receive 1 merged notification
- [ ] Open dashboard → Unread count resets to 0
- [ ] New notification → Shows as unread
- [ ] Notification bell → Shows unread count badge
- [ ] Click bell → Dropdown shows notifications
- [ ] 7 days pass → Old notifications auto-delete

## Common Patterns

### Admin Action with Notification
```javascript
export async function POST(request) {
  try {
    await verifyAdminAuth(request);
    
    // Your admin logic
    const task = await Task.create({...});
    
    // Notify users
    await notifyEntityChange({
      entityType: 'task',
      entityId: task.id,
      action: 'created',
      entityName: task.title
    });
    
    return NextResponse.json({ success: true, task });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### Fetching Notifications in Component
```javascript
const fetchNotifications = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/dashboard/notifications?limit=10', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  setNotifications(data.data.notifications);
  setUnreadCount(data.data.unreadCount);
};
```

## Support

For issues or questions:
1. Check NOTIFICATION_SYSTEM_README.md for detailed documentation
2. Review implementation in NOTIFICATION_IMPLEMENTATION_SUMMARY.md
3. Examine service code in `lib/services/notification.service.js`
