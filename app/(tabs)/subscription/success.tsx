import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CircleCheck as CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#34C759', '#32D74B']}
        style={styles.iconContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <CheckCircle2 color="#FFF" size={64} />
      </LinearGradient>

      <Text style={styles.title}>Payment Successful!</Text>
      <Text style={styles.message}>
        Thank you for subscribing to CareAI Pro. Your premium features are now activated.
      </Text>

      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>What's included:</Text>
        <View style={styles.benefitItem}>
          <CheckCircle2 color="#34C759" size={20} />
          <Text style={styles.benefitText}>Advanced AI companionship</Text>
        </View>
        <View style={styles.benefitItem}>
          <CheckCircle2 color="#34C759" size={20} />
          <Text style={styles.benefitText}>24/7 emergency monitoring</Text>
        </View>
        <View style={styles.benefitItem}>
          <CheckCircle2 color="#34C759" size={20} />
          <Text style={styles.benefitText}>Detailed health insights</Text>
        </View>
        <View style={styles.benefitItem}>
          <CheckCircle2 color="#34C759" size={20} />
          <Text style={styles.benefitText}>Priority support access</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/')}>
        <LinearGradient
          colors={['#007AFF', '#0055FF']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.buttonText}>Start Using CareAI Pro</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 24,
    paddingTop: 80,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  benefitsContainer: {
    width: '100%',
    backgroundColor: '#F8F8F8',
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#000000',
    marginLeft: 12,
  },
  button: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});