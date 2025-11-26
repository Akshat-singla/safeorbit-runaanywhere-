import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { 
  PhoneIcon, 
  AlertTriangleIcon, 
  HeartPulseIcon, 
  UserIcon,
  ShieldAlertIcon,
  MapPinIcon,
  InfoIcon
} from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, Alert, Linking, Platform, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

const EMERGENCY_CONTACT_KEY = '@safeorbit_emergency_contact';

interface EmergencyContact {
  number: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  hoverColor: string;
  borderColor: string;
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    number: '101',
    name: 'Fire Emergency',
    icon: '🔥',
    color: '#f97316',
    bgColor: '#ea580c',
    hoverColor: '#c2410c',
    borderColor: '#fdba74',
  },
  {
    number: '102',
    name: 'Ambulance',
    icon: '🚑',
    color: '#10b981',
    bgColor: '#059669',
    hoverColor: '#047857',
    borderColor: '#6ee7b7',
  },
  {
    number: '100',
    name: 'Police',
    icon: '👮',
    color: '#3b82f6',
    bgColor: '#2563eb',
    hoverColor: '#1d4ed8',
    borderColor: '#93c5fd',
  },
];

export default function EmergencyActionsScreen() {
  const router = useRouter();
  const [emergencyContact, setEmergencyContact] = React.useState<string | null>(null);
  const [emergencyContactName, setEmergencyContactName] = React.useState<string | null>(null);
  const [pressedButton, setPressedButton] = React.useState<string | null>(null);

  const loadEmergencyContact = async () => {
    try {
      const contact = await AsyncStorage.getItem(EMERGENCY_CONTACT_KEY);
      const contactName = await AsyncStorage.getItem('@safeorbit_emergency_contact_name');
      setEmergencyContact(contact);
      setEmergencyContactName(contactName);
    } catch (error) {
      console.error('Failed to load emergency contact:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadEmergencyContact();
    }, [])
  );

  const makeEmergencyCall = async (number: string, name: string) => {
    // Remove any special characters from number
    const cleanNumber = number.replace(/[^0-9+]/g, '');
    
    if (Platform.OS === 'web') {
      // On web, show alert with number
      Alert.alert(
        'Emergency Call',
        `To call ${name}, dial: ${cleanNumber}\n\nNote: Direct calling is only available on mobile devices.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      '🚨 Emergency Call',
      `Are you sure you want to call ${name}?\n\nNumber: ${cleanNumber}`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => console.log('Call cancelled')
        },
        {
          text: 'Call Now',
          style: 'default',
          onPress: async () => {
            try {
              // Use tel: for all platforms (iOS and Android)
              // telprompt: is deprecated in iOS 13+
              const phoneUrl = `tel:${cleanNumber}`;
              
              console.log('Attempting to open:', phoneUrl);
              
              const supported = await Linking.canOpenURL(phoneUrl);
              console.log('Phone calling supported:', supported);
              
              if (supported) {
                await Linking.openURL(phoneUrl);
                console.log('Call initiated successfully');
              } else {
                Alert.alert(
                  'Error', 
                  'Phone dialing is not supported on this device.\n\nPlease check your device settings.',
                  [{ text: 'OK' }]
                );
              }
            } catch (error: any) {
              console.error('Failed to make call:', error);
              Alert.alert(
                'Error', 
                `Failed to initiate call: ${error.message || 'Unknown error'}`,
                [{ text: 'OK' }]
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const EmergencyButton = ({ contact }: { contact: EmergencyContact }) => {
    const isPressed = pressedButton === contact.number;

    return (
      <Pressable
        onPressIn={() => setPressedButton(contact.number)}
        onPressOut={() => setPressedButton(null)}
        onPress={() => makeEmergencyCall(contact.number, contact.name)}
        className="w-full"
        style={{ opacity: isPressed ? 0.8 : 1 }}
      >
        <View 
          className="rounded-2xl border-4 shadow-2xl p-5 min-h-[100px] justify-center"
          style={{
            backgroundColor: isPressed ? contact.hoverColor : contact.bgColor,
            borderColor: contact.borderColor,
          }}
        >
          <View className="items-center gap-2">
            <View className="flex-row items-center gap-3">
              <Text className="text-5xl">{contact.icon}</Text>
              <Icon as={PhoneIcon} size={32} color="#ffffff" />
            </View>
            <Text className="text-white font-bold text-xl text-center">
              {contact.name}
            </Text>
            <View className="bg-white/20 rounded-full px-4 py-1 mt-1">
              <Text className="text-white font-bold text-base">
                Dial {contact.number}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const CustomContactButton = () => {
    const isPressed = pressedButton === 'custom';
    const hasContact = !!emergencyContact;

    return (
      <Pressable
        onPressIn={() => setPressedButton('custom')}
        onPressOut={() => setPressedButton(null)}
        onPress={() => {
          if (emergencyContact) {
            makeEmergencyCall(emergencyContact, emergencyContactName || 'Your Emergency Contact');
          } else {
            Alert.alert(
              'No Emergency Contact',
              'Please set up your emergency contact in Settings first.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Go to Settings',
                  onPress: () => router.push('/(tabs)/settings' as any)
                }
              ]
            );
          }
        }}
        className="w-full"
        style={{ opacity: isPressed ? 0.8 : 1 }}
      >
        <View 
          className="rounded-2xl border-4 shadow-2xl p-5 min-h-[100px] justify-center"
          style={{
            backgroundColor: isPressed ? '#7c3aed' : hasContact ? '#8b5cf6' : '#6b7280',
            borderColor: hasContact ? '#c4b5fd' : '#9ca3af',
          }}
        >
          <View className="items-center gap-2">
            <View className="flex-row items-center gap-3">
              <Text className="text-5xl">📞</Text>
              <Icon as={UserIcon} size={32} color="#ffffff" />
            </View>
            <Text className="text-white font-bold text-xl text-center">
              {hasContact ? 'Personal Emergency Contact' : 'Set Emergency Contact'}
            </Text>
            <View className="bg-white/20 rounded-full px-4 py-1 mt-1">
              <Text className="text-white font-bold text-base">
                {hasContact ? (emergencyContactName || emergencyContact) : 'Not configured'}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  function InfoItem({ text }: { text: string }) {
    return (
      <View className="flex-row items-start gap-2">
        <View className="mt-1">
          <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
        </View>
        <Text className="text-muted-foreground text-sm flex-1">{text}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header Section */}
        <View className="px-4 pt-6 pb-4 sm:px-6 md:px-8">
          <View className="flex-row items-center gap-3 mb-2">
            <View className="bg-red-500 rounded-full p-2">
              <Icon as={ShieldAlertIcon} size={28} color="#ffffff" />
            </View>
            <Text className="text-3xl font-bold text-foreground sm:text-4xl">
              Emergency Actions
            </Text>
          </View>
          
          {/* Warning Banner */}
          <View className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-4 mt-4">
            <View className="flex-row items-start gap-3">
              <Icon as={AlertTriangleIcon} size={24} color="#ef4444" />
              <View className="flex-1">
                <Text className="text-red-500 font-bold text-base mb-1">
                  ⚠️ Emergency Use Only
                </Text>
                <Text className="text-red-500/80 text-sm">
                  These buttons will immediately dial emergency services. Only use in real emergencies.
                </Text>
              </View>
            </View>
          </View>

          {/* Platform Info */}
          {Platform.OS === 'web' && (
            <View className="bg-blue-500/10 border-2 border-blue-500/30 rounded-xl p-4 mt-3">
              <View className="flex-row items-start gap-3">
                <Icon as={InfoIcon} size={20} color="#3b82f6" />
                <Text className="text-blue-500 text-sm flex-1">
                  Direct calling is only available on mobile devices. You'll see the number to dial manually.
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Emergency Call Buttons */}
        <View className="px-4 gap-4 mt-2 sm:px-6 md:px-8 md:flex-row md:flex-wrap">
          {EMERGENCY_CONTACTS.map((contact) => (
            <View key={contact.number} className="w-full md:w-[48%]">
              <EmergencyButton contact={contact} />
            </View>
          ))}
        </View>

        {/* Custom Emergency Contact */}
        <View className="px-4 mt-4 sm:px-6 md:px-8">
          <View className="mb-3">
            <Text className="text-foreground font-semibold text-lg">
              Personal Contact
            </Text>
            <Text className="text-muted-foreground text-sm mt-1">
              Quick access to your personal emergency contact
            </Text>
          </View>
          <CustomContactButton />
        </View>

        {/* Info Section */}
        <View className="px-4 mt-8 sm:px-6 md:px-8">
          <View className="bg-card border border-border rounded-xl p-5">
            <View className="flex-row items-center gap-2 mb-4">
              <Icon as={MapPinIcon} size={20} color="#10b981" />
              <Text className="text-foreground font-bold text-base">
                Emergency Guidelines
              </Text>
            </View>
            <View className="gap-3">
              <InfoItem text="Stay calm and speak clearly" />
              <InfoItem text="Provide your exact location" />
              <InfoItem text="Describe the nature of the emergency" />
              <InfoItem text="Follow the operator's instructions" />
              <InfoItem text="Don't hang up until told to do so" />
            </View>
          </View>
        </View>

        {/* Configure Emergency Contact Button */}
        <View className="px-4 mt-6 sm:px-6 md:px-8">
          <Pressable
            onPress={() => router.push('/(tabs)/settings' as any)}
            className="rounded-xl border-2 border-border bg-card p-4 active:bg-accent"
          >
            <View className="flex-row items-center justify-center gap-2">
              <Icon as={UserIcon} size={20} color="#8b5cf6" />
              <Text className="text-foreground font-semibold text-base">
                Configure Emergency Contact
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Emergency Numbers Reference */}
        <View className="px-4 mt-6 sm:px-6 md:px-8">
          <View className="bg-muted/50 border border-border rounded-xl p-5">
            <Text className="text-foreground font-bold text-base mb-3">
              📋 Quick Reference
            </Text>
            <View className="gap-2">
              {EMERGENCY_CONTACTS.map((contact) => (
                <View key={contact.number} className="flex-row items-center justify-between py-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-2xl">{contact.icon}</Text>
                    <Text className="text-foreground text-sm font-medium">{contact.name}</Text>
                  </View>
                  <View className="bg-background rounded-full px-3 py-1">
                    <Text className="text-foreground font-bold text-sm">{contact.number}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
