/**
 * @format
 */

import { AppRegistry, Platform } from 'react-native';
import {
  getMessaging,
  getToken,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import { registerNativeNotifyDevice } from './native-notify/nativeNotifyClient';
import { setUpNativeNotifyDisplay } from './native-notify/nativeNotifyDisplay';

// This app's Native Notify id and token. They identify the app to the push
// service — keep the repository private, and rotate the token on the Keys page
// in Native Notify (https://dashboard.nativenotify.com) if it ever leaks.
const NN_APP_ID = '34007';
const NN_APP_TOKEN = 'ipDk1qyGZjAfPtR4VRQuQS';

/**
 * Hands this device's Firebase token to Native Notify, so a push can reach it.
 * It runs on every launch and again whenever Firebase rotates the token.
 */
function registerDevice(fcmToken) {
  registerNativeNotifyDevice({
    appId: NN_APP_ID,
    appToken: NN_APP_TOKEN,
    platform: 'android',
    fcmToken,
  }).catch(error => {
    console.warn('[NativeNotify] registration failed:', error.message);
  });
}

if (Platform.OS === 'android') {
  // Draws every push Android shows — Firebase never draws a data message itself.
  setUpNativeNotifyDisplay();

  const messaging = getMessaging();
  // Android 13+ shows the "Allow notifications" prompt here.
  requestPermission(messaging)
    .catch(() => undefined)
    .then(() => getToken(messaging))
    .then(registerDevice)
    .catch(error => {
      console.warn('[NativeNotify] no Firebase token yet:', error.message);
    });

  onTokenRefresh(messaging, registerDevice);
}

AppRegistry.registerComponent(appName, () => App);
