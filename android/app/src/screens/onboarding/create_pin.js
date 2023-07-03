import React, { Component } from "react";
import { BackHandler, StyleSheet, Text, View } from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import SmoothPinCodeInput from "react-native-smooth-pincode-input";
import moment from 'moment';
import * as Icon from "@expo/vector-icons";

import { showToast } from "_actions/toast_actions";
import {
  registerSessionListener,
  storeUserData,
  storeUserPin,
  getUserProfile
} from "_actions/user_actions";

import { Dictionary, Util, ResponseCodes } from "_utils";
import { SharedStyle, Mixins, FormStyle, Colors, Typography } from "_styles";
import { SubHeader, ScrollView, FloatingLabelInput, TouchItem } from "_atoms";
import { MainHeader } from "_organisms";
import { PrimaryButton } from "_molecules";

import { Network } from "_services";

import { AppEventsLogger } from "react-native-fbsdk";

class CreatePIN extends Component {
  state = {
    pin: "",
    confirm_pin: "",
    pin_error: "",
    processing: false,
    secure_text: false,
    confirm_secure_text: false
  };

  onChangePIN = (pin) => {
    this.setState({
      pin,
      pin_error: ""
    });
  };

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      !this.state.processing && this.props.navigation.navigate("Login");

      return true;
    }
  };

  toggleSecureText = () => {
    this.setState({
      secure_text: !this.state.secure_text,
    });
  };

  toggleConfirmSecureText = () => {
    this.setState({
      confirm_secure_text: !this.state.confirm_secure_text,
    });
  };

  validatePin = () => {

  }

  handleSubmit = () => {
    const { navigation } = this.props;
    const bvn_data = navigation.getParam("bvn_data");
    const is_system_upgrade = navigation.getParam("is_system_upgrade");
    const phone_number = navigation.getParam("phone_number") ?? "";

    if (!this.state.pin || this.state.pin.length != 4) {
      this.setState({
        pin_error: Dictionary.ENTER_VALID_PIN
      });

      return;
    }

    if (is_system_upgrade && this.state.pin !== this.state.confirm_pin) {
      this.setState({
        pin_error: Dictionary.PIN_DO_NOT_MATCH
      });

      return
    }

    this.setState({ processing: true }, () => {
      let date_of_birth= moment(bvn_data.dateOfBirth, "DD-mm-YYYY").format("YYYY-MM-DD");
      Network.completeOnboarding(
        this.props.user.user_data.phoneNumber,
        date_of_birth,
        bvn_data.firstName,
        bvn_data.lastName,
        bvn_data.middleName,
        bvn_data.gender,
        bvn_data.bvn,
        this.state.pin
      )
        .then((result) => {
          this.setState(
            {
              processing: false
            },
            () => {
              if (result.resp.code == ResponseCodes.SUCCESS_CODE) {
              } else {
              }
              // this.props.registerSessionListener(result.data);
              // this.props.storeUserData(result.data);
              this.props.storeUserPin(this.state.pin);
              Util.logEventData("onboarding_pin");
              AppEventsLogger.logEvent("user_signed_up");
              if (is_system_upgrade) {
                this.props.showToast(Dictionary.SYSTEM_UPGRADE_CREATE_PIN_SUCCESS, false);
                this.props.navigation.navigate('Password', {
                  phone_number,
                  is_system_upgrade: true,
                });
                
              } else {
                this.props.navigation.navigate("Dashboard");
              }
              
            }
          );
        })
        .catch((error) => {
          this.setState({ processing: false }, () =>
            this.props.showToast(error.message)
          );
        });
    });
  };

  render() {
    const is_system_upgrade = this.props.navigation.getParam("is_system_upgrade");
    return (
      <View style={SharedStyle.mainContainer}>
         {is_system_upgrade ? (
          <MainHeader
            backgroundStyle={{
              backgroundColor: Colors.WHITE,
              ...Mixins.boxShadow(Colors.WHITE),
            }}
            textColor="#090A0A"
            title={""}
            // leftIcon="arrow-left"
            // onPressLeftIcon={this.handleBackButton}
            // title={""}
            // textColor="#090A0A"
            // backgroundStyle={{
            //   backgroundColor: Colors.WHITE,
            //   ...Mixins.boxShadow(Colors.WHITE),
            // }}
          />
        ) : (
          <MainHeader
            leftIcon="arrow-left"
            onPressLeftIcon={this.handleBackButton}
            title={Dictionary.GET_STARTED_HEADER}
          />
        )}
        <ScrollView {...this.props} hasButtomButtons={true}>
          {!is_system_upgrade && (
            <SubHeader text={Dictionary.SIGN_UP_CREATE_PIN_HEADER} />
          )}
          {is_system_upgrade && (
            <View style={FormStyle.formContainer}>
              <Text style={styles.pin}>Create new pin</Text>
              <Text style={styles.enter}>Your new pin must be different from the previous used pin</Text>
            </View>
          )}
          <View style={FormStyle.formContainer}>
            {is_system_upgrade ? (
              <View style={FormStyle.formItem}>
                <View>
                  <FloatingLabelInput
                    style={styles.newPin}
                    createPin
                    label="New Pin"
                    value={this.state.pin}
                    secureTextEntry={!this.state.secure_text}
                    multiline={false}
                    autoCorrect={false}
                    onChangeText={(pin) =>
                      this.setState({
                        pin,
                        pin_error: "",
                      })
                    }
                    editable={!this.state.processing}
                  />
                  {!!this.state.pin && (
                    <TouchItem
                      style={[
                        styles.secureToggle,
                        { right: Mixins.scaleSize(0) },
                      ]}
                      onPress={this.toggleSecureText}
                    >
                      <Icon.Ionicons
                        style={styles.secureToggleIcon}
                        size={Mixins.scaleSize(25)}
                        name={
                          this.state.secure_text ? "ios-eye-off" : "ios-eye"
                        }
                      />
                    </TouchItem>
                  )}
                </View>
                <View>
                  <FloatingLabelInput
                    style={{ paddingRight: Mixins.scaleSize(45) }}
                    createPin
                    label="Confirm New Pin"
                    value={this.state.confirm_pin}
                    secureTextEntry={!this.state.confirm_secure_text}
                    multiline={false}
                    autoCorrect={false}
                    onChangeText={(confirm_pin) =>
                      this.setState({
                        confirm_pin,
                        pin_error: "",
                      })
                    }
                    editable={!this.state.processing}
                  />
                  {!!this.state.confirm_pin && (
                    <TouchItem
                      style={[
                        styles.secureToggle,
                        { right: Mixins.scaleSize(0) },
                      ]}
                      onPress={this.toggleConfirmSecureText}
                    >
                      <Icon.Ionicons
                        style={styles.secureToggleIcon}
                        size={Mixins.scaleSize(25)}
                        name={
                          this.state.confirm_secure_text
                            ? "ios-eye-off"
                            : "ios-eye"
                        }
                      />
                    </TouchItem>
                  )}
                </View>
                <Text style={[FormStyle.formError, styles.pin_error]}>
                  {this.state.pin_error}
                </Text>
              </View>
            ) : (
              <View>
                <View style={FormStyle.formItem}>
                  <Text style={[FormStyle.inputLabel, { ...Mixins.margin(0) }]}>
                    {Dictionary.ENTER_PIN}
                  </Text>
                </View>
                <View style={FormStyle.formItem}>
                  <SmoothPinCodeInput
                    animated={false}
                    maskDelay={0}
                    password
                    mask={<View style={FormStyle.pinMask} />}
                    codeLength={4}
                    containerStyle={FormStyle.pinContainer}
                    cellStyle={[FormStyle.pinBox, styles.pinBox]}
                    cellStyleFocused={FormStyle.activePinBox}
                    cellSize={Mixins.scaleSize(54)}
                    value={this.state.pin}
                    autoFocus={false}
                    onTextChange={(pin) => this.onChangePIN(pin)}
                  />
                  <Text style={[FormStyle.formError, styles.pin_error]}>
                    {this.state.pin_error}
                  </Text>
                </View>
              </View>
            )}
          </View>
          <View style={SharedStyle.bottomPanel}>
            <View style={FormStyle.formButton}>
              <PrimaryButton
                loading={this.state.processing}
                disabled={this.props.processing}
                title={is_system_upgrade ? Dictionary.RESET : Dictionary.CONTINUE_BTN}
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
  pinBox: {
    marginRight: Mixins.scaleSize(17)
  },
  pin_error: {
    textAlign: "center",
    marginVertical: Mixins.scaleSize(10)
  },
  newPin: {
    paddingRight: Mixins.scaleSize(45),
    marginBottom: Mixins.scaleSize(25)
  },
  pin: {
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
  },
  secureToggle: {
    ...Mixins.padding(15),
    position: "absolute",
    right: 0,
  },
  secureToggleIcon: {
    color: Colors.CV_YELLOW,
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user
  };
};

const mapDispatchToProps = {
  showToast,
  registerSessionListener,
  storeUserData,
  storeUserPin,
  getUserProfile
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(CreatePIN));
