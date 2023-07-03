import React, { Component } from "react";
import { BackHandler, StyleSheet, Text, View, Alert } from "react-native";

import { withNavigationFocus } from "react-navigation";
import analytics from "@react-native-firebase/analytics";
import remoteConfig from "@react-native-firebase/remote-config";
import * as WebBrowser from "expo-web-browser";

import { connect } from "react-redux";

import { showToast } from "_actions/toast_actions";
import { storeUserData, setReferalCode } from "_actions/user_actions";
import { hideExitDialog } from "_actions/util_actions";

import { env, Dictionary, Util, ResponseCodes } from "_utils";
import { SharedStyle, Mixins, Typography, Colors, FormStyle } from "_styles";
import { SubHeader, ScrollView, FloatingLabelInput, TouchItem } from "_atoms";
import { MainHeader } from "_organisms";
import { PrimaryButton } from "_molecules";

import { Network } from "_services";
// import { stripFirstZeroInPhone } from "_utils";

// import { OTP_TYPE } from "_utils";
// import { OTP_NOTIFICATION_TYPE } from "_utils";
// import { SUCCESS_CODE } from "_utils";

class EnterMobile extends Component {
  constructor(props) {
    super(props);
    const { navigation } = this.props;
    const is_system_upgrade = navigation.getParam("is_system_upgrade") || false;

    this.state = {
      is_system_upgrade,
      phone_number: this.props.user.user_data.phoneNumber,
      phone_number_error: "",
      referral_code: "",
      referral_code_error: "",
      processing: false,
      showLocationModal: false
    };
  }

  componentDidMount = async () => {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);

    this.getUserLocation();
  };

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      !this.state.processing && this.props.navigation.goBack();

      return true;
    }
  };

  openTerms = async () => {
    let termsUrl = remoteConfig()
      .getValue(`terms_url_${env().target}`)
      .asString();
    if (!termsUrl.startsWith("http")) {
      termsUrl = "http://" + termsUrl;
    }
    analytics().logEvent("open_link", { url: termsUrl });
    await WebBrowser.openBrowserAsync(termsUrl);
  };

  validFields = () => {
    const { phone_number, referral_code } = this.state;
    let validity = true;
    if (!Util.isValidPhone(phone_number)) {
      this.setState({
        phone_number_error: Dictionary.ENTER_VALID_PHONE
      });

      validity = false;
    }

    // if (referral_code &&  ) {
    //   this.setState({
    //     referral_code_error: Dictionary.ENTER_VALID_REFERRAL_CODE,
    //   });

    //   validity = false;
    // }

    return validity;
  };

  verifyPhoneNumber = () => {
    if (this.validFields()) {
      this.setState({ processing: true }, () => {
        let { phone_number, is_system_upgrade } = this.state;
        const phoneVal = Util.stripFirstZeroInPhone(phone_number);
        Network.requestOtp(
          phoneVal,
          ResponseCodes.OTP_TYPE.REG,
          ResponseCodes.OTP_NOTIFICATION_TYPE.SMS
        )
          .then(() => {
            this.setState({ processing: false }, () => {
              this.props.navigation.navigate("ValidateMobile", {
                phone_number,
                is_system_upgrade
              });
              // Util.logEventData("onboarding_get_started");
            });
          })
          .catch((error) => {
            console.log("weh2error", error);
            this.setState({ processing: false }, () => {
              
              this.props.showToast(error.message || "Unable to Send Otp.");
            });
          });
      });
    }
  };

  handleSubmit = () => {
    if (this.validFields()) {
      let { phone_number, referral_code } = this.state;

      this.props.storeUserData({ phone_number });
      this.setState({ processing: true }, () => {
        const phoneVal = Util.stripFirstZeroInPhone(phone_number);
        Network.initializeSignUp(phone_number, referral_code)
          .then((data) => {
            this.props.setReferalCode("");
            if (data.hasOwnProperty("validReferralCode")) {
              if (data.validReferralCode == "N") {
                Alert.alert(
                  "No user exist with this referal code",
                  "Do you want to continue?",
                  [
                    {
                      text: "NO",
                      onPress: () => {
                        this.setState({ processing: false });
                        return;
                      },
                      style: "cancel"
                    },
                    {
                      text: "YES",
                      onPress: () => {
                        if (data.resp.code == ResponseCodes.SUCCESS_CODE) {
                          Network.requestOtp(
                            phoneVal,
                            ResponseCodes.OTP_TYPE.REG,
                            ResponseCodes.OTP_NOTIFICATION_TYPE.SMS
                          )
                            .then(() => {
                              this.setState({ processing: false }, () => {
                                this.props.navigation.navigate(
                                  "ValidateMobile",
                                  {
                                    phone_number
                                  }
                                );
                                Util.logEventData("onboarding_get_started");
                              });
                            })
                            .catch((error) => {
                              console.log("weh2error", error);
                            });
                        } else {
                          this.setState({ processing: false }, () => {
                            this.props.showToast(data.resp.message);
                          });
                        }
                      }
                    }
                  ]
                );
              } else {
                if (data.resp.code == ResponseCodes.SUCCESS_CODE) {
                  Network.requestOtp(
                    phoneVal,
                    ResponseCodes.OTP_TYPE.REG,
                    ResponseCodes.OTP_NOTIFICATION_TYPE.SMS
                  )
                    .then(() => {
                      this.props.setReferalCode(this.state.referral_code);
                      this.setState({ processing: false }, () => {
                        this.props.navigation.navigate("ValidateMobile", {
                          phone_number
                        });
                        Util.logEventData("onboarding_get_started");
                      });
                    })
                    .catch((error) => {
                      this.setState({ processing: false }, () => {
                        this.props.showToast(error.message);
                      });
                    });
                } else {
                  this.setState({ processing: false }, () => {
                    this.props.showToast(data.resp.message);
                  });
                }
              }
            } else {
              if (data.resp.code == ResponseCodes.SUCCESS_CODE) {
                Network.requestOtp(
                  phoneVal,
                  ResponseCodes.OTP_TYPE.REG,
                  ResponseCodes.OTP_NOTIFICATION_TYPE.SMS
                )
                  .then(() => {
                    this.props.setReferalCode(this.state.referral_code);
                    this.setState({ processing: false }, () => {
                      this.props.navigation.navigate("ValidateMobile", {
                        phone_number
                      });
                      Util.logEventData("onboarding_get_started");
                    });
                  })
                  .catch((error) => {
                    this.setState({ processing: false }, () => {
                      // this.props.showToast(error.message);

                      this.props.navigation.navigate("ValidateMobile", {
                        phone_number
                      });
                    });
                  });
              } else {
                this.setState({ processing: false }, () => {
                  // this.props.showToast(data.resp.message);
                  this.props.navigation.navigate("ValidateMobile", {
                    phone_number
                  });
                });
              }
            }

            // this.setState({ processing: false }, () => {
            //     this.props.navigation.navigate('ValidateMobile', { phone_number });
            //     Util.logEventData('onboarding_get_started');
            // });
          })
          .catch((error) => {
            this.setState({ processing: false }, () => {
              if (error.http_status === 409) {
                this.props.navigation.navigate("Login");
              }
              this.props.showToast(error.message);
            });
          });
      });
    }
  };

  render() {
    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.GET_STARTED_HEADER}
        />
        <ScrollView {...this.props}>
          <SubHeader
            text={
              this.state.is_system_upgrade
                ? Dictionary.SYSTEM_UPGRADE_VERIFY_PHONE_NUMBER
                : Dictionary.SIGN_UP_ENTER_MOBILE_HEADER
            }
          />
          <View style={[FormStyle.formContainer, styles.formContainer]}>
            <View style={FormStyle.formItem}>
              <FloatingLabelInput
                label={Dictionary.MOBILE_NUMBER_LABEL}
                value={this.state.phone_number}
                keyboardType={"number-pad"}
                enterMobile
                multiline={false}
                autoCorrect={false}
                maxLength={11}
                onChangeText={(text) =>
                  this.setState({
                    phone_number: text.replace(/\D/g, ""),
                    phone_number_error: ""
                  })
                }
                editable={!this.state.processing}
              />
              <Text style={FormStyle.formError}>
                {this.state.phone_number_error}
              </Text>
            </View>

            {!this.state.is_system_upgrade && (
              <View style={FormStyle.formItem}>
                <FloatingLabelInput
                  label={Dictionary.REFERRAL_CODE_LABEL}
                  value={this.state.referral_code}
                  multiline={false}
                  autoCorrect={false}
                  // maxLength={6}
                  autoCapitalize="characters"
                  onChangeText={(text) =>
                    this.setState({
                      referral_code: text,
                      referral_code_error: ""
                    })
                  }
                  editable={!this.state.processing}
                />
                <Text style={FormStyle.formError}>
                  {this.state.referral_code_error}
                </Text>
              </View>
            )}
          </View>
          <View style={SharedStyle.bottomPanel}>
            {!this.state.is_system_upgrade && (
              <TouchItem style={styles.infoPanel} onPress={this.openTerms}>
                <Text style={styles.infoPanelText}>
                  {Dictionary.SIGN_UP_TERMS}{" "}
                  <Text style={{ textDecorationLine: "underline" }}>
                    {Dictionary.CREDITVILLE_TERMS_LINK}
                  </Text>
                </Text>
              </TouchItem>
            )}
            <View style={FormStyle.formButton}>
              <PrimaryButton
                loading={this.state.processing}
                title={
                  this.state.is_system_upgrade
                    ? Dictionary.VERIFY
                    : Dictionary.CONTINUE_BTN
                }
                icon="arrow-right"
                onPress={
                  this.state.is_system_upgrade
                    ? this.verifyPhoneNumber
                    : this.handleSubmit
                }
              />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  formContainer: {
    paddingBottom: Mixins.scaleSize(140)
  },
  infoPanel: {
    ...Mixins.margin(8, 8, 32, 8),
    ...Mixins.padding(16),
    backgroundColor: Colors.ASH_BG,
    borderRadius: Mixins.scaleSize(10)
  },
  infoPanelText: {
    ...Typography.FONT_REGULAR,
    fontSize: Mixins.scaleFont(12),
    lineHeight: Mixins.scaleSize(14),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.LIGHT_GREY
  },
  exitDialog: {
    justifyContent: "flex-end",
    margin: 0
  },
  dialog: {
    ...Mixins.padding(0, 16, 16, 16),
    height: Mixins.scaleSize(235),
    alignItems: "center"
  },
  slider: {
    width: Mixins.scaleSize(50),
    height: Mixins.scaleSize(5),
    marginBottom: Mixins.scaleSize(12),
    backgroundColor: Colors.WHITE,
    borderRadius: Mixins.scaleSize(80),
    justifyContent: "center",
    alignItems: "center"
  },
  container: {
    width: "100%",
    borderRadius: Mixins.scaleSize(8)
  },
  header: {
    ...Mixins.padding(24, 16, 24, 16),
    ...Typography.FONT_BOLD,
    fontSize: Mixins.scaleFont(16),
    lineHeight: Mixins.scaleSize(19),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.DARK_GREY,
    borderBottomColor: Colors.FAINT_BORDER,
    borderBottomWidth: Mixins.scaleSize(1)
  },
  message: {
    ...Mixins.padding(32, 16, 32, 16),
    flexDirection: "row",
    justifyContent: "space-between",
    ...Typography.FONT_MEDIUM,
    color: Colors.DARK_GREY,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01)
  },
  buttons: {
    flex: 1,
    flexDirection: "row",
    borderTopColor: Colors.FAINT_BORDER,
    borderTopWidth: Mixins.scaleSize(1)
  },
  button: {
    flex: 1,
    justifyContent: "center"
  },
  buttonText: {
    textAlign: "center",
    ...Typography.FONT_MEDIUM,
    color: Colors.CV_YELLOW,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01)
  },
  timeoutText: {
    ...SharedStyle.biometricText,
    width: "70%"
  }
});

const mapStateToProps = (state) => {
  return {
    user: state.user
  };
};

const mapDispatchToProps = {
  showToast,
  storeUserData,
  setReferalCode
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(EnterMobile));
