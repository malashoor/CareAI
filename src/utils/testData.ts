export const testMedications = [
  {
    id: '1',
    name: 'Aspirin',
    dosage: '81mg',
    frequency: 'Once daily',
    timeOfDay: '08:00',
    instructions: 'Take with food',
  },
  {
    id: '2',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Twice daily',
    timeOfDay: ['09:00', '21:00'],
    instructions: 'Take with or without food',
  },
  {
    id: '3',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Three times daily',
    timeOfDay: ['08:00', '14:00', '20:00'],
    instructions: 'Take with meals',
  },
  {
    id: '4',
    name: 'Simvastatin',
    dosage: '20mg',
    frequency: 'Once daily',
    timeOfDay: '20:00',
    instructions: 'Take in the evening',
  },
  {
    id: '5',
    name: 'Levothyroxine',
    dosage: '50mcg',
    frequency: 'Once daily',
    timeOfDay: '07:00',
    instructions: 'Take on empty stomach',
  },
];

export const testAppointments = [
  {
    id: '1',
    doctorName: 'Dr. Sarah Johnson',
    specialty: 'Primary Care',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    time: '10:00',
    location: '123 Medical Center Dr.',
    notes: 'Annual checkup',
  },
  {
    id: '2',
    doctorName: 'Dr. Michael Chen',
    specialty: 'Cardiology',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    time: '14:30',
    location: '456 Heart Health Blvd.',
    notes: 'Follow-up appointment',
  },
  {
    id: '3',
    doctorName: 'Dr. Emily Wilson',
    specialty: 'Endocrinology',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Week from now
    time: '11:15',
    location: '789 Specialist Ave.',
    notes: 'Thyroid check',
  },
];

export const testUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'user',
    preferences: {
      notifications: {
        medicationReminders: true,
        appointmentReminders: true,
        refillReminders: true,
        pushNotifications: true,
        emailNotifications: true,
        smsNotifications: false,
      },
      accessibility: {
        voiceFeedback: true,
        highContrast: false,
        largeText: false,
      },
    },
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@careai.com',
    role: 'admin',
    preferences: {
      notifications: {
        medicationReminders: true,
        appointmentReminders: true,
        refillReminders: true,
        pushNotifications: true,
        emailNotifications: true,
        smsNotifications: true,
      },
      accessibility: {
        voiceFeedback: false,
        highContrast: false,
        largeText: false,
      },
    },
  },
]; 