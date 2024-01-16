import React, { Component } from "react";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import { BackHandler, StyleSheet, View, Text, Platform } from "react-native";
import moment from "moment";
import SmoothPinCodeInput from "react-native-smooth-pincode-input";
import CountDown from "react-native-countdown-component";
import { showToast } from "_actions/toast_actions";

import { Dictionary, Util, ResponseCodes } from "_utils";
import { Mixins, SharedStyle, FormStyle, Colors } from "_styles";
import { SubHeader, ScrollView, FloatingLabelInput, TouchItem } from "_atoms";
import { MainHeader } from "_organisms";
import { PrimaryButton, _DateTimePicker, ActionButton } from "_molecules";

import { Network } from "_services";

class ValidateBVN extends Component {
  constructor(props) {
    super(props);

    const { navigation } = this.props;
    const bvn_data = navigation.getParam("bvn_data");
    const is_system_upgrade = navigation.getParam("is_system_upgrade") || false;
    const phone_number = navigation.getParam("phone_number") ?? "";

    let header_text = Dictionary.SIGN_UP_VALIDATE_BVN_HEADER;
    header_text = header_text.replace(
      "%s",
      Util.toTitleCase(bvn_data.firstName)
    );

    let last_5_text = Dictionary.ENTER_MOBILE_LAST_5;
    last_5_text = last_5_text.replace(
      "%s",
      Util.toTitleCase(bvn_data.phoneNumber.substr(0, 6))
    );

    let last_5 = "";
    let render_last_5_view = true;
    if (bvn_data.phoneNumber === this.props.user.user_data.phone_number) {
      last_5 = bvn_data.phoneNumber.substr(-5);
      render_last_5_view = false;
    }

    let eighteen_years_ago = new Date();
    eighteen_years_ago = new Date(
      eighteen_years_ago.setFullYear(eighteen_years_ago.getFullYear() - 18)
    );

    this.state = {
      is_system_upgrade,
      bvn_data,
      header_text,
      eighteen_years_ago,
      last_5,
      last_5_text,
      last_5_error: "",
      render_last_5_view,
      date_of_birth: "",
      date_of_birth_error: "",
      show_date_picker: false,

      otp: "",
      otpError: "",
      counting_down: true,
      counting_id: 1,
      until: 60,
      resending: false,
      phone_number,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      !this.state.validating && this.props.navigation.goBack();

      return true;
    }
  };

  toggleSelectDate = (show_date_picker) => {
    this.setState({ show_date_picker });
  };

  prcessSelectedDate = (event, date) => {
    if (Platform.OS === "android") {
      this.closeDatePicker();
      if (event.type === "set") {
        this.setSelectedDate(date);
      }
    } else {
      this.setSelectedDate(date);
    }
  };

  setSelectedDate = (date) => {
    this.setState({
      date_of_birth: moment(date).format("DD/MM/YYYY"),
      // date_of_birth: moment(date).format("YYYY-MM-DD"),
      date_of_birth_error: "",
    });
  };

  // setSelectedDate = (date) => {
  //   // const formattedDate = moment(date).format("YYYY-MM-DD");
  //   date_of_birth: moment(date).format("DD/MM/YYYY"),
  //     this.setState({
  //       date_of_birth: formattedDate,
  //       date_of_birth_error: "",
  //     });
  // };

  closeDatePicker = () => {
    this.toggleSelectDate(false);
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

  handleSubmit = () => {
    const { navigation } = this.props;
    //const otp = navigation.getParam("otp") ?? "";

    if (this.validFields()) {
      this.setState({ validating: true }, () => {
        const phoneVal = Util.stripFirstZeroInPhone(
          this.state.bvn_data.phoneNumber
        );
        Network.validateOTP(
          phoneVal,
          this.state.otp,
          ResponseCodes.OTP_TYPE.REG,
          ResponseCodes.OTP_NOTIFICATION_TYPE.SMS,
          this.state.is_system_upgrade && this.state.phone_number
        )
          .then((validationData) => {
            Network.validateBVN(
              this.state.bvn_data.bvn,
              this.state.bvn_data.phoneNumber,
              moment(this.state.date_of_birth, "DD/MM/YYYY").format(
                "DD/MM/YYYY"
              ),
              this.state.otp

              // "YYYY-MM-DD"
            )
              .then(() => {
                this.setState({ validating: false }, () => {
                  if (this.state.is_system_upgrade) {
                    this.props.navigation.navigate("SystemUpgradeAlmostDone", {
                      bvn_data: this.state.bvn_data,
                      phone_number: this.state.phone_number,
                      otp: this.state.otp,
                    });
                  } else {
                    this.props.navigation.navigate("EnterMobile", {
                      // bvn_data: this.state.bvn_data,
                    });

                    // UploadID;
                  }

                  // this.props.navigation.navigate('EnterEmail');
                  Util.logEventData("onboarding_bvn");
                });
              })
              .catch((error) => {
                this.setState({ validating: false }, () => {
                  this.props.showToast(error.message);
                });
              });
          })
          .catch((error) => {
            this.setState({ validating: false }, () =>
              this.props.showToast(error.message)
            );
          });
      });
    }
  };

  validFields = () => {
    let is_valid = true;
    if (!this.state.last_5 || this.state.last_5.length != 5) {
      is_valid = false;
      this.setState({ last_5_error: Dictionary.REQUIRED_FIELD });
    }

    if (this.state.otp == "" || this.state.otp.length < 6) {
      is_valid = false;
      this.setState({ otpError: Dictionary.OTP_EMPTY_ERROR });
    }

    if (!this.state.date_of_birth) {
      is_valid = false;
      this.setState({ date_of_birth_error: Dictionary.REQUIRED_FIELD });
    }

    if (is_valid) {
      let bvn_mobile = this.state.bvn_data.phoneNumber;
      if (bvn_mobile.substr(bvn_mobile.length - 5) !== this.state.last_5) {
        is_valid = false;
        this.setState({ last_5_error: Dictionary.BVN_MOBILE_MISMATCH });
      }
    }

    return is_valid;
  };

  handleResendOTP = () => {
    this.setState({ resending: true }, () => {
      let phoneVal = Util.stripFirstZeroInPhone(
        this.state.bvn_data.phoneNumber
      );
      Network.requestOtp(
        phoneVal,
        ResponseCodes.OTP_TYPE.REG,
        ResponseCodes.OTP_NOTIFICATION_TYPE.SMS,
        this.state.is_system_upgrade && this.state.phone_number
      )
        .then(() => {
          this.setState(
            {
              resending: false,
              counting_id: ++this.state.counting_id,
              counting_down: true,
            },
            () => {
              // this.getSMSMessage();
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

  render() {
    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.GET_STARTED_HEADER}
        />
        <ScrollView {...this.props}>
          <SubHeader text={this.state.header_text} />
          <View
            style={[
              FormStyle.formContainer,
              { marginBottom: Mixins.scaleSize(50) },
            ]}
          >
            {this.state.render_last_5_view && (
              <View>
                <View style={FormStyle.formItem}>
                  <Text style={[FormStyle.inputLabel, { marginLeft: 0 }]}>
                    {this.state.last_5_text}
                  </Text>
                </View>
                <View style={FormStyle.formItem}>
                  <FloatingLabelInput
                    label={Dictionary.MOBILE_LAST_5_LABEL}
                    value={this.state.last_5}
                    keyboardType={"number-pad"}
                    maxLength={5}
                    multiline={false}
                    autoCorrect={false}
                    onChangeText={(last_5) =>
                      this.setState({ last_5, last_5_error: "" })
                    }
                    editable={!this.state.validating}
                  />
                  <Text style={FormStyle.formError}>
                    {this.state.last_5_error}
                  </Text>
                </View>
              </View>
            )}
            <View style={FormStyle.formItem}>
              <Text style={[FormStyle.inputLabel, { marginLeft: 0 }]}>
                {Dictionary.ENTER_BVN_DATE}
              </Text>
            </View>
            <View style={FormStyle.formItem}>
              <TouchItem
                disabled={this.state.validating}
                onPress={() => this.toggleSelectDate(true)}
              >
                <FloatingLabelInput
                  pointerEvents="none"
                  label={Dictionary.DOB_LABEL}
                  value={this.state.date_of_birth}
                  multiline={false}
                  autoCorrect={false}
                  editable={false}
                />
              </TouchItem>
              <Text style={FormStyle.formError}>
                {this.state.date_of_birth_error}
              </Text>
            </View>

            <View style={FormStyle.formItem}>
              <Text style={FormStyle.inputLabel}>
                {Dictionary.ENTER_OTP_BVN}
              </Text>
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
                    disabled={this.state.validating || this.state.counting_down}
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
          </View>
          <View style={[SharedStyle.bottomPanel, styles.bottomPanel]}>
            <View style={FormStyle.formButton}>
              <PrimaryButton
                loading={this.state.validating}
                disabled={this.state.validating}
                title={Dictionary.CONTINUE_BTN}
                icon="arrow-right"
                onPress={this.handleSubmit}
              />
            </View>
          </View>
          <_DateTimePicker
            show={this.state.show_date_picker}
            value={this.state.date_of_birth}
            defaultValue={this.state.eighteen_years_ago}
            //  mini={this.state.eighteen_years_ago}
            maximumDate={this.state.eighteen_years_ago}
            onChange={this.prcessSelectedDate}
            onClose={this.closeDatePicker}
          />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bottomPanel: {
    marginTop: Mixins.scaleSize(12),
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = {
  showToast,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(ValidateBVN));
