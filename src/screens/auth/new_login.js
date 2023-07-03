import React, { Component } from "react";
import {
  BackHandler,
  Text,
  View,
  Image,
  StyleSheet,
  TextInput,
  Animated,
  Platform,
  ImageBackground,
} from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import * as Icon from "@expo/vector-icons";
import Modal from "react-native-modal";

import { showToast } from "_actions/toast_actions";
import { showExitDialog } from "_actions/util_actions";

import { Dictionary, Util, ResponseCodes } from "_utils";
import { SharedStyle, FormStyle, Mixins, Colors, Typography } from "_styles";
import { SubHeader, ScrollView, FloatingLabelInput, TouchItem } from "_atoms";
import { MainHeader } from "_organisms";
import { PrimaryButton } from "_molecules";

import { Network } from "_services";

class Login extends Component {
  state = {
    phone_number: this.props.user.user_data.phoneNumber ?? "",
    phone_number_error: "",
    processing: false,
    isFocused: false,
    image: this.props.information.image,
    information: this.props.information.imageVisible,
    modal_visible: true,
  };

  componentDidMount(prevProps) {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    //this.getInformation();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentDidUpdate(prevProps) {
    if (this.props.information !== prevProps.information) {
      this.setState({
        image: this.props.information.image,
        information: this.props.information.imageVisible,
      });
    }
  }

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

  handleSubmit = () => {
    if (this.validFields()) {
      let { phone_number } = this.state;
      this.setState({ processing: true }, () => {
        Network.validateUser(phone_number)
          .then((result) => {
            this.setState({ processing: false }, () => {
              let { userType } = result;
              if (userType === "PASSWORD_NOT_UPDATED") {
                this.props.navigation.navigate("SystemUpgrade", {
                  phone_number: this.state.phone_number,
                });

                return;
              }
              if (userType === "PASSWORD_UPDATED") {
                this.props.navigation.navigate("Password", {
                  phone_number: this.state.phone_number,
                });

                return;
              }
              Util.logEventData("validate_user");
            });
          })
          .catch((error) => {
            this.setState({ processing: false }, () => {
              this.props.showToast(error.message);
            });
          });
      });
    }
  };

  onCloseModal = () => {
    this.setState({
      modal_visible: false,
      information: false,
    });
  };

  // getInformation = () => {
  //   Network.getInformation().then((result) => {
  //     console.log("information", result.fileLocation);
  //     // this.setState(
  //     //   {
  //     //     authenticating: false,
  //     //   },
  //     //   () => {

  //     //   })
  //   });
  // };

  render() {
    return this.state.information ? (
      <Modal
        isVisible={this.state.modal_visible}
        swipeDirection="down"
        onSwipeComplete={this.onCloseModal}
        onBackButtonPress={this.onCloseModal}
        animationInTiming={500}
        animationOutTiming={800}
        backdropTransitionInTiming={500}
        backdropTransitionOutTiming={800}
        useNativeDriver={true}
        style={styles.modal}
      >
        {/* <View
          style={[
            SharedStyle.modalContent,
            SharedStyle.authModalContent,
            { height: "90%" },
          ]}
        > */}
        <ImageBackground
          style={styles.imageBackground}
          imageStyle={{
            resizeMode: "contain",
            borderRadius: Mixins.scaleSize(8),
          }}
          source={{ uri: this.state.image }}
        />
        {/* </View> */}

        <TouchItem style={styles.icon} onPress={this.onCloseModal}>
          <Icon.Feather
            size={Mixins.scaleSize(30)}
            style={{ color: Colors.PRIMARY_BLUE, textAlign: "center" }}
            name="x"
          />
        </TouchItem>
      </Modal>
    ) : (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          //leftIcon="arrow-left"
          backgroundStyle={{
            backgroundColor: Colors.WHITE,
            ...Mixins.boxShadow(Colors.WHITE),
          }}
          textColor="#090A0A"
          onPressLeftIcon={this.handleBackButton}
          title={""}
        />
        <ScrollView {...this.props}>
          <View style={FormStyle.formContainer}>
            <Text style={styles.login}>Login</Text>
            <Text style={styles.enter}>
              Enter your phone number to continue
            </Text>
          </View>
          <View style={FormStyle.formContainer}>
            {/* <Text style={styles.phone}>Phone Number</Text> */}
            <View style={FormStyle.formItem}>
              {/* <View style={[FormStyle.inputBox, { ...Mixins.padding(8) }]}>
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
                  </View> */}
                  <FloatingLabelInput
                    value={this.state.phone_number}
                    keyboardType={"number-pad"}
                    multiline={false}
                    autoCorrect={false}
                    enterMobile
                    //placeholder={Dictionary.PHONE_NUMBER_LABEL}
                    //placeholderTextColor={Colors.CV_BLUE}
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
                {/* </View> */}
                <Text
                  style={[
                    FormStyle.formError,
                    // { ...Mixins.margin(-50, 0, 0, 0) },
                  ]}
                >
                  {this.state.phone_number_error}
                </Text>
              {/* </View> */}
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
                loading={this.state.processing}
                title={Dictionary.VERIFY}
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
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    information: state.information,
  };
};

const mapDispatchToProps = {
  showToast,
  showExitDialog,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(Login));
