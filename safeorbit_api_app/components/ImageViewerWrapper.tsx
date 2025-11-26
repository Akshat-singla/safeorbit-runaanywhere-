import React from 'react';
import { Platform, Modal, View, Image, Pressable, StyleSheet } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { XIcon } from 'lucide-react-native';

interface ImageViewerProps {
  images: Array<{ uri: string }>;
  imageIndex: number;
  visible: boolean;
  onRequestClose: () => void;
}

// Lazy load the native image viewer only on native platforms
let NativeImageView: any = null;
if (Platform.OS !== 'web') {
  try {
    NativeImageView = require('react-native-image-viewing').default;
  } catch (error) {
    console.warn('react-native-image-viewing not available');
  }
}

// Simple web fallback viewer
function WebImageViewer({ images, imageIndex, visible, onRequestClose }: ImageViewerProps) {
  if (!visible || !images[imageIndex]) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.webContainer}>
        <Pressable style={styles.backdrop} onPress={onRequestClose} />
        <View style={styles.imageContainer}>
          <Pressable style={styles.closeButton} onPress={onRequestClose}>
            <Icon as={XIcon} size={24} color="#ffffff" />
          </Pressable>
          <Image
            source={{ uri: images[imageIndex].uri }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>
    </Modal>
  );
}

// Main component that switches based on platform
export function ImageViewerWrapper(props: ImageViewerProps) {
  if (Platform.OS === 'web') {
    return <WebImageViewer {...props} />;
  }

  if (NativeImageView) {
    return <NativeImageView {...props} />;
  }

  // Fallback to web viewer if native viewer not available
  return <WebImageViewer {...props} />;
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  imageContainer: {
    width: '90%',
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
