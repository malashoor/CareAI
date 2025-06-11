import { Linking } from 'react-native';
import { LinkingOptions } from '@react-navigation/native';
import { PharmacyInsuranceStackParamList } from './PharmacyInsuranceNavigator';

export const linking: LinkingOptions<PharmacyInsuranceStackParamList> = {
  prefixes: ['careai://', 'https://careai.app'],
  config: {
    initialRouteName: 'PharmacyRefills',
    screens: {
      PharmacyRefills: 'refills',
      NewPharmacyRefill: 'refills/new',
      RefillDetails: {
        path: 'refills/:refillId',
        parse: {
          refillId: (id: string) => id,
        },
      },
      InsuranceClaims: 'claims',
      NewInsuranceClaim: 'claims/new',
      ClaimDetails: {
        path: 'claims/:claimId',
        parse: {
          claimId: (id: string) => id,
        },
      },
      Notifications: 'notifications',
      NotificationPreferences: 'notifications/preferences',
    },
  },
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    return url;
  },
  subscribe(listener) {
    const subscription = Linking.addEventListener('url', ({ url }) => listener(url));
    return () => subscription.remove();
  },
}; 