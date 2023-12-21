import React, { Component } from "react";
import { BackHandler, StyleSheet, View, Text } from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import * as Icon from "@expo/vector-icons";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-community/async-storage";
import Modal from "react-native-modal";

import { showToast } from "_actions/toast_actions";
import { storeUserData, storeUserPwd } from "_actions/user_actions";
import { getDocuments } from "_actions/document_actions";

import { Dictionary, Util } from "_utils";
import { Colors, Mixins, SharedStyle, FormStyle, Typography } from "_styles";
import { SubHeader, ScrollView, FloatingLabelInput, TouchItem } from "_atoms";
import { MainHeader } from "_organisms";
import { PrimaryButton, PasswordCriteria } from "_molecules";

import { Network } from "_services";

class CreateUser extends Component {
  constructor(props) {
    super(props);

    const { navigation } = this.props;
    const bvn_data = navigation.getParam("bvn_data");
    //const confirmation_id = navigation.getParam("confirmation_id");

    this.state = {
      // phone_number,

      // password: "",
      email: "",
      first_name: "",
      last_name: "",
      // last_name: bvn_data.lastName,
      middle_name: "",
      referral_code: "",
      latitude: "",
      showLocationModal: false,
      longitude: "",
      secure_text: false,
      valid_password: false,
      is_length_error: true,
      is_uppercase_error: true,
      is_lowercase_error: true,
      is_symbol_error: true,
      gender_error: "",
      gender: "",
      processing: false,
      email_error: "",
      last_name_error: "",
      first_name_error: "",
      referral_code_error: "",
    };
  }

  componentDidMount = async () => {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    const referral_code = await AsyncStorage.getItem("referral_code");
    let referral_regex = /^[a-z0-9]+$/i;
    if (
      referral_code &&
      referral_code.length == 6 &&
      referral_regex.test(referral_code)
    ) {
      this.setState({
        referral_code: referral_code.trim(),
      });
    }
    this.getUserLocation();
  };

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      !this.state.processing && this.props.navigation.navigate("Login");

      return true;
    }
  };

  getUserLocation = async () => {
    let { status } = await Location.requestPermissionsAsync();
    if (status === "granted") {
      try {
        let location = await Location.getCurrentPositionAsync({
          enableHighAccuracy: true,
        });
        if (!location) {
          location = await Location.getLastKnownPositionAsync();
        }
        this.setState({
          latitude: location.coords.latitude + "",
          longitude: location.coords.longitude + "",
        });
      } catch (error) {
        this.setState({ processing: false }, () => {
          this.props.showToast(Dictionary.LOCATION_ERROR);
        });
      }
    } else {
      this.setState({ processing: false }, () => {
        // this.setState({showLocationModal:true});
        this.props.showToast(Dictionary.LOCATION_PERMISSION_REQUIRED);
      });
    }
  };

  deniedLocationPermission = () => {
    this.setState({ showLocationModal: false }, () =>
      this.props.navigation.navigate("Login")
    );
  };

  toggleSecureText = () => {
    this.setState({
      secure_text: !this.state.secure_text,
    });
  };

  onChangePassword = (password) => {
    this.setState(
      {
        password,
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
    if (this.state.password.length < 8) {
      is_length_error = true;
      valid_password = false;
    }

    let capital_reg = /[A-Z]/;
    if (!capital_reg.test(this.state.password)) {
      is_uppercase_error = true;
      valid_password = false;
    }

    let lower_reg = /[a-z]/;
    if (!lower_reg.test(this.state.password)) {
      is_lowercase_error = true;
      valid_password = false;
    }

    let special_reg = /[!@#$%^&*(),.?":{}|<>=&]/;
    if (!special_reg.test(this.state.password)) {
      is_symbol_error = true;
      valid_password = false;
    }

    this.setState({
      is_length_error,
      is_uppercase_error,
      is_lowercase_error,
      is_symbol_error,
      valid_password,
    });
  };

  validFields = () => {
    const { referral_code, first_name, last_name, gender } = this.state;
    let validity = true;

    // if (!!referral_code && referral_code.length !== 6) {
    //   this.setState({
    //     referral_code_error: Dictionary.ENTER_VALID_REFERRAL_CODE
    //   });

    //   validity = false;
    // }

    // if (!!first_name && first_name == "") {
    //   this.setState({
    //     first_name_error: Dictionary.ENTER_FIRST_NAME
    //   });

    //   validity = false;
    // }

    // if (!!last_name && last_name == "") {
    //   this.setState({
    //     last_name_error: Dictionary.ENTER_LAST_NAME
    //   });

    //   validity = false;
    // }

    // if (!!gender && gender == "") {
    //   this.setState({
    //     gender_error: Dictionary.YOUR_GENDER_LABEL
    //   });

    //   validity = false;
    // }

    if (!this.state.email || !Util.isValidEmail(this.state.email)) {
      this.setState({
        email_error: Dictionary.ENTER_VALID_EMAIL,
      });

      return;
    }

    return validity;
  };

  handleSubmit = () => {
    if (!this.validFields()) {
      return;
    }
    let {
      first_name,
      last_name,
      gender,
      middle_name,
      referral_code,
      latitude,
      longitude,
    } = this.state;
    if (__DEV__) {
      latitude = "6.465422";
      longitude = "3.406448";
    }
    this.setState({ processing: true }, () => {
      let phone_number = this.props.user.user_data.phone_number;
      let password = this.props.user.user_pwd;

      Network.createCustomer(
        phone_number,
        this.state.email,
        first_name,
        last_name,
        middle_name,
        gender,
        this.props.user.referal_code,
        password,
        latitude,
        longitude
      )
        .then((result) => {
          console.log("habeebbbbb", result),
            this.setState(
              {
                processing: false,
              },
              () => {
                let user_data = {
                  ...result.customerDetails,
                  token: result.token,
                };

                // user_data.session_id = result.session_id;
                this.props.storeUserData(user_data);
                // this.props.storeUserPwd(password);
                // this.props.getDocuments();
                this.props.navigation.navigate("EnterBVN");
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

  presetGender = (gender) => {
    this.setState({ gender });
  };

  render() {
    return (
      <View style={SharedStyle.mainContainer}>
        <Modal
          isVisible={this.state.showLocationModal}
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
              <Text style={styles.header}>Location Permission</Text>
              <Text style={styles.message}>
                Location permission must be granted to complete registration
              </Text>
              <View style={styles.buttons}>
                <TouchItem
                  style={styles.button}
                  onPress={this.deniedLocationPermission}
                >
                  <Text style={styles.buttonText}>May be later</Text>
                </TouchItem>
                <TouchItem style={styles.button} onPress={this.getUserLocation}>
                  <Text style={styles.buttonText}>Proceed</Text>
                </TouchItem>
              </View>
            </View>
          </View>
        </Modal>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.GET_STARTED_HEADER}
        />
        <ScrollView {...this.props}>
          <SubHeader text={Dictionary.SIGN_UP_CREATE_CUSTOMER_HEADER} />
          <View style={FormStyle.formContainer}>
            {/* <View style={FormStyle.formItem}>
              <FloatingLabelInput
                label={Dictionary.FIRST_NAME_LABEL}
                value={this.state.first_name}
                multiline={false}
                autoCorrect={false}
                // maxLength={6}
                autoCapitalize="characters"
                onChangeText={(text) =>
                  this.setState({
                    first_name: text,
                    first_name_error: ""
                  })
                }
                editable={!this.state.processing}
              />
              <Text style={FormStyle.formError}>
                {this.state.first_name_error}
              </Text>
            </View> */}

            {/* <View style={FormStyle.formItem}>
              <FloatingLabelInput
                label={Dictionary.MIDDLE_NAME_LABEL}
                value={this.state.middle_name}
                multiline={false}
                autoCorrect={false}
                // maxLength={6}
                autoCapitalize="characters"
                onChangeText={(text) =>
                  this.setState({
                    middle_name: text
                  })
                }
                editable={!this.state.processing}
              />
            </View> */}

            {/* <View style={FormStyle.formItem}>
              <FloatingLabelInput
                label={Dictionary.LAST_NAME_LABEL}
                value={this.state.last_name}
                multiline={false}
                autoCorrect={false}
                // maxLength={6}
                autoCapitalize="characters"
                onChangeText={(text) =>
                  this.setState({
                    last_name: text,
                    last_name_error: ""
                  })
                }
                editable={!this.state.processing}
              />
              <Text style={FormStyle.formError}>
                {this.state.last_name_error}
              </Text>
            </View> */}

            <View style={FormStyle.formItem}>
              <FloatingLabelInput
                label={Dictionary.EMAIL_ADDRESS_LABEL}
                value={this.state.email}
                keyboardType={"email-address"}
                multiline={false}
                autoCorrect={false}
                onChangeText={(text) =>
                  this.setState({
                    email: text,
                    email_error: "",
                  })
                }
                editable={!this.state.processing}
              />
              <Text style={FormStyle.formError}>{this.state.email_error}</Text>
            </View>
          </View>

          <View style={SharedStyle.bottomPanel}>
            <View style={FormStyle.formButton}>
              <PrimaryButton
                loading={this.state.processing}
                disabled={this.state.processing}
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
  presets: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Mixins.scaleSize(8),
    borderWidth: Mixins.scaleSize(1),
    borderRadius: Mixins.scaleSize(4),
    borderColor: Colors.INPUT_BORDER,
  },
  preset: {
    ...Mixins.padding(16, 8, 16, 8),
    marginRight: Mixins.scaleSize(16),
    borderBottomWidth: Mixins.scaleSize(2),
    borderBottomColor: "transparent",
  },
  activePreset: {
    borderBottomColor: Colors.CV_YELLOW,
  },
  presetText: {
    ...Typography.FONT_REGULAR,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.CV_BLUE,
  },
  activePresetText: {
    ...Typography.FONT_MEDIUM,
    color: Colors.CV_YELLOW,
  },
  presetLabel: {
    ...Typography.FONT_REGULAR,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.LIGHT_GREY,
  },
  gender: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  halfColumn: {
    width: "45%",
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = {
  showToast,
  storeUserData,
  storeUserPwd,
  getDocuments,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(CreateUser));
