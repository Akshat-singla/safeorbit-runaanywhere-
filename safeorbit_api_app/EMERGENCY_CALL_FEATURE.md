# Emergency Call Feature Documentation

## Overview

The Emergency Call feature provides quick access to emergency services and personal emergency
contacts directly from the SafeOrbit app. This feature is designed with safety, accessibility, and
ease of use as top priorities.

## Features

### 1. Emergency Actions Screen (`emergency-actions.tsx`)

A dedicated screen with three large, high-contrast buttons for emergency calling:

#### Fire Emergency Button (Red)

- **Number**: 101
- **Color**: Red (#ef4444) with red border
- **Icon**: 🚨 Fire emoji + AlertTriangle icon
- **Action**: Dials fire emergency services

#### Ambulance Button (Green)

- **Number**: 102
- **Color**: Green (#16a34a) with green border
- **Icon**: 🏥 Hospital emoji + HeartPulse icon
- **Action**: Dials ambulance services

#### Custom Emergency Contact Button (Blue)

- **Number**: User-configured
- **Color**: Blue (#2563eb) with blue border
- **Icon**: 📞 Phone emoji + User icon
- **Action**: Calls saved emergency contact or prompts to set one

### 2. Emergency Contact Settings Component

Located in `components/settings/emergency-contact-settings.tsx`, this component allows users to:

- **Save** a personal emergency contact number
- **Edit** existing contact information
- **Delete** saved contact
- **Validate** phone numbers (10-15 digits, ITU-T E.164 standard)
- **View** success toast notification on save

#### Validation Rules

- Minimum 10 digits (common phone number minimum)
- Maximum 15 digits (ITU-T E.164 international standard)
- Accepts formatting characters (+, -, spaces, parentheses)
- Removes non-digit characters for validation

### 3. Integration Points

#### Home Screen Quick Actions

The Emergency Actions button is prominently displayed at the top of the Quick Actions section on the
home screen for immediate access.

```typescript
<Button 
  className="h-14 bg-red-600 rounded-xl shadow-lg border-2 border-red-400"
  onPress={() => router.push('/(tabs)/emergency-actions' as any)}
>
  <View className="flex-row items-center gap-2">
    <Icon as={PhoneIcon} size={20} color="#ffffff" />
    <Text className="text-white font-bold text-base">
      🚨 Emergency Actions
    </Text>
  </View>
</Button>
```

#### Settings Screen

The Emergency Contact configuration is integrated into the Settings screen as the first section,
making it easily discoverable.

#### Navigation Tabs

The Emergency Actions screen is accessible via the bottom tab navigation with a phone icon.

## Technical Implementation

### Phone Dialing

The feature uses React Native's `Linking` API to initiate phone calls:

```typescript
const makeEmergencyCall = async (number: string, name: string) => {
  // Use telprompt for iOS to return to app after call
  const phoneUrl = Platform.OS === 'ios' 
    ? `telprompt:${number}` 
    : `tel:${number}`;
  
  const supported = await Linking.canOpenURL(phoneUrl);
  if (supported) {
    await Linking.openURL(phoneUrl);
  } else {
    Alert.alert('Error', 'Phone dialing is not supported on this device');
  }
};
```

#### Platform-Specific Behavior

- **iOS**: Uses `telprompt:` scheme to return user to app after call
- **Android**: Uses `tel:` scheme for standard phone dialing

### Data Storage

Emergency contact information is stored using `AsyncStorage`:

```typescript
const EMERGENCY_CONTACT_KEY = '@safeorbit_emergency_contact';

// Save
await AsyncStorage.setItem(EMERGENCY_CONTACT_KEY, phoneNumber);

// Load
const contact = await AsyncStorage.getItem(EMERGENCY_CONTACT_KEY);

// Delete
await AsyncStorage.removeItem(EMERGENCY_CONTACT_KEY);
```

### User Confirmation

Before initiating any call, the app displays a confirmation dialog:

```typescript
Alert.alert(
  'Emergency Call',
  `Are you sure you want to call ${name}?`,
  [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Call Now', style: 'destructive', onPress: initiateCall }
  ]
);
```

## UI/UX Design

### Color Coding

- **Red**: Fire emergency (danger, urgent)
- **Green**: Medical/Ambulance (health, life-saving)
- **Blue**: Personal contact (trust, communication)

### Accessibility Features

- Large, touch-friendly buttons (height: 96px / h-24)
- High contrast colors for visibility
- Clear icons and emoji for quick recognition
- Rounded corners for modern, friendly appearance
- Warning banner at the top
- Helpful tips section

### Button Specifications

```typescript
// Large emergency buttons
className="h-24 bg-{color}-600 rounded-2xl shadow-2xl border-4 border-{color}-400"

// Dimensions
- Height: 96px (6rem / h-24)
- Border: 4px solid
- Border radius: 16px (rounded-2xl)
- Shadow: Extra large (shadow-2xl)
```

## Safety Features

1. **Confirmation Dialog**: Prevents accidental calls
2. **Warning Banner**: Reminds users to use only in real emergencies
3. **Validation**: Ensures phone numbers are in valid format
4. **Error Handling**: Graceful fallback if dialing not supported
5. **Visual Feedback**: Toast notifications for successful saves

## Usage Guide

### For End Users

1. **Setting Up Emergency Contact**:
    - Navigate to Settings
    - Find "Emergency Contact" section at the top
    - Enter phone number (with country code if needed)
    - Tap "Save"
    - See success confirmation

2. **Making Emergency Calls**:
    - From Home screen, tap "🚨 Emergency Actions"
    - Or navigate to "Actions" tab
    - Select appropriate emergency service
    - Confirm the call in the dialog
    - Phone dialer opens automatically

3. **Quick Tips Provided**:
    - Stay calm and speak clearly
    - Provide exact location
    - Describe nature of emergency
    - Follow operator's instructions

### For Developers

#### Adding New Emergency Numbers

```typescript
<Button
  className="h-24 bg-purple-600 rounded-2xl shadow-2xl border-4 border-purple-400"
  onPress={() => makeEmergencyCall('103', 'Police (103)')}
>
  <View className="items-center gap-2">
    <View className="flex-row items-center gap-3">
      <Text className="text-4xl">👮</Text>
      <Icon as={ShieldIcon} size={32} color="#ffffff" />
    </View>
    <Text className="text-white font-bold text-xl text-center">
      Call Police
    </Text>
    <Text className="text-white/80 text-sm font-medium">
      Dial 103
    </Text>
  </View>
</Button>
```

#### Customizing Emergency Numbers by Region

You can create a configuration file for different regions:

```typescript
// config/emergency-numbers.ts
export const EMERGENCY_NUMBERS = {
  US: {
    fire: '911',
    ambulance: '911',
    police: '911',
  },
  UK: {
    fire: '999',
    ambulance: '999',
    police: '999',
  },
  IN: {
    fire: '101',
    ambulance: '102',
    police: '100',
  },
};
```

## Dependencies

Required packages (already included in package.json):

- `react-native`: Core framework
- `expo-linking`: For opening phone dialer
- `@react-native-async-storage/async-storage`: For storing emergency contact
- `lucide-react-native`: For icons
- `expo-router`: For navigation

## File Structure

```
safeorbit_api_app/
├── app/
│   └── (tabs)/
│       ├── emergency-actions.tsx          # Main emergency screen
│       ├── home.tsx                        # Updated with quick action
│       ├── settings.tsx                    # Updated with emergency contact
│       └── _layout.tsx                     # Updated navigation
├── components/
│   └── settings/
│       └── emergency-contact-settings.tsx  # Emergency contact component
└── EMERGENCY_CALL_FEATURE.md              # This documentation
```

## Testing Checklist

- [ ] Fire emergency button dials 101
- [ ] Ambulance button dials 102
- [ ] Custom contact button opens settings if not configured
- [ ] Custom contact button dials saved number if configured
- [ ] Phone number validation works correctly
- [ ] Save button stores contact in AsyncStorage
- [ ] Edit button loads and allows editing
- [ ] Delete button removes contact
- [ ] Success toast appears on save
- [ ] Confirmation dialog appears before calling
- [ ] iOS uses telprompt scheme
- [ ] Android uses tel scheme
- [ ] Navigation from home screen works
- [ ] Tab navigation works
- [ ] Component reloads contact on focus

## Future Enhancements

1. **Location Sharing**: Send GPS coordinates with emergency calls
2. **Medical Info**: Store and display medical information (allergies, blood type)
3. **Multiple Contacts**: Support for multiple emergency contacts
4. **SMS Option**: Send SMS if call not possible
5. **Emergency Mode**: One-tap activation of all emergency features
6. **Silent Alert**: Discreet emergency notification option
7. **Auto-call**: Shake to call feature
8. **Regional Customization**: Automatic detection of local emergency numbers

## Security & Privacy

- Phone numbers stored locally on device only
- No transmission to external servers
- User has full control to edit/delete data
- No call history tracking within app
- Uses system phone dialer for actual calls

## Compliance

This feature is designed to complement, not replace, native emergency calling systems. Users should:

- Ensure their device has cellular service
- Know local emergency numbers for their region
- Test the feature in non-emergency situations
- Keep emergency contact information up to date

## Support

For issues or questions:

1. Check this documentation
2. Review the code comments
3. Test in development environment first
4. Ensure all required packages are installed

## License

Part of the SafeOrbit application. See main README for license information.
