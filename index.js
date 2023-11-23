// // import { registerRootComponent } from "expo";
// // import messaging from "@react-native-firebase/messaging";
// // import { Platform } from "react-native";
// // import codePush from "react-native-code-push";
// // import App from "./src";

// // import { SAVE_NOTIFICATION } from "./src/redux/types/notification_types";
// // import { store } from "./src/redux/store/index";

// // // Register background push notification handler
// // messaging().setBackgroundMessageHandler(async (remoteMessage) => {
// //   console.log(
// //     "Push Notification received in background state",
// //     JSON.stringify(remoteMessage)
// //   );
// //   store.dispatch({ type: SAVE_NOTIFICATION, notification: remoteMessage });
// // });

// // // registerRootComponent callsregisterComponent('main', () => App);
// // // It also ensures that whether you load the app in the Expo client or in a native build,
// // // the environment is set up appropriately

// // const isBetaUser = false;
// // const codePushKeys = Platform.select({
// //   // ios: {
// //   //   BETA: "KgzM-pCDXL93CM7T7sw65DoBnoSM8K-mNMM7h",
// //   //   PRODUCTION: "d7LvJ5_pJ4jbTrPIk26id-gOEELEIQl91WbaX",
// //   //   TESTING: "kectNYw0kI3AVCYhMfRlV_pqJyvwWXZcyxNqD",
// //   // },
// //   android: {
// //     BETA: "x2A78Xu3bKnVfLNGj2E2ntkXkal5JNjnGAhuN",
// //     PRODUCTION: "Or8pZx-POki5ApI7gNbyTC5HfHt0Ikn3AYhmB",
// //     TESTING: "4WytHszoGGT3qUgyYXErr630-vXW1HN9dx165",
// //   },
// // });

// // export const codePushDeploymentKeys = isBetaUser
// //   ? codePushKeys.BETA
// //   : codePushKeys.PRODUCTION;

// // const CodePushifiedApp = codePush({
// //   deploymentKey: codePushDeploymentKeys,
// //   checkFrequency: codePush.CheckFrequency.MANUAL,
// // })(App);

// // registerRootComponent(CodePushifiedApp);

// import { registerRootComponent } from "expo";
// import messaging from "@react-native-firebase/messaging";
// import { Platform } from "react-native";
// import codePush from "react-native-code-push";
// import App from "./src";

// import { SAVE_NOTIFICATION } from "./src/redux/types/notification_types";
// import { store } from "./src/redux/store/index";

// // Register background push notification handler
// messaging().setBackgroundMessageHandler(async (remoteMessage) => {
//   console.log(
//     "Push Notification received in background state",
//     JSON.stringify(remoteMessage, null, 4)
//   );
//   store.dispatch({ type: SAVE_NOTIFICATION, notification: remoteMessage });
// });

// // Your code for CodePush configuration
// const isBetaUser = false;
// const codePushKeys = Platform.select({
//   android: {
//     BETA: "x2A78Xu3bKnVfLNGj2E2ntkXkal5JNjnGAhuN",
//     PRODUCTION: "Or8pZx-POki5ApI7gNbyTC5HfHt0Ikn3AYhmB",
//     TESTING: "4WytHszoGGT3qUgyYXErr630-vXW1HN9dx165",
//   },
// });

// export const codePushDeploymentKeys = isBetaUser
//   ? codePushKeys.BETA
//   : codePushKeys.PRODUCTION;

// const CodePushifiedApp = codePush({
//   deploymentKey: codePushDeploymentKeys,
//   checkFrequency: codePush.CheckFrequency.MANUAL,
// })(App);

// registerRootComponent(CodePushifiedApp);

import { registerRootComponent } from "expo";
import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";
import codePush from "react-native-code-push";
import { PermissionsAndroid } from "react-native"; // Add this line
import App from "./src";

import { SAVE_NOTIFICATION } from "./src/redux/types/notification_types";
import { store } from "./src/redux/store/index";

// Function to request user permission for notifications
// Function to request user permission for notifications
// async function requestUserPermission() {
//   try {
//     const authStatus = await messaging().requestPermission();
//     const enabled =
//       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//       authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//     if (enabled) {
//       console.log("Authorization status:", authStatus);
//     }

//     if (Platform.OS === "android" && Platform.Version >= 33) {
//       const permission = PermissionsAndroid.PERMISSIONS.REQUEST_NOTIFICATIONS;
//       const granted = await PermissionsAndroid.request(permission);

//       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//         console.log("Notification permission granted");
//       } else {
//         console.log("Notification permission denied");
//       }
//     }
//   } catch (error) {
//     console.error("Error requesting permission:", error);
//   }
// }

// Background push notification handler
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
