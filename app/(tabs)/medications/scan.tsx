import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Camera,
  Image as ImageIcon,
  CircleCheck as CheckCircle2,
  CircleAlert as AlertCircle,
  Pill,
  Loader,
  Volume2 as VolumeUp,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';

type ScanStatus = 'initial' | 'scanning' | 'processing' | 'success' | 'error';
type ScannedMedication = {
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  image: string;
};

export default function ScanScreen() {
  const router = useRouter();
  const [scanStatus, setScanStatus] = useState<ScanStatus>('initial');
  const [scannedMed, setScannedMed] = useState<ScannedMedication | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const confidenceTimer = useRef<NodeJS.Timeout | null>(null);

  const simulateScanning = () => {
    setScanStatus('scanning');
    setIsProcessing(true);

    // Simulate scanning process with progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setConfidence(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setScanStatus('processing');
        simulateProcessing();
      }
    }, 500);
  };

  const simulateProcessing = () => {
    setTimeout(() => {
      setScannedMed({
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        instructions: 'Take with or without food. Avoid taking with high-potassium foods.',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&auto=format&fit=crop',
      });
      setScanStatus('success');
      setIsProcessing(false);
      
      // Provide audio feedback
      Speech.speak('Medication scanned successfully. Lisinopril 10mg identified.', {
        rate: 0.8,
        pitch: 1.0,
      });
    }, 2000);
  };

  const handleScan = () => {
    simulateScanning();
  };

  const handleRetry = () => {
    setScanStatus('initial');
    setScannedMed(null);
    setConfidence(0);
  };

  const renderScanArea = () => {
    switch (scanStatus) {
      case 'initial':
        return (
          <View style={styles.initialState}>
            <LinearGradient
              colors={['#007AFF', '#0055FF']}
              style={styles.scanFrame}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Camera color="#FFF" size={48} />
              <Text style={styles.scanText}>Position medication label in frame</Text>
              <Text style={styles.scanSubtext}>Make sure text is clear and well-lit</Text>
            </LinearGradient>
          </View>
        );

      case 'scanning':
        return (
          <View style={styles.scanningState}>
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${confidence}%` }]} />
            </View>
            <Loader color="#007AFF" size={32} style={styles.spinner} />
            <Text style={styles.scanningText}>Scanning medication label...</Text>
            <Text style={styles.confidenceText}>{confidence}% complete</Text>
          </View>
        );

      case 'processing':
        return (
          <View style={styles.processingState}>
            <LinearGradient
              colors={['#34C759', '#32D74B']}
              style={styles.processingIndicator}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Pill color="#FFF" size={32} />
            </LinearGradient>
            <Text style={styles.processingText}>Processing medication information...</Text>
            <Text style={styles.processingSubtext}>Analyzing text and verifying details</Text>
          </View>
        );

      case 'success':
        return (
          <ScrollView style={styles.successState}>
            <View style={styles.resultCard}>
              <Image source={{ uri: scannedMed?.image }} style={styles.medicationImage} />
              <View style={styles.resultHeader}>
                <View style={styles.resultTitleContainer}>
                  <Text style={styles.resultTitle}>{scannedMed?.name}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      Speech.speak(`${scannedMed?.name}, ${scannedMed?.dosage}. ${scannedMed?.instructions}`, {
                        rate: 0.8,
                        pitch: 1.0,
                      })
                    }>
                    <VolumeUp color="#007AFF" size={24} />
                  </TouchableOpacity>
                </View>
                <View style={styles.successBadge}>
                  <CheckCircle2 color="#34C759" size={16} />
                  <Text style={styles.successText}>Verified</Text>
                </View>
              </View>

              <View style={styles.resultDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Dosage</Text>
                  <Text style={styles.detailValue}>{scannedMed?.dosage}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Frequency</Text>
                  <Text style={styles.detailValue}>{scannedMed?.frequency}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Instructions</Text>
                  <Text style={styles.detailValue}>{scannedMed?.instructions}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        );

      case 'error':
        return (
          <View style={styles.errorState}>
            <AlertCircle color="#FF3B30" size={48} />
            <Text style={styles.errorText}>Unable to scan label</Text>
            <Text style={styles.errorSubtext}>Please ensure the label is clear and try again</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan Medication</Text>
        <Text style={styles.subtitle}>
          {scanStatus === 'success'
            ? 'Review scanned medication details'
            : 'Position the medication label in the frame'}
        </Text>
      </View>

      <View style={styles.scanArea}>{renderScanArea()}</View>

      <View style={styles.actions}>
        {scanStatus === 'initial' && (
          <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
            <LinearGradient
              colors={['#007AFF', '#0055FF']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              <Camera color="#FFF" size={24} />
              <Text style={styles.buttonText}>Start Scanning</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {scanStatus === 'success' && (
          <>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => router.push('/medications/details')}>
              <LinearGradient
                colors={['#34C759', '#32D74B']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <Text style={styles.buttonText}>Continue to Setup</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryText}>Scan Again</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.manualButton}
          onPress={() => router.push('/medications/details')}>
          <ImageIcon color="#007AFF" size={20} />
          <Text style={styles.manualButtonText}>Enter Details Manually</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  scanArea: {
    flex: 1,
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  initialState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scanFrame: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scanText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  scanSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 8,
    textAlign: 'center',
  },
  scanningState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    width: '80%',
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  spinner: {
    marginBottom: 16,
  },
  scanningText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  processingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingIndicator: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  processingText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 8,
  },
  processingSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
  },
  successState: {
    flex: 1,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  medicationImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resultTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginRight: 12,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  successText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#34C759',
    marginLeft: 4,
  },
  resultDetails: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FF3B30',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
  actions: {
    padding: 16,
  },
  scanButton: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueButton: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  retryButton: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  retryText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#007AFF',
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  manualButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#007AFF',
    marginLeft: 8,
  },
});