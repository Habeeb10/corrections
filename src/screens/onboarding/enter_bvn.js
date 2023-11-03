import React, { Component } from "react";
import { BackHandler, StyleSheet, View, Text, Linking } from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import * as Icon from "@expo/vector-icons";

import { showToast } from "_actions/toast_actions";

import { Dictionary, ResponseCodes, Util } from "_utils";
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from "_styles";
import { SubHeader, ScrollView, FloatingLabelInput } from "_atoms";
import { MainHeader } from "_organisms";
import { PrimaryButton, ActionButton } from "_molecules";

import { Network } from "_services";

class EnterBVN extends Component {
  constructor(props) {
    super(props);
    const { navigation } = this.props;
    const is_system_upgrade = navigation.getParam("is_system_upgrade") || false;

    this.state = {
      is_system_upgrade,
      bvn: "",
      bvn_error: "",
      checking: false
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
      !this.state.checking && this.props.navigation.navigate("Login");

      return true;
    }
  };

  handleGetBVN = () => {
    let ussdCode = "*565*0#";
    if (Platform.OS === "android") {
      ussdCode = `tel:${encodeURIComponent(ussdCode)}`;
    } else {
      ussdCode = `telprompt:${ussdCode}`;
    }

    Linking.openURL(ussdCode);
  };

  handleSubmit = () => {
    const { navigation } = this.props;
    const phone_number = navigation.getParam("phone_number") ?? "";
    const otp = navigation.getParam("otp") ?? "";

    if (!this.state.bvn || this.state.bvn.length != 11) {
      this.setState({
        bvn_error: Dictionary.ENTER_VALID_BVN
      });

      return;
    }

    this.setState({ checking: true }, () => {
      Network.checkBVN(this.state.bvn)
        .then((result) => {

          //send otp to bvn phone number
          let otpBvnPhone = Util.stripFirstZeroInPhone(result.phoneNumber);
          Network.requestOtp(
            otpBvnPhone,
            ResponseCodes.OTP_TYPE.REG,
            ResponseCodes.OTP_NOTIFICATION_TYPE.SMS,
            this.state.is_system_upgrade && phone_number
          )
            .then(() => {
              this.setState({ checking: false }, () => {
                this.props.navigation.navigate("ValidateBVN", {
                  bvn_data: result,
                  otp,
                  is_system_upgrade:this.state.is_system_upgrade,
                  phone_number
                });
              });
            })
            .catch((error) => {
              this.setState({ checking: false }, () =>
                this.props.showToast(error.message)
                // this.props.navigation.navigate("ValidateBVN", {
                //   bvn_data: result,
                //   is_system_upgrade:this.state.is_system_upgrade
                // })
              );
            });
        })
        .catch((error) => {
          this.setState({ checking: false }, () =>
            this.props.showToast(error.message)
          );
        });
    });
  };
         
  render() {
    let {is_system_upgrade} = this.state;
    return (
      <View style={SharedStyle.mainContainer}>
        {is_system_upgrade ? (
          <MainHeader
            leftIcon="arrow-left"
            onPressLeftIcon={this.handleBackButton}
            title={""}
            textColor="#090A0A"
            backgroundStyle={{
              backgroundColor: Colors.WHITE,
              ...Mixins.boxShadow(Colors.WHITE),
            }}
          />
        ) : (
          <MainHeader
            leftIcon="arrow-left"
            onPressLeftIcon={this.handleBackButton}
            title={Dictionary.GET_STARTED_HEADER}
          />
        )}
        <ScrollView {...this.props}>
          {!is_system_upgrade && (
            <SubHeader text={Dictionary.SIGN_UP_ENTER_BVN_HEADER} />
          )}
          {is_system_upgrade && (
            <View style={FormStyle.formContainer}>
              <Text style={styles.bvn}>Enter your BVN</Text>
              <Text style={styles.enter}>Please verify your BVN Number</Text>
            </View>
          )}
          <View style={FormStyle.formContainer}>
            <View style={FormStyle.formItem}>
              <FloatingLabelInput
                label={Dictionary.BVN_LABEL}
                value={this.state.bvn}
                keyboardType={"number-pad"}
                maxLength={11}
                multiline={false}
                autoCorrect={false}
                onChangeText={(text) =>
                  this.setState({
                    bvn: text.replace(/\D/g, ""),
                    bvn_error: ""
                  })
                }
                editable={!this.state.checking}
              />
              <Text style={FormStyle.formError}>{this.state.bvn_error}</Text>
            </View>
          </View>
          <View style={FormStyle.formItem}>
            <View style={[FormStyle.formButton, styles.formButton]}>
              <ActionButton
                disabled={this.state.checking}
                title={Dictionary.GET_BVN_BTN}
                color={Colors.CV_YELLOW}
                icon="plus"
                onPress={this.handleGetBVN}
              />
            </View>
          </View>
          {!this.state.is_system_upgrade && (
            <View style={FormStyle.formItem}>
              <LinearGradient
                style={styles.privacy}
                colors={["#56D79C", "#44AB7A"]}
              >
                <View style={{ flex: 12 }}>
                  <Text
                    style={[styles.privacyText, styles.privacyHeader]}
                    numberOfLines={1}
                  >
                    {Dictionary.BVN_POLICY}
                  </Text>
                  <Text style={styles.privacyText}>
                    {Dictionary.BVN_POLICY_TEXT}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Icon.SimpleLineIcons
                    size={Mixins.scaleSize(24)}
                    style={styles.privacyIcon}
                    name="info"
                  />
                </View>
              </LinearGradient>
            </View>
          )}
          <View style={SharedStyle.bottomPanel}>
            <View style={FormStyle.formButton}>
              <PrimaryButton
                loading={this.state.checking}
                disabled={this.state.checking}
                title={Dictionary.VALIDATE_BVN_BTN}
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
  formButton: {
    marginHorizontal: Mixins.scaleSize(16)
  },
  privacy: {
    ...Mixins.padding(12),
    marginHorizontal: Mixins.scaleSize(16),
    marginBottom: Mixins.scaleSize(80),
    borderRadius: Mixins.scaleSize(8),
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  privacyHeader: {
    ...Typography.FONT_BOLD,
    fontSize: Mixins.scaleFont(16)
  },
  privacyText: {
    ...Typography.FONT_REGULAR,
    fontSize: Mixins.scaleFont(13),
    lineHeight: Mixins.scaleSize(18),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.WHITE
  },
  privacyIcon: {
    color: Colors.WHITE
  },
  bvn: {
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
});

const mapStateToProps = (state) => {
  return {
    user: state.user
  };
};

const mapDispatchToProps = {
  showToast
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(EnterBVN));
