"@ts-check";

import React, { Component } from "react";
import Modal from "react-native-modal";
import { StyleSheet, View, Text, Image } from "react-native";
import * as Icon from "@expo/vector-icons";
import _ from "lodash";
import { connect } from "react-redux";
import moment from "moment";

import { Dictionary, Util } from "_utils";
import { PrimaryButton } from "_molecules";
import { Mixins, SharedStyle, FormStyle, Colors, Typography } from "_styles";
import { SubHeader, ScrollView, TouchItem, ProgressBar } from "_atoms";
import { MainHeader, AuthorizeTransaction } from "_organisms";

import { Network } from "_services";
import { account_type_data } from "../../../src/data";
import { ResponseCodes } from "_utils";
import { addNotification } from "_actions/notification_actions";
import { showToast } from "_actions/toast_actions";
import { randomId } from "../../utils/util";

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
    const { navigation, onCloseModal } = this.props;

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
        const {
          BankVerificationNumber,
          DestinationInstitutionCode,
          SessionID,
          ChannelCode,
          KYCLevel,
          amount,
          account_number,
          account_name,
          narration,
        } = this.props.transfers.funds_transfer;

        const account_type = this.props.transfers.account_type,
          touch_gold = account_type_data.ACCOUNT_TYPE.TOUCH_GOLD;
        let payload;

        if (account_type == touch_gold) {
          payload = {
            fromAccountId: this.props.user.wallet_id,
            fromNuban: this.props.user.user_data.nuban,
            toAccountId: account_number,
            amount: amount,
            notes: narration,
            pin,
          };
        } else {
          payload = {
            BankCode: "999333",
            NameEnquiryRef: SessionID,
            DestinationInstitutionCode: DestinationInstitutionCode,
            ChannelCode,
            BeneficiaryAccountName: account_name,
            BeneficiaryAccountNumber: account_number,
            BeneficiaryBankVerificationNumber: BankVerificationNumber,
            BeneficiaryKYCLevel: KYCLevel || "1",
            OriginatorAccountName:
              this.props.user.user_data.firstName +
              " " +
              this.props.user.user_data.lastName,
            OriginatorAccountNumber: this.props.user.user_data.nuban,
            OriginatorBankVerificationNumber: this.props.user.user_data.bvn,
            OriginatorKYCLevel: 1,
            TransactionLocation: "6.4300747,3.4110715",
            Amount: amount,
            Narration: narration,
            pin,
            account_id: this.props.user.wallet_id,
          };
        }

        Network.validatePIN(pin)
          .then(() => {
            const apiCall =
              account_type == account_type_data.ACCOUNT_TYPE.OTHERS
                ? Network.doTransfer
                : Network.doTransferIntra;
            apiCall(payload)
              .then((result) => {
                console.log({ result });

                this.setState({
                  processing: false,
                  auth_screen_visible: false,
                });

                if (result.resp.code == ResponseCodes.SUCCESS_CODE) {
                  onCloseModal();
                  result.account_type = this.props.transfers.account_type;

                  if (
                    this.props.transfers.account_type ==
                    account_type_data.ACCOUNT_TYPE.OTHERS
                  ) {
                    navigation.navigate("TransferSuccess", {
                      event_name: "transactions_successful_transfer",
                      event_data: {
                        transaction_id: result.referenceNumber,
                        amount,
                      },

                      success_message: result.resp.message,
                      transaction_data: {
                        ...payload,
                        referenceNumber: result.referenceNumber,
                      },
                      transaction_payload: {
                        ...payload,
                        referenceNumber: result.referenceNumber,
                      },
                    });
                  } else {
                    navigation.navigate("Success", {
                      event_name: "transactions_successful_transfer",
                      event_data: {
                        transaction_id: result.referenceNumber,
                        amount,
                      },
                      success_message: result.resp.message,
                      transaction_data: {
                        ...(result.intraDepositResp || result.transferData),
                        referenceNumber: result.referenceNumber,
                      },
                      transaction_payload: {
                        ...payload,
                        referenceNumber: result.referenceNumber,
                      },
                    });
                  }

                  this.props.addNotification({
                    id: randomId(),
                    is_read: false,
                    title: "Transfer Debit",
                    description: `You just sent NGN${amount} to ${account_number} for ${narration}.`,
                    timestamp: moment().toString(),
                  });
                } else {
                  onCloseModal();
                  navigation.navigate("Error", {
                    event_name: "transactions_failed_transfer",
                    error_message:
                      error.message ?? "Transfer is not successfull,Try again.",
                  });
                }
              })
              .catch((error) => {
                if (
                  error.message &&
                  error.message.toLowerCase().includes("pin")
                ) {
                  this.setState({
                    processing: false,
                    pin_error: error.message || "Pin is incorrect",
                  });
                } else {
                  this.setState(
                    {
                      processing: false,
                      auth_screen_visible: false,
                    },
                    () => {
                      navigation.navigate("Error", {
                        event_name: "transactions_failed_transfer",
                        error_message:
                          error.message ??
                          "Transfer is not successfull,Try again.",
                      });
                    }
                  );
                }
              });
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
    const {
      amount,
      account_number,
      account_name,
      bank,
      narration,
      fees,
      bank_logo,
    } = this.props.transfers.funds_transfer;

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
                ₦{Util.formatAmount(amount)}
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
                  {this.props.transfers.account_type ===
                    account_type_data.ACCOUNT_TYPE.TOUCH_GOLD && (
                    <Image
                      style={styles.image}
                      source={require("../../assets/images/transfers/icon.png")}
                    />
                  )}

                  {this.props.transfers.account_type ===
                    account_type_data.ACCOUNT_TYPE.OTHERS && (
                    <Image
                      style={styles.image}
                      source={{
                        uri:
                          bank_logo ??
                          "https://nigerianbanks.xyz/logo/default-image.png",
                      }}
                    />
                  )}
                  <Text
                    numberOfLines={1}
                    style={[styles.normalText, SharedStyle.value]}
                  >
                    {bank?.label ?? bank}
                  </Text>
                </View>
              </View>

              <View style={[SharedStyle.row, styles.divider]}>
                <Text numberOfLines={1} style={styles.subtitle}>
                  {Dictionary.NARRATION}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.normalText, SharedStyle.value]}
                >
                  {narration || "- - - "}
                </Text>
              </View>

              <View style={SharedStyle.row}>
                <Text numberOfLines={1} style={styles.subtitle}>
                  {Dictionary.TRANSACTION_FEE}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.normalText, SharedStyle.value]}
                >
                  ₦{Util.formatAmount(fees)}
                </Text>
              </View>
            </View>

            <View style={{ ...Mixins.padding(25, 0, 0, 0) }}>
              <PrimaryButton
                title={"Pay"}
                icon="arrow-right"
                leftIcon="bank"
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
