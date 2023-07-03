import React, { Component } from "react";
import { BackHandler, Keyboard, StyleSheet, Text, View } from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import SmoothPinCodeInput from "react-native-smooth-pincode-input";
import CountDown from "react-native-countdown-component";
// import SMSUserConsent from 'react-native-sms-user-consent';
import {  getUserProfile } from '_actions/user_actions';
import { showToast } from "_actions/toast_actions";

import { Dictionary, ResponseCodes, Util } from "_utils";
import { Colors, Mixins, SharedStyle, FormStyle } from "_styles";
import { SubHeader, ScrollView, FloatingLabelInput } from "_atoms";
import { MainHeader } from "_organisms";
import { PrimaryButton, ActionButton } from "_molecules";

import { Network } from "_services";
// import { stripFirstZeroInPhone } from '_utils';
// import { OTP_TYPE } from '_utils';
// import { OTP_NOTIFICATION_TYPE } from '_utils';

class ValidateEmail extends Component {
  constructor(props) {
    super(props);

    const { navigation } = this.props;
    const phone_number = navigation.getParam("phone_number");
    const is_system_upgrade = navigation.getParam("is_system_upgrade")||false;

    this.state = {
      is_system_upgrade,
      email:this.props.user.user_data.email,
      otp: "",
      otpError: "",
      counting_down: true,
      counting_id: 1,
      until: 60,
      validating: false,
      resending: false,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);

    this.getSMSMessage();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);

    this.removeSmsListener();
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      let processing = this.state.validating || this.state.resending;
      !processing && this.props.navigation.goBack();

      return true;
    }
  };

  getSMSMessage = async () => {
    /* this.removeSmsListener();
        try {
            const { receivedOtpMessage } = await SMSUserConsent.listenOTP();
            this.onChangeOTP(receivedOtpMessage.match(/\d{6}/g)[0]);
        } catch (e) {
            console.log(e);
        } */
  };

  removeSmsListener = () => {
    /* try {
            SMSUserConsent.removeOTPListener();
        } catch (e) {
            console.log(e);
        } */
  };

  onChangeOTP = (otp) => {
    this.setState(
      {
        otp,
        otpError: "",
      },
      () => {
        if (this.state.otp.length === 6) {
          this.handleSubmit();
        }
      }
    );
  };

  handleResendOTP = () => {
    this.setState({ resending: true }, () => {
      let phoneVal = Util.stripFirstZeroInPhone(this.state.phone_number);
      Network.requestOtp(
        phoneVal,
        ResponseCodes.OTP_TYPE.REG,
        ResponseCodes.OTP_NOTIFICATION_TYPE.SMS
      )
        .then(() => {
          this.setState(
            {
              resending: false,
              counting_id: ++this.state.counting_id,
              counting_down: true,
            },
            () => {
              this.getSMSMessage();
              this.props.showToast(Dictionary.OTP_SENT, false);
            }
          );
        })
        .catch((error) => {
          this.setState({ resending: false }, () =>
            this.props.showToast(error.message)
          );
        });
    });
  };

  handleSubmit = () => {
    if (!this.state.otp || this.state.otp.length != 6) {
      this.setState({
        otpError: Dictionary.ENTER_VALID_OTP,
      });

      return;
    }

    Keyboard.dismiss();
    this.removeSmsListener();

    this.setState({ validating: true }, () => {
      
      
      Network.validateOTP(
        this.state.email,
        this.state.otp,
        ResponseCodes.OTP_TYPE.REG,
        ResponseCodes.OTP_NOTIFICATION_TYPE.EMAIL
      )
        .then((validationData) => {

            Network.verifyEmail(
                this.props.user.user_data.phoneNumber,
                this.state.otp,
                this.state.email,
                
              ).then((result) => {

                this.props.showToast(result.message||"Email Verified successully!", false);
                    this.props.getUserProfile();
                    this.props.navigation.navigate("Dashboard");
              })

              .catch((error) => {
                this.setState({ validating: false }, () =>
                // this.props.navigation.navigate("EnterBVN", {
                //   is_system_upgrade: this.state.is_system_upgrade,
                //   //confirmation_id: validationData.data.confirmation_id
                // })
                   this.props.showToast(error.message)
                );
              });


        })
        .catch((error) => {
          this.setState({ validating: false }, () =>
          // this.props.navigation.navigate("EnterBVN", {
          //   is_system_upgrade: this.state.is_system_upgrade,
          //   //confirmation_id: validationData.data.confirmation_id
          // })
             this.props.showToast(error.message||"Cannot Validate Email")
          );
        });
    });
  };

  render() {
    let processing = this.state.validating || this.state.resending;
    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.GET_STARTED_HEADER}
        />
        <ScrollView {...this.props}>
          <SubHeader text={Dictionary.SIGN_UP_VALIDATE_MOBILE_HEADER} />
          <View style={FormStyle.formContainer}>
            <View style={FormStyle.formItem}>
              <FloatingLabelInput
                label={Dictionary.EMAIL_ADDRESS_LABEL}
                value={this.state.email}
                keyboardType={"email-address"}
                multiline={false}
                autoCorrect={false}
                
                editable={false}
              />
            </View>
          </View>
          <View style={FormStyle.formItem}>
            <Text style={FormStyle.inputLabel}>{Dictionary.ENTER_OTP}</Text>
          </View>
          <View style={FormStyle.formItem}>
            <SmoothPinCodeInput
              animated={false}
              maskDelay={0}
              password
              mask={<View style={FormStyle.pinMask} />}
              codeLength={6}
              containerStyle={FormStyle.pinContainer}
              cellStyle={FormStyle.pinBox}
              cellStyleFocused={FormStyle.activePinBox}
              cellSize={Mixins.scaleSize(54)}
              value={this.state.otp}
              autoFocus={false}
              onTextChange={(otp) => this.onChangeOTP(otp)}
            />
            <Text style={[FormStyle.formError, styles.otpError]}>
              {this.state.otpError}
            </Text>
          </View>
          <View style={FormStyle.formItem}>
            <View style={FormStyle.formButtons}>
              <View style={[FormStyle.formButton, { flex: 5 }]}>
                <ActionButton
                  loading={this.state.resending}
                  disabled={processing || this.state.counting_down}
                  title={Dictionary.RESEND_SMS}
                  color={
                    this.state.counting_down
                      ? Colors.LIGHT_GREY
                      : Colors.CV_YELLOW
                  }
                  icon="speech"
                  onPress={this.handleResendOTP}
                />
              </View>
              {this.state.counting_down && (
                <View style={FormStyle.formButton}>
                  <CountDown
                    until={this.state.until}
                    id={"" + this.state.counting_id}
                    onFinish={() => {
                      this.setState({
                        counting_down: false,
                      });
                    }}
                    size={10}
                    digitStyle={styles.countdownBackground}
                    digitTxtStyle={styles.countdown}
                    timeToShow={["M", "S"]}
                    timeLabels={{ m: null, s: null }}
                    showSeparator
                    separatorStyle={styles.countdown}
                  />
                </View>
              )}
            </View>
          </View>
          <View style={SharedStyle.bottomPanel}>
            <View style={FormStyle.formButton}>
              <PrimaryButton
                loading={this.state.validating}
                disabled={processing}
                title={Dictionary.CONTINUE_BTN}
                icon="arrow-right"
                onPress={this.handleSubmit}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  otpError: {
    marginHorizontal: Mixins.scaleSize(16),
  },
  countdownBackground: {
    backgroundColor: "transparent",
  },
  countdown: {
    textAlign: "right",
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.LIGHT_GREY,
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = {
  showToast,
  getUserProfile
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(ValidateEmail));
