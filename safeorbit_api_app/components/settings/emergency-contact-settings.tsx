import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react-native';
import * as React from 'react';
import { View, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EMERGENCY_CONTACT_KEY = '@safeorbit_emergency_contact';

export function EmergencyContactSettings() {
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [savedNumber, setSavedNumber] = React.useState<string | null>(null);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    loadEmergencyContact();
  }, []);

  const loadEmergencyContact = async () => {
    try {
      const contact = await AsyncStorage.getItem(EMERGENCY_CONTACT_KEY);
      if (contact) {
        setSavedNumber(contact);
        setPhoneNumber(contact);
      }
    } catch (error) {
      console.error('Failed to load emergency contact:', error);
    }
  };

  const validatePhoneNumber = (number: string): boolean => {
    // Remove all non-digit characters for validation
    const digitsOnly = number.replace(/\D/g, '');
    
    // Check if it has at least 10 digits (common minimum for phone numbers)
    // and at most 15 digits (ITU-T E.164 international standard)
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    const trimmedNumber = phoneNumber.trim();
    
    if (!trimmedNumber) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    if (!validatePhoneNumber(trimmedNumber)) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid phone number (10-15 digits)'
      );
      return;
    }

    try {
      await AsyncStorage.setItem(EMERGENCY_CONTACT_KEY, trimmedNumber);
      setSavedNumber(trimmedNumber);
      setIsEditing(false);
      
      // Show success toast
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to save emergency contact:', error);
      Alert.alert('Error', 'Failed to save emergency contact');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Emergency Contact',
      'Are you sure you want to remove your emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(EMERGENCY_CONTACT_KEY);
              setSavedNumber(null);
              setPhoneNumber('');
              setIsEditing(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete emergency contact');
            }
          },
        },
      ]
    );
  };

  return (
    <View className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      {/* Success Toast */}
      {showSuccess && (
        <View className="bg-green-600 px-4 py-3 flex-row items-center gap-2">
          <Icon as={CheckCircleIcon} size={20} color="#ffffff" />
          <Text className="text-white font-medium flex-1">
            Emergency contact saved successfully!
          </Text>
        </View>
      )}

      <View className="px-4 py-4">
        <View className="flex-row items-center gap-2 mb-3">
          <Icon as={PhoneIcon} size={20} color="#ef4444" />
          <Text className="text-white font-semibold text-base">
            Emergency Contact
          </Text>
        </View>
        
        <Text className="text-white/60 text-sm mb-4">
          Set up a trusted contact for quick access during emergencies
        </Text>

        {!isEditing && savedNumber ? (
          <View className="bg-white/10 rounded-lg p-4 mb-3">
            <Text className="text-white/60 text-xs mb-1">Saved Contact</Text>
            <Text className="text-white font-medium text-lg">{savedNumber}</Text>
          </View>
        ) : (
          <View className="mb-3">
            <Text className="text-white/80 text-sm mb-2">Phone Number</Text>
            <TextInput
              className="bg-white/10 text-white rounded-lg px-4 py-3 text-base border border-white/20"
              placeholder="Enter phone number"
              placeholderTextColor="#ffffff60"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text className="text-white/40 text-xs mt-2">
              Include country code if needed (e.g., +1234567890)
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View className="gap-2">
          {!isEditing && savedNumber ? (
            <View className="flex-row gap-2">
              <Button
                className="flex-1 h-11 bg-blue-600 rounded-lg"
                onPress={() => setIsEditing(true)}
              >
                <Text className="text-white font-medium">Edit</Text>
              </Button>
              <Button
                className="h-11 bg-red-600/20 border border-red-600/40 rounded-lg px-4"
                onPress={handleDelete}
              >
                <Icon as={XCircleIcon} size={18} color="#ef4444" />
              </Button>
            </View>
          ) : (
            <View className="flex-row gap-2">
              <Button
                className="flex-1 h-11 bg-green-600 rounded-lg"
                onPress={handleSave}
              >
                <View className="flex-row items-center gap-2">
                  <Icon as={CheckCircleIcon} size={18} color="#ffffff" />
                  <Text className="text-white font-medium">
                    {savedNumber ? 'Update' : 'Save'}
                  </Text>
                </View>
              </Button>
              {savedNumber && (
                <Button
                  className="h-11 bg-white/10 border border-white/20 rounded-lg px-4"
                  onPress={() => {
                    setPhoneNumber(savedNumber);
                    setIsEditing(false);
                  }}
                >
                  <Text className="text-white font-medium">Cancel</Text>
                </Button>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
