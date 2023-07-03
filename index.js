import { registerRootComponent } from "expo";
import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";
import codePush from "react-native-code-push";
import App from "./src";

import { SAVE_NOTIFICATION } from "./src/redux/types/notification_types";
import { store } from "./src/redux/store/index";

// Register background push notification handler
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log(
    "Push Notification received in background state",
    JSON.stringify(remoteMessage, null, 4)
  );
  store.dispatch({ type: SAVE_NOTIFICATION, notification: remoteMessage });
});

// registerRootComponent callsregisterComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately

const isBetaUser = false;
const codePushKeys = Platform.select({
  // ios: {
  //   BETA: "KgzM-pCDXL93CM7T7sw65DoBnoSM8K-mNMM7h",
  //   PRODUCTION: "d7LvJ5_pJ4jbTrPIk26id-gOEELEIQl91WbaX",
  //   TESTING: "kectNYw0kI3AVCYhMfRlV_pqJyvwWXZcyxNqD",
  // },
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
