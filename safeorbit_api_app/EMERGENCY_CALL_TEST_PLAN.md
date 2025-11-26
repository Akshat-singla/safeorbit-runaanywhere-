# Emergency Call Feature - Test Plan

## Test Environment Setup

### Prerequisites

- Device with phone capability (or emulator)
- SafeOrbit app installed and running
- Test phone numbers ready (non-emergency numbers for testing)
- Cellular or VoIP service enabled

### Test Data

- Valid test numbers:
    - 10 digits: `1234567890`
    - With country code: `+11234567890`
    - Formatted: `+1 (123) 456-7890`
- Invalid test numbers:
    - Too short: `12345`
    - Too long: `12345678901234567890`
    - Letters: `abcd1234567`

---

## Test Suite 1: Emergency Actions Screen

### Test 1.1: Screen Access from Home

**Objective**: Verify users can access Emergency Actions from home screen

**Steps**:

1. Open the app
2. Navigate to Home tab
3. Locate "Quick Actions" section
4. Find "🚨 Emergency Actions" button (should be red)
5. Tap the button

**Expected Result**:

- ✅ Button is visible and prominent (red, large)
- ✅ Navigation to Emergency Actions screen occurs
- ✅ No errors or crashes

**Status**: [ ] Pass [ ] Fail

---

### Test 1.2: Screen Access from Tab Navigation

**Objective**: Verify users can access Emergency Actions from bottom tabs

**Steps**:

1. Open the app
2. Look at bottom navigation tabs
3. Find "Actions" tab with phone icon
4. Tap the tab

**Expected Result**:

- ✅ "Actions" tab is visible
- ✅ Phone icon is displayed
- ✅ Emergency Actions screen loads
- ✅ No errors or crashes

**Status**: [ ] Pass [ ] Fail

---

### Test 1.3: Fire Emergency Button (101)

**Objective**: Verify Fire Emergency button functionality

**Steps**:

1. Navigate to Emergency Actions screen
2. Locate "🚨 Call Fire Emergency" button (red)
3. Tap the button
4. Verify confirmation dialog appears
5. Tap "Cancel"
6. Tap button again
7. Tap "Call Now"

**Expected Result**:

- ✅ Button is large, red with red border
- ✅ Contains fire emoji and icon
- ✅ Confirmation dialog shows "Are you sure you want to call Fire Emergency (101)?"
- ✅ Cancel dismisses dialog
- ✅ Call Now opens phone dialer with 101
- ✅ iOS uses `telprompt:101`, Android uses `tel:101`

**Status**: [ ] Pass [ ] Fail

---

### Test 1.4: Ambulance Button (102)

**Objective**: Verify Ambulance button functionality

**Steps**:

1. Navigate to Emergency Actions screen
2. Locate "🏥 Call Ambulance" button (green)
3. Tap the button
4. Verify confirmation dialog appears
5. Tap "Call Now"

**Expected Result**:

- ✅ Button is large, green with green border
- ✅ Contains ambulance emoji and HeartPulse icon
- ✅ Confirmation dialog shows "Are you sure you want to call Ambulance (102)?"
- ✅ Call Now opens phone dialer with 102

**Status**: [ ] Pass [ ] Fail

---

### Test 1.5: Custom Emergency Contact (Not Configured)

**Objective**: Verify behavior when no contact is saved

**Steps**:

1. Ensure no emergency contact is saved (delete if exists)
2. Navigate to Emergency Actions screen
3. Locate "📞 Call Emergency Contact" button (blue)
4. Verify button shows "Set Emergency Contact"
5. Verify button shows "Not configured"
6. Tap the button

**Expected Result**:

- ✅ Button shows "Set Emergency Contact" text
- ✅ Button shows "Not configured" subtitle
- ✅ Dialog appears: "No Emergency Contact"
- ✅ "Go to Settings" button is present
- ✅ Tapping "Go to Settings" navigates to Settings screen

**Status**: [ ] Pass [ ] Fail

---

### Test 1.6: Warning Banner

**Objective**: Verify warning banner is displayed

**Steps**:

1. Navigate to Emergency Actions screen
2. Look at top section below title

**Expected Result**:

- ✅ Red/dark red banner is visible
- ✅ Contains warning icon ⚠️
- ✅ Text: "Use only in real emergencies"
- ✅ Subtext about dialing emergency services

**Status**: [ ] Pass [ ] Fail

---

### Test 1.7: Quick Tips Section

**Objective**: Verify tips section is present and helpful

**Steps**:

1. Navigate to Emergency Actions screen
2. Scroll down to tips section

**Expected Result**:

- ✅ Tips section is visible
- ✅ Contains 💡 icon
- ✅ Lists 5 tips about calling emergency services
- ✅ Text is readable and clear

**Status**: [ ] Pass [ ] Fail

---

## Test Suite 2: Emergency Contact Settings

### Test 2.1: Settings Integration

**Objective**: Verify Emergency Contact section appears in Settings

**Steps**:

1. Navigate to Settings tab
2. Look at top of Settings screen

**Expected Result**:

- ✅ "Emergency Contact" section is at the top
- ✅ Red phone icon is visible
- ✅ Component is clearly separated from other settings

**Status**: [ ] Pass [ ] Fail

---

### Test 2.2: Save Valid Phone Number (10 digits)

**Objective**: Verify saving a valid 10-digit phone number

**Steps**:

1. Navigate to Settings → Emergency Contact
2. Enter `1234567890` in phone number field
3. Tap "Save" button

**Expected Result**:

- ✅ Green success banner appears
- ✅ Success message: "Emergency contact saved successfully!"
- ✅ Banner disappears after 3 seconds
- ✅ Phone number is displayed in "Saved Contact" view
- ✅ Edit and Delete buttons appear
- ✅ Number is stored in AsyncStorage

**Status**: [ ] Pass [ ] Fail

---

### Test 2.3: Save Valid Phone Number (with country code)

**Objective**: Verify saving a number with country code

**Steps**:

1. Navigate to Settings → Emergency Contact
2. Enter `+11234567890` in phone number field
3. Tap "Save" button

**Expected Result**:

- ✅ Number is accepted
- ✅ Success toast appears
- ✅ Number is displayed with country code

**Status**: [ ] Pass [ ] Fail

---

### Test 2.4: Save Valid Phone Number (with formatting)

**Objective**: Verify saving a formatted number

**Steps**:

1. Navigate to Settings → Emergency Contact
2. Enter `+1 (123) 456-7890` in phone number field
3. Tap "Save" button

**Expected Result**:

- ✅ Number is accepted (validates digits only)
- ✅ Success toast appears
- ✅ Number is stored with formatting

**Status**: [ ] Pass [ ] Fail

---

### Test 2.5: Validation - Too Short

**Objective**: Verify validation rejects numbers too short

**Steps**:

1. Navigate to Settings → Emergency Contact
2. Enter `12345` (5 digits) in phone number field
3. Tap "Save" button

**Expected Result**:

- ✅ Error dialog appears
- ✅ Message: "Please enter a valid phone number (10-15 digits)"
- ✅ Number is NOT saved
- ✅ No success toast

**Status**: [ ] Pass [ ] Fail

---

### Test 2.6: Validation - Too Long

**Objective**: Verify validation rejects numbers too long

**Steps**:

1. Navigate to Settings → Emergency Contact
2. Enter `12345678901234567890` (20 digits)
3. Tap "Save" button

**Expected Result**:

- ✅ Error dialog appears
- ✅ Message: "Please enter a valid phone number (10-15 digits)"
- ✅ Number is NOT saved

**Status**: [ ] Pass [ ] Fail

---

### Test 2.7: Validation - Empty Field

**Objective**: Verify validation rejects empty input

**Steps**:

1. Navigate to Settings → Emergency Contact
2. Leave phone number field empty
3. Tap "Save" button

**Expected Result**:

- ✅ Error dialog appears
- ✅ Message: "Please enter a phone number"
- ✅ Nothing is saved

**Status**: [ ] Pass [ ] Fail

---

### Test 2.8: Edit Emergency Contact

**Objective**: Verify editing existing contact

**Steps**:

1. Save a valid emergency contact
2. Tap "Edit" button
3. Change the number
4. Tap "Update" button

**Expected Result**:

- ✅ Edit button appears when contact is saved
- ✅ Tapping Edit shows input field with current number
- ✅ Button text changes to "Update"
- ✅ Update saves new number
- ✅ Success toast appears
- ✅ New number is displayed

**Status**: [ ] Pass [ ] Fail

---

### Test 2.9: Cancel Edit

**Objective**: Verify canceling edit operation

**Steps**:

1. Save a valid emergency contact
2. Tap "Edit" button
3. Change the number
4. Tap "Cancel" button

**Expected Result**:

- ✅ Cancel button appears when editing existing contact
- ✅ Tapping Cancel reverts to saved view
- ✅ Original number is unchanged
- ✅ No success toast

**Status**: [ ] Pass [ ] Fail

---

### Test 2.10: Delete Emergency Contact

**Objective**: Verify deleting saved contact

**Steps**:

1. Save a valid emergency contact
2. Tap red trash icon button
3. Confirm deletion in dialog

**Expected Result**:

- ✅ Delete icon (red) appears when contact is saved
- ✅ Confirmation dialog appears
- ✅ Dialog asks for confirmation
- ✅ After confirming, contact is removed
- ✅ View returns to empty state
- ✅ "Not configured" text appears on Emergency Actions screen

**Status**: [ ] Pass [ ] Fail

---

### Test 2.11: Delete Cancellation

**Objective**: Verify canceling delete operation

**Steps**:

1. Save a valid emergency contact
2. Tap red trash icon button
3. Tap "Cancel" in dialog

**Expected Result**:

- ✅ Dialog dismisses
- ✅ Contact remains saved
- ✅ No changes to stored data

**Status**: [ ] Pass [ ] Fail

---

## Test Suite 3: Integration Tests

### Test 3.1: Call Saved Emergency Contact

**Objective**: Verify calling saved emergency contact from Emergency Actions

**Steps**:

1. Save a valid emergency contact in Settings
2. Navigate to Emergency Actions screen
3. Verify custom contact button shows "Call Emergency Contact"
4. Verify button shows the saved number
5. Tap the button
6. Confirm the call

**Expected Result**:

- ✅ Button text changes to "Call Emergency Contact"
- ✅ Saved number is displayed
- ✅ Confirmation dialog appears
- ✅ Phone dialer opens with saved number
- ✅ Correct number is dialed

**Status**: [ ] Pass [ ] Fail

---

### Test 3.2: Contact Persistence After App Restart

**Objective**: Verify saved contact persists after closing app

**Steps**:

1. Save a valid emergency contact
2. Close the app completely
3. Reopen the app
4. Navigate to Settings → Emergency Contact
5. Navigate to Emergency Actions screen

**Expected Result**:

- ✅ Saved contact is still present in Settings
- ✅ Number is displayed correctly
- ✅ Emergency Actions screen shows saved contact
- ✅ Data persists in AsyncStorage

**Status**: [ ] Pass [ ] Fail

---

### Test 3.3: Configure from Emergency Actions

**Objective**: Verify "Configure Emergency Contact" button navigation

**Steps**:

1. Navigate to Emergency Actions screen
2. Scroll to bottom
3. Tap "Configure Emergency Contact" button

**Expected Result**:

- ✅ Button is visible at bottom
- ✅ Navigation to Settings screen occurs
- ✅ Settings screen loads correctly

**Status**: [ ] Pass [ ] Fail

---

### Test 3.4: Update Contact Reflected Immediately

**Objective**: Verify changes in Settings reflect immediately in Emergency Actions

**Steps**:

1. Save emergency contact `1234567890`
2. Navigate to Emergency Actions - verify number shown
3. Go back to Settings
4. Edit contact to `0987654321`
5. Navigate to Emergency Actions again

**Expected Result**:

- ✅ First number shows in Emergency Actions
- ✅ After editing, new number shows immediately
- ✅ No need to restart or refresh
- ✅ useFocusEffect loads latest data

**Status**: [ ] Pass [ ] Fail

---

## Test Suite 4: Platform-Specific Tests

### Test 4.1: iOS Phone Dialing

**Objective**: Verify iOS uses telprompt scheme

**Platform**: iOS only

**Steps**:

1. Run app on iOS device
2. Navigate to Emergency Actions
3. Tap any emergency button
4. Confirm the call
5. Complete or cancel the call
6. Check if returned to app

**Expected Result**:

- ✅ Uses `telprompt:` scheme
- ✅ Phone dialer opens
- ✅ After call ends, returns to SafeOrbit app

**Status**: [ ] Pass [ ] Fail [ ] N/A (Not iOS)

---

### Test 4.2: Android Phone Dialing

**Objective**: Verify Android uses tel scheme

**Platform**: Android only

**Steps**:

1. Run app on Android device
2. Navigate to Emergency Actions
3. Tap any emergency button
4. Confirm the call

**Expected Result**:

- ✅ Uses `tel:` scheme
- ✅ Phone dialer opens
- ✅ Correct number is pre-filled

**Status**: [ ] Pass [ ] Fail [ ] N/A (Not Android)

---

### Test 4.3: Device Without Phone Capability

**Objective**: Verify error handling on devices without phone

**Platform**: Tablets/devices without phone

**Steps**:

1. Run app on device without phone capability
2. Try to make an emergency call

**Expected Result**:

- ✅ Error dialog appears
- ✅ Message: "Phone dialing is not supported on this device"
- ✅ App doesn't crash

**Status**: [ ] Pass [ ] Fail [ ] N/A (Has phone)

---

## Test Suite 5: UI/UX Tests

### Test 5.1: Button Accessibility

**Objective**: Verify buttons are touch-friendly and accessible

**Steps**:

1. Navigate to Emergency Actions
2. Try tapping each button
3. Verify visual feedback

**Expected Result**:

- ✅ Buttons are large (96px height)
- ✅ Clear visual feedback on press (active state)
- ✅ Easy to tap (not too small)
- ✅ Adequate spacing between buttons

**Status**: [ ] Pass [ ] Fail

---

### Test 5.2: Color Contrast

**Objective**: Verify colors are visible and distinguishable

**Steps**:

1. Navigate to Emergency Actions
2. Check button colors
3. Verify text readability

**Expected Result**:

- ✅ Red button clearly distinguishable
- ✅ Green button clearly distinguishable
- ✅ Blue button clearly distinguishable
- ✅ White text readable on all backgrounds
- ✅ High contrast maintained

**Status**: [ ] Pass [ ] Fail

---

### Test 5.3: Success Toast Visibility

**Objective**: Verify success toast is visible and clear

**Steps**:

1. Save emergency contact
2. Observe success toast

**Expected Result**:

- ✅ Green banner appears at top
- ✅ Success icon visible
- ✅ Text is clear and readable
- ✅ Appears for 3 seconds
- ✅ Automatically dismisses

**Status**: [ ] Pass [ ] Fail

---

### Test 5.4: Scrolling Behavior

**Objective**: Verify screens scroll properly

**Steps**:

1. Navigate to Emergency Actions
2. Scroll up and down
3. Navigate to Settings with Emergency Contact
4. Scroll up and down

**Expected Result**:

- ✅ Emergency Actions scrolls smoothly
- ✅ All content is accessible
- ✅ Settings scrolls without issues
- ✅ No content is cut off

**Status**: [ ] Pass [ ] Fail

---

## Test Suite 6: Error Handling

### Test 6.1: No Network Connection

**Objective**: Verify behavior without network

**Steps**:

1. Turn off all network connections
2. Try to save emergency contact
3. Try to make emergency call

**Expected Result**:

- ✅ Saving contact works (uses AsyncStorage)
- ✅ Making call attempts to open dialer
- ✅ System handles actual call failure
- ✅ App doesn't crash

**Status**: [ ] Pass [ ] Fail

---

### Test 6.2: AsyncStorage Failure

**Objective**: Verify graceful handling of storage errors

**Steps**:

1. Simulate AsyncStorage failure (if possible)
2. Try to save/load contact

**Expected Result**:

- ✅ Error is caught and logged
- ✅ User sees error message
- ✅ App doesn't crash

**Status**: [ ] Pass [ ] Fail

---

## Test Suite 7: Performance Tests

### Test 7.1: Load Time

**Objective**: Verify screens load quickly

**Steps**:

1. Navigate to Emergency Actions screen
2. Time the load
3. Navigate to Settings
4. Time the load

**Expected Result**:

- ✅ Emergency Actions loads < 1 second
- ✅ Settings loads < 1 second
- ✅ No noticeable lag

**Status**: [ ] Pass [ ] Fail

---

### Test 7.2: Memory Usage

**Objective**: Verify no memory leaks

**Steps**:

1. Navigate between screens multiple times
2. Save/edit/delete contacts multiple times
3. Monitor memory usage

**Expected Result**:

- ✅ Memory usage stays stable
- ✅ No gradual increase
- ✅ No memory leaks detected

**Status**: [ ] Pass [ ] Fail

---

## Test Summary

### Pass/Fail Count

- Total Tests: 37
- Passed: [ ]
- Failed: [ ]
- N/A: [ ]

### Critical Issues

List any critical issues found:

1.
2.
3.

### Non-Critical Issues

List any minor issues found:

1.
2.
3.

### Recommendations

1.
2.
3.

---

## Sign-Off

**Tester Name**: _________________

**Date**: _________________

**Build Version**: _________________

**Test Environment**: _________________

**Overall Status**: [ ] PASS [ ] FAIL [ ] PASS WITH ISSUES

---

## Notes

Additional notes or observations:
