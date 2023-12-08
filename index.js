import { registerRootComponent } from "expo";
import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";
import codePush from "react-native-code-push";
import { PermissionsAndroid } from "react-native"; // Add this line
import App from "./src";

import { SAVE_NOTIFICATION } from "./src/redux/types/notification_types";
import { store } from "./src/redux/store/index";

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log(
    "Push Notification received in background state",
    JSON.stringify(remoteMessage, null, 4)
  );
  store.dispatch({ type: SAVE_NOTIFICATION, notification: remoteMessage });
});

// Call the requestUserPermission function at the beginning or during initialization
// requestUserPermission();

// Your code for CodePush configuration
const isBetaUser = false;
const codePushKeys = Platform.select({
  android: {
    BETA: "x2A78Xu3bKnVfLNGj2E2ntkXkal5JNjnGAhuN",
    PRODUCTION: "Or8pZx-POki5ApI7gNbyTC5HfHt0Ikn3AYhmB",
    TESTING: "4WytHszoGGT3qUgyYXErr630-vXW1HN9dx165",
  },
});

export const codePushDeploymentKeys = isBetaUser
  ? codePushKeys.BETA
  : codePushKeys.PRODUCTION;

const CodePushifiedApp = codePush({
  deploymentKey: codePushDeploymentKeys,
  checkFrequency: codePush.CheckFrequency.MANUAL,
})(App);

registerRootComponent(CodePushifiedApp);
