import React, { Component } from "react";
import {
  BackHandler,
  StyleSheet,
  View,
  Text,
  AppState,
  Button,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
  PanResponder,
  Linking
} from "react-native";
import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { connect } from "react-redux";
import Modal from "react-native-modal";
import analytics from "@react-native-firebase/analytics";
import dynamicLinks from '@react-native-firebase/dynamic-links';
import * as Icon from "@expo/vector-icons";

import { hideToast } from "_actions/toast_actions";
import { hideExitDialog } from "_actions/util_actions";
import { getInformation } from "_actions/information_actions";
import {
  hideSessionDialog,
  refreshUserToken,
  clearUserData,
  showScreenInactivityDialog,
  hideScreenInactivityDialog,
  registerSessionListener
} from "_actions/user_actions";
import {
  setAppVersion,updatingApp,setDeepLinkPath
} from "_actions/settings_actions";

import NavLoader from "./nav_loader";
import TourNavigator from "./tour_navigator";
import AuthNavigator from "./auth_navigator";
import AppNavigator from "./app_navigator";

import { Dictionary } from "_utils";
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from "_styles";

import {
  ToastNotification,
  TouchItem,
  FloatingLabelInput,
  ScrollView,
} from "_atoms";
import {
  StatusBar,
  OfflineNotice,
  SessionTimeout,
  InactiveScreen,
} from "_organisms";
import { NavigatorService, Network } from "_services";

import { TextInput } from "react-native-gesture-handler";

import * as ExpoAuthentication from 'expo-local-authentication';
import codePush from "react-native-code-push";
import moment from "moment";
import Constants from 'expo-constants';

import { codePushDeploymentKeys } from "../../index";

import UpdatingScreen from "../screens/auth/ota_updating";
import UpdatingScreen2 from "../screens/auth/ota_updating2";
import { deeplinkRouteHandler } from "../utils/util";

const MIN_BACKGROUND_DURATION_IN_MIN = 15;

let count = 0

const RootNavigator = createSwitchNavigator(
  {
    Welcome: {screen: NavLoader, path: 'welcome'},
    Tour: {screen: TourNavigator, path: 'tour'},
    Auth: {screen: AuthNavigator, path: 'auth'},
    App: {screen: AppNavigator, path: 'app'},
  },
  {
    initialRouteName: "Welcome",
    headerMode: "none",
    // linking: linkingConfig,
  }
);
const AppContainer = createAppContainer(RootNavigator);

const labelStyle = {
  ...Typography.FONT_REGULAR,
  letterSpacing: Mixins.scaleSize(0.01),
  color: Colors.LIGHT_GREY,
  position: "absolute",
  left: Mixins.scaleSize(8),
};

const authRoutesThatRequireToken = [
  "EnterBVN",
  "ValidateBVN",
  // "EnterEmail",
  "UploadID",
  "UploadUtility",
  "CreatePIN",
]

const authRoutesThatDoesNotRequireToken = [  
  "ProductTour",
  "Login",
  "AuthorizeDevice",
  "EnterMobile",
  "ValidateMobile",
  "CreatePassword",
  "ForgotPassword",
  "ForgotPasswordOTP",
  "ResetPassword",
  "CreateUser",
  "Password"
  //  "Dashboard"
]

const authRoutes = [
  ...authRoutesThatDoesNotRequireToken, 
  ...authRoutesThatRequireToken
]



const prefix = /https:\/\/www.creditvillegroup.com\/|https:\/\/creditvillegroup.com\/|creditvillegroup:\/\/creditvillegroup\/|creditvillegroup:\/\//;
class Navigator extends Component {
  state = {
    isActive: true,
    showInActiveModal: true,
    timer: 200,
    timerPassword: "",
    hideTimerPassword: true,
    timerPasswordError:"",
    biometrics_supported: false,
    biometrics_enabled: false,
    is_biometrics_visible: false,
    currentScreen: "Login",
    prevScreen:"Login",
    showUpdatingScreen: false,
    lastBackgroundedTime: 0,
    appState: AppState.currentState,
  };

  componentDidMount() {
    this.handleAppLinks()
    //DEEP LINKING
    this.getInitialURL();
    Linking.addEventListener('url', this.handleDeepLink)
    this.initializeBiometrics();
    this.props.getInformation()
    // this.resetInactivityTimeout();
    // this.checkForOTAUpdate();
    // this.setCodePushVersionNumber();
   // AppState.addEventListener("change", this.handleAppStateChange);
    if(this.props.user.show_session_dialog) {
      this.props.hideSessionDialog();
    }
  }
  


    getInitialURL = async () => {
    const url = await Linking.getInitialURL();
    if (url) {
        setTimeout(() => {
            this.handleDeepLink({ url });
        }, 2000);
    }

    return url;
}

  handleAppLinks = async () => {
    await dynamicLinks()
      .getInitialLink()
      .then(async (link) => {
        console.log("Pqewrererer", {link});
        if (link) {
          const { url } = link
          if (url.startsWith('https://dynamic.creditvillegroup.com/refer')) {
            const referral_code = link.url.split("/").pop();
            await AsyncStorage.setItem("referral_code", referral_code);
            return;
          }
          const path = url.split(':/')[1]
          const route = deeplinkRouteHandler(path)
          const isAuthenticated = this.props.user.user_data.token
          if (isAuthenticated) {
            NavigatorService.navigate(route)
          }else{
            this.props.setDeepLinkPath(route)
            NavigatorService.navigate("Login")
          }
        }else{
          
        }
    })
  }

  panResponder = PanResponder.create({
    onStartShouldSetPanResponderCapture: () => {
        this.resetInactivityTimeout()
    },
  });

  resetInactivityTimeout = () => {
    // this.props.user.session_timeout_ref
    if(true){
      clearTimeout(this.timerId)
    //   // clearTimeout(this.navigationTimerId)
      this.timerId = setTimeout(() => {
        // action after user has been detected idle
        // this.props.refreshUserToken();
        this.props.showScreenInactivityDialog()
      },  50000)
    //   // }, this.props.user.user_data.expires_in * 1000)
    }
  }

  setCodePushVersionNumber = async () => {
    try {
      const data = await codePush.getUpdateMetadata()
      const label = data.label.substring(1)
      this.props.setAppVersion({version_date: data.binaryModifiedTime, version_number: `${data.appVersion}.${label}`})
    } catch (error) {
      this.props.setAppVersion({version_number:`${Constants.nativeAppVersion}`})
    }
  }

  handleDeepLink = async (event = null) => {
      if (!event) return
      const {url} = event
      const path = url.split(':/')[1]
      const isAuthenticated = this.props.user.user_data.token
      const route = deeplinkRouteHandler(path)
      if (isAuthenticated) {
        NavigatorService.navigate(route)
      }
      else{
        this.props.setDeepLinkPath(route)
        NavigatorService.navigate("Login")
      }
  }

  checkForOTAUpdate = async (state = true) => { 
    try {
    const update = await codePush.checkForUpdate(codePushDeploymentKeys)
      if (update) {
        this.props.updatingApp(true)
      }
      else{
        this.props.updatingApp(false)
      }
    }
    catch (error) {
      this.props.updatingApp(false)
      console.log("KO SI ERROR9", error)}
  }

  handleAppStateChange = async nextAppState => {
    const { appState, lastBackgroundedTime } = this.state;

    // Try to run the CodePush sync whenever app comes to foreground
    if (appState.match(/inactive|background/) && nextAppState === "active") {
      // Only run the sync if app has been in the background for a certain amount of time
      if (
        moment.duration(moment().diff(lastBackgroundedTime)).asMinutes() >
        MIN_BACKGROUND_DURATION_IN_MIN
      ) {
        // Please show the user some feedback while running this
        // This might take some time, especially if an update is available
        // const update = await codePush.checkForUpdate(codePushDeploymentKeys)
        // if (update) {
        //   console.log("we reach here 2",{update})
        //   this.props.updatingApp(true)
        // }
        // else{
        //   console.log("Update no dey boss",{update})
        //   this.props.updatingApp(false)
        // }

      }
    }

    if (nextAppState.match(/inactive|background/)) {
      this.setState({
        lastBackgroundedTime: moment(),
      });
    }

    if (appState !== nextAppState)
      this.setState({
        appState: nextAppState,
      });
  };

  componentWillUnmount() {
    clearTimeout(this.timerId)
    clearTimeout(this.navigationTimerId)
    //AppState.removeEventListener("change", this.handleAppStateChange);
    Linking.removeEventListener('url', this.handleDeepLink);
  }

  // this.props.user.user_data.expires_in * 1000

  handleLogin = (isBiometrics = false) => {
    if (isBiometrics) {
      ///this.props.refreshUserToken();
      this.setState({timerPasswordError:"", timerPassword:""})
      this.props.hideScreenInactivityDialog()
    //  this.props.refreshUserToken();
      this.resetInactivityTimeout()
      return;
    }
    if (this.state.timerPassword.length < 1) return;
    if (this.state.timerPassword === this.props.user.user_pwd) {
      this.setState({timerPasswordError:"", timerPassword:""})
    //  this.props.refreshUserToken();
      this.props.hideScreenInactivityDialog()
      this.resetInactivityTimeout()
    }else{
      this.setState({timerPasswordError:"Invalid login details"})
    }
  }


  initializeBiometrics = async () => {
    this.showBiometricsDialog();
    let compatible = await ExpoAuthentication.hasHardwareAsync();
    if (!compatible) {
        return;
    }
    let isEnrolled = await ExpoAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
        console.log('Biometrics not set up on device... Please check OS settings.');
    } else {
        this.setState({
            biometrics_supported: true,
            biometrics_enabled: this.props.settings.biometric_login && this.props.user.user_data.phoneNumber && this.props.user.user_pwd
        }, () => {
            if (this.state.biometrics_supported &&
                this.state.biometrics_enabled && this.props.user.user_data.activated === 1) {
                this.showBiometricsDialog();
            }
        });
    }
  }



  scanBiometrics = async () => {
    let result = await ExpoAuthentication.authenticateAsync({
        promptMessage: Dictionary.CONFIRM_IDENTITY,
        cancelLabel: Dictionary.USE_PASSWORD_BTN,
        fallbackLabel: '',
        disableDeviceFallback: true
    });

    if (result.success) {
        this.hideBiometricsDialog();
        this.handleLogin(true);
    } else {
        this.hideBiometricsDialog();
    }
}

  showBiometricsDialog = async () => {
    this.setState({
        is_biometrics_visible: true
    });
  }

  hideBiometricsDialog = () => {
    ExpoAuthentication.cancelAuthenticate();
    // this.setState({
    //     is_biometrics_visible: false
    // });
  }

  handleLogOut = () => {    
    Network.logoutUser().then((result) => {
        if (result.status === 200) {
            console.log("Logout successful")
            // this.props.clearUserData();      
        }
    }).catch((e) => console.log("Logout error message", e))
  }

  render() {
    return <View style={{ flex: 1 }} {...this.panResponder.panHandlers}>
        <StatusBar statusBarStyle={this.props.util.statusBarStyle} />
        <OfflineNotice />

        <Modal
          //isVisible={this.props.user.show_screen_inactivity_dialog &&  !authRoutes.includes(this.state.currentScreen)}
          // isVisible={this.props.user.show_screen_inactivity_dialog}
          animationInTiming={500}
          animationOutTiming={800}
          backdropTransitionInTiming={500}
          backdropTransitionOutTiming={800}
          useNativeDriver={true}
          style={SharedStyle.modal}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              margin: 20,
              borderRadius: 10,
              padding: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: Colors.CV_YELLOW,
                  fontWeight: "bold",
                  textAlign: "center",
                  margin: 5,
                }}
              >
                {`${Dictionary.HELLO} ${this.props.user.user_data.firstName ? this.props.user.user_data.firstName : "" } unlock the app to continue`}
              </Text>
              <View
                style={[
                  FormStyle.formItem,
                  { marginVertical: 20, paddingHorizontal: 5 },
                ]}
              >
                <View
                  style={{
                    width: Dimensions.get("screen").width - 60,
                    borderRadius: 5,
                    height: 60,
                    borderColor: Colors.LIGHT_GREY,
                    borderWidth: 2, 
                    borderWidth: Mixins.scaleSize(1),
                    borderRadius: Mixins.scaleSize(4),
                    borderColor: Colors.INPUT_BORDER,
                    justifyContent:"space-between",
                    flexDirection:"row"
                  }}
                >
                  <TextInput
                    style={{
                      fontSize: Mixins.scaleFont(16),
                      color: Colors.DARK_GREY,
                      flex:1
                    }}
                    placeholder="Password"
                    placeholderTextColor={Colors.LIGHT_GREY}
                    value={this.state.timerPassword}
                    onChangeText={(value)=>this.setState({timerPassword:value})}
                    secureTextEntry={this.state.hideTimerPassword}
                  />
                  <View style={{flexDirection:"row", alignItems:"center", height:"100%"}}>
                  {true && (
                  <TouchItem
                    style={[
                      // styles.secureToggle,
                      {backgroundColor:"white", marginRight:10}
                    ]}
                    onPress={()=>{this.setState({hideTimerPassword:!this.state.hideTimerPassword})}}
                  >
                    <Icon.Ionicons
                      style={styles.secureToggleIcon}
                      size={Mixins.scaleSize(25)}
                      name={!this.state.hideTimerPassword ? "ios-eye-off" : "ios-eye"}
                    />
                  </TouchItem>
                )}
                {this.state.is_biometrics_visible && (
                  <TouchItem
                    style={[{backgroundColor:"white", marginRight:10}]}
                    onPress={this.scanBiometrics}
                  >
                    <Image
                      style={styles.fingerprintImage}
                      source={require("../assets/images/shared/fingerprint.png")}
                    />
                  </TouchItem>
                )}
                  </View>
                </View>
                <View>
                  <TouchItem
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 10,
                      backgroundColor: Colors.CV_YELLOW,
                      borderRadius: 5,
                      marginTop: 20,
                    }}
                    onPress={()=>{

                      this.handleLogin()
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: 18,
                      }}
                    >
                      Continue
                    </Text>
                  </TouchItem>
                </View>
                {/* <FloatingLabelInput
                    label={Dictionary.PASSWORD_LABEL}
                    value={"this.state.password"}
                    secureTextEntry={!false}
                    multiline={false}
                    autoCorrect={false}
                    onChangeText={password => this.setState({
                        password,
                        password_error: ''
                    })}
                    style={{backgroundColor:"RED"}}
                    editable={!false}
                  /> */}
                
                <Text style={FormStyle.formError}>{this.state.timerPasswordError}</Text>
              </View>
            </View>
            <View style={{ position: "absolute", bottom: 10, width: "100%" }}>
              <TouchableOpacity
                style={{ fontSize: 18, fontWeight: "600", color: Colors.CV_YELLOW }}
                onPress={() => {
                  this.setState({timerPasswordError:"", timerPassword:""})
                  this.props.hideScreenInactivityDialog()
                  clearTimeout(this.timerId)
                  NavigatorService.navigate("Login");
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: Colors.CV_YELLOW,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <ToastNotification
          text={this.props.toast.message}
          isVisible={this.props.toast.show}
          action={this.props.toast.action}
          actionText={this.props.toast.actionText}
          isError={this.props.toast.isError}
          onClose={this.props.hideToast}
        />
        <View style={{ flex: 1 }}>
          <AppContainer
            // enableURLHandling={false} 
            // uriPrefix={"/https?:\/\/creditvillegroup.com|https?:\/\/www.creditvillegroup.com|creditvillegroup.com|com.creditville:\//;"}
            screenProps={this.props.screenProps}
            ref={(navigatorRef) => {
              NavigatorService.setTopLevelNavigator(navigatorRef);
            }}
            onNavigationStateChange={async (prevState, currentState) => {
              const currentScreen = getCurrentRouteName(currentState);
              const prevScreen = getCurrentRouteName(prevState);
              this.setState({currentScreen})
              if (authRoutesThatDoesNotRequireToken.includes(currentScreen)){ 
                this.props.hideScreenInactivityDialog()
                clearTimeout(this.timerId)
              }else{
                // this.navigationTimerId = setTimeout(() => {
                //   this.props.refreshUserToken();
                //   console.log("calling timer ", count++);
                // }, this.props.user.user_data.expires_in * 1000);
                // this.props.hideScreenInactivityDialog();
                // this.resetInactivityTimeout()
                // this.navigationTimerId = this.props.refreshUserToken();
              }
              this.setState({currentScreen})
              if (prevScreen !== currentScreen) {
                console.log(
                  "Navigation: " + prevScreen + "-> " + currentScreen
                );
                await analytics().logScreenView({
                  screen_name: currentScreen,
                  screen_class: currentScreen,
                });
              }
            }}
          />
          <Modal
            isVisible={this.props.util.showExitDialog}
            animationInTiming={500}
            animationOutTiming={800}
            backdropTransitionInTiming={500}
            backdropTransitionOutTiming={800}
            useNativeDriver={true}
            style={styles.exitDialog}
          >
            <View style={styles.dialog}>
              <View style={styles.slider} />
              <View style={[SharedStyle.mainContainer, styles.container]}>
                <Text style={styles.header}>{Dictionary.CONFIRM}</Text>
                <Text style={styles.message}>{Dictionary.EXIT_APP}</Text>
                <View style={styles.buttons}>
                  <TouchItem
                    style={styles.button}
                    onPress={this.props.hideExitDialog}
                  >
                    <Text style={styles.buttonText}>{Dictionary.NO_BTN}</Text>
                  </TouchItem>
                  <TouchItem
                    style={styles.button}
                    onPress={() => {
                      this.setState({timerPasswordError:"", timerPassword:""})
                      this.props.hideScreenInactivityDialog()
                      clearTimeout(this.timerId)
                      clearTimeout(this.timerId)
                      this.props.clearUserData();
                      this.props.hideExitDialog();
                      NavigatorService.navigate("Login");
                      BackHandler.exitApp();
                    }}
                  >
                    <Text style={styles.buttonText}>{Dictionary.YES_BTN}</Text>
                  </TouchItem>
                </View>
              </View>
            </View>
          </Modal>
          {this.props.user.show_session_dialog && (
            <SessionTimeout
              isVisible={this.props.user.show_session_dialog}
              onTimeOut={() => {
                this.props.hideSessionDialog();
                NavigatorService.navigate("Login");
                this.handleLogOut();
              }}
              onContinue={() => {
                this.props.hideSessionDialog();
                this.props.registerSessionListener(this.props.user.user_data);
              }}
            />
          )}
         {this.props.settings.app_is_updating && <UpdatingScreen2 />}
        </View>
      </View>
  }
}

const getCurrentRouteName = (navigationState) => {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];
  if (route.routes) {
    return getCurrentRouteName(route);
  }
  return route.routeName;
};

const styles = StyleSheet.create({
  exitDialog: {
    justifyContent: "flex-end",
    margin: 0,
  },
  dialog: {
    ...Mixins.padding(0, 16, 16, 16),
    height: Mixins.scaleSize(235),
    alignItems: "center",
  },
  slider: {
    width: Mixins.scaleSize(50),
    height: Mixins.scaleSize(5),
    marginBottom: Mixins.scaleSize(12),
    backgroundColor: Colors.WHITE,
    borderRadius: Mixins.scaleSize(80),
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "100%",
    borderRadius: Mixins.scaleSize(8),
  },
  header: {
    ...Mixins.padding(24, 16, 24, 16),
    ...Typography.FONT_BOLD,
    fontSize: Mixins.scaleFont(16),
    lineHeight: Mixins.scaleSize(19),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.DARK_GREY,
    borderBottomColor: Colors.FAINT_BORDER,
    borderBottomWidth: Mixins.scaleSize(1),
  },
  message: {
    ...Mixins.padding(32, 16, 32, 16),
    flexDirection: "row",
    justifyContent: "space-between",
    ...Typography.FONT_MEDIUM,
    color: Colors.DARK_GREY,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
  },
  buttons: {
    flex: 1,
    flexDirection: "row",
    borderTopColor: Colors.FAINT_BORDER,
    borderTopWidth: Mixins.scaleSize(1),
  },
  button: {
    flex: 1,
    justifyContent: "center",
  },
  buttonText: {
    textAlign: "center",
    ...Typography.FONT_MEDIUM,
    color: Colors.CV_YELLOW,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
  },
  timeoutText: {
    ...SharedStyle.biometricText,
    width: "70%",
  },
  banner: {
    width: "100%",
    height: Mixins.scaleSize(171),
  },
  bannerText: {
    ...Mixins.margin(90, 0, 24, 16),
  },
  title: {
    ...Typography.FONT_MEDIUM,
    fontSize: Mixins.scaleFont(25),
    color: Colors.WHITE,
    marginBottom: Mixins.scaleSize(12),
  },
  description: {
    ...Typography.FONT_REGULAR,
    color: Colors.WHITE,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
  },
  secureToggle: {
    ...Mixins.padding(15),
    position: "absolute",
    right: 0,
  },
  secureToggleIcon: {
    color: Colors.CV_YELLOW,
  },
  fingerprint: {
    ...Mixins.padding(12),
    position: "absolute",
    right: 0,
  },
  fingerprintImage: {
    width: Mixins.scaleSize(24),
    height: Mixins.scaleSize(31),
  },
  alternate: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Mixins.scaleSize(16),
    backgroundColor: Colors.ASH_BG,
    position: "absolute",
    bottom: 0,
  },
  alternateText: {
    flex: Mixins.scaleSize(3.2),
    color: Colors.LIGHT_GREY,
  },
  alternateTextIcon: {
    marginRight: Mixins.scaleSize(10),
    color: Colors.CV_YELLOW,
  },
  alternateTextAction: {
    ...Typography.FONT_MEDIUM,
    fontSize: Mixins.scaleFont(14),
    color: Colors.CV_YELLOW,
  },
});

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user,
    util: state.util,
    toast: state.toast,
    settings: state.settings,
  };
};

const mapDispatchToProps = {
  hideToast,
  hideExitDialog,
  hideSessionDialog,
  clearUserData,
  refreshUserToken,
  showScreenInactivityDialog,
  hideScreenInactivityDialog,
  setAppVersion,
  updatingApp,
  setDeepLinkPath,
  getInformation,
  registerSessionListener
};

export default connect(mapStateToProps, mapDispatchToProps)(Navigator);