// import React, { Component } from "react";
// import {
//   Keyboard,
//   View,
//   InteractionManager,
//   Linking,
//   Alert,
//   BackHandler,
//   LogBox,
// } from "react-native";
// import AsyncStorage from "@react-native-community/async-storage";
// import * as SplashScreen from "expo-splash-screen";
// import { Asset } from "expo-asset";
// import * as Font from "expo-font";
// import * as Icon from "@expo/vector-icons";
// import { PersistGate } from "redux-persist/integration/react";
// import { Provider } from "react-redux";
// import { store, persistor } from "./redux/store/index";
// import remoteConfig from "@react-native-firebase/remote-config";
// import dynamicLinks from "@react-native-firebase/dynamic-links";
// import { MenuProvider } from "react-native-popup-menu";
// import VersionCheck from "react-native-version-check";

// import { Mixins, SharedStyle } from "_styles";
// import Navigator from "_navigations";
// import { navigate } from "./services/navigator";
// import { deeplinkRouteHandler } from "./utils/util";
// import ErrorBoundries from "./error";
// class App extends Component {
//   state = {
//     isReady: false,
//     scrollHeight: Mixins.DRAW_HEIGHT,
//     scrollWithTabHeight: Mixins.DRAW_HEIGHT_WITH_NAV,
//   };
//   async componentDidMount() {
//     try {
//       await SplashScreen.preventAutoHideAsync();
//     } catch (e) {
//       console.log(e);
//     }
//     this.keyboardDidShowListener = Keyboard.addListener(
//       "keyboardDidShow",
//       (e) => this.handleKeyboardOpened(e)
//     );
//     this.keyboardDidHideListener = Keyboard.addListener(
//       "keyboardDidHide",
//       (e) => this.handleKeyboardClosed(e)
//     );
//     this.loadResources();
//     LogBox.ignoreLogs(["Setting a timer"]);
//   }
//   componentWillUnmount = () => {
//     if (this.keyboardDidShowListener) {
//       this.keyboardDidShowListener.remove();
//     }
//     if (this.keyboardDidHideListener) {
//       this.keyboardDidHideListener.remove();
//     }
//   };
//   handleKeyboardOpened(e) {
//     this.setState({
//       scrollHeight: Mixins.DRAW_HEIGHT - e.endCoordinates.height,
//       scrollWithTabHeight:
//         Mixins.DRAW_HEIGHT_WITH_NAV - e.endCoordinates.height,
//     });
//   }
//   handleKeyboardClosed(e) {
//     this.setState({
//       scrollHeight: Mixins.DRAW_HEIGHT,
//       scrollWithTabHeight: Mixins.DRAW_HEIGHT_WITH_NAV,
//     });
//   }
//   async checkVersion() {
//     try {
//       let updateNeeded = await VersionCheck.needUpdate();
//       if (updateNeeded && updateNeeded.isNeeded) {
//         Alert.alert(
//           "Please Update",
//           "You will have to update your app to the latest version to continue using.",
//           [
//             {
//               text: "Update",
//               onPress: () => {
//                 BackHandler.exitApp();
//                 Linking.openURL(updateNeeded.storeUrl);
//               },
//             },
//           ],
//           { cancelable: false }
//         );
//       }
//     } catch (e) {
//       console.log("Update error:".e);
//     }
//   }
//   async loadResources() {
//     // Pre-load fonts
//     await Font.loadAsync({
//       ...Icon.AntDesign.font,
//       ...Icon.Entypo.font,
//       ...Icon.Feather.font,
//       ...Icon.FontAwesome.font,
//       ...Icon.Ionicons.font,
//       ...Icon.MaterialCommunityIcons.font,
//       ...Icon.MaterialIcons.font,
//       ...Icon.SimpleLineIcons.font,
//       "Roboto-Regular": require("./assets/fonts/Roboto-Regular.ttf"),
//       "Roboto-Medium": require("./assets/fonts/Roboto-Medium.ttf"),
//       "Roboto-Bold": require("./assets/fonts/Roboto-Bold.ttf"),
//     });

//     // Pre-load images
//     await Asset.loadAsync([
//       require("./assets/images/logo.png"),
//       require("./assets/images/tour/tour_1.png"),
//       require("./assets/images/tour/tour_2.png"),
//       require("./assets/images/tour/tour_3.png"),
//       require("./assets/images/login/banner.png"),
//       require("./assets/images/settings/accounts.png"),
//       require("./assets/images/settings/banks.png"),
//       require("./assets/images/settings/banner.png"),
//       require("./assets/images/settings/biometrics.png"),
//       require("./assets/images/settings/call.png"),
//       require("./assets/images/settings/change_password.png"),
//       require("./assets/images/settings/change_pin.png"),
//       require("./assets/images/settings/contact_support.png"),
//       require("./assets/images/settings/documents.png"),
//       require("./assets/images/settings/email.png"),
//       require("./assets/images/settings/facebook.png"),
//       require("./assets/images/settings/instagram.png"),
//       require("./assets/images/settings/next_of_kin.png"),
//       require("./assets/images/settings/notifications.png"),
//       require("./assets/images/settings/privacy_policy.png"),
//       require("./assets/images/settings/profile.png"),
//       require("./assets/images/settings/recover_pin.png"),
//       require("./assets/images/settings/terms_and_conditions.png"),
//       require("./assets/images/settings/twitter.png"),
//       require("./assets/images/settings/website.png"),
//       require("./assets/images/dashboard/airtime.png"),
//       require("./assets/images/dashboard/bill_payment.png"),
//       require("./assets/images/dashboard/empty_transactions.png"),
//       require("./assets/images/dashboard/loans.png"),
//       require("./assets/images/dashboard/loans_card.png"),
//       require("./assets/images/dashboard/savings.png"),
//       require("./assets/images/dashboard/savings_card.png"),
//       require("./assets/images/dashboard/transfers.png"),
//       require("./assets/images/savings/fixed.png"),
//       require("./assets/images/savings/halal.png"),
//       require("./assets/images/savings/regular.png"),
//       require("./assets/images/savings/rollover_savings.png"),
//       require("./assets/images/savings/savings_summary.png"),
//       require("./assets/images/savings/summary_bg.png"),
//       require("./assets/images/savings/top_up_savings.png"),
//       require("./assets/images/savings/withdraw_savings.png"),
//       require("./assets/images/loans/apply_bg.png"),
//       require("./assets/images/loans/cancel_loan.png"),
//       require("./assets/images/loans/debit_requirement_icon.png"),
//       require("./assets/images/loans/employment_requirement_icon.png"),
//       require("./assets/images/loans/guarantor_requirement_icon.png"),
//       require("./assets/images/loans/loan_history.png"),
//       require("./assets/images/loans/personal_requirement_icon.png"),
//       require("./assets/images/loans/repay_loan.png"),
//       require("./assets/images/loans/summary_bg.png"),
//       require("./assets/images/bills/bills_bg.png"),
//       require("./assets/images/transactions/credit.png"),
//       require("./assets/images/transactions/debit.png"),
//       require("./assets/images/referrals/referrals.png"),
//       require("./assets/images/shared/9mobile.png"),
//       require("./assets/images/shared/airtel.png"),
//       require("./assets/images/shared/call.png"),
//       require("./assets/images/shared/creditville.png"),
//       require("./assets/images/shared/empty_account.png"),
//       require("./assets/images/shared/empty_card.png"),
//       require("./assets/images/shared/error_bg.png"),
//       require("./assets/images/shared/error_icon.png"),
//       require("./assets/images/shared/fingerprint.png"),
//       require("./assets/images/shared/first_bank.png"),
//       require("./assets/images/shared/glo.png"),
//       require("./assets/images/shared/gtb.png"),
//       require("./assets/images/shared/happy_phone_presser.png"),
//       require("./assets/images/shared/mtn.png"),
//       require("./assets/images/shared/pay_with_agent.png"),
//       require("./assets/images/shared/pay_with_card.png"),
//       require("./assets/images/shared/pay_with_ussd.png"),
//       require("./assets/images/shared/paystack_badge.png"),
//       require("./assets/images/shared/profile.png"),
//       require("./assets/images/shared/spectranet.png"),
//       require("./assets/images/shared/success_bg.png"),
//       require("./assets/images/shared/success_icon.png"),
//       require("./assets/images/shared/cybersecurity.png"),
//       require("./assets/images/shared/otpverification.png"),
//       require("./assets/images/shared/icon_user.png"),
//       require("./assets/images/transfers/home-bank.png"),
//     ]);
//     // Initialize remote configurations
//     await remoteConfig().setConfigSettings({
//       minimumFetchIntervalMillis: 900000, // Cache configs locally for 15mins
//     });
//     remoteConfig()
//       .setDefaults({})
//       .then(() => remoteConfig().fetchAndActivate())
//       .then(() => {
//         const appConfig = remoteConfig().getAll();
//         // console.log('\n===== APP CONFIGURATIONS =====\n', JSON.stringify(appConfig, null, 4));
//       });
//     this.setState({ isReady: true });
//   }
//   render() {
//     if (!this.state.isReady) {
//       return null;
//     }
//     let scrollHeight = this.state.scrollHeight;
//     let scrollWithTabHeight = this.state.scrollWithTabHeight;
//     return (
//       <ErrorBoundries>
//         <MenuProvider>
//           <View style={SharedStyle.mainContainer}>
//             <Provider store={store}>
//               <PersistGate loading={null} persistor={persistor}>
//                 <Navigator
//                   screenProps={{ scrollHeight, scrollWithTabHeight }}
//                 />
//               </PersistGate>
//             </Provider>
//           </View>
//         </MenuProvider>
//       </ErrorBoundries>
//     );
//   }
// }

// export default App;

import React, { Component } from "react";
import {
  Keyboard,
  View,
  LogBox,
  Platform,
  AsyncStorage,
  Alert,
  BackHandler,
  Linking,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { Asset } from "expo-asset";
import * as Font from "expo-font";
import * as Icon from "@expo/vector-icons";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import remoteConfig from "@react-native-firebase/remote-config";
import dynamicLinks from "@react-native-firebase/dynamic-links";
import { MenuProvider } from "react-native-popup-menu";
import VersionCheck from "react-native-version-check";
import { request, PERMISSIONS, check, RESULTS } from "react-native-permissions";
import { Mixins, SharedStyle } from "_styles";
import Navigator from "_navigations";
import { navigate } from "./services/navigator";
import { deeplinkRouteHandler } from "./utils/util";
import ErrorBoundaries from "./error";
import messaging from "@react-native-firebase/messaging";
// import NotificationService from "./screens/auth/fcmToken"; // Replace with the correct path
import { store, persistor } from "./redux/store/index";

class App extends Component {
  state = {
    isReady: false,
    scrollHeight: Mixins.DRAW_HEIGHT,
    scrollWithTabHeight: Mixins.DRAW_HEIGHT_WITH_NAV,
  };

  // notificationService = new NotificationService();

  async componentDidMount() {
    try {
      await SplashScreen.preventAutoHideAsync();
    } catch (e) {
      console.log(e);
    }

    await this.checkPermissions();
    this.loadResources();
    LogBox.ignoreLogs(["Setting a timer"]);

    // Register for push notifications and get FCM token
    // await this.notificationService.registerForPushNotifications();
  }

  componentWillUnmount = () => {
    if (this.keyboardDidShowListener) {
      this.keyboardDidShowListener.remove();
    }
    if (this.keyboardDidHideListener) {
      this.keyboardDidHideListener.remove();
    }
  };

  async checkPermissions() {
    await this.checkLocationPermission();
    await this.checkStoragePermission();
    await this.checkCameraPermission();
  }

  async checkLocationPermission() {
    const status = await check(
      Platform.OS === "ios"
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
    );

    if (status !== RESULTS.GRANTED) {
      const result = await request(
        Platform.OS === "ios"
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      );

      if (result === RESULTS.GRANTED) {
        console.log("Location permission granted!");
        // Handle granting as needed
      } else {
        console.log("Location permission denied!");
        // Handle denial as needed
      }
    } else {
      // Permission already granted, proceed
      console.log("Location permission already granted!");
    }
  }

  async checkStoragePermission() {
    const status = await check(
      Platform.OS === "ios"
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
    );

    if (status !== RESULTS.GRANTED) {
      const result = await request(
        Platform.OS === "ios"
          ? PERMISSIONS.IOS.PHOTO_LIBRARY
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
      );

      if (result === RESULTS.GRANTED) {
        console.log("Storage permission granted!");
        // Handle granting as needed
      } else {
        console.log("Storage permission denied!");
        // Handle denial as needed
      }
    } else {
      // Permission already granted, proceed
      console.log("Storage permission already granted!");
    }
  }

  async checkCameraPermission() {
    const status = await check(
      Platform.OS === "ios"
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA
    );

    if (status !== RESULTS.GRANTED) {
      const result = await request(
        Platform.OS === "ios"
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.ANDROID.CAMERA
      );

      if (result === RESULTS.GRANTED) {
        console.log("Camera permission granted!");
        // Handle granting as needed
      } else {
        console.log("Camera permission denied!");
        // Handle denial as needed
      }
    } else {
      // Permission already granted, proceed
      console.log("Camera permission already granted!");
    }
  }

  handleKeyboardOpened(e) {
    this.setState({
      scrollHeight: Mixins.DRAW_HEIGHT - e.endCoordinates.height,
      scrollWithTabHeight:
        Mixins.DRAW_HEIGHT_WITH_NAV - e.endCoordinates.height,
    });
  }
  handleKeyboardClosed(e) {
    this.setState({
      scrollHeight: Mixins.DRAW_HEIGHT,
      scrollWithTabHeight: Mixins.DRAW_HEIGHT_WITH_NAV,
    });
  }
  async checkVersion() {
    try {
      let updateNeeded = await VersionCheck.needUpdate();
      if (updateNeeded && updateNeeded.isNeeded) {
        Alert.alert(
          "Please Update",
          "You will have to update your app to the latest version to continue using.",
          [
            {
              text: "Update",
              onPress: () => {
                BackHandler.exitApp();
                Linking.openURL(updateNeeded.storeUrl);
              },
            },
          ],
          { cancelable: false }
        );
      }
    } catch (e) {
      console.log("Update error:".e);
    }
  }
  async loadResources() {
    // Pre-load fonts
    await Font.loadAsync({
      ...Icon.AntDesign.font,
      ...Icon.Entypo.font,
      ...Icon.Feather.font,
      ...Icon.FontAwesome.font,
      ...Icon.Ionicons.font,
      ...Icon.MaterialCommunityIcons.font,
      ...Icon.MaterialIcons.font,
      ...Icon.SimpleLineIcons.font,
      "Roboto-Regular": require("./assets/fonts/Roboto-Regular.ttf"),
      "Roboto-Medium": require("./assets/fonts/Roboto-Medium.ttf"),
      "Roboto-Bold": require("./assets/fonts/Roboto-Bold.ttf"),
    });

    // Pre-load images
    await Asset.loadAsync([
      require("./assets/images/logo.png"),
      require("./assets/images/tour/tour_1.png"),
      require("./assets/images/tour/tour_2.png"),
      require("./assets/images/tour/tour_3.png"),
      require("./assets/images/login/banner.png"),
      require("./assets/images/settings/accounts.png"),
      require("./assets/images/settings/banks.png"),
      require("./assets/images/settings/banner.png"),
      require("./assets/images/settings/biometrics.png"),
      require("./assets/images/settings/call.png"),
      require("./assets/images/settings/change_password.png"),
      require("./assets/images/settings/change_pin.png"),
      require("./assets/images/settings/contact_support.png"),
      require("./assets/images/settings/documents.png"),
      require("./assets/images/settings/email.png"),
      require("./assets/images/settings/facebook.png"),
      require("./assets/images/settings/instagram.png"),
      require("./assets/images/settings/next_of_kin.png"),
      require("./assets/images/settings/notifications.png"),
      require("./assets/images/settings/privacy_policy.png"),
      require("./assets/images/settings/profile.png"),
      require("./assets/images/settings/recover_pin.png"),
      require("./assets/images/settings/terms_and_conditions.png"),
      require("./assets/images/settings/twitter.png"),
      require("./assets/images/settings/website.png"),
      require("./assets/images/dashboard/airtime.png"),
      require("./assets/images/dashboard/bill_payment.png"),
      require("./assets/images/dashboard/empty_transactions.png"),
      require("./assets/images/dashboard/loans.png"),
      require("./assets/images/dashboard/loans_card.png"),
      require("./assets/images/dashboard/savings.png"),
      require("./assets/images/dashboard/savings_card.png"),
      require("./assets/images/dashboard/transfers.png"),
      require("./assets/images/savings/fixed.png"),
      require("./assets/images/savings/halal.png"),
      require("./assets/images/savings/regular.png"),
      require("./assets/images/savings/rollover_savings.png"),
      require("./assets/images/savings/savings_summary.png"),
      require("./assets/images/savings/summary_bg.png"),
      require("./assets/images/savings/top_up_savings.png"),
      require("./assets/images/savings/withdraw_savings.png"),
      require("./assets/images/loans/apply_bg.png"),
      require("./assets/images/loans/cancel_loan.png"),
      require("./assets/images/loans/debit_requirement_icon.png"),
      require("./assets/images/loans/employment_requirement_icon.png"),
      require("./assets/images/loans/guarantor_requirement_icon.png"),
      require("./assets/images/loans/loan_history.png"),
      require("./assets/images/loans/personal_requirement_icon.png"),
      require("./assets/images/loans/repay_loan.png"),
      require("./assets/images/loans/summary_bg.png"),
      require("./assets/images/bills/bills_bg.png"),
      require("./assets/images/transactions/credit.png"),
      require("./assets/images/transactions/debit.png"),
      require("./assets/images/referrals/referrals.png"),
      require("./assets/images/shared/9mobile.png"),
      require("./assets/images/shared/airtel.png"),
      require("./assets/images/shared/call.png"),
      require("./assets/images/shared/creditville.png"),
      require("./assets/images/shared/empty_account.png"),
      require("./assets/images/shared/empty_card.png"),
      require("./assets/images/shared/error_bg.png"),
      require("./assets/images/shared/error_icon.png"),
      require("./assets/images/shared/fingerprint.png"),
      require("./assets/images/shared/first_bank.png"),
      require("./assets/images/shared/glo.png"),
      require("./assets/images/shared/gtb.png"),
      require("./assets/images/shared/happy_phone_presser.png"),
      require("./assets/images/shared/mtn.png"),
      require("./assets/images/shared/pay_with_agent.png"),
      require("./assets/images/shared/pay_with_card.png"),
      require("./assets/images/shared/pay_with_ussd.png"),
      require("./assets/images/shared/paystack_badge.png"),
      require("./assets/images/shared/profile.png"),
      require("./assets/images/shared/spectranet.png"),
      require("./assets/images/shared/success_bg.png"),
      require("./assets/images/shared/success_icon.png"),
      require("./assets/images/shared/cybersecurity.png"),
      require("./assets/images/shared/otpverification.png"),
      require("./assets/images/shared/icon_user.png"),
      require("./assets/images/transfers/home-bank.png"),
    ]);
    // Initialize remote configurations
    await remoteConfig().setConfigSettings({
      minimumFetchIntervalMillis: 900000, // Cache configs locally for 15mins
    });
    remoteConfig()
      .setDefaults({})
      .then(() => remoteConfig().fetchAndActivate())
      .then(() => {
        const appConfig = remoteConfig().getAll();
        // console.log('\n===== APP CONFIGURATIONS =====\n', JSON.stringify(appConfig, null, 4));
      });
    this.setState({ isReady: true });
  }
  render() {
    if (!this.state.isReady) {
      return null;
    }

    let scrollHeight = this.state.scrollHeight;
    let scrollWithTabHeight = this.state.scrollWithTabHeight;
    return (
      <ErrorBoundaries>
        <MenuProvider>
          <View style={SharedStyle.mainContainer}>
            <Provider store={store}>
              <PersistGate loading={null} persistor={persistor}>
                <Navigator
                  screenProps={{ scrollHeight, scrollWithTabHeight }}
                />
              </PersistGate>
            </Provider>
          </View>
        </MenuProvider>
      </ErrorBoundaries>
    );
  }
}

export default App;

//  updateFcmToken = async (phoneNumber, newToken) => {
//    try {
//      // Call the asynchronous function and await its response
//      const result = await Network.getFcmTokenAndSave(phoneNumber, newToken);

//      // Log the response here
//      console.log("FCM Token update API response:", result);

//      if (result.ok) {
//        console.log("FCM token update successful", newToken);

//        // Save the updated FCM token to local storage
//        this.saveFcmTokenToStorage(newToken);
//      } else {
//        console.error("Error updating FCM token:", result.statusText);
//      }
//    } catch (error) {
//      console.error("Error updating FCM token:", error.message);
//    }
//  };

// async function saveTokenToDatabase(token) {
//   // Modify this part based on your Firestore structure
//   const userCollection = firestore().collection("users");

//   // Use a unique identifier for the user (e.g., device ID or some custom ID)
//   const DEVICE_ID = "DEVICE_ID";

//   // Check if a document for the device ID already exists
//   const deviceDoc = await userCollection.doc(DEVICE_ID).get();

//   if (deviceDoc.exists) {
//     // If the document exists, update the tokens array
//     await userCollection.doc(DEVICE_ID).update({
//       tokens: firestore.FieldValue.arrayUnion(token),
//     });
//   } else {
//     // If the document doesn't exist, create a new one
//     await userCollection.doc(DEVICE_ID).set({
//       tokens: [token],
//     });
//   }
// }

//! Moved this Logic to handleAppLinks under navigation.js
// Set referral code if app was launched using referral dynamic link
// await dynamicLinks()
//   .getInitialLink()
//   .then(async (link) => {
//     if (link) {
//       console.log(link, "stageone");
//       const { url } = link
//       if (url.startsWith('https://dynamic.creditvillegroup.com/refer')) {
//         //Only bothered about referral here.
//         const referral_code = link.url.split("/").pop();
//         await AsyncStorage.setItem("referral_code", referral_code);
//       }else{
//         const path = url.split(':/')[1]
//         console.log({path}, "stagetwo");
//         const route = deeplinkRouteHandler(path)
//         console.log(route, "stagethree");
//         const isAuthenticated = false
//         if (isAuthenticated){
//           navigate(route)
//         }else{
//           await AsyncStorage.setItem("applink_screen", route);
//         }
//       }
//   }})

// import React, { Component } from "react";
// import { Keyboard, View, LogBox, Platform, AsyncStorage, Alert, BackHandler, Linking } from "react-native";
// import * as SplashScreen from "expo-splash-screen";
// import { Asset } from "expo-asset";
// import * as Font from "expo-font";
// import * as Icon from "@expo/vector-icons";
// import { PersistGate } from "redux-persist/integration/react";
// import { Provider } from "react-redux";
// import remoteConfig from "@react-native-firebase/remote-config";
// import dynamicLinks from "@react-native-firebase/dynamic-links";
// import { MenuProvider } from "react-native-popup-menu";
// import VersionCheck from "react-native-version-check";
// import { request, PERMISSIONS, check, RESULTS } from "react-native-permissions";
// import { Mixins, SharedStyle } from "_styles";
// import Navigator from "_navigations";
// import { navigate } from "./services/navigator";
// import { deeplinkRouteHandler } from "./utils/util";
// import ErrorBoundaries from "./error";
// import messaging from "@react-native-firebase/messaging";

// class App extends Component {
//   state = {
//     isReady: false,
//     scrollHeight: Mixins.DRAW_HEIGHT,
//     scrollWithTabHeight: Mixins.DRAW_HEIGHT_WITH_NAV,
//   };

//   isEnabled = false;
//   token = undefined;

//   async componentDidMount() {
//     try {
//       await SplashScreen.preventAutoHideAsync();
//     } catch (e) {
//       console.log(e);
//     }

//     // Check and request permissions
//     await this.checkPermissions();

//     // Initialize Firebase Cloud Messaging
//     await this.requestPermission();
//     const fcmToken = await this.registerForPushNotifications();
//     console.log("FCM Token on initialization:", fcmToken);

//     // Save the FCM token to AsyncStorage
//     this.saveFcmTokenToAsyncStorage(fcmToken);

//     this.messageListener = messaging().onMessage(async (payload) => {
//       console.log(
//         "Foreground Push Notification received",
//         JSON.stringify(payload, null, 4)
//       );

//       // Handle the foreground message as needed
//       Alert.alert("Foreground Notification", payload.notification.title);
//     });

//     this.loadResources();
//     LogBox.ignoreLogs(["Setting a timer"]);
//   }

//   componentWillUnmount = () => {
//     if (this.keyboardDidShowListener) {
//       this.keyboardDidShowListener.remove();
//     }
//     if (this.keyboardDidHideListener) {
//       this.keyboardDidHideListener.remove();
//     }
//   };

//   async requestPermission() {
//     const authStatus = await messaging().requestPermission();
//     const enabled =
//       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
//       authStatus === messaging.AuthorizationStatus.PROVISIONAL;

//     console.log(authStatus);

//     if (enabled) {
//       this.isEnabled = true;
//     }
//   }

//   async registerForPushNotifications() {
//     if (this.token) {
//       return this.token;
//     }

//     const token = await messaging().getToken();
//     console.log("FCM Token:", token);

//     this.token = token;
//     return token;
//   }

//   async checkPermissions() {
//     await this.checkLocationPermission();
//     await this.checkStoragePermission();
//     await this.checkCameraPermission();
//   }

//   async checkLocationPermission() {
//     const status = await check(
//       Platform.OS === "ios"
//         ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
//         : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
//     );

//     if (status !== RESULTS.GRANTED) {
//       const result = await request(
//         Platform.OS === "ios"
//           ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
//           : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
//       );

//       if (result === RESULTS.GRANTED) {
//         console.log("Location permission granted!");
//         // Handle granting as needed
//       } else {
//         console.log("Location permission denied!");
//         // Handle denial as needed
//       }
//     } else {
//       // Permission already granted, proceed
//       console.log("Location permission already granted!");
//     }
//   }

//   async checkStoragePermission() {
//     const status = await check(
//       Platform.OS === "ios"
//         ? PERMISSIONS.IOS.PHOTO_LIBRARY
//         : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
//     );

//     if (status !== RESULTS.GRANTED) {
//       const result = await request(
//         Platform.OS === "ios"
//           ? PERMISSIONS.IOS.PHOTO_LIBRARY
//           : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
//       );

//       if (result === RESULTS.GRANTED) {
//         console.log("Storage permission granted!");
//         // Handle granting as needed
//       } else {
//         console.log("Storage permission denied!");
//         // Handle denial as needed
//       }
//     } else {
//       // Permission already granted, proceed
//       console.log("Storage permission already granted!");
//     }
//   }

//   async checkCameraPermission() {
//     const status = await check(
//       Platform.OS === "ios"
//         ? PERMISSIONS.IOS.CAMERA
//         : PERMISSIONS.ANDROID.CAMERA
//     );

//     if (status !== RESULTS.GRANTED) {
//       const result = await request(
//         Platform.OS === "ios"
//           ? PERMISSIONS.IOS.CAMERA
//           : PERMISSIONS.ANDROID.CAMERA
//       );

//       if (result === RESULTS.GRANTED) {
//         console.log("Camera permission granted!");
//         // Handle granting as needed
//       } else {
//         console.log("Camera permission denied!");
//         // Handle denial as needed
//       }
//     } else {
//       // Permission already granted, proceed
//       console.log("Camera permission already granted!");
//     }
//   }

//   handleKeyboardOpened(e) {
//     this.setState({
//       scrollHeight: Mixins.DRAW_HEIGHT - e.endCoordinates.height,
//       scrollWithTabHeight:
//         Mixins.DRAW_HEIGHT_WITH_NAV - e.endCoordinates.height,
//     });
//   }
//   handleKeyboardClosed(e) {
//     this.setState({
//       scrollHeight: Mixins.DRAW_HEIGHT,
//       scrollWithTabHeight: Mixins.DRAW_HEIGHT_WITH_NAV,
//     });
//   }
//   async checkVersion() {
//     try {
//       let updateNeeded = await VersionCheck.needUpdate();
//       if (updateNeeded && updateNeeded.isNeeded) {
//         Alert.alert(
//           "Please Update",
//           "You will have to update your app to the latest version to continue using.",
//           [
//             {
//               text: "Update",
//               onPress: () => {
//                 BackHandler.exitApp();
//                 Linking.openURL(updateNeeded.storeUrl);
//               },
//             },
//           ],
//           { cancelable: false }
//         );
//       }
//     } catch (e) {
//       console.log("Update error:".e);
//     }
//   }
//   async loadResources() {
//     // Pre-load fonts
//     await Font.loadAsync({
//       ...Icon.AntDesign.font,
//       ...Icon.Entypo.font,
//       ...Icon.Feather.font,
//       ...Icon.FontAwesome.font,
//       ...Icon.Ionicons.font,
//       ...Icon.MaterialCommunityIcons.font,
//       ...Icon.MaterialIcons.font,
//       ...Icon.SimpleLineIcons.font,
//       "Roboto-Regular": require("./assets/fonts/Roboto-Regular.ttf"),
//       "Roboto-Medium": require("./assets/fonts/Roboto-Medium.ttf"),
//       "Roboto-Bold": require("./assets/fonts/Roboto-Bold.ttf"),
//     });

//     // Pre-load images
//     await Asset.loadAsync([
//       require("./assets/images/logo.png"),
//       require("./assets/images/tour/tour_1.png"),
//       require("./assets/images/tour/tour_2.png"),
//       require("./assets/images/tour/tour_3.png"),
//       require("./assets/images/login/banner.png"),
//       require("./assets/images/settings/accounts.png"),
//       require("./assets/images/settings/banks.png"),
//       require("./assets/images/settings/banner.png"),
//       require("./assets/images/settings/biometrics.png"),
//       require("./assets/images/settings/call.png"),
//       require("./assets/images/settings/change_password.png"),
//       require("./assets/images/settings/change_pin.png"),
//       require("./assets/images/settings/contact_support.png"),
//       require("./assets/images/settings/documents.png"),
//       require("./assets/images/settings/email.png"),
//       require("./assets/images/settings/facebook.png"),
//       require("./assets/images/settings/instagram.png"),
//       require("./assets/images/settings/next_of_kin.png"),
//       require("./assets/images/settings/notifications.png"),
//       require("./assets/images/settings/privacy_policy.png"),
//       require("./assets/images/settings/profile.png"),
//       require("./assets/images/settings/recover_pin.png"),
//       require("./assets/images/settings/terms_and_conditions.png"),
//       require("./assets/images/settings/twitter.png"),
//       require("./assets/images/settings/website.png"),
//       require("./assets/images/dashboard/airtime.png"),
//       require("./assets/images/dashboard/bill_payment.png"),
//       require("./assets/images/dashboard/empty_transactions.png"),
//       require("./assets/images/dashboard/loans.png"),
//       require("./assets/images/dashboard/loans_card.png"),
//       require("./assets/images/dashboard/savings.png"),
//       require("./assets/images/dashboard/savings_card.png"),
//       require("./assets/images/dashboard/transfers.png"),
//       require("./assets/images/savings/fixed.png"),
//       require("./assets/images/savings/halal.png"),
//       require("./assets/images/savings/regular.png"),
//       require("./assets/images/savings/rollover_savings.png"),
//       require("./assets/images/savings/savings_summary.png"),
//       require("./assets/images/savings/summary_bg.png"),
//       require("./assets/images/savings/top_up_savings.png"),
//       require("./assets/images/savings/withdraw_savings.png"),
//       require("./assets/images/loans/apply_bg.png"),
//       require("./assets/images/loans/cancel_loan.png"),
//       require("./assets/images/loans/debit_requirement_icon.png"),
//       require("./assets/images/loans/employment_requirement_icon.png"),
//       require("./assets/images/loans/guarantor_requirement_icon.png"),
//       require("./assets/images/loans/loan_history.png"),
//       require("./assets/images/loans/personal_requirement_icon.png"),
//       require("./assets/images/loans/repay_loan.png"),
//       require("./assets/images/loans/summary_bg.png"),
//       require("./assets/images/bills/bills_bg.png"),
//       require("./assets/images/transactions/credit.png"),
//       require("./assets/images/transactions/debit.png"),
//       require("./assets/images/referrals/referrals.png"),
//       require("./assets/images/shared/9mobile.png"),
//       require("./assets/images/shared/airtel.png"),
//       require("./assets/images/shared/call.png"),
//       require("./assets/images/shared/creditville.png"),
//       require("./assets/images/shared/empty_account.png"),
//       require("./assets/images/shared/empty_card.png"),
//       require("./assets/images/shared/error_bg.png"),
//       require("./assets/images/shared/error_icon.png"),
//       require("./assets/images/shared/fingerprint.png"),
//       require("./assets/images/shared/first_bank.png"),
//       require("./assets/images/shared/glo.png"),
//       require("./assets/images/shared/gtb.png"),
//       require("./assets/images/shared/happy_phone_presser.png"),
//       require("./assets/images/shared/mtn.png"),
//       require("./assets/images/shared/pay_with_agent.png"),
//       require("./assets/images/shared/pay_with_card.png"),
//       require("./assets/images/shared/pay_with_ussd.png"),
//       require("./assets/images/shared/paystack_badge.png"),
//       require("./assets/images/shared/profile.png"),
//       require("./assets/images/shared/spectranet.png"),
//       require("./assets/images/shared/success_bg.png"),
//       require("./assets/images/shared/success_icon.png"),
//       require("./assets/images/shared/cybersecurity.png"),
//       require("./assets/images/shared/otpverification.png"),
//       require("./assets/images/shared/icon_user.png"),
//       require("./assets/images/transfers/home-bank.png"),
//     ]);
//     // Initialize remote configurations
//     await remoteConfig().setConfigSettings({
//       minimumFetchIntervalMillis: 900000, // Cache configs locally for 15mins
//     });
//     remoteConfig()
//       .setDefaults({})
//       .then(() => remoteConfig().fetchAndActivate())
//       .then(() => {
//         const appConfig = remoteConfig().getAll();
//         // console.log('\n===== APP CONFIGURATIONS =====\n', JSON.stringify(appConfig, null, 4));
//       });
//     this.setState({ isReady: true });
//   }
//   render() {
//     if (!this.state.isReady) {
//       return null;
//     }

//     let scrollHeight = this.state.scrollHeight;
//     let scrollWithTabHeight = this.state.scrollWithTabHeight;
//     return (
//       <ErrorBoundaries>
//         <MenuProvider>
//           <View style={SharedStyle.mainContainer}>
//             <Provider store={store}>
//               <PersistGate loading={null} persistor={persistor}>
//                 <Navigator
//                   screenProps={{ scrollHeight, scrollWithTabHeight }}
//                 />
//               </PersistGate>
//             </Provider>
//           </View>
//         </MenuProvider>
//       </ErrorBoundaries>
//     );
//   }
// }

// export default App;
