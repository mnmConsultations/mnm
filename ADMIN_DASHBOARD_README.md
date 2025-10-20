# Admin Dashboard Documentation

## Overview
The Admin Dashboard provides comprehensive tools for managing users and content in the M&M Consultants platform.

## Features

### Home Tab
The Home Tab provides user management capabilities:

#### Paid User Count
- Displays the total number of users with active paid plans (Basic or Plus)
- Stored in a separate `Stats` model to avoid querying all users
- Updates automatically when user packages are changed

#### User Search & Management
- **Search by Email**: Find users by their email address (case-insensitive, partial match supported)
- **View User Details**: See complete user information including:
  - Name and email
  - Current package (Free, Basic, Plus)
  - Package expiration date
  - Account status

#### Package Management
- **Change User Package**: Upgrade or downgrade users between Free, Basic, and Plus plans
- When changing to a paid package:
  - `packageActivatedAt` is set to current date
  - `packageExpiresAt` is set to 1 year from activation
- When changing to Free:
  - Package dates are cleared
  - Paid user count is decremented

#### User Deletion
- **Delete User**: Remove users from the system
- **Protection**: Cannot delete users with active paid plans
- Active plan check: Package is not "free" AND expiration date is in the future
- Requires confirmation before deletion

---

### Content Management Tab
The Content Tab provides CRUD operations for categories and tasks:

#### Category Management

**Constraints:**
- **Maximum**: 6 categories
- **Minimum**: 1 category (cannot delete the last category)
- **Display Name**: Maximum 50 characters
- **ID**: Auto-generated from display name (camelCase format)
- **Unique**: Each category must have a unique ID/name

**Features:**
- Create new categories with:
  - Display name
  - Description
  - Icon identifier
  - Color (hex color picker)
  - Estimated time frame
- Edit existing categories (all fields except MongoDB `_id`)
- Delete categories (only if no tasks exist in the category)
- Reorder categories using up/down arrows
- View task count per category

**ID Generation:**
When you create or update a category with display name "Upon Arrival", the system generates:
- `id`: "uponArrival" (camelCase)
- `name`: "uponArrival" (same as id)

#### Task Management

**Constraints:**
- **Maximum**: 12 tasks per category
- **Minimum**: 1 task per category (cannot delete the last task in a category)
- **Title**: Maximum 50 characters
- **Description**: Maximum 800 characters
- **ID**: Auto-generated from title (kebab-case format)
- **Unique**: Each task must have a unique ID

**Features:**
- Create new tasks with:
  - Title
  - Rich text description (HTML content)
  - Category assignment
  - Difficulty level (Easy, Medium, Hard)
  - Estimated duration
  - Tips (array of strings)
  - Requirements (array of strings)
  - External links (array of objects)
- Edit existing tasks (all fields except MongoDB `_id`)
- Delete tasks (respecting minimum constraint)
- Reorder tasks within their category using up/down arrows
- Filter tasks by category

**Rich Text Editor:**
- Based on Tiptap editor (React 19 compatible)
- Supports:
  - Text formatting: Bold, Italic, Strikethrough
  - Headings: H2, H3, H4
  - Lists: Bullet and numbered lists
  - Blockquotes
  - Links (with URL prompt)
  - Horizontal rules
  - Undo/Redo
- Output stored as HTML in the database
- User-friendly interface (no markdown knowledge required)

**ID Generation:**
When you create or update a task with title "Find accommodation", the system generates:
- `id`: "find-accommodation" (kebab-case)

If a task with that ID exists, it appends a number: "find-accommodation-1", "find-accommodation-2", etc.

---

## Security

### Admin Authentication Middleware
All admin API routes are protected by the `verifyAdminAuth` middleware:

**Location**: `lib/middleware/adminAuth.js`

**How it works:**
1. Extracts JWT token from cookies
2. Verifies token using JWT_SECRET
3. Finds user in database
4. Checks if user role is "admin"
5. Returns user object or throws error

**Protected Routes:**
- `/api/admin/paid-users` - GET paid user count
- `/api/admin/users/search` - GET search users
- `/api/admin/users/[id]` - DELETE user, PATCH update package
- `/api/admin/categories` - GET all, POST create
- `/api/admin/categories/[id]` - GET one, PATCH update, DELETE
- `/api/admin/categories/[id]/order` - PATCH reorder
- `/api/admin/tasks` - GET all, POST create
- `/api/admin/tasks/[id]` - GET one, PATCH update, DELETE
- `/api/admin/tasks/[id]/order` - PATCH reorder

**Error Responses:**
- 401: No authentication token
- 403: Not an admin user
- 404: Resource not found
- 400: Validation error
- 500: Server error

---

## Database Models

### User Model Updates
Added fields to existing User model:
```javascript
{
  package: {
    type: String,
    enum: ["free", "basic", "plus"],
    default: "free"
  },
  packageActivatedAt: {
    type: Date
  },
  packageExpiresAt: {
    type: Date
  }
}
```

### Stats Model (New)
Singleton model for storing aggregate statistics:
```javascript
{
  _id: "global-stats", // Fixed ID
  paidUserCount: Number,
  lastUpdated: Date
}
```

### Category Model
```javascript
{
  id: String (unique, camelCase from displayName),
  name: String (same as id),
  displayName: String (max 50 chars),
  description: String,
  icon: String,
  color: String (hex),
  order: Number,
  isActive: Boolean,
  estimatedTimeFrame: String
}
```

### Task Model
```javascript
{
  id: String (unique, kebab-case from title),
  title: String (max 50 chars),
  description: String (HTML content, max 800 chars),
  category: String (references Category.id),
  order: Number,
  isRequired: Boolean,
  estimatedDuration: String,
  difficulty: String (easy/medium/hard),
  externalLinks: Array,
  tips: Array of Strings,
  requirements: Array of Strings,
  isActive: Boolean
}
```

---

## API Endpoints

### User Management

#### GET /api/admin/paid-users
Get count of paid users
- Response: `{ success: true, paidUserCount: 0 }`

#### GET /api/admin/users/search?email={email}
Search users by email
- Query param: `email` (optional, returns empty array if not provided)
- Response: `{ success: true, users: [...] }`

#### DELETE /api/admin/users/[id]
Delete a user
- Validates: User exists, no active plan
- Response: `{ success: true, message: "User deleted successfully" }`

#### PATCH /api/admin/users/[id]
Update user package
- Body: `{ package: "free" | "basic" | "plus" }`
- Updates package dates automatically
- Updates paid user count
- Response: `{ success: true, user: {...}, paidUserCount: 0 }`

### Category Management

#### GET /api/admin/categories
Get all categories
- Response: `{ success: true, categories: [...] }`

#### POST /api/admin/categories
Create new category
- Body: `{ displayName, description, icon, color, estimatedTimeFrame }`
- Validates: Max 6 categories, unique name, max 50 chars
- Response: `{ success: true, category: {...} }`

#### GET /api/admin/categories/[id]
Get single category
- Response: `{ success: true, category: {...} }`

#### PATCH /api/admin/categories/[id]
Update category
- Body: Any category fields
- Handles ID changes if displayName changes
- Response: `{ success: true, category: {...} }`

#### DELETE /api/admin/categories/[id]
Delete category
- Validates: Not last category, no tasks
- Response: `{ success: true, message: "..." }`

#### PATCH /api/admin/categories/[id]/order
Reorder category
- Body: `{ newOrder: number }`
- Response: `{ success: true, category: {...}, categories: [...] }`

### Task Management

#### GET /api/admin/tasks?category={categoryId}
Get all tasks or filter by category
- Query param: `category` (optional)
- Response: `{ success: true, tasks: [...] }`

#### POST /api/admin/tasks
Create new task
- Body: `{ title, description, category, estimatedDuration, difficulty, externalLinks, tips, requirements }`
- Validates: Required fields, max 12 per category, category exists, title max 50 chars, description max 800 chars
- Response: `{ success: true, task: {...} }`

#### GET /api/admin/tasks/[id]
Get single task
- Response: `{ success: true, task: {...} }`

#### PATCH /api/admin/tasks/[id]
Update task
- Body: Any task fields
- Handles ID changes if title changes
- Validates category change constraints
- Response: `{ success: true, task: {...} }`

#### DELETE /api/admin/tasks/[id]
Delete task
- Validates: Not last task in category
- Response: `{ success: true, message: "..." }`

#### PATCH /api/admin/tasks/[id]/order
Reorder task within category
- Body: `{ newOrder: number }`
- Response: `{ success: true, task: {...}, tasks: [...] }`

---

## Usage Instructions

### Accessing the Admin Dashboard
1. Navigate to `/dashboard/admin`
2. You must be logged in with an admin role
3. Non-admin users are redirected to `/dashboard/user`
4. Non-authenticated users are redirected to `/auth/signin`

### Managing Users
1. Click on the "Home" tab
2. View the paid user count at the top
3. Search for users by typing email in the search box
4. Click "Manage" on any user to:
   - View full details
   - Change their package
   - Delete their account (if no active plan)

### Managing Categories
1. Click on the "Content Management" tab
2. Ensure "Categories" view is selected
3. Click "+ Add Category" to create new (max 6)
4. Use up/down arrows to reorder categories
5. Click "Edit" to modify category details
6. Click "Delete" to remove (only if no tasks)

### Managing Tasks
1. Click on the "Content Management" tab
2. Select "Tasks" view
3. Choose a category from the filter buttons
4. Click "+ Add Task" to create new (max 12 per category)
5. Use the rich text editor for task descriptions
6. Add tips and requirements (one per line)
7. Use up/down arrows to reorder tasks
8. Click "Edit" to modify task details
9. Click "Delete" to remove (respecting minimum)

---

## Technical Notes

### Rich Text Editor
- Component: `components/RichTextEditor.jsx`
- Library: Tiptap with StarterKit, Link, and Placeholder extensions
- Dynamically imported to avoid SSR issues
- Outputs clean HTML for storage

### ID Generation Logic
- Categories: camelCase (e.g., "Upon Arrival" → "uponArrival")
- Tasks: kebab-case with uniqueness check (e.g., "Find Accommodation" → "find-accommodation")
- IDs are immutable in database but get regenerated when names change

### Order Management
- Categories and tasks have `order` field
- Reordering shifts other items' orders automatically
- Order is 1-indexed
- Items are always displayed sorted by order

### Package Expiration
- Paid packages expire 1 year from activation
- Expiration is checked when attempting to delete users
- Expired packages don't prevent deletion

---

## Future Enhancements
- Bulk user operations
- Export user data
- Category icons from icon library
- Task templates
- Revision history for content
- Analytics dashboard
- Email notifications for package changes
