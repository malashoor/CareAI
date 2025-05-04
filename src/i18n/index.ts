import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Admin section
      admin: {
        title: 'Admin Settings',
        buttonHint: 'Tap to perform admin action',
        sections: {
          promotions: 'Promotions',
          discounts: 'Discounts',
          settings: 'System Settings',
        },
        actions: {
          createPromo: 'Create Promotion',
          manageDiscounts: 'Manage Discounts',
          systemSettings: 'System Settings',
          edit: 'Edit',
        },
        status: {
          loading: 'Loading...',
          error: 'An error occurred',
          success: 'Operation successful',
        },
        promotions: {
          title: 'Promotions Management',
          create: 'Create Promotion',
          edit: 'Edit Promotion',
          active: 'Active',
          inactive: 'Inactive',
          discount: 'Discount',
          uses: 'Uses',
          validUntil: 'Valid Until',
          empty: 'No promotions found',
          createSuccess: 'Promotion created successfully',
          editSuccess: 'Promotion updated successfully',
          deleteSuccess: 'Promotion deleted successfully',
          deleteConfirm: 'Are you sure you want to delete this promotion?',
        },
      },
      
      // Settings section
      settings: {
        title: 'Settings',
        sections: {
          preferences: 'Preferences',
          notifications: 'Notifications',
          account: 'Account',
          privacy: 'Privacy',
        },
        actions: {
          save: 'Save Changes',
          cancel: 'Cancel',
          reset: 'Reset to Default',
        },
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export const t = (key: string): string => {
  const translations: { [key: string]: string } = {
    'medications.title': 'Medications',
    'medications.addButton': 'Add Medication',
    'medications.screenLabel': 'Medications List',
    'medications.addMedicationLabel': 'Add new medication',
    'medications.fields.name': 'Medication Name',
    'medications.fields.dosage': 'Dosage',
    'medications.fields.schedule': 'Schedule',
    'medications.fields.notes': 'Notes',
    'medications.hints.name': 'Enter the name of the medication',
    'medications.hints.dosage': 'Enter the dosage amount',
    'medications.hints.schedule': 'Enter when to take the medication',
    'medications.hints.notes': 'Enter any additional notes',
    'medications.errors.nameRequired': 'Medication name is required',
    'medications.errors.dosageRequired': 'Dosage is required',
    'medications.errors.scheduleRequired': 'Schedule is required',
    'medications.addScreen.title': 'Add New Medication',
    'medications.addScreen.submit': 'Add Medication',
    'medications.addScreen.screenLabel': 'Add New Medication Form',
    'common.cancel': 'Cancel',
  };

  return translations[key] || key;
};

export default i18n; 