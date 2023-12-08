import React, { Component } from "react";
import { BackHandler, View, Text } from "react-native";
import { connect } from "react-redux";
import { withNavigationFocus } from "react-navigation";
import * as Icon from "@expo/vector-icons";
import moment from "moment";

import { Dictionary, Util } from "_utils";
import { Mixins, SharedStyle, FormStyle, Colors } from "_styles";
import { SubHeader, ScrollView, TouchItem, ProgressBar } from "_atoms";
import { PrimaryButton } from "_molecules";
import { MainHeader, AuthorizeTransaction } from "_organisms";

import { Network } from "_services";
import { account_type_data } from "../../../src/data";
import { ResponseCodes } from "_utils";
import { addNotification } from "_actions/notification_actions";
import { showToast } from "_actions/toast_actions";
import { randomId } from "../../utils/util";

class TransferSummary extends Component {
  constructor(props) {
    super(props);

    const {
      amount,
      account_number,
      account_name,
      beneficiary_id,
      save_beneficiary,
      bank,
      narration,
      fees,
      BankVerificationNumber,
      DestinationInstitutionCode,
      ChannelCode,
      KYCLevel,
      SessionID,
    } = this.props.transfers.funds_transfer;

    this.state = {
      ChannelCode,
      KYCLevel,
      SessionID,
      DestinationInstitutionCode,
      BankVerificationNumber,
      amount,
      account_number,
      account_name,
      beneficiary_id,
      save_beneficiary,
      bank,
      narration,
      fees,
      processing: false,
      auth_screen_visible: false,
      pin_error: "",
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
      if (!this.state.processing) {
        if (this.state.auth_screen_visible) {
          this.cancelTransactionAuthorization();
        } else {
          this.props.navigation.goBack();
        }
      }

      return true;
    }
  };

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
    if (!this.props.user.user_data.emailVerificationStatus) {
      this.setState({
        auth_screen_visible: false,
      });
      this.props.showToast(Dictionary.EMAIL_NOT_VERIFIED);

      this.props.navigation.navigate("EnterEmail");

      return;
    }
    if (!this.props.user.user_data.photoUrl) {
      this.setState({
        auth_screen_visible: false,
      });
      this.props.showToast(Dictionary.NO_PHOTO_URL);
      this.props.navigation.navigate("OnboardSelfie");
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
          beneficiary_id,
          save_beneficiary,
          bank,
          narration,
        } = this.state;
        let payload;
        if (
          this.props.transfers.account_type ==
          account_type_data.ACCOUNT_TYPE.TOUCH_GOLD
        ) {
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
            // OriginatorAccountNumber: this.props.user.wallet_id,
            OriginatorAccountNumber: this.props.user.user_data.nuban,
            OriginatorBankVerificationNumber: this.props.user.user_data.bvn,
            OriginatorKYCLevel: 1,
            TransactionLocation: "6.4300747,3.4110715",

            // PaymentReference: "1234",
            Amount: amount,
            Narration: narration,
            pin,
            account_id: this.props.user.wallet_id,
          };

          // if (beneficiary_id) {
          //     payload.beneficiary_id = beneficiary_id;
          // } else {
          //     payload.beneficiary = {
          //         account_number,
          //         account_name,
          //         bank_code: bank.value,
          //         save: save_beneficiary
          //     }
          // }
        }

        Network.validatePIN(pin)
          .then(() => {
            const apiCall =
              this.props.transfers.account_type ==
              account_type_data.ACCOUNT_TYPE.OTHERS
                ? Network.doTransfer
                : Network.doTransferIntra;
            apiCall(payload)
              .then((result) => {
                // console.log({ result });
                this.setState(
                  {
                    processing: false,
                    auth_screen_visible: false,
                  },
                  () => {
                    if (result.resp.code == ResponseCodes.SUCCESS_CODE) {
                      result.account_type = this.props.transfers.account_type;

                      if (
                        this.props.transfers.account_type ==
                        account_type_data.ACCOUNT_TYPE.OTHERS
                      ) {
                        this.props.navigation.navigate("TransferSuccess", {
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
                        this.props.navigation.navigate("Success", {
                          event_name: "transactions_successful_transfer",
                          event_data: {
                            transaction_id: result.referenceNumber,
                            amount,
                          },
                          success_message: result.resp.message,
                          transaction_data:
                            result.intraDepositResp || result.transferData,
                          transaction_payload: payload,
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
                      this.props.navigation.navigate("Error", {
                        event_name: "transactions_failed_transfer",
                        error_message:
                          error.message ??
                          "Transfer is not successfull,Try again.",
                      });
                    }
                  }
                );
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
                      this.props.navigation.navigate("Error", {
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
    const { amount, account_number, account_name, bank, narration, fees } =
      this.state;
    const total_fees = 0;
    // const total_fees = fees.reduce((sum, fee) => { return sum + Number(fee.fee) }, 0);
    const amount_due = Number(total_fees) + Number(amount);

    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.TRANSFERS}
        />
        <ScrollView {...this.props} hasButtomButtons={true}>
          <SubHeader text={Dictionary.PAYMENT_SUMMARY} />
          <ProgressBar progress={1.0} />
          <View style={FormStyle.formContainer}>
            <View style={SharedStyle.section}>
              <View style={SharedStyle.row}>
                <View style={SharedStyle.halfColumn}>
                  <Text
                    numberOfLines={1}
                    style={[SharedStyle.normalText, SharedStyle.label]}
                  >
                    {Dictionary.BENEFICIARY_NAME_LABEL}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[SharedStyle.normalText, SharedStyle.value]}
                  >
                    {account_name}
                  </Text>
                </View>
                <View style={SharedStyle.halfColumn}>
                  <Text
                    numberOfLines={1}
                    style={[
                      SharedStyle.normalText,
                      SharedStyle.label,
                      SharedStyle.right,
                    ]}
                  >
                    {Dictionary.BANK_LABEL}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      SharedStyle.normalText,
                      SharedStyle.right,
                      { color: Colors.DARK_GREY },
                    ]}
                  >
                    {bank?.label ?? bank}
                  </Text>
                </View>
              </View>
              <View style={SharedStyle.row}>
                <View style={SharedStyle.halfColumn}>
                  <Text
                    numberOfLines={1}
                    style={[SharedStyle.normalText, SharedStyle.label]}
                  >
                    {Dictionary.ACCOUNT_NUMBER_LABEL}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[SharedStyle.normalText, SharedStyle.value]}
                  >
                    {account_number}
                  </Text>
                </View>
                <View style={SharedStyle.halfColumn}>
                  <Text
                    numberOfLines={1}
                    style={[
                      SharedStyle.normalText,
                      SharedStyle.label,
                      SharedStyle.right,
                    ]}
                  >
                    {Dictionary.AMOUNT}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      SharedStyle.normalText,
                      SharedStyle.value,
                      SharedStyle.right,
                    ]}
                  >
                    ₦{Util.formatAmount(amount)}
                  </Text>
                </View>
              </View>
              {/* <View style={SharedStyle.row}>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.TRANSACTION_FEE}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>₦{Util.formatAmount(total_fees)}</Text>
                                </View>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.TOTAL_AMOUNT_DUE}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>₦{Util.formatAmount(amount_due)}</Text>
                                </View>
                            </View> */}
              <View style={SharedStyle.row}>
                <View style={SharedStyle.fullColumn}>
                  <Text
                    numberOfLines={1}
                    style={[SharedStyle.normalText, SharedStyle.label]}
                  >
                    {Dictionary.NARRATION}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[SharedStyle.normalText, SharedStyle.value]}
                  >
                    {narration || "- - - "}
                  </Text>
                </View>
              </View>
              <TouchItem
                style={SharedStyle.sectionButton}
                onPress={() => this.props.navigation.navigate("TransferAmount")}
              >
                <Icon.Feather
                  size={Mixins.scaleSize(18)}
                  style={SharedStyle.sectionButtonIcon}
                  name="edit"
                />
                <Text style={SharedStyle.sectionButtonText}>
                  {Dictionary.EDIT_BTN}
                </Text>
              </TouchItem>
            </View>
          </View>
          <View style={SharedStyle.bottomPanel}>
            <View style={FormStyle.formButton}>
              <PrimaryButton
                title={Dictionary.CONTINUE_BTN}
                icon="arrow-right"
                onPress={this.handleTransactionAuthorization}
              />
            </View>
          </View>
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
        </ScrollView>
      </View>
    );
  }
}

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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(TransferSummary));
