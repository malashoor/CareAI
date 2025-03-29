import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

const i18n = new I18n({
  en: {
    welcome: 'Welcome to CareAI',
    roles: {
      senior: 'Senior',
      child: 'Family Member',
      medical: 'Healthcare Professional'
    },
    monitoring: {
      medication: {
        taken: 'Medication taken',
        missed: 'Medication missed',
        upcoming: 'Upcoming medication'
      },
      health: {
        normal: 'Normal',
        attention: 'Needs attention',
        critical: 'Critical'
      },
      alerts: {
        emergency: 'Emergency alert',
        notification: 'Notification'
      }
    },
    messages: {
      new: 'New message',
      reply: 'Reply',
      listen: 'Listen',
      record: 'Record'
    }
  },
  es: {
    welcome: 'Bienvenido a CareAI',
    roles: {
      senior: 'Adulto Mayor',
      child: 'Familiar',
      medical: 'Profesional de Salud'
    },
    monitoring: {
      medication: {
        taken: 'Medicamento tomado',
        missed: 'Medicamento perdido',
        upcoming: 'Próximo medicamento'
      },
      health: {
        normal: 'Normal',
        attention: 'Necesita atención',
        critical: 'Crítico'
      },
      alerts: {
        emergency: 'Alerta de emergencia',
        notification: 'Notificación'
      }
    },
    messages: {
      new: 'Nuevo mensaje',
      reply: 'Responder',
      listen: 'Escuchar',
      record: 'Grabar'
    }
  }
});

i18n.locale = Localization.locale;
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export default i18n;