import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useNotifications } from '../src/hooks/useNotifications';
import { useVoiceFeedback } from '../src/hooks/useVoiceFeedback';
import { theme } from '../src/theme';
import { testMedications, testAppointments } from '../src/utils/testData';

export default function NotificationTest() {
  const { announce } = useVoiceFeedback();
  const { permission, requestPermissions, scheduleNotification } = useNotifications();

  const testPermissions = async () => {
    try {
      const result = await requestPermissions();
      announce(`Permission request result: ${result ? 'granted' : 'denied'}`);
    } catch (error) {
      console.error('Error testing permissions:', error);
      announce('Error testing permissions');
    }
  };

  const testLocalNotification = async () => {
    try {
      await scheduleNotification(
        'Test Notification',
        'This is a test local notification',
        { seconds: 5 }
      );
      announce('Local notification scheduled for 5 seconds from now');
    } catch (error) {
      console.error('Error scheduling notification:', error);
      announce('Error scheduling notification');
    }
  };

  const testBadgeCount = async () => {
    try {
      const currentCount = await Notifications.getBadgeCountAsync();
      await Notifications.setBadgeCountAsync(currentCount + 1);
      announce(`Badge count increased to ${currentCount + 1}`);
      
      // Reset after 5 seconds
      setTimeout(async () => {
        await Notifications.setBadgeCountAsync(currentCount);
        announce('Badge count reset');
      }, 5000);
    } catch (error) {
      console.error('Error managing badge count:', error);
      announce('Error managing badge count');
    }
  };

  const testMedicationReminder = async () => {
    try {
      const medication = testMedications[Math.floor(Math.random() * testMedications.length)];
      await scheduleNotification(
        'Medication Reminder',
        `Time to take ${medication.name} ${medication.dosage}\n${medication.instructions}`,
        { seconds: 10 }
      );
      announce(`Medication reminder scheduled for ${medication.name}`);
    } catch (error) {
      console.error('Error scheduling medication reminder:', error);
      announce('Error scheduling medication reminder');
    }
  };

  const testAppointmentReminder = async () => {
    try {
      const appointment = testAppointments[Math.floor(Math.random() * testAppointments.length)];
      await scheduleNotification(
        'Appointment Reminder',
        `Upcoming appointment with ${appointment.doctorName}\nDate: ${appointment.date.toLocaleDateString()}\nTime: ${appointment.time}\nLocation: ${appointment.location}`,
        { seconds: 15 }
      );
      announce(`Appointment reminder scheduled for ${appointment.doctorName}`);
    } catch (error) {
      console.error('Error scheduling appointment reminder:', error);
      announce('Error scheduling appointment reminder');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Notification Test Suite</Text>
      <Text style={styles.status}>Current Permission Status: {permission}</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testPermissions}>
          <Text style={styles.buttonText}>Test Permissions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testLocalNotification}>
          <Text style={styles.buttonText}>Test Local Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testBadgeCount}>
          <Text style={styles.buttonText}>Test Badge Count</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testMedicationReminder}>
          <Text style={styles.buttonText}>Test Medication Reminder</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testAppointmentReminder}>
          <Text style={styles.buttonText}>Test Appointment Reminder</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary.default,
    borderRadius: 8,
    padding: 15,
  },
  buttonContainer: {
    gap: 10,
  },
  buttonText: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: theme.colors.background.primary,
    flex: 1,
    padding: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
}); 