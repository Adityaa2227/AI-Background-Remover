import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export const NotificationService = {
  register: async () => {
    if (Capacitor.getPlatform() === 'web') {
      console.log('Push notifications not fully supported on web without service worker setup.');
      return;
    }

    try {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        console.error('User denied permissions!');
        return;
      }

      await PushNotifications.register();

      PushNotifications.addListener('registration', (token) => {
        console.log('Push Registration Token: ', token.value);
        // Here you would send the token to your backend if you had one for storing tokens
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push action performed: ', notification);
      });

    } catch (error) {
      console.error('Error registering for push notifications', error);
    }
  }
};
