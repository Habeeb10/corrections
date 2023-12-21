import React, { Component } from "react";
import {
  BackHandler,
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
} from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import RNPaystack from "react-native-paystack";
import crashlytics from "@react-native-firebase/crashlytics";
import Modal from "react-native-modal";
import * as Icon from "@expo/vector-icons";
import { WebView } from "react-native-webview";

import { showToast } from "_actions/toast_actions";
import { getUserCards } from "_actions/payment_actions";

import { Dictionary, Util, ResponseCodes } from "_utils";
import { SharedStyle, Mixins, FormStyle, Colors, Typography } from "_styles";
import { SubHeader, ScrollView, FloatingLabelInput, TouchItem } from "_atoms";
import { MainHeader } from "_organisms";
import { PrimaryButton } from "_molecules";

import { Network } from "_services";

class AddCard extends Component {
  state = {
    card_number: "",
    card_number_error: "",
    card_date: "",
    card_date_error: "",
    card_cvv: "",
    card_cvv_error: "",
    processing: false,
    modal_visible: true,
    authorization_url: "",
    callback_url: "",
    verifyCount: 0,
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

  validate = () => {
    let is_valid = true;

    if (!this.state.card_number || !this.state.card_number.length >= 16) {
      this.setState({
        card_number_error: Dictionary.ENTER_VALID_CARD_NUMBER,
      });

      is_valid = false;
    }

    if (!this.state.card_date || this.state.card_date.length != 5) {
      this.setState({
        card_date_error: Dictionary.ENTER_VALID_CARD_DATE,
      });

      is_valid = false;
    }

    if (!this.state.card_cvv || this.state.card_cvv.length != 3) {
      this.setState({
        card_cvv_error: Dictionary.ENTER_VALID_CARD_CVV,
      });

      is_valid = false;
    }

    return is_valid;
  };

  onCloseModal = () => {
    this.setState({
      modal_visible: false,
    });
  };

  onCloseModalAndGoback = () => {
    this.setState({ modal_visible: false }, () => {
      this.props.navigation.goBack();
    });
  };

  openModal = () => {
    this.setState({
      modal_visible: true,
    });
  };

  chargeCard = (access_code) => {
    let date_data = this.state.card_date.split("/");
    let paystack_load = {
      cardNumber: this.state.card_number.replace(/\s+/g, "").trim(),
      expiryMonth: date_data[0],
      expiryYear: date_data[1],
      cvc: this.state.card_cvv,
      accessCode: access_code,
      //         email: 'chargeIOS@master.dev',
      //   amountInKobo: 500,
      //subAccount: 'ACCT_pz61jjjsslnx1d9',
    };

    this.onCloseModal();
    RNPaystack.chargeCardWithAccessCode(paystack_load)
      .then((result) => {
        this.verifyCard(result);
      })
      .catch((error) => {
        this.setState({ processing: false });

        let error_message = error.message;
        error_message = error_message.includes(":")
          ? error_message.substring(error_message.indexOf(":") + 1).trim()
          : error_message;

        this.props.showToast(error_message);
        crashlytics().recordError(error, "Paystack Error");
      });
  };

  verifyCard = (result) => {
    this.setState({ processing: true }, () => {
      this.setState({ verifyCount: 1 });

      Network.verifyAddCard(result.reference)
        .then((restData) => {
          // if(restData.responseCode==ResponseCodes.SUCCESS_CODE){
          // console.log("verifyAddCard",restData)

          this.setState({ processing: false }, () => {
            this.props.showToast("Card Added Successfully", false);
            this.props.navigation.goBack();
            this.props.getUserCards(this.props.user.user_data.id);
          });
          // return
          // }else{

          // this.setState({ processing: false }, () => {
          //     this.props.showToast(restData.responseMessage);
          // });

          // }
        })
        .catch((error) => {
          console.log("error", error);
          this.setState({ processing: false }, () => {
            this.props.showToast(error.message || "Error adding card");
            this.props.navigation.goBack();
          });
        });
    });
  };

  handleSubmit = () => {
    if (!this.validate()) {
      return;
    }

    this.setState({ processing: true }, () => {
      let payload = {
        customerId: this.props.user.user_data.id,
        accountId: this.props.user.wallet_id,
        //accountId:"12330015129",

        amount: "50",
      };

      Network.initAddCard(payload)
        .then((result) => {})
        .catch((error) => {
          this.onCloseModal();
          this.setState({ processing: false }, () => {
            this.props.showToast(error.message);
          });
        });
    });
  };

  onNavigationStateChange = (state) => {
    const payload = this.props.navigation.getParam("payload");
    const callback_url =
      "https://creditvilleapp.com/main/successful-fund-request";

    const { url, title } = state;
    console.log("state", state);
    if (!url) return;

    if (url.includes(callback_url) || title === "C Money") {
      // get transaction reference from url and verify transaction, then redirect
      //   const redirectTo = 'window.location = "' + callback_url + '"';
      //   this.webview.injectJavaScript(redirectTo);
      //this.props.navigation.navigate("PaymentMethods")
      if (this.state.verifyCount === 0) {
        this.verifyCard(payload?.data);
      }
      this.onCloseModal();
      //this.props.navigation.navigate("PaymentMethods")
      //this.webview.stopLoading()
    }
  };

  render() {
    const payload = this.props.navigation.getParam("payload");

    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.ADD_CARD_HEADER}
        />
        <ScrollView {...this.props}>
          <SubHeader text={Dictionary.ADD_CARD_SUB_HEADER} />
          {this.state.processing && (
            <View
              style={[
                SharedStyle.loaderContainer,
                {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
            </View>
          )}
        </ScrollView>

        <Modal
          isVisible={this.state.modal_visible}
          //swipeDirection="down"
          //onSwipeComplete={this.onCloseModal}
          onBackButtonPress={this.onCloseModal}
          animationInTiming={500}
          animationOutTiming={800}
          backdropTransitionInTiming={500}
          backdropTransitionOutTiming={800}
          useNativeDriver={true}
          //style={styles.modal}
        >
          <WebView
            ref={(r) => (this.webview = r)}
            source={{ uri: payload?.data?.authorization_url }}
            style={{ marginTop: 40 }}
            onNavigationStateChange={this.onNavigationStateChange}
          />
          <View style={[SharedStyle.bottomPanel, { paddingBottom: 1 }]}>
            <TouchItem style={styles.icon} onPress={this.onCloseModalAndGoback}>
              <Icon.Feather
                size={Mixins.scaleSize(30)}
                style={{ color: Colors.PRIMARY_BLUE, textAlign: "center" }}
                name="x"
              />
            </TouchItem>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  parallelFields: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  secureBadge: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  secureImage: {
    width: "50%",
    height: Mixins.scaleSize(50),
    resizeMode: "contain",
  },
  modal: {
    borderRadius: 20,
    borderColor: "white",
    backgroundColor: "#DCDCDC",
    alignSelf: "center",
    display: "flex",
    justifyContent: "center",
    height: "20%",
  },
  modatText: {
    marginLeft: 10,
    marginRight: 10,
    color: Colors.BLACK,
    fontSize: 18,
    ...Typography.FONT_REGULAR,
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
    //opacity: 0.7
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = {
  showToast,
  getUserCards,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(AddCard));
