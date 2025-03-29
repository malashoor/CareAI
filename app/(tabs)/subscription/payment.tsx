import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { CreditCard, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function PaymentScreen() {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const handlePayment = () => {
    // Implement payment processing
    router.push('/subscription/success');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Details</Text>
        <Text style={styles.subtitle}>Enter your payment information securely</Text>
      </View>

      <View style={styles.cardSection}>
        <LinearGradient
          colors={['#007AFF', '#0055FF']}
          style={styles.cardPreview}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <CreditCard color="#FFF" size={32} />
          <Text style={styles.cardNumber}>
            {cardNumber || '•••• •••• •••• ••••'}
          </Text>
          <View style={styles.cardDetails}>
            <View>
              <Text style={styles.cardLabel}>Card Holder</Text>
              <Text style={styles.cardValue}>{name || 'Your Name'}</Text>
            </View>
            <View>
              <Text style={styles.cardLabel}>Expires</Text>
              <Text style={styles.cardValue}>{expiryDate || 'MM/YY'}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Card Number</Text>
            <TextInput
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
              maxLength={19}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                value={expiryDate}
                onChangeText={setExpiryDate}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cardholder Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>
      </View>

      <View style={styles.securityNote}>
        <Lock color="#34C759" size={20} />
        <Text style={styles.securityText}>
          Your payment information is encrypted and secure
        </Text>
      </View>

      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
        <LinearGradient
          colors={['#34C759', '#32D74B']}
          style={styles.payGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.payText}>Complete Payment</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
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
  cardSection: {
    padding: 16,
  },
  cardPreview: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  cardNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginTop: 24,
    letterSpacing: 2,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  cardValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  form: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  row: {
    flexDirection: 'row',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  securityText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginLeft: 8,
  },
  payButton: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  payGradient: {
    padding: 16,
    alignItems: 'center',
  },
  payText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});