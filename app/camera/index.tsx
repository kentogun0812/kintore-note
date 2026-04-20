import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  
  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'white', textAlign: 'center', marginBottom: 20 }}>
          We need your permission to show the camera
        </Text>
        <Button label="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.overlay}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Icon name="close" size={28} color="white" />
          </Pressable>
          
          <View style={styles.bottomControls}>
             <Pressable style={styles.flipButton} onPress={toggleCameraFacing}>
               <Icon name="camera-reverse" size={28} color="white" />
             </Pressable>
             
             <Pressable style={styles.captureButton}>
               <View style={styles.captureInner} />
             </Pressable>
             
             <View style={styles.flipButton} /> 
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 20,
    marginTop: 40,
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 50,
  },
  flipButton: {
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    padding: 5,
  },
  captureInner: {
    flex: 1,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'black',
  }
});
