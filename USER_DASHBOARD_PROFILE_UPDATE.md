# User Dashboard Profile Update

## Overview
Enhanced the user dashboard profile card to display package expiry information and centered the profile picture for better visual presentation.

## Changes Made

### Component: `components/dashboard/HomeTab.jsx`

#### 1. Centered Profile Picture
- **Before**: Profile picture was left-aligned within the card
- **After**: 
  - Wrapped all content in a flex column container with center alignment
  - Increased profile picture size from `w-16 lg:w-20` to `w-20 lg:w-24`
  - Increased text size from `text-xl lg:text-2xl` to `text-2xl lg:text-3xl`
  - Added `mx-auto` class to ensure horizontal centering
  - Better visual hierarchy and prominence

#### 2. Added Package Expiry Information
Added a new section showing:
- **Current Package**: Badge displaying package type (Free/Essential/Premium)
- **Expiry Date**: Shows when the package expires (for paid packages only)
- **Status Indicator**: Visual indicator showing if package is Active (✓) or Expired (✗)

**Visual Design:**
- Package badge uses color coding:
  - Free: `badge-ghost` (gray)
  - Essential: `badge-info` (blue)
  - Premium: `badge-success` (green)
- Status indicator uses semantic colors:
  - Active: Green text with checkmark (✓)
  - Expired: Red text with X mark (✗)

#### 3. Layout Improvements
- Reorganized card layout with better spacing
- Reduced divider margin (`my-2` instead of default)
- Made "Edit Profile" button full-width (`w-full`) for better mobile experience
- All text elements centered for consistent alignment

## UI/UX Improvements

### Before:
```
┌─────────────────┐
│   👤 (left)     │
│ Name (left)     │
│ Email (left)    │
│ ───────────     │
│ Edit Profile    │
└─────────────────┘
```

### After:
```
┌─────────────────┐
│      👤         │  (larger, centered)
│     Name        │
│     Email       │
│   Plan: BADGE   │
│ Expires: Date   │
│   ✓ Active      │
│ ───────────     │
│ Edit Profile    │  (full width)
└─────────────────┘
```

## Conditional Rendering

The package expiry information is conditionally displayed:
- **Always shows**: Package badge
- **Only shows if exists**: Expiry date and status indicator
- Free users won't see expiry information (as they don't have expiry dates)

## Code Example

```jsx
{/* Package Information */}
<div className="mt-2 mb-3 w-full">
    <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
            <span className="text-xs lg:text-sm text-base-content/70">Plan:</span>
            <span className={`badge ${
                user.package === 'free' ? 'badge-ghost' :
                user.package === 'essential' ? 'badge-info' :
                'badge-success'
            }`}>
                {user.package?.toUpperCase() || 'FREE'}
            </span>
        </div>
        
        {user.packageExpiresAt && (
            <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-base-content/60">
                    Expires: {new Date(user.packageExpiresAt).toLocaleDateString()}
                </span>
                <span className={`text-xs font-medium ${
                    new Date(user.packageExpiresAt) > new Date() 
                        ? 'text-success' 
                        : 'text-error'
                }`}>
                    {new Date(user.packageExpiresAt) > new Date() 
                        ? '✓ Active' 
                        : '✗ Expired'
                    }
                </span>
            </div>
        )}
    </div>
</div>
```

## User Benefits

1. **Quick Package Status Check**: Users can immediately see their package status without navigating elsewhere
2. **Expiry Awareness**: Clear visibility of when their package will expire, helping them plan renewals
3. **Better Visual Hierarchy**: Centered profile creates a more professional and polished look
4. **Mobile Responsive**: All elements scale appropriately on different screen sizes

## Display Examples

### Example 1: Active Essential Package
```
Plan: [ESSENTIAL]
Expires: 01/25/2026
✓ Active
```

### Example 2: Expired Premium Package
```
Plan: [PREMIUM]
Expires: 09/15/2025
✗ Expired
```

### Example 3: Free Package
```
Plan: [FREE]
(No expiry information shown)
```

## Responsive Design

- **Mobile (< lg)**: Smaller text sizes, compact spacing
- **Desktop (≥ lg)**: Larger text sizes, comfortable spacing
- **All breakpoints**: Centered alignment maintained

## Testing Checklist

- [x] Profile picture is centered on all screen sizes
- [x] Package badge displays with correct colors
- [x] Expiry date shows in localized format
- [x] Active/Expired status shows correct indicator
- [x] Free users don't see expiry information
- [x] Edit Profile button is full width and centered
- [x] Responsive layout works on mobile and desktop
- [x] No layout shifts or overflow issues

## Browser Compatibility

- Chrome/Edge ✓
- Firefox ✓
- Safari ✓
- Mobile browsers ✓

## Notes

- Date formatting uses browser's locale (`.toLocaleDateString()`)
- Status check uses simple date comparison
- Package badge defaults to "FREE" if package is undefined
- All changes are purely visual - no API modifications needed
