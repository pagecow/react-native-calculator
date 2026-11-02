// Native Notify — shows pushes on Android (added by Agent Notify).
//
// Android pushes arrive as FCM *data* messages, which Firebase never draws for
// you. This file draws them while the app is open, in the background and
// closed — including the picture of a send that has a Big picture. iPhones show
// the alert themselves, so everything here does nothing on iOS.
//
// Packages (run in your terminal):
//   npm install @react-native-firebase/app @react-native-firebase/messaging @notifee/react-native
//
// Call it once at the top of index.js, BEFORE AppRegistry.registerComponent —
// Firebase's background handler has to be set before the app mounts:
//   import { setUpNativeNotifyDisplay } from './native-notify/nativeNotifyDisplay';
//   setUpNativeNotifyDisplay();

import { Platform } from 'react-native';
import { getMessaging, onMessage, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';

const CHANNEL_ID = 'default';
const CHANNEL_NAME = 'Notifications';

/** Creates the notification channel and starts drawing pushes. Android only. */
export function setUpNativeNotifyDisplay() {
  if (Platform.OS !== 'android') return;
  // Firebase draws a push with a picture on this channel while the app is closed (firebase.json names it), so it must exist.
  notifee.createChannel({ id: CHANNEL_ID, name: CHANNEL_NAME, importance: AndroidImportance.HIGH }).catch(() => {});
  onMessage(getMessaging(), showNativeNotifyMessage);
  setBackgroundMessageHandler(getMessaging(), showNativeNotifyMessage);
}

/**
 * Draws one push. A push that carries a picture has a notification block with the image URL.
 * @param {import('@react-native-firebase/messaging').RemoteMessage} remoteMessage
 */
export async function showNativeNotifyMessage(remoteMessage) {
  const data = /** @type {Record<string, string>} */ (remoteMessage.data || {}); // every value is a String
  if (!data.title) return;
  const channelId = await notifee.createChannel({ id: data.channelId || CHANNEL_ID, name: CHANNEL_NAME, importance: AndroidImportance.HIGH });
  const imageUrl = remoteMessage.notification?.android?.imageUrl;
  const picture = typeof imageUrl === 'string' && imageUrl.startsWith('https://') ? imageUrl : null; // https only
  await notifee.displayNotification({
    title: data.title,
    body: data.message,
    data: { pushData: data.body || '{}' }, // your pushData as JSON (+ nn_notification_id / nn_source)
    android: {
      channelId,
      pressAction: { id: 'default' },
      ...(picture ? { largeIcon: picture, style: { type: AndroidStyle.BIGPICTURE, picture } } : {}),
    },
  });
}
