import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions, Animated, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Brain, Shield, Volume2 as VolumeUp, ArrowRight, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { theme } from '@/theme';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

const { width, height } = Dimensions.get('window');

const features = [
  {
    id: 'health',
    title: 'Smart Health Monitoring',
    description: 'Track vital signs and medications with AI-powered insights',
    icon: Heart,
    color: ['#FF2D55', '#FF0066'],
    image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'cognitive',
    title: 'Brain Training Games',
    description: 'Engaging exercises to keep your mind active and sharp',
    icon: Brain,
    color: ['#5856D6', '#5E5CE6'],
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'safety',
    title: '24/7 Safety & Support',
    description: 'Advanced fall detection and emergency assistance',
    icon: Shield,
    color: ['#34C759', '#32D74B'],
    image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=2000&auto=format&fit=crop'
  }
];

const testimonials = [
  {
    id: 1,
    name: 'Margaret, 72',
    role: 'Active Senior',
    text: 'CareAI helps me live independently while keeping my family informed. The medication reminders are a lifesaver!',
    image: 'https://images.unsplash.com/photo-1505685679686-2490cab6217d?q=80&w=200&auto=format&fit=crop',
    rating: 5
  },
  {
    id: 2,
    name: 'Sarah',
    role: 'Family Caregiver',
    text: 'The peace of mind knowing I can monitor my mom\'s health remotely is invaluable. The fall detection feature is amazing.',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop',
    rating: 5
  },
  {
    id: 3,
    name: 'Dr. Anderson',
    role: 'Geriatric Specialist',
    text: 'CareAI has transformed how I provide care. The real-time health data helps me make better decisions for my patients.',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=200&auto=format&fit=crop',
    rating: 5
  }
];

const getRandomStats = () => ({
  activeUsers: 50000 + Math.floor(Math.random() * 5000),
  healthAlerts: 1000000 + Math.floor(Math.random() * 100000),
  livesImproved: 100000 + Math.floor(Math.random() * 10000)
});

export default function WelcomeScreen() {
  const router = useRouter();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [stats, setStats] = useState(getRandomStats());
  const fadeAnim = new Animated.Value(0);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getRandomStats());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const interval = setInterval(() => {
      setCurrentFeature((current) => (current + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const speakFeature = async (text: string) => {
    try {
      if (Platform.OS === 'web') {
        console.log('Speech not supported on web');
        return;
      }

      setIsListening(true);
      
      await Speech.speak(text, {
        rate: 0.8,
        pitch: 1.0,
        onDone: () => setIsListening(false),
        onError: () => setIsListening(false),
      });
    } catch (error) {
      console.error('Speech error:', error);
      setIsListening(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array(rating).fill(0).map((_, i) => (
      <Star key={i} color="#FFD700" fill="#FFD700" size={16} />
    ));
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1505685679686-2490cab6217d?q=80&w=2000&auto=format&fit=crop' }}
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={[
            'rgba(0, 0, 0, 0.7)',
            'rgba(0, 0, 0, 0.5)',
            'rgba(0, 0, 0, 0.3)',
            'rgba(0, 0, 0, 0.1)',
            'transparent'
          ]}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Heart size={48} color={theme.colors.primary.default} />
              <Text style={styles.logoText}>CareAI</Text>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>
                Your Personal Health Companion
              </Text>
              <Text style={styles.subtitle}>
                Empowering seniors with AI-driven health monitoring and support
              </Text>
            </View>

            <View style={styles.featuresContainer}>
              <FeatureItem text="24/7 Health Monitoring" />
              <FeatureItem text="Smart Medication Reminders" />
              <FeatureItem text="Emergency Alerts" />
              <FeatureItem text="Family Connection" />
            </View>

            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/welcome/role-selection')}
            >
              <Text style={styles.ctaText}>Get Started</Text>
              <ArrowRight size={20} color={theme.colors.text.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureDot} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: height * 0.1,
    paddingBottom: height * 0.05,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontSize: 32,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.text.white,
  },
  textContainer: {
    gap: 16,
  },
  title: {
    fontSize: 40,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.text.white,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.white,
    opacity: 0.9,
    lineHeight: 24,
  },
  featuresContainer: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary.default,
  },
  featureText: {
    fontSize: 16,
    fontFamily: theme.typography.families.medium,
    color: theme.colors.text.white,
    opacity: 0.9,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: theme.colors.primary.default,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
  },
  ctaText: {
    fontSize: 18,
    fontFamily: theme.typography.families.semibold,
    color: theme.colors.text.white,
  },
});