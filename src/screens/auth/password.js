import React, { Component } from "react";
import { BackHandler, StyleSheet, View, Text, ActivityIndicator, Image } from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import NetInfo from "@react-native-community/netinfo";
import * as Icon from "@expo/vector-icons";
import * as Location from "expo-location";
import Modal from "react-native-modal";
import * as ExpoAuthentication from "expo-local-authentication";

import { resetStatusBarStyle, showExitDialog } from "_actions/util_actions";
import { clearDeepLinkPath } from "_actions/settings_actions";
import { showToast, showToastNav } from "_actions/toast_actions";
import { getDocuments } from "_actions/document_actions";
import {
  registerSessionListener,
  removeSessionListener,
  storeUserData,
  storeUserPwd,
  clearUserPin,
  resetLoanApplicationData,
} from "_actions/user_actions";
import { Dictionary, Util, ResponseCodes } from "_utils";
import { Colors, Mixins, SharedStyle, FormStyle, Typography } from "_styles";
import { SubHeader, ScrollView, FloatingLabelInput, TouchItem } from "_atoms";
import { MainHeader } from "_organisms";
import { PrimaryButton, PasswordCriteria, ActionButton } from "_molecules";

import { Network } from "_services";

class Password extends Component {
  constructor(props) {
    super(props);

    const { navigation } = this.props;
    const is_system_upgrade = navigation.getParam("is_system_upgrade")??false;
    const phone_number = navigation.getParam("phone_number");
    //const confirmation_id = navigation.getParam("confirmation_id");

    this.state = {
      phone_number: phone_number,
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
      is_system_upgrade,
      passwordProcessing: false
    };
  }

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
  //   if (!prevProps.isFocused && this.props.isFocused) {
  //     this.setState({
  //       phone_number: this.props.user.user_data.phoneNumber
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
          // this.setState({showLocationModal:true})
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
            // this.props.user.user_data.activated === 1
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
      Network.initializeSignUp(this.state.phone_number).then((data) => {
        if (data.resp.code == ResponseCodes.SUCCESS_CODE) {
          this.setState({ processing: false }, () => {
            this.props.showToast("This phone number do not exist!");
          });
        } else {
         
        }
      })
      .catch((error)=>{
              if (error.code==ResponseCodes.USER_ALREADY_EXIST) {
                //continue with the process
                const phoneVal = Util.stripFirstZeroInPhone(this.state.phone_number);
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
  }

  routeToPage = (user_data) => {
    let { stage, activated, validDevice, isFirstTimeLogin } = user_data;
    let target;
    if (activated === 1) {
      target = "Dashboard";
    } 
    // else if (validDevice == "N") {
    //   target = "AuthorizeDevice";
    //   this.props.showToastNav("This device is not authorized", {
    //     action: this.handleAuthorizeDevice,
    //     actionText: Dictionary.AUTHORIZE_DEVICE_BTN,
    //   });

    //   return;
    // } 
    else if (stage === "0") {
      target = "EnterBVN";
    } else if (stage === "1") {
      target = "EnterBVN";
    } else if (stage === "2") {
      target = "EnterBVN";
    } else if (stage === "3") {
      target = "Dashboard";
    }
    else if (stage === 5) {
      target = "CreatePIN";
    }
    else {
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
      let previous_user = this.props.user.user_data.phoneNumber;
      this.setState({ authenticating: true }, () => {
        Network.authenticateUser(phone_number, password, latitude, longitude)
          .then((result) => {
            this.setState(
              {
                authenticating: false,
                password: "",
              },
              () => {
                let user_data = { ...result, activated: "", stage_id: "" };
                user_data.phoneNumber = phone_number;
                //user_data.session_id = result.session_id;

                this.props.storeUserData(user_data);
                this.props.storeUserPwd(password);

                if (phone_number !== previous_user) {
                  this.props.clearUserPin();
                  this.props.resetLoanApplicationData();
                }

                this.routeToPage(user_data);
                Util.logEventData("onboarding_sign_in");
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
  };

  render() {
    let can_show_biometrics =
      this.state.biometrics_supported &&
      this.state.biometrics_enabled
      // this.props.user.user_data.activated === 1;
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
            <Text style={styles.login}>Login</Text>
            <Text style={styles.enter}>Enter your password to continue</Text>
          </View>

          <View style={FormStyle.formContainer}>
            <View style={FormStyle.formItem}>
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
            </View>

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
    ...Typography.FONT_REGULAR,
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
    right: 0
  },
  fingerprintImage: {
    width: Mixins.scaleSize(24),
    height: Mixins.scaleSize(31)
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    settings: state.settings
  };
};

const mapDispatchToProps = {
  showToast,
  showToastNav,
  resetStatusBarStyle,
  registerSessionListener,
  storeUserData,
  storeUserPwd,
  clearUserPin,
  removeSessionListener,
  resetLoanApplicationData,
  showExitDialog,
  clearDeepLinkPath,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(Password));
