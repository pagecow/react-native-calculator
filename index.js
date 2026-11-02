/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// This app's Native Notify id and token. They identify the app to the push
// service — keep the repository private, and rotate the token on the Keys page
// in Native Notify (https://dashboard.nativenotify.com) if it ever leaks.
const NN_APP_ID = '34007';
const NN_APP_TOKEN = 'ipDk1qyGZjAfPtR4VRQuQS';

// Android registration and notification display are wired in once the packages
// are installed (npm install @react-native-firebase/app
// @react-native-firebase/messaging @notifee/react-native) — see
// native-notify/README.md. iPhone has its own registration in
// ios/ReactNativeCalculator/AppDelegate.swift and needs nothing here.

AppRegistry.registerComponent(appName, () => App);
