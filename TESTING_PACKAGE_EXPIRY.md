# Testing Guide: Package Expiry Date Feature

## Test Cases

### Test Case 1: Adding New Paid Package with Expiry Date
**Steps:**
1. Log in as admin
2. Navigate to Admin Dashboard > Home tab
3. Search for a user with a free package
4. Click "Manage" on the user
5. Click "Edit Package"
6. Select "Essential" package
7. Set expiry date to 3 months from today
8. Click "Save Changes"
9. Confirm the change

**Expected Result:**
- User package updates to "Essential"
- Package expiry date shows in user details
- Expiry date matches the selected date
- Success toast appears
- Paid user count increases by 1

---

### Test Case 2: Updating Expiry Date Only
**Steps:**
1. Search for a user with an existing paid package
2. Click "Manage"
3. Click "Edit Package"
4. Keep the same package selected
5. Change the expiry date to a different future date
6. Click "Save Changes"

**Expected Result:**
- Package remains the same
- Expiry date updates to new date
- Success toast appears
- Paid user count remains the same

---

### Test Case 3: Validation - Missing Expiry Date
**Steps:**
1. Search for a user
2. Click "Manage" > "Edit Package"
3. Select "Premium" package
4. Clear the expiry date field (if possible) or don't select a date
5. Click "Save Changes"

**Expected Result:**
- Error toast: "Please select an expiry date for paid packages"
- Changes are not saved
- User remains in edit mode

---

### Test Case 4: Validation - Past Date
**Steps:**
1. Search for a user
2. Click "Manage" > "Edit Package"
3. Select "Essential" package
4. Try to select today's date or a past date
5. Click "Save Changes"

**Expected Result:**
- Date picker prevents selecting past dates (min date is today)
- If somehow selected, error toast: "Expiry date must be in the future"
- Changes are not saved

---

### Test Case 5: Downgrade to Free Package
**Steps:**
1. Search for a user with a paid package
2. Click "Manage" > "Edit Package"
3. Select "Free" package
4. Click "Save Changes"

**Expected Result:**
- Date picker disappears (not needed for free package)
- Confirmation message appears
- User package updates to "Free"
- Package expiry date is cleared
- Paid user count decreases by 1

---

### Test Case 6: Change Package and Expiry Date Together
**Steps:**
1. Search for a user with "Essential" package
2. Click "Manage" > "Edit Package"
3. Change to "Premium" package
4. Set new expiry date to 1 year from today
5. Click "Save Changes"

**Expected Result:**
- Warning alert shows both changes
- Confirmation dialog mentions both package change and expiry date
- Both updates are applied
- Success toast appears
- Paid user count remains the same (still a paid user)

---

### Test Case 7: Cancel Edit Mode
**Steps:**
1. Search for a user
2. Click "Manage" > "Edit Package"
3. Change package and expiry date
4. Click "Cancel" instead of "Save Changes"

**Expected Result:**
- Edit mode closes
- No changes are saved
- User data remains unchanged
- No API calls made

---

### Test Case 8: No Changes Warning
**Steps:**
1. Search for a user
2. Click "Manage" > "Edit Package"
3. Don't change anything
4. Click "Save Changes"

**Expected Result:**
- Info toast: "No changes to save"
- Edit mode closes
- No API calls made

---

## API Testing

### Test API Endpoint Directly

**Valid Request (Essential Package):**
```bash
PATCH /api/admin/users/{userId}
{
  "package": "essential",
  "packageExpiresAt": "2026-01-25"
}
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "package": "essential",
    "packageExpiresAt": "2026-01-25T00:00:00.000Z",
    "packageActivatedAt": "2025-10-25T..."
  },
  "paidUserCount": 5
}
```

---

**Invalid Request (Missing Expiry Date):**
```bash
PATCH /api/admin/users/{userId}
{
  "package": "premium"
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Package expiry date is required for paid packages"
}
```

---

**Invalid Request (Past Date):**
```bash
PATCH /api/admin/users/{userId}
{
  "package": "essential",
  "packageExpiresAt": "2020-01-01"
}
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Expiry date must be in the future"
}
```

---

## Edge Cases to Test

1. **Leap Year Date**: Set expiry to Feb 29, 2028 (leap year)
2. **Very Far Future**: Set expiry to 10 years from now
3. **Timezone Handling**: Set expiry near midnight in different timezones
4. **Rapid Switching**: Quickly switch between packages and dates
5. **Network Error**: Disconnect internet before saving
6. **Multiple Admins**: Two admins editing same user simultaneously

---

## Browser Testing

Test in:
- Chrome/Edge (Chromium)
- Firefox
- Safari (if available)
- Mobile browsers (responsive design)

---

## Regression Testing

Ensure existing features still work:
- User search pagination
- User deletion (with active plan protection)
- Package badge colors
- Paid user count display
- Admin authentication
- Toast notifications
- Confirmation dialogs
