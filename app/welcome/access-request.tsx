import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Search, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';

export default function AccessRequestScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .eq('email', email)
        .eq('role', 'senior')
        .single();

      if (error) throw error;

      if (data) {
        setSearchResult(data);
        setError(null);
      } else {
        setError('No senior account found with this email');
        setSearchResult(null);
      }
    } catch (err) {
      setError('Error searching for user');
      setSearchResult(null);
    }
  };

  const handleRequestAccess = async () => {
    if (!searchResult) return;

    try {
      const { error } = await supabase
        .from('connected_users')
        .insert({
          user_id: searchResult.id,
          connected_user_id: supabase.auth.user()?.id,
          relationship: 'pending',
          permissions: ['read'],
        });

      if (error) throw error;

      router.push('/(tabs)');
    } catch (err) {
      setError('Error requesting access');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Shield color="#007AFF" size={48} />
        <Text style={styles.title}>Request Access</Text>
        <Text style={styles.subtitle}>
          Enter the email address of the senior you'd like to connect with
        </Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}>
            <Search color="#007AFF" size={24} />
          </TouchableOpacity>
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {searchResult && (
          <View style={styles.resultCard}>
            <Text style={styles.resultName}>{searchResult.name}</Text>
            <Text style={styles.resultEmail}>{searchResult.email}</Text>
            <TouchableOpacity
              style={styles.requestButton}
              onPress={handleRequestAccess}>
              <LinearGradient
                colors={['#34C759', '#32D74B']}
                style={styles.requestGradient}>
                <Text style={styles.requestText}>Request Access</Text>
                <ChevronRight color="#FFF" size={24} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>What happens next?</Text>
        <Text style={styles.infoText}>
          1. The senior will receive a notification of your request{'\n'}
          2. They can review and approve your access{'\n'}
          3. Once approved, you'll be able to monitor their health and send messages
        </Text>
      </View>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  searchSection: {
    padding: 24,
  },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  searchButton: {
    padding: 12,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FF3B30',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  resultName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 4,
  },
  resultEmail: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    marginBottom: 16,
  },
  requestButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  requestGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  requestText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  infoSection: {
    padding: 24,
  },
  infoTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#000000',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666666',
    lineHeight: 24,
  },
});