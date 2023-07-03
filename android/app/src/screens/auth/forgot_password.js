import React, { Component } from "react";
import { BackHandler, Text, View } from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";

import { showToast } from "_actions/toast_actions";

import { Dictionary, Util, ResponseCodes } from "_utils";
import { SharedStyle, FormStyle } from "_styles";
import { SubHeader, ScrollView, FloatingLabelInput } from "_atoms";
import { MainHeader } from "_organisms";
import { PrimaryButton } from "_molecules";

import { Network } from "_services";

class ForgotPassword extends Component {
  state = {
    phone_number: "",
    phone_number_error: "",
    processing: false,
  };

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      !this.state.processing && this.props.navigation.goBack();

      return true;
    }
  };

  handleSubmit = () => {
    if (!Util.isValidPhone(this.state.phone_number)) {
      this.setState({
        phone_number_error: Dictionary.ENTER_VALID_PHONE,
      });

      return;
    }

    this.setState({ processing: true }, () => {
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
            ResponseCodes.OTP_NOTIFICATION_TYPE.SMS
          )
            .then(() => {
              this.setState({ processing: false }, () => {
                this.props.navigation.navigate("ForgotPasswordOTP", {
                  phone_number: this.state.phone_number,
                });
                Util.logEventData("onboarding_forgot");
              });
            })
            .catch((error) => {
              
              this.setState({ processing: false }, () =>
                this.props.showToast(error.message)
              );
            });
              } else {
                this.setState({ processing: false }, () =>
                this.props.showToast(error.message)
              );
              }
      });
    });
  };

  render() {
    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.FORGOT_PASSWORD_HEADER}
        />
        <ScrollView {...this.props}>
          <SubHeader text={Dictionary.FORGOT_ENTER_MOBILE_HEADER} />
          <View style={FormStyle.formContainer}>
            <View style={FormStyle.formItem}>
              <FloatingLabelInput
                label={Dictionary.MOBILE_NUMBER_LABEL}
                value={this.state.phone_number}
                keyboardType={"number-pad"}
                multiline={false}
                autoCorrect={false}
                maxLength={11}
                onChangeText={(text) =>
                  this.setState({
                    phone_number: text.replace(/\D/g, ""),
                    phone_number_error: "",
                  })
                }
                editable={!this.state.processing}
              />
              <Text style={FormStyle.formError}>
                {this.state.phone_number_error}
              </Text>
            </View>
          </View>
          <View style={SharedStyle.bottomPanel}>
            <View style={FormStyle.formButton}>
              <PrimaryButton
                loading={this.state.processing}
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
)(withNavigationFocus(ForgotPassword));
