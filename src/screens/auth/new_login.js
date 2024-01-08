import React, { Component } from "react";
import {
  BackHandler,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Image,
} from "react-native";
import { PrimaryButton, PasswordCriteria, ActionButton } from "_molecules";

import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import * as Icon from "@expo/vector-icons";
import Modal from "react-native-modal";
import { showToast, showToastNav } from "_actions/toast_actions";
import { showExitDialog, resetStatusBarStyle } from "_actions/util_actions";
import { Dictionary, Util, ResponseCodes } from "_utils";
import { SharedStyle, FormStyle, Mixins, Colors, Typography } from "_styles";
import { SubHeader, ScrollView, FloatingLabelInput, TouchItem } from "_atoms";
import { MainHeader } from "_organisms";
import { clearDeepLinkPath } from "_actions/settings_actions";
import { AsyncStorage, Alert } from "react-native";
import { Network } from "_services";
import {
  registerSessionListener,
  removeSessionListener,
  storeUserData,
  storeUserPwd,
  clearUserPin,
  resetLoanApplicationData,
} from "_actions/user_actions";
import NotificationService from "../auth/fcmToken"; // Replace with the correct path
import * as ExpoAuthentication from "expo-local-authentication";

// import { getImage } from "_actions/information_actions";

class Login extends Component {
  constructor(props) {
    super(props);
    const { navigation } = this.props;

    const is_system_upgrade = navigation.getParam("is_system_upgrade") ?? false;
    const phone_number = navigation.getParam("phone_number");
    this.state = {
      phone_number: this.props.user.user_data.phoneNumber ?? "",
      phone_number_error: "",
      processing: false,
      isFocused: false,
      // image: this.props.information.image,
      // information: this.props.information.imageVisible,
      modal_visible: true,
      password_error: "",
      longitude: "",
      latitude: "",
      secure_text: false,
      biometrics_supported: false,
      biometrics_enabled: false,
      is_biometrics_visible: false,
      authenticating: false,
      isOffline: false,
      showLocationModal: false,
      password: "",
      passwordProcessing: false,
      is_system_upgrade,
    };
  }
  notificationService = new NotificationService();

  async componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    this.props.removeSessionListener();
    this.props.resetStatusBarStyle();
    this.initializeBiometrics();

    this.unsubscribe = NetInfo.addEventListener((state) => {
      this.setState(
        {
          isOffline: !state.isInternetReachable,
        },
        () => {
          if (this.state.isOffline && this.state.is_biometrics_visible) {
            this.hideBiometricsDialog();
          }
        }
      );
    });
    this.getUserLocation();
  }
  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
  // componentDidUpdate(prevProps) {
  //   if (this.props.information !== prevProps.information) {
  //     this.setState({
  //       image: this.props.information.image,
  //       information: this.props.information.imageVisible,
  //     });
  //   }
  // }

  getUserLocation = async () => {
    try {
      let { status } = await Location.requestPermissionsAsync();
      if (status === "granted") {
        try {
          let location = await Location.getCurrentPositionAsync({
            enableHighAccuracy: true,
          });
          if (!location) {
            location = await Location.getLastKnownPositionAsync();
          }
          if (__DEV__) {
            this.setState({ latitude: "6.465422", longitude: "3.406448" });
          } else {
            this.setState({
              latitude: location.coords.latitude + "",
              longitude: location.coords.longitude + "",
            });
          }
        } catch (error) {
          this.setState({ processing: false }, () => {
            this.props.showToast(Dictionary.LOCATION_ERROR);
          });
        }
      } else {
        this.setState({ processing: false }, () => {
          this.props.showToast(Dictionary.LOCATION_PERMISSION_REQUIRED);
        });
      }
    } catch (error) {
      this.props.showToast(Dictionary.LOCATION_PERMISSION_REQUIRED);
    }
  };
  handleBackButton = () => {
    if (this.props.isFocused) {
      if (!this.state.authenticating) {
        if (this.state.is_biometrics_visible) {
          this.hideBiometricsDialog();
        } else {
          this.props.navigation.goBack();
        }
      }

      return true;
    }
  };
  initializeBiometrics = async () => {
    let compatible = await ExpoAuthentication.hasHardwareAsync();
    if (!compatible) {
      return;
    }

    let isEnrolled = await ExpoAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      console.log(
        "Biometrics not set up on device... Please check OS settings."
      );
    } else {
      this.setState(
        {
          biometrics_supported: true,
          biometrics_enabled:
            this.props.settings.biometric_login &&
            this.props.user.user_data.phoneNumber &&
            this.props.user.user_pwd,
        },
        () => {
          if (
            !this.state.isOffline &&
            this.state.biometrics_supported &&
            this.state.biometrics_enabled
          ) {
            this.showBiometricsDialog();
          }
        }
      );
    }
  };
  toggleSecureText = () => {
    this.setState({
      secure_text: !this.state.secure_text,
    });
  };
  showBiometricsDialog = async () => {
    this.setState({
      is_biometrics_visible: true,
    });
  };

  scanBiometrics = async () => {
    let result = await ExpoAuthentication.authenticateAsync({
      promptMessage: Dictionary.CONFIRM_IDENTITY,
      cancelLabel: Dictionary.USE_PASSWORD_BTN,
      fallbackLabel: "",
      disableDeviceFallback: true,
    });

    if (result.success) {
      this.hideBiometricsDialog();
      this.handleSubmit(true);
    } else {
      this.hideBiometricsDialog();
    }
  };

  hideBiometricsDialog = () => {
    ExpoAuthentication.cancelAuthenticate();
    this.setState({
      is_biometrics_visible: false,
    });
  };
  handleAuthorizeDevice = () => {
    this.props.navigation.navigate("AuthorizeDevice", {
      phone_number: this.state.phone_number,
      password: this.state.password,
    });
  };
  handleForgot = () => {
    this.props.navigation.navigate("ForgotPassword");
  };
  loadSignUp = () => {
    this.props.navigation.navigate("EnterMobile");
  };
  validFields = (isBiometrics) => {
    let isValid = true;

    if (!isBiometrics && !this.state.password) {
      isValid = false;
      this.setState({ password_error: Dictionary.REQUIRED_FIELD });
    }

    return isValid;
  };
  forgotPassword = () => {
    this.setState({ passwordProcessing: true }, () => {
      Network.initializeSignUp(this.state.phone_number)
        .then((data) => {
          if (data.resp.code == ResponseCodes.SUCCESS_CODE) {
            this.setState({ processing: false }, () => {
              this.props.showToast("This phone number do not exist!");
            });
          } else {
          }
        })
        .catch((error) => {
          if (error.code == ResponseCodes.USER_ALREADY_EXIST) {
            //continue with the process
            const phoneVal = Util.stripFirstZeroInPhone(
              this.state.phone_number
            );
            Network.requestOtp(
              phoneVal,
              ResponseCodes.OTP_TYPE.REG,
              ResponseCodes.OTP_NOTIFICATION_TYPE.SMS,
              this.state.phone_number
            )
              .then(() => {
                this.setState({ passwordProcessing: false }, () => {
                  this.props.navigation.navigate("ForgotPasswordOTP", {
                    phone_number: this.state.phone_number,
                  });
                  Util.logEventData("onboarding_forgot");
                });
              })
              .catch((error) => {
                this.setState({ passwordProcessing: false }, () =>
                  this.props.showToast(error.message)
                );
              });
          } else {
            this.setState({ passwordProcessing: false }, () =>
              this.props.showToast(error.message)
            );
          }
        });
    });
  };
  routeToPage = (user_data) => {
    let { stage, activated, validDevice, isFirstTimeLogin } = user_data;
    let target;
    if (activated === 1) {
      target = "Dashboard";
    } else if (validDevice == "N") {
      target = "AuthorizeDevice";
      this.props.showToastNav("This device is not authorized", {
        action: this.handleAuthorizeDevice,
        actionText: Dictionary.AUTHORIZE_DEVICE_BTN,
      });

      return;
    } else if (stage === "0") {
      target = "EnterBVN";
    } else if (stage === "1") {
      target = "EnterBVN";
    } else if (stage === "2") {
      target = "EnterBVN";
    } else if (stage === "3") {
      target = "Dashboard";
    } else if (stage === 5) {
      target = "CreatePIN";
    } else {
      target = "Dashboard";
    }

    if (target === "Dashboard") {
      this.props.registerSessionListener(user_data);
    }

    this.setState({ authenticating: false }, () => {
      this.props.navigation.navigate(target);
    });
  };

  handleSubmit = async (isBiometrics) => {
    if (this.validFields(isBiometrics)) {
      let { phone_number, password, latitude, longitude } = this.state;

      if (isBiometrics) {
        phone_number = this.props.user.user_data.phoneNumber;
        password = this.props.user.user_pwd;
      }

      // Check if the locally stored FCM token is available
      try {
        const storedFcmToken = await AsyncStorage.getItem("fcmToken");
        console.log("Stored FCM Token:", storedFcmToken);

        // Register for push notifications and obtain FCM token
        const fcmToken =
          await this.notificationService.registerForPushNotifications();

        console.log("Current FCM Token:", fcmToken);

        // Add FCM token to the authentication request
        let previous_user = this.props.user.user_data.phoneNumber;

        if (storedFcmToken) {
          // If the user already has a stored FCM token, compare with the new one
          if (storedFcmToken !== fcmToken) {
            // Save the new FCM token locally
            await AsyncStorage.setItem("fcmToken", fcmToken);
            console.log("New FCM Token saved locally:", fcmToken);

            // Continue with the authentication process
            this.setState({ authenticating: true }, async () => {
              Network.authenticateUser(
                phone_number,
                password,
                latitude,
                longitude
              )
                .then(async (result) => {
                  this.setState(
                    {
                      authenticating: false,
                      password: "",
                    },
                    async () => {
                      let user_data = {
                        ...result,
                        activated: "",
                        stage_id: "",
                      };
                      user_data.phoneNumber = phone_number;
                      this.props.storeUserData(user_data);
                      this.props.storeUserPwd(password);

                      if (phone_number !== previous_user) {
                        this.props.clearUserPin();
                        this.props.resetLoanApplicationData();
                      }

                      setTimeout(async () => {
                        this.routeToPage(user_data);
                        Util.logEventData("onboarding_sign_in");
                        // Update FCM token on the server
                        Network.getFcmTokenAndSave(phone_number, fcmToken)
                          .then((data) => {
                            // Handle successful response
                            console.log("FCM token response:", data);
                          })
                          .catch((error) => {
                            // Handle errors
                            console.error("Error:", error.message);
                          });
                      }, 1000);
                    }
                  );
                })
                .catch((error) => {
                  this.setState(
                    {
                      authenticating: false,
                    },
                    () => {
                      if (error.http_status === 412) {
                        this.props.showToastNav(error.message, {
                          action: this.handleAuthorizeDevice,
                          actionText: Dictionary.AUTHORIZE_DEVICE_BTN,
                        });
                      } else {
                        this.props.showToast(error.message);
                      }
                    }
                  );
                });
            });
          } else {
            // If the stored token is the same as the current one, proceed with the existing token
            this.setState({ authenticating: true }, async () => {
              Network.authenticateUser(
                phone_number,
                password,
                latitude,
                longitude
              )
                .then(async (result) => {
                  this.setState(
                    {
                      authenticating: false,
                      password: "",
                    },
                    async () => {
                      let user_data = {
                        ...result,
                        activated: "",
                        stage_id: "",
                      };
                      user_data.phoneNumber = phone_number;
                      this.props.storeUserData(user_data);
                      this.props.storeUserPwd(password);

                      if (phone_number !== previous_user) {
                        this.props.clearUserPin();
                        this.props.resetLoanApplicationData();
                      }

                      setTimeout(async () => {
                        this.routeToPage(user_data);
                        Util.logEventData("onboarding_sign_in");
                      }, 1000);
                    }
                  );
                })
                .catch((error) => {
                  this.setState(
                    {
                      authenticating: false,
                    },
                    () => {
                      if (error.http_status === 412) {
                        this.props.showToastNav(error.message, {
                          action: this.handleAuthorizeDevice,
                          actionText: Dictionary.AUTHORIZE_DEVICE_BTN,
                        });
                      } else {
                        this.props.showToast(error.message);
                      }
                    }
                  );
                });
            });
          }
        } else {
          // If there is no stored token, generate a new one and proceed with the new token
          await AsyncStorage.setItem("fcmToken", fcmToken);
          console.log("FCM Token saved locally:", fcmToken);

          // Continue with the authentication process
          this.setState({ authenticating: true }, async () => {
            Network.authenticateUser(
              phone_number,
              password,
              latitude,
              longitude
            )
              .then(async (result) => {
                this.setState(
                  {
                    authenticating: false,
                    password: "",
                  },
                  async () => {
                    let user_data = { ...result, activated: "", stage_id: "" };
                    user_data.phoneNumber = phone_number;
                    this.props.storeUserData(user_data);
                    this.props.storeUserPwd(password);

                    if (phone_number !== previous_user) {
                      this.props.clearUserPin();
                      this.props.resetLoanApplicationData();
                    }

                    setTimeout(async () => {
                      this.routeToPage(user_data);
                      Util.logEventData("onboarding_sign_in");

                      console.log({
                        phone_number: phone_number,
                        fcmToken: fcmToken,
                      });
                      // Update FCM token on the server
                      Network.getFcmTokenAndSave(phone_number, fcmToken)
                        .then((data) => {
                          // Handle successful response
                          console.log("FCM token response:", data);
                        })
                        .catch((error) => {
                          // Handle errors
                          console.error("Error:", error.message);
                        });
                    }, 1000);
                  }
                );
              })
              .catch((error) => {
                this.setState(
                  {
                    authenticating: false,
                  },
                  () => {
                    if (error.http_status === 412) {
                      this.props.showToastNav(error.message, {
                        action: this.handleAuthorizeDevice,
                        actionText: Dictionary.AUTHORIZE_DEVICE_BTN,
                      });
                    } else {
                      this.props.showToast(error.message);
                    }
                  }
                );
              });
          });
        }
      } catch (storageError) {
        console.error("Error accessing AsyncStorage:", storageError);
        // Handle the error appropriately, such as showing a message to the user
      }
    }
  };

  validFields = () => {
    let isValid = true;
    if (!Util.isValidPhone(this.state.phone_number)) {
      isValid = false;
      this.setState({ phone_number_error: Dictionary.ENTER_VALID_PHONE });
    }
    return isValid;
  };
  handleFocus = () => {
    this.setState({ isFocused: true });
    this.props.onFocus && this.props.onFocus();
  };
  handleBlur = () => {
    this.setState({ isFocused: false });
    this.props.onBlur && this.props.onBlur();
  };
  handleBackButton = () => {
    if (this.props.isFocused) {
      !this.state.processing && this.props.showExitDialog();

      return true;
    }
  };
  loadSignUp = () => {
    this.props.navigation.navigate("EnterMobile");
  };
  onCloseModal = () => {
    this.setState({
      modal_visible: false,
      // information: false,
    });
  };
  render() {
    let can_show_biometrics =
      this.state.biometrics_supported && this.state.biometrics_enabled;
    return (
      <View style={SharedStyle.mainContainer}>
        {this.state.is_system_upgrade ? (
          <MainHeader
            backgroundStyle={{
              backgroundColor: Colors.WHITE,
              ...Mixins.boxShadow(Colors.WHITE),
            }}
            textColor="#090A0A"
            title={""}
          />
        ) : (
          <MainHeader
            leftIcon="arrow-left"
            backgroundStyle={{
              backgroundColor: Colors.WHITE,
              ...Mixins.boxShadow(Colors.WHITE),
            }}
            textColor="#090A0A"
            onPressLeftIcon={this.handleBackButton}
            title={""}
          />
        )}
        <ScrollView {...this.props}>
          <View style={FormStyle.formContainer}>
            <View style={styles.center}>
              <Text style={styles.login}>Login</Text>
              <TouchableOpacity
                style={styles.getHelp}
                onPress={() => this.props.navigation.navigate("GetHelp")}
              >
                <Icon.AntDesign
                  name="questioncircleo"
                  size={Mixins.scaleFont(15)}
                  color={Colors.BLACK}
                />
                <Text style={styles.getHelpText}>Get Help</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.enter}>
              Enter your phone number to continue
            </Text>
          </View>
          <View style={FormStyle.formContainer}>
            <View style={FormStyle.formItem}>
              <FloatingLabelInput
                value={this.state.phone_number}
                keyboardType={"number-pad"}
                multiline={false}
                autoCorrect={false}
                enterMobile
                label={Dictionary.PHONE_NUMBER_LABEL}
                style={{ width: "100%" }}
                onChangeText={(text) =>
                  this.setState({
                    phone_number: text,
                    phone_number_error: "",
                  })
                }
                editable={!this.state.processing}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
                blurOnSubmit
              />
              <Text style={[FormStyle.formError]}>
                {this.state.phone_number_error}
              </Text>
              <View style={[FormStyle.formItem, { marginTop: 30 }]}>
                <FloatingLabelInput
                  style={{
                    paddingRight: can_show_biometrics
                      ? Mixins.scaleSize(85)
                      : Mixins.scaleSize(45),
                  }}
                  label={Dictionary.PASSWORD_LABEL}
                  value={this.state.password}
                  secureTextEntry={!this.state.secure_text}
                  multiline={false}
                  autoCorrect={false}
                  onChangeText={(password) =>
                    this.setState({
                      password,
                      password_error: "",
                    })
                  }
                  editable={!this.state.authenticating}
                />
                {!!this.state.password && (
                  <TouchItem
                    style={[
                      styles.secureToggle,
                      {
                        right: can_show_biometrics
                          ? Mixins.scaleSize(38)
                          : Mixins.scaleSize(0),
                      },
                    ]}
                    onPress={this.toggleSecureText}
                  >
                    <Icon.Ionicons
                      style={styles.secureToggleIcon}
                      size={Mixins.scaleSize(25)}
                      name={this.state.secure_text ? "ios-eye-off" : "ios-eye"}
                    />
                  </TouchItem>
                )}
                {!!can_show_biometrics && (
                  <TouchItem
                    style={styles.fingerprint}
                    onPress={this.scanBiometrics}
                  >
                    <Image
                      style={styles.fingerprintImage}
                      source={require("../../assets/images/shared/fingerprint.png")}
                    />
                  </TouchItem>
                )}
                <Text style={FormStyle.formError}>
                  {this.state.password_error}
                </Text>

                <View style={styles.forgotpassword}>
                  {this.state.passwordProcessing ? (
                    <ActivityIndicator color={Colors.PRIMARY_BLUE} />
                  ) : (
                    <TouchItem
                      disabled={this.state.passwordProcessing}
                      onPress={this.forgotPassword}
                    >
                      <Text style={styles.forgotPasswordText}>
                        {Dictionary.FORGOT_PASSWORD_BTN}
                      </Text>
                    </TouchItem>
                  )}
                </View>
              </View>
              {/* <View style={styles.forgotpassword}>
                {this.state.passwordProcessing ? (
                  <ActivityIndicator color={Colors.PRIMARY_BLUE} />
                ) : (
                  <TouchItem
                    disabled={this.state.passwordProcessing}
                    onPress={this.forgotPassword}
                  >
                    <Text style={styles.forgotPasswordText}>
                      {Dictionary.FORGOT_PASSWORD_BTN}
                    </Text>
                  </TouchItem>
                )}
              </View> */}
            </View>

            <View style={styles.signup}>
              <Text style={styles.signupText}>{Dictionary.DONT_HAVE_ACCT}</Text>
              <TouchItem
                style={styles.createAccount}
                disabled={this.state.processing}
                onPress={this.loadSignUp}
              >
                <Text style={styles.createAccountText}>
                  {Dictionary.CREATE_ACCOUNT}
                </Text>
              </TouchItem>
            </View>
          </View>

          <View style={SharedStyle.bottomPanel}>
            <View style={FormStyle.formButton}>
              <PrimaryButton
                loading={this.state.authenticating}
                disabled={this.state.authenticating}
                title={Dictionary.CONTINUE_BTN}
                icon="arrow-right"
                onPress={this.handleSubmit}
              />
            </View>
          </View>

          {this.state.is_biometrics_visible && (
            <Modal
              isVisible={this.state.is_biometrics_visible}
              swipeDirection="down"
              onSwipeComplete={this.hideBiometricsDialog}
              onBackButtonPress={this.handleBackButton}
              animationInTiming={500}
              animationOutTiming={800}
              backdropTransitionInTiming={500}
              backdropTransitionOutTiming={800}
              useNativeDriver={true}
              style={SharedStyle.modal}
            >
              <View
                style={[SharedStyle.modalContent, SharedStyle.authModalContent]}
              >
                <View style={SharedStyle.modalSlider} />
                <View style={SharedStyle.modalPanel}>
                  <Text style={SharedStyle.modalTop}>
                    {Dictionary.BIOMETRIC_LOGIN}
                  </Text>
                  <View style={SharedStyle.modalMiddle}>
                    <View style={SharedStyle.biometricText}>
                      <Text style={SharedStyle.biometricMainText}>
                        {Dictionary.CONFIRM_IDENTITY}
                      </Text>
                      <Text style={SharedStyle.biometricSubText}>
                        {Dictionary.ACTIVATE_SENSOR}
                      </Text>
                    </View>
                    <TouchItem
                      style={SharedStyle.biometricIcon}
                      onPress={this.scanBiometrics}
                    >
                      <Image
                        style={SharedStyle.biometricIconImage}
                        source={require("../../assets/images/shared/fingerprint.png")}
                      />
                    </TouchItem>
                  </View>
                  <View style={SharedStyle.modalBottom}>
                    <ActionButton
                      disabled={this.state.authenticating}
                      title={Dictionary.USE_PASSWORD_BTN}
                      color={Colors.CV_YELLOW}
                      icon="lock"
                      onPress={this.hideBiometricsDialog}
                    />
                  </View>
                </View>
              </View>
            </Modal>
          )}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  secureToggle: {
    ...Mixins.padding(15),
    position: "absolute",
    right: 0,
  },
  secureToggleIcon: {
    color: Colors.CV_YELLOW,
  },
  criteria: {
    ...Mixins.margin(30, 16, 30, 16),
    paddingBottom: Mixins.scaleSize(20),
  },
  login: {
    fontWeight: "700",
    fontSize: 32,
    color: Colors.CV_BLUE,
    paddingBottom: 8,
    ...Typography.FONT_BOLD,
  },
  enter: {
    color: Colors.BLACK,
    fontSize: 16,
    ...Typography.FONT_REGULAR,
    //fontWeight: "400"
  },
  forgotpassword: {
    alignSelf: "flex-end",
    display: "flex",
    flexDirection: "row",
    ...Mixins.padding(0, 0, 0, 0),
  },
  forgotPasswordText: {
    ...Typography.FONT_REGULAR,
    fontWeight: "400",
    fontSize: 14,
    color: Colors.CV_BLUE,
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

  row: {
    display: "flex",
    flexDirection: "row",
  },
  rowCenter: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    ...Mixins.padding(0, 20, 0, 0),
  },
  login: {
    fontSize: 32,
    color: Colors.CV_BLUE,
    paddingBottom: 8,
    ...Typography.FONT_BOLD,
  },
  enter: {
    color: Colors.BLACK,
    fontSize: 16,
    ...Typography.FONT_REGULAR,
  },
  phone: {
    paddingBottom: 8,
    color: Colors.CV_BLUE,
  },
  signup: {
    alignSelf: "flex-end",
    display: "flex",
    flexDirection: "row",
    ...Mixins.padding(5, 0, 0, 0),
  },
  signupText: {
    ...Typography.FONT_MEDIUM,
    ...Mixins.padding(1, 5, 0, 0),
    // color: Colors.BLACK,
  },
  createAccount: {},
  createAccountText: {
    color: Colors.CV_YELLOW,
    ...Typography.FONT_BOLD,
    textDecorationLine: "underline",
    textAlign: "center",
  },
  input: {
    display: "flex",
    flexDirection: "row",
  },
  imageBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  icon: {
    alignSelf: "center",
    display: "flex",
    justifyContent: "center",
    width: 50,
    height: 50,
    marginTop: 7,
    borderRadius: 50,
    borderColor: "white",
    backgroundColor: "#DCDCDC",
    opacity: 0.7,
  },
  modal: {
    //width: Mixins.scaleSize(200),
    // height: Mixins.scaleSize(400),
  },
  center: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  getHelp: {
    // width: Mixins.scaleSize(80),
    height: Mixins.scaleSize(28),
    ...Mixins.padding(0, 6, 0, 6),
    // padding: Mixins.scaleSize(6),
    backgroundColor: "#F5F5F5",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  getHelpText: {
    color: Colors.BLACK,
    fontSize: 12,
    ...Typography.FONT_REGULAR,
    marginLeft: Mixins.scaleSize(5),
  },
});

const mapStateToProps = (state) => ({
  user: state.user,
  settings: state.settings,
  // information: state.information,
});

const mapDispatchToProps = {
  showToast,
  showToastNav,
  resetStatusBarStyle,
  showExitDialog,
  clearDeepLinkPath,
  registerSessionListener,
  removeSessionListener,
  storeUserData,
  storeUserPwd,
  clearUserPin,
  // getImage,
  resetLoanApplicationData,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(Login));

// try {
//   const response = await fetch(
//     `https://creditvilleprelive.com/userservice/api/v1/customer/fcm/update/${phone_number}/${fcmToken}`,
//     {
//       method: "POST",
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//         "X-Mobile-OS": "android",
//         apiKey: user_data.token,
//       },
//       body: JSON.stringify({
//         phone_number: phone_number,
//         fcmToken: fcmToken,
//       }),
//     }
//   );

//   if (!response.ok) {
//     throw new Error(
//       `HTTP error! Status: ${response.status}`
//     );
//   }

//   const data = await response.json();
//   console.log("FCM Token update response:", data, {
//     fcmToken,
//   });
// } catch (error) {
//   console.error(
//     "Error updating FCM Token on server:",
//     error.message
//   );
// }
//placeholder={Dictionary.PHONE_NUMBER_LABEL}
//placeholderTextColor={Colors.CV_BLUE}
{
  /* <View style={[FormStyle.inputBox, { ...Mixins.padding(8) }]}>
                <View style={styles.row}>
                  <View style={styles.rowCenter}>
                    <Image
                      source={require("../../assets/images/login/Flag.png")}
                    />
                    <Text
                      style={{
                        color: Colors.BLACK,
                        ...Mixins.padding(0, 8, 0, 8),
                      }}
                    >
                      +234
                    </Text>
                    <Icon.SimpleLineIcons
                      size={Mixins.scaleSize(15)}
                      style={{ color: Colors.BLACK }}
                      name="arrow-down"
                    />
                  </View> */
}
{
  /* <Text style={styles.phone}>Phone Number</Text> */
}
// { ...Mixins.margin(-50, 0, 0, 0) },
// componentDidUpdate(prevProps) {
//   if (this.props.information !== prevProps.information) {
//     this.setState({
//       image: this.props.information.image,
//       information: this.props.information.imageVisible,
//     });
//   }
// }
// handleSubmit = (isBiometrics) => {
//   if (this.validFields(isBiometrics)) {
//     let { phone_number, password, latitude, longitude, authenticating } =
//       this.state;

//     if (isBiometrics) {
//       phone_number = this.props.user.user_data.phoneNumber;
//       password = this.props.user.user_pwd;
//     }

//     let previous_user = this.props.user.user_data.phoneNumber;

//     const handleSuccess = (result) => {
//       this.setState(
//         {
//           authenticating: false,
//           password: "",
//         },
//         () => {
//           let user_data = { ...result, activated: "", stage_id: "" };
//           user_data.phoneNumber = phone_number;

//           this.props.storeUserData(user_data);
//           this.props.storeUserPwd(password);

//           if (phone_number !== previous_user) {
//             this.props.clearUserPin();
//             this.props.resetLoanApplicationData();
//           }

//           this.routeToPage(user_data);
//           Util.logEventData("onboarding_sign_in");
//         }
//       );
//     };

//     const handleFailure = (error) => {
//       this.setState(
//         {
//           authenticating: false,
//         },
//         () => {
//           if (error.http_status === 412) {
//             this.props.showToastNav(error.message, {
//               action: this.handleAuthorizeDevice,
//               actionText: Dictionary.AUTHORIZE_DEVICE_BTN,
//             });
//           } else {
//             this.props.showToast(error.message);
//           }
//         }
//       );
//     };

//     this.setState({ authenticating: true }, () => {
//       Network.authenticateUser(phone_number, password, latitude, longitude)
//         .then(handleSuccess)
//         .catch(handleFailure);
//     });
//   }
// };

// import React, { Component } from "react";
// import {
//   BackHandler,
//   Text,
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   ImageBackground,
// } from "react-native";
// import { withNavigationFocus } from "react-navigation";
// import { connect } from "react-redux";
// import * as Icon from "@expo/vector-icons";
// import Modal from "react-native-modal";

// import { showToast } from "_actions/toast_actions";
// import { showExitDialog } from "_actions/util_actions";

// import { Dictionary, Util, ResponseCodes } from "_utils";
// import { SharedStyle, FormStyle, Mixins, Colors, Typography } from "_styles";
// import { SubHeader, ScrollView, FloatingLabelInput, TouchItem } from "_atoms";
// import { MainHeader } from "_organisms";
// import { PrimaryButton } from "_molecules";

// import { Network } from "_services";

// class Login extends Component {
//   state = {
//     phone_number: this.props.user.user_data.phoneNumber ?? "",
//     phone_number_error: "",
//     processing: false,
//     isFocused: false,
//     image: this.props.information.image,
//     information: this.props.information.imageVisible,
//     modal_visible: true,
//   };

//   componentDidMount(prevProps) {
//     BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
//     //this.getInformation();
//   }

//   componentWillUnmount() {
//     BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
//   }

//   componentDidUpdate(prevProps) {
//     if (this.props.information !== prevProps.information) {
//       this.setState({
//         image: this.props.information.image,
//         information: this.props.information.imageVisible,
//       });
//     }
//   }

//   validFields = () => {
//     let isValid = true;
//     if (!Util.isValidPhone(this.state.phone_number)) {
//       isValid = false;
//       this.setState({ phone_number_error: Dictionary.ENTER_VALID_PHONE });
//     }

//     return isValid;
//   };

//   handleFocus = () => {
//     this.setState({ isFocused: true });
//     this.props.onFocus && this.props.onFocus();
//   };

//   handleBlur = () => {
//     this.setState({ isFocused: false });
//     this.props.onBlur && this.props.onBlur();
//   };

//   handleBackButton = () => {
//     if (this.props.isFocused) {
//       !this.state.processing && this.props.showExitDialog();

//       return true;
//     }
//   };

//   loadSignUp = () => {
//     this.props.navigation.navigate("EnterMobile");
//   };

//   handleSubmit = () => {
//     if (this.validFields()) {
//       let { phone_number } = this.state;
//       this.setState({ processing: true }, () => {
//         Network.validateUser(phone_number)
//           .then((result) => {
//             this.setState({ processing: false }, () => {
//               let { userType } = result;
//               if (userType === "PASSWORD_NOT_UPDATED") {
//                 this.props.navigation.navigate("SystemUpgrade", {
//                   phone_number: this.state.phone_number,
//                 });

//                 return;
//               }
//               if (userType === "PASSWORD_UPDATED") {
//                 this.props.navigation.navigate("Password", {
//                   phone_number: this.state.phone_number,
//                 });

//                 return;
//               }
//               Util.logEventData("validate_user");
//             });
//           })
//           .catch((error) => {
//             this.setState({ processing: false }, () => {
//               this.props.showToast(error.message);
//             });
//           });
//       });
//     }
//   };

//   onCloseModal = () => {
//     this.setState({
//       modal_visible: false,
//       information: false,
//     });
//   };

//   // getInformation = () => {
//   //   Network.getInformation().then((result) => {
//   //     console.log("information", result.fileLocation);
//   //     // this.setState(
//   //     //   {
//   //     //     authenticating: false,
//   //     //   },
//   //     //   () => {

//   //     //   })
//   //   });
//   // };

//   render() {
//     return this.state.information ? (
//       <Modal
//         isVisible={this.state.modal_visible}
//         swipeDirection="down"
//         onSwipeComplete={this.onCloseModal}
//         onBackButtonPress={this.onCloseModal}
//         animationInTiming={500}
//         animationOutTiming={800}
//         backdropTransitionInTiming={500}
//         backdropTransitionOutTiming={800}
//         useNativeDriver={true}
//         style={styles.modal}
//       >
//         {/* <View
//           style={[
//             SharedStyle.modalContent,
//             SharedStyle.authModalContent,
//             { height: "90%" },
//           ]}
//         > */}
//         <ImageBackground
//           style={styles.imageBackground}
//           imageStyle={{
//             resizeMode: "contain",
//             borderRadius: Mixins.scaleSize(8),
//           }}
//           source={{ uri: this.state.image }}
//         />
//         {/* </View> */}

//         <TouchItem style={styles.icon} onPress={this.onCloseModal}>
//           <Icon.Feather
//             size={Mixins.scaleSize(30)}
//             style={{ color: Colors.PRIMARY_BLUE, textAlign: "center" }}
//             name="x"
//           />
//         </TouchItem>
//       </Modal>
//     ) : (
//       <View style={SharedStyle.mainContainer}>
//         <MainHeader
//           //leftIcon="arrow-left"
//           backgroundStyle={{
//             backgroundColor: Colors.WHITE,
//             ...Mixins.boxShadow(Colors.WHITE),
//           }}
//           textColor="#090A0A"
//           onPressLeftIcon={this.handleBackButton}
//           title={""}
//         />
//         <ScrollView {...this.props}>
//           <View style={FormStyle.formContainer}>
//             <View style={styles.center}>
//               <Text style={styles.login}>Login</Text>
//               <TouchableOpacity
//                 style={styles.getHelp}
//                 onPress={() => this.props.navigation.navigate("GetHelp")}
//               >
//                 <Icon.AntDesign
//                   name="questioncircleo"
//                   size={Mixins.scaleFont(15)}
//                   color={Colors.BLACK}
//                 />
//                 <Text style={styles.getHelpText}>Get Help</Text>
//               </TouchableOpacity>
//             </View>
//             <Text style={styles.enter}>
//               Enter your phone number to continue
//             </Text>
//           </View>
//           <View style={FormStyle.formContainer}>
//             {/* <Text style={styles.phone}>Phone Number</Text> */}
//             <View style={FormStyle.formItem}>
//               {/* <View style={[FormStyle.inputBox, { ...Mixins.padding(8) }]}>
//                 <View style={styles.row}>
//                   <View style={styles.rowCenter}>
//                     <Image
//                       source={require("../../assets/images/login/Flag.png")}
//                     />
//                     <Text
//                       style={{
//                         color: Colors.BLACK,
//                         ...Mixins.padding(0, 8, 0, 8),
//                       }}
//                     >
//                       +234
//                     </Text>
//                     <Icon.SimpleLineIcons
//                       size={Mixins.scaleSize(15)}
//                       style={{ color: Colors.BLACK }}
//                       name="arrow-down"
//                     />
//                   </View> */}
//               <FloatingLabelInput
//                 value={this.state.phone_number}
//                 keyboardType={"number-pad"}
//                 multiline={false}
//                 autoCorrect={false}
//                 enterMobile
//                 //placeholder={Dictionary.PHONE_NUMBER_LABEL}
//                 //placeholderTextColor={Colors.CV_BLUE}
//                 label={Dictionary.PHONE_NUMBER_LABEL}
//                 style={{ width: "100%" }}
//                 onChangeText={(text) =>
//                   this.setState({
//                     phone_number: text,
//                     phone_number_error: "",
//                   })
//                 }
//                 editable={!this.state.processing}
//                 onFocus={this.handleFocus}
//                 onBlur={this.handleBlur}
//                 blurOnSubmit
//               />
//               {/* </View> */}
//               <Text
//                 style={[
//                   FormStyle.formError,
//                   // { ...Mixins.margin(-50, 0, 0, 0) },
//                 ]}
//               >
//                 {this.state.phone_number_error}
//               </Text>
//               {/* </View> */}
//             </View>

//             <View style={styles.signup}>
//               <Text style={styles.signupText}>{Dictionary.DONT_HAVE_ACCT}</Text>
//               <TouchItem
//                 style={styles.createAccount}
//                 disabled={this.state.processing}
//                 onPress={this.loadSignUp}
//               >
//                 <Text style={styles.createAccountText}>
//                   {Dictionary.CREATE_ACCOUNT}
//                 </Text>
//               </TouchItem>
//             </View>
//           </View>

//           <View style={SharedStyle.bottomPanel}>
//             <View style={FormStyle.formButton}>
//               <PrimaryButton
//                 loading={this.state.processing}
//                 title={Dictionary.VERIFY}
//                 icon="arrow-right"
//                 onPress={this.handleSubmit}
//               />
//             </View>
//           </View>
//         </ScrollView>
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   row: {
//     display: "flex",
//     flexDirection: "row",
//   },
//   rowCenter: {
//     display: "flex",
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     ...Mixins.padding(0, 20, 0, 0),
//   },
//   login: {
//     fontSize: 32,
//     color: Colors.CV_BLUE,
//     paddingBottom: 8,
//     ...Typography.FONT_BOLD,
//   },
//   enter: {
//     color: Colors.BLACK,
//     fontSize: 16,
//     ...Typography.FONT_REGULAR,
//   },
//   phone: {
//     paddingBottom: 8,
//     color: Colors.CV_BLUE,
//   },
//   signup: {
//     alignSelf: "flex-end",
//     display: "flex",
//     flexDirection: "row",
//     ...Mixins.padding(5, 0, 0, 0),
//   },
//   signupText: {
//     ...Typography.FONT_MEDIUM,
//     ...Mixins.padding(1, 5, 0, 0),
//     // color: Colors.BLACK,
//   },
//   createAccount: {},
//   createAccountText: {
//     color: Colors.CV_YELLOW,
//     ...Typography.FONT_BOLD,
//     textDecorationLine: "underline",
//     textAlign: "center",
//   },
//   input: {
//     display: "flex",
//     flexDirection: "row",
//   },
//   imageBackground: {
//     flex: 1,
//     width: "100%",
//     height: "100%",
//   },
//   icon: {
//     alignSelf: "center",
//     display: "flex",
//     justifyContent: "center",
//     width: 50,
//     height: 50,
//     marginTop: 7,
//     borderRadius: 50,
//     borderColor: "white",
//     backgroundColor: "#DCDCDC",
//     opacity: 0.7,
//   },
//   modal: {
//     //width: Mixins.scaleSize(200),
//     // height: Mixins.scaleSize(400),
//   },
//   center: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   getHelp: {
//     // width: Mixins.scaleSize(80),
//     height: Mixins.scaleSize(28),
//     ...Mixins.padding(0, 6, 0, 6),
//     // padding: Mixins.scaleSize(6),
//     backgroundColor: "#F5F5F5",
//     borderRadius: 100,
//     justifyContent: "center",
//     alignItems: "center",
//     flexDirection: "row",
//   },
//   getHelpText: {
//     color: Colors.BLACK,
//     fontSize: 12,
//     ...Typography.FONT_REGULAR,
//     marginLeft: Mixins.scaleSize(5),
//   },
// });

// const mapStateToProps = (state) => {
//   return {
//     user: state.user,
//     information: state.information,
//   };
// };

// const mapDispatchToProps = {
//   showToast,
//   showExitDialog,
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(withNavigationFocus(Login));
