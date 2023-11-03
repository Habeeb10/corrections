import React, { Component } from "react";
import {
  Keyboard,
  View,
  InteractionManager,
  Linking,
  Alert,
  BackHandler,
  LogBox,
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import * as SplashScreen from "expo-splash-screen";
import { Asset } from "expo-asset";
import * as Font from "expo-font";
import * as Icon from "@expo/vector-icons";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store/index";
import remoteConfig from "@react-native-firebase/remote-config";
import dynamicLinks from "@react-native-firebase/dynamic-links";
import { MenuProvider } from "react-native-popup-menu";
import VersionCheck from "react-native-version-check";

import { Mixins, SharedStyle } from "_styles";
import Navigator from "_navigations";
import { navigate } from "./services/navigator";
import { deeplinkRouteHandler } from "./utils/util";
import ErrorBoundries from "./error";

class App extends Component {
  state = {
    isReady: false,
    scrollHeight: Mixins.DRAW_HEIGHT,
    scrollWithTabHeight: Mixins.DRAW_HEIGHT_WITH_NAV,
  };

  async componentDidMount() {
    try {
      await SplashScreen.preventAutoHideAsync();
    } catch (e) {
      console.log(e);
    }
    this.keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => this.handleKeyboardOpened(e)
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      (e) => this.handleKeyboardClosed(e)
    );
    this.loadResources();
    // this.checkVersion();
    LogBox.ignoreLogs(["Setting a timer"]);
  }

  componentWillUnmount = () => {
    if (this.keyboardDidShowListener) {
      this.keyboardDidShowListener.remove();
    }
    if (this.keyboardDidHideListener) {
      this.keyboardDidHideListener.remove();
    }
  };

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
      //console.log("updateNeeded", updateNeeded)
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

    this.setState({ isReady: true });
  }

  render() {
    if (!this.state.isReady) {
      return null;
    }

    let scrollHeight = this.state.scrollHeight;
    let scrollWithTabHeight = this.state.scrollWithTabHeight;
    return (
      <ErrorBoundries>
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
      </ErrorBoundries>
    );
  }
}

export default App;
