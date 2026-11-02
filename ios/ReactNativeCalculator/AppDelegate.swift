import UIKit
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    NativeNotifyPush.shared.start()
    return true
  }

  // Apple hands the app its push token here — that token is what Native Notify sends to.
  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    NativeNotifyPush.shared.register(deviceToken: deviceToken)
  }

  func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    NSLog("[NativeNotify] Could not register for remote notifications: ", error.localizedDescription)
  }
}

/**
 * Registers this iPhone with Native Notify.
 *
 * iOS pushes go straight from Native Notify to Apple, so the app needs no
 * Firebase here: all it does is ask the user, get Apple's device token and
 * hand it to the push service once per launch (Apple may change the token).
 */
final class NativeNotifyPush: NSObject, UNUserNotificationCenterDelegate {
  static let shared = NativeNotifyPush()

  // This app's Native Notify id and token. They identify the app to the push
  // service — keep the repository private, and rotate the token on the Keys
  // page in Native Notify (https://dashboard.nativenotify.com) if it leaks.
  private let appId = "34007"
  private let appToken = "ipDk1qyGZjAfPtR4VRQuQS"
  private let registerURL = URL(string: "https://app.nativenotify.com/api/universal/device/register")!

  func start() {
    UNUserNotificationCenter.current().delegate = self
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
      guard granted else {
        NSLog("[NativeNotify] Notifications were not allowed, so this device cannot register.")
        return
      }
      DispatchQueue.main.async {
        UIApplication.shared.registerForRemoteNotifications()
      }
    }
  }

  // iPhones show nothing for an app that is on screen unless the app asks for it.
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    completionHandler([.banner, .sound, .badge])
  }

  func register(deviceToken: Data) {
    // Apple's token is hex; Native Notify wants it lowercase.
    let apnsToken = deviceToken.map { String(format: "%02x", $0) }.joined()
    let deviceId = UIDevice.current.identifierForVendor?.uuidString.lowercased() ?? apnsToken

    var body: [String: Any] = [
      "appToken": appToken,
      "deviceId": deviceId,
      "platform": "ios",
      "tokens": ["apnsToken": apnsToken],
    ]
    body["appId"] = Int(appId) ?? appId

    var request = URLRequest(url: registerURL)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = try? JSONSerialization.data(withJSONObject: body)

    URLSession.shared.dataTask(with: request) { _, response, error in
      if let error = error {
        NSLog("[NativeNotify] Registration request failed: ", error.localizedDescription)
        return
      }
      let status = (response as? HTTPURLResponse)?.statusCode ?? 0
      NSLog("[NativeNotify] Registration answered HTTP %d", status)
    }.resume()
  }
}
