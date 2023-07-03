import React, { Component } from "react";
import { BackHandler, StyleSheet, View, Text } from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import * as Icon from "@expo/vector-icons";

import { showToast } from "_actions/toast_actions";
import { storeUserPwd } from "_actions/user_actions";

import { Dictionary } from "_utils";
import { Colors, Mixins, SharedStyle, FormStyle } from "_styles";
import { SubHeader, ScrollView, FloatingLabelInput, TouchItem } from "_atoms";
import { MainHeader } from "_organisms";
import { PrimaryButton, PasswordCriteria } from "_molecules";

import { Network } from "_services";

class ChangePassword extends Component {
  state = {
    old_password: "",
    old_password_error: "",
    new_password: "",
    new_password_error: "",
    old_secure_text: false,
    new_secure_text: false,
    valid_password: false,
    is_length_error: true,
    is_uppercase_error: true,
    is_lowercase_error: true,
    is_symbol_error: true,
    processing: false
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

  toggleOldSecureText = () => {
    this.setState({
      old_secure_text: !this.state.old_secure_text
    });
  };

  onChangeOldPassword = (old_password) => {
    this.setState({
      old_password,
      old_password_error: ""
    });
  };

  toggleNewSecureText = () => {
    this.setState({
      new_secure_text: !this.state.new_secure_text
    });
  };

  onChangeNewPassword = (new_password) => {
    this.setState(
      {
        new_password,
        new_password_error: ""
      },
      () => this.validate()
    );
  };

  validate = () => {
    let is_length_error = false,
      is_uppercase_error = false,
      is_lowercase_error = false,
      is_symbol_error = false;
    let valid_password = true;
    if (this.state.new_password.length < 8) {
      is_length_error = true;
      valid_password = false;
    }

    let capital_reg = /[A-Z]/;
    if (!capital_reg.test(this.state.new_password)) {
      is_uppercase_error = true;
      valid_password = false;
    }

    let lower_reg = /[a-z]/;
    if (!lower_reg.test(this.state.new_password)) {
      is_lowercase_error = true;
      valid_password = false;
    }

    let special_reg = /[!@#$%^&*(),.?":{}|<>=&]/;
    if (!special_reg.test(this.state.new_password)) {
      is_symbol_error = true;
      valid_password = false;
    }

    this.setState({
      is_length_error,
      is_uppercase_error,
      is_lowercase_error,
      is_symbol_error,
      valid_password
    });

    return valid_password;
  };

  verifyPasswords = () => {
    let is_valid = true;
    if (!this.state.old_password) {
      this.setState({
        old_password_error: Dictionary.REQUIRED_FIELD
      });

      is_valid = false;
    }

    if (!this.state.new_password) {
      this.setState({
        new_password_error: Dictionary.REQUIRED_FIELD
      });

      is_valid = false;
    }

    if (
      this.state.old_password &&
      this.state.new_password &&
      this.state.old_password === this.state.new_password
    ) {
      this.setState({
        new_password_error: Dictionary.CYCLIC_PASSWORD_CHANGE
      });

      is_valid = false;
    }

    return is_valid;
  };

  handleSubmit = () => {
    if (!this.verifyPasswords() || !this.validate()) {
      return;
    }
    let { old_password, new_password } = this.state;
    this.setState({ processing: true }, () => {
      Network.changePassword(
        old_password,
        new_password,
        this.props.user.user_data.phoneNumber || ""
      )
        .then((result) => {
          this.setState(
            {
              processing: false
            },
            () => {
              this.props.storeUserPwd(new_password);
              const { navigation } = this.props;
              const is_system_upgrade =
                navigation.getParam("is_system_upgrade");
              if (is_system_upgrade) {
                this.props.showToast(
                  result.message || "Password Updated successfully",
                  false
                );
                this.props.navigation.navigate("Dashboard");
              } else {
                this.handleBackButton();
                this.props.showToast(result.message, false);
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
    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.CHANGE_PASSWORD_HEADER}
        />
        <ScrollView {...this.props}>
          <SubHeader text={Dictionary.CHANGE_PASSWORD_SUB_HEADER} />
          <View style={FormStyle.formContainer}>
            <View style={FormStyle.formItem}>
              <FloatingLabelInput
                style={{ paddingRight: Mixins.scaleSize(45) }}
                label={Dictionary.OLD_PASSWORD_LABEL}
                value={this.state.old_password}
                secureTextEntry={!this.state.old_secure_text}
                multiline={false}
                autoCorrect={false}
                onChangeText={(password) => this.onChangeOldPassword(password)}
                editable={!this.state.processing}
              />
              {!!this.state.old_password && (
                <TouchItem
                  style={styles.secureToggle}
                  onPress={this.toggleOldSecureText}
                >
                  <Icon.Ionicons
                    style={styles.secureToggleIcon}
                    size={Mixins.scaleSize(25)}
                    name={
                      this.state.old_secure_text ? "ios-eye-off" : "ios-eye"
                    }
                  />
                </TouchItem>
              )}
              <Text style={FormStyle.formError}>
                {this.state.old_password_error}
              </Text>
            </View>
            <View style={FormStyle.formItem}>
              <FloatingLabelInput
                style={{ paddingRight: Mixins.scaleSize(45) }}
                label={Dictionary.NEW_PASSWORD_LABEL}
                value={this.state.new_password}
                secureTextEntry={!this.state.new_secure_text}
                multiline={false}
                autoCorrect={false}
                onChangeText={(password) => this.onChangeNewPassword(password)}
                editable={!this.state.processing}
              />
              {!!this.state.new_password && (
                <TouchItem
                  style={styles.secureToggle}
                  onPress={this.toggleNewSecureText}
                >
                  <Icon.Ionicons
                    style={styles.secureToggleIcon}
                    size={Mixins.scaleSize(25)}
                    name={
                      this.state.new_secure_text ? "ios-eye-off" : "ios-eye"
                    }
                  />
                </TouchItem>
              )}
              <Text style={FormStyle.formError}>
                {this.state.new_password_error}
              </Text>
            </View>
          </View>
          <View style={FormStyle.formItem}>
            <View style={styles.criteria}>
              <PasswordCriteria
                lengthError={this.state.is_length_error}
                uppercaseError={this.state.is_uppercase_error}
                lowercaseError={this.state.is_lowercase_error}
                symbolError={this.state.is_symbol_error}
              />
            </View>
          </View>
          <View style={SharedStyle.bottomPanel}>
            <View style={FormStyle.formButton}>
              <PrimaryButton
                loading={this.state.processing}
                disabled={this.state.processing}
                title={Dictionary.SAVE_PASSWORD_BTN}
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
  secureToggle: {
    ...Mixins.padding(15),
    position: "absolute",
    right: 0
  },
  secureToggleIcon: {
    color: Colors.CV_YELLOW
  },
  criteria: {
    ...Mixins.margin(10, 16, 30, 16),
    paddingBottom: Mixins.scaleSize(20)
  }
});

const mapStateToProps = (state) => {
  return {
    user: state.user
  };
};

const mapDispatchToProps = {
  showToast,
  storeUserPwd
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(ChangePassword));
