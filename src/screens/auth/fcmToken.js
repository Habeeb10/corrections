import { AsyncStorage } from "react-native";
import messaging from "@react-native-firebase/messaging";

class NotificationService {
  isEnabled;
  token;

  constructor() {
    this.isEnabled = false;
    this.token = undefined;
  }

  async requestPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      console.log(authStatus);
      if (enabled) {
        this.isEnabled = true;
      }
    } catch (error) {
      console.error("Error requesting permission:", error.message);
    }
  }

  async registerForPushNotifications() {
    try {
      // Check if the token is already stored locally
      const storedToken = await AsyncStorage.getItem("fcmToken");

      if (storedToken) {
        this.token = storedToken;
        console.log("FCM token retrieved from local storage:", storedToken);
        return storedToken;
      }

      await this.requestPermission();

      const token = await messaging().getToken();
      console.log("FCM token obtained:", token);

      // Save the token locally
      await AsyncStorage.setItem("fcmToken", token);
      console.log("FCM token saved locally.");

      this.token = token;
      return token;
    } catch (error) {
      console.error("Error registering for push notifications:", error.message);
    }

    this.messageListener = messaging().onMessage(async (payload) => {
      console.log(
        "Foreground Push Notification received",
        JSON.stringify(payload, null, 4)
      );

      // Handle the foreground message as needed
      Alert.alert("Foreground Notification", payload.notification.title);
    });
  }

  // Add a method to handle onMessage event
  onMessage(callback) {
    this.messageListener = messaging().onMessage(callback);
  }

  // Add a method to remove the onMessage event listener
  removeMessageListener() {
    if (this.messageListener) {
      this.messageListener();
    }
  }
}

export default NotificationService;
