import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import {
  ArrowLeft,
  Camera as CameraIcon,
  Image as ImageIcon,
  ScanLine,
  CheckCircle2,
  AlertCircle,
  Volume2 as VolumeUp,
  Zap
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useMedications } from '@/hooks/useMedications';

export default function ScanMedicationScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { scanMedicationInfo, addMedication } = useMedications(user?.id || '');

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ name: string; dosage: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const cameraRef = useRef<Camera>(null);

  const requestPermissions = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access to scan medications.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      Alert.alert('Error', 'Failed to request camera permission.');
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsScanning(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (Platform.OS !== 'web') {
        await Speech.speak('Analyzing medication image. Please wait.', {
          rate: 0.8,
          pitch: 1.0
        });
      }

      // Process the image with OCR
      const result = await scanMedicationInfo(photo.uri);
      
      if (result) {
        setScanResult(result);
        setShowConfirmModal(true);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Alert.alert(
          'Scan Failed',
          'Could not detect medication information. Please try again or enter manually.',
          [
            { text: 'Try Again', style: 'default' },
            { text: 'Enter Manually', onPress: () => router.push('/medications/add') }
          ]
        );
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to scan medication. Please try again.');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } finally {
      setIsScanning(false);
    }
  };

  const selectFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Gallery Permission Required',
          'Please enable gallery access to select photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsScanning(true);

        if (Platform.OS !== 'web') {
          await Speech.speak('Analyzing selected image. Please wait.', {
            rate: 0.8,
            pitch: 1.0
          });
        }

        const scanResult = await scanMedicationInfo(result.assets[0].uri);
        
        if (scanResult) {
          setScanResult(scanResult);
          setShowConfirmModal(true);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          Alert.alert(
            'Scan Failed',
            'Could not detect medication information in the selected image.',
            [
              { text: 'Try Another Image', style: 'default' },
              { text: 'Enter Manually', onPress: () => router.push('/medications/add') }
            ]
          );
        }
        
        setIsScanning(false);
      }
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      Alert.alert('Error', 'Failed to process image. Please try again.');
      setIsScanning(false);
    }
  };

  const confirmAndAdd = async () => {
    if (!scanResult) return;

    try {
      await addMedication({
        name: scanResult.name,
        dosage: scanResult.dosage,
        frequency: 'once_daily',
        times_per_day: 1,
        time_of_day: ['08:00'],
        instructions: 'Scanned medication - please verify details',
        side_effects: [],
        start_date: new Date().toISOString(),
        reminder_enabled: true,
        caregiver_alerts: false,
        adherence_rate: 100,
        current_streak: 0,
        total_doses: 0,
        missed_doses: 0,
        active: true
      });

      setShowConfirmModal(false);
      
      if (Platform.OS !== 'web') {
        await Speech.speak(`Successfully added ${scanResult.name} to your medication list.`, {
          rate: 0.8,
          pitch: 1.0
        });
      }

      router.back();
    } catch (error) {
      console.error('Error adding scanned medication:', error);
      Alert.alert('Error', 'Failed to add medication. Please try again.');
    }
  };

  const editManually = () => {
    setShowConfirmModal(false);
    router.push({
      pathname: '/medications/add',
      params: {
        name: scanResult?.name || '',
        dosage: scanResult?.dosage || ''
      }
    });
  };

  const speakInstructions = async () => {
    if (Platform.OS === 'web') return;

    const message = 'Point your camera at the medication label or bottle. Make sure the text is clear and well-lit for best results.';
    
    try {
      await Speech.speak(message, { rate: 0.8, pitch: 1.0 });
    } catch (error) {
      console.error('Error speaking instructions:', error);
    }
  };

  // Request permissions on component mount
  useState(() => {
    requestPermissions();
  });

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Setting up camera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.errorContainer}>
        <CameraIcon color="#666666" size={48} />
        <Text style={styles.errorTitle}>Camera Access Required</Text>
        <Text style={styles.errorText}>
          Please enable camera access in your device settings to scan medications.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestPermissions}>
          <Text style={styles.retryButtonText}>Request Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.manualButton} onPress={() => router.push('/medications/add')}>
          <Text style={styles.manualButtonText}>Add Manually Instead</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Scan Medication</Text>
        <TouchableOpacity style={styles.speakButton} onPress={speakInstructions}>
          <VolumeUp color="#FFFFFF" size={24} />
        </TouchableOpacity>
      </View>

      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.corner} style={[styles.corner, styles.topLeft]} />
            <View style={styles.corner} style={[styles.corner, styles.topRight]} />
            <View style={styles.corner} style={[styles.corner, styles.bottomLeft]} />
            <View style={styles.corner} style={[styles.corner, styles.bottomRight]} />
            
            <View style={styles.scanLineContainer}>
              <ScanLine color="#007AFF" size={200} />
            </View>
          </View>
          
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructions}>
              Position the medication label or bottle within the frame
            </Text>
            <Text style={styles.subInstructions}>
              Ensure good lighting and clear text for best results
            </Text>
          </View>
        </View>
      </Camera>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={selectFromGallery}
          disabled={isScanning}
        >
          <ImageIcon color="#007AFF" size={24} />
          <Text style={styles.controlText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, isScanning && styles.captureButtonDisabled]}
          onPress={takePicture}
          disabled={isScanning}
        >
          <LinearGradient
            colors={isScanning ? ['#999', '#999'] : ['#007AFF', '#0055FF']}
            style={styles.captureGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isScanning ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <CameraIcon color="#FFFFFF" size={32} />
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => router.push('/medications/add')}
          disabled={isScanning}
        >
          <Zap color="#007AFF" size={24} />
          <Text style={styles.controlText}>Manual</Text>
        </TouchableOpacity>
      </View>

      {isScanning && (
        <View style={styles.scanningOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.scanningText}>Analyzing medication...</Text>
        </View>
      )}

      <Modal
        visible={showConfirmModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <CheckCircle2 color="#34C759" size={32} />
              <Text style={styles.modalTitle}>Medication Detected</Text>
            </View>

            {scanResult && (
              <View style={styles.detectedInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValue}>{scanResult.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Dosage:</Text>
                  <Text style={styles.infoValue}>{scanResult.dosage}</Text>
                </View>
              </View>
            )}

            <Text style={styles.confirmText}>
              Please verify the detected information is correct before adding.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.editButton} onPress={editManually}>
                <Text style={styles.editButtonText}>Edit Details</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.confirmButton} onPress={confirmAndAdd}>
                <LinearGradient
                  colors={['#34C759', '#32D74B']}
                  style={styles.confirmGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.confirmButtonText}>Add Medication</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  manualButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 12,
  },
  manualButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#007AFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  speakButton: {
    padding: 8,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  scanArea: {
    width: 280,
    height: 200,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLineContainer: {
    position: 'absolute',
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 200,
    paddingHorizontal: 32,
  },
  instructions: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subInstructions: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#CCCCCC',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  controlButton: {
    alignItems: 'center',
    padding: 8,
  },
  controlText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    marginTop: 4,
  },
  captureButton: {
    borderRadius: 40,
    overflow: 'hidden',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 32,
    maxWidth: 400,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginTop: 8,
  },
  detectedInfo: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#666666',
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000000',
  },
  confirmText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  confirmGradient: {
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
}); 