import React, { Component } from "react";
import Modal from "react-native-modal";
import { StyleSheet, View, Text, Image } from "react-native";
import * as Icon from "@expo/vector-icons";
import _ from "lodash";
import { connect } from "react-redux";

import { Dictionary, Util, ResponseCodes, Endpoints } from "_utils";
import { PrimaryButton } from "_molecules";
import { Mixins, SharedStyle, Colors, Typography } from "_styles";
import { TouchItem } from "_atoms";
import { AuthorizeTransaction } from "_organisms";

import { Network } from "_services";
import { addNotification } from "_actions/notification_actions";
import { showToast } from "_actions/toast_actions";
import { store } from "../../redux/store/index";

class Summary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      processing: false,
      auth_screen_visible: false,
      pin_error: "",
    };
  }

  handleTransactionAuthorization = () => {
    this.setState({
      auth_screen_visible: true,
      pin_error: "",
    });
  };

  cancelTransactionAuthorization = () => {
    this.setState({
      auth_screen_visible: false,
    });
  };

  handleSubmit = (pin) => {
    const { navigation, onCloseModal, transaction_data } = this.props;
    const payload = {
      referralCode: transaction_data?.referralCode,
      referredCode: transaction_data?.referredCode,
    };
    const user_data = store.getState().user.user_data;
    const token = user_data.token || "";
    //          "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIyMjE1MzAyNjM5MyIsImV4cCI6MTY5ODQzMjQ1MSwic3ViIjoiMDgxNjM5ODYxNzRfMjIxNTMwMjYzOTMiLCJpc3MiOiJDdXN0b21lciJ9.5XtUw5ip5nZl9leEmW1ZOhBIBRVk83aEfvdOp29de9U",

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apiKey: token,
      },
      body: JSON.stringify(payload),
    };

    if (!this.props.user.user_data.emailVerificationStatus) {
      this.setState({
        auth_screen_visible: false,
      });
      this.props.showToast(Dictionary.EMAIL_NOT_VERIFIED);

      navigation.navigate("EnterEmail");

      return;
    }
    if (!this.props.user.user_data.photoUrl) {
      this.setState({
        auth_screen_visible: false,
      });
      this.props.showToast(Dictionary.NO_PHOTO_URL);
      navigation.navigate("OnboardSelfie");
      return;
    }
    this.setState(
      {
        processing: true,
      },
      () => {
        Network.validatePIN(pin)
          .then(() => {
            // Network.doReferralTransfer(payload)
            //   .then((result) => {
            //     this.setState(
            //       {
            //         processing: false,
            //         auth_screen_visible: false,
            //       },
            //       () => {
            //         if (result.respData.code == ResponseCodes.SUCCESS_CODE) {
            //   onCloseModal();
            //   this.props.showToast("Withdrawal was successful", false);
            //   this.props.addNotification({
            //     id: Util.randomId(),
            //     is_read: false,
            //     title: "Referral Credit",
            //     description: `You just sent NGN${transaction_data?.referralAmount} referral bonus to your wallet balance.`,
            //     timestamp: moment().toString(),
            //   });
            //   navigation.goBack();
            //         } else {
            //           onCloseModal();
            //           this.props.showToast(result?.respData.message);
            //         }
            //       }
            //     );
            //   })
            //   .catch((error) => {
            //     this.setState(
            //       {
            //         processing: false,
            //         auth_screen_visible: false,
            //       },
            //       () => {
            //         console.log({ error });
            //         onCloseModal();
            //         this.props.showToast(error.message || "Failed to make transfer");
            //       }
            //     );
            //   });
            fetch(`${Endpoints.REFERRAL_ACTIVITIES}/transfer`, requestOptions)
              .then((response) => response.json())
              .then((data) => {
                this.setState(
                  {
                    processing: false,
                    auth_screen_visible: false,
                  },
                  () => {
                    if (
                      data.data?.respData.code == ResponseCodes.SUCCESS_CODE
                    ) {
                      onCloseModal();
                      this.props.showToast(
                        data.data?.respData.message ||
                          "Withdrawal was successful",
                        false
                      );
                      this.props.addNotification({
                        id: Util.randomId(),
                        is_read: false,
                        title: "Referral Credit",
                        description: `You just sent NGN${transaction_data?.referralAmount} referral bonus to your wallet balance.`,
                        timestamp: moment().toString(),
                      });
                      navigation.goBack();
                    } else {
                      onCloseModal();
                      this.props.showToast(
                        data.data?.respData.message || "Failed to make transfer"
                      );
                    }
                  }
                );
              })
              .catch((err) =>
                this.setState(
                  {
                    processing: false,
                    auth_screen_visible: false,
                  },
                  () => {
                    onCloseModal();
                    this.props.showToast("An unexpeted error occured");
                  }
                )
              );
          })

          .catch((error) => {
            this.setState({
              processing: false,
              pin_error: error.message,
            });
          });
      }
    );
  };

  render() {
    const { modal_visible, onCloseModal } = this.props;
    let { user_data } = this.props.user;
    let account_number = user_data?.nuban;
    let account_name =
      user_data.firstName && user_data.lastName
        ? user_data.firstName.charAt(0).toUpperCase() +
          user_data.firstName.substring(1).toLowerCase() +
          " " +
          (user_data.lastName.charAt(0).toUpperCase() +
            user_data.lastName.substring(1).toLowerCase())
        : "";

    return (
      <View>
        <Modal
          isVisible={modal_visible}
          animationIn={"slideInUp"}
          onBackdropPress={onCloseModal}
          swipeDirection="down"
          onSwipeComplete={onCloseModal}
          onBackButtonPress={onCloseModal}
          animationInTiming={300}
          animationOutTiming={500}
          backdropTransitionInTiming={300}
          backdropTransitionOutTiming={500}
          useNativeDriver={true}
          style={{ margin: 0 }}
        >
          <View
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              borderTopLeftRadius: Mixins.scaleSize(20),
              borderTopRightRadius: Mixins.scaleSize(20),
              backgroundColor: "white",
              ...Mixins.padding(15),
            }}
          >
            <View style={styles.modalHeader}>
              <TouchItem style={styles.icon} onPress={onCloseModal}>
                <Icon.Feather
                  size={Mixins.scaleSize(24)}
                  style={{ color: Colors.PRIMARY_BLUE }}
                  name="x"
                />
              </TouchItem>
            </View>

            <View
              style={{
                alignSelf: "center",
                marginBottom: Mixins.scaleSize(20),
              }}
            >
              <Text style={styles.title} numberOfLines={1}>
                ₦{Util.formatAmount(1000)}
              </Text>
            </View>

            <View style={[SharedStyle.section, styles.background]}>
              <View style={[SharedStyle.row, styles.divider]}>
                <Text numberOfLines={1} style={styles.subtitle}>
                  {Dictionary.ACCOUNT_NUMBER_LABEL}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.normalText, SharedStyle.value]}
                >
                  {account_number}
                </Text>
              </View>

              <View style={[SharedStyle.row, styles.divider]}>
                <Text numberOfLines={1} style={styles.subtitle}>
                  {Dictionary.BENEFICIARY_NAME_LABEL}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.normalText, SharedStyle.value]}
                >
                  {account_name}
                </Text>
              </View>

              <View style={[SharedStyle.row, styles.divider]}>
                <Text numberOfLines={1} style={styles.subtitle}>
                  {Dictionary.BANK_LABEL}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={styles.image}
                    source={require("../../assets/images/transfers/icon.png")}
                  />
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.normalText,
                      SharedStyle.value,
                      { textTransform: "uppercase" },
                    ]}
                  >
                    {"CMFB"}
                  </Text>
                </View>
              </View>

              {/* <View style={[SharedStyle.row, styles.divider]}>
                <Text numberOfLines={1} style={styles.subtitle}>
                  {Dictionary.NARRATION}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.normalText, SharedStyle.value]}
                >
                  {narration || "- - - "}
                </Text>
              </View> */}
            </View>

            <View style={{ ...Mixins.padding(25, 0, 0, 0) }}>
              <PrimaryButton
                title={"Withdraw to Wallet"}
                icon="arrow-right"
                //leftIcon="bank"
                onPress={this.handleTransactionAuthorization}
              />
            </View>
          </View>
        </Modal>

        {this.state.auth_screen_visible && (
          <AuthorizeTransaction
            title={Dictionary.TRANSFERS}
            isVisible={this.state.auth_screen_visible}
            isProcessing={this.state.processing}
            pinError={this.state.pin_error}
            resetError={() => this.setState({ pin_error: "" })}
            onSubmit={this.handleSubmit}
            onCancel={this.cancelTransactionAuthorization}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  modalHeader: {
    width: "100%",
    display: "flex",
  },
  title: {
    color: Colors.CV_BLUE,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Mixins.scaleFont(24),
    fontWeight: "bold",
    lineHeight: 28.13,
  },
  subtitle: {
    color: Colors.DARK_BLUE,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Mixins.scaleFont(14),
    lineHeight: 16.41,
    fontWeight: "700",
  },
  icon: {
    alignSelf: "flex-end",
    //backgroundColor: "#F3F3FF",
    borderRadius: 50,
    padding: 5,
  },
  normalText: {
    ...Typography.FONT_REGULAR,
    fontSize: Mixins.scaleFont(12),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
  },
  background: {
    backgroundColor: Colors.RECEIPT_BG,
    borderWidth: Mixins.scaleSize(0),
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(7, 44, 80, 0.1)",
    paddingBottom: Mixins.scaleSize(20),
    // marginBottom: Mixins.scaleSize(15),
  },
  image: {
    width: Mixins.scaleSize(21),
    height: Mixins.scaleSize(21),
    marginRight: 10,
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    wallet: state.wallet,
    transfers: state.transfers,
  };
};

const mapDispatchToProps = {
  addNotification,
  showToast,
};

export default connect(mapStateToProps, mapDispatchToProps)(Summary);
