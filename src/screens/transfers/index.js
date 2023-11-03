import React, { Component } from "react";
import {
  BackHandler,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import * as Icon from "@expo/vector-icons";
import SwitchToggle from "@dooboo-ui/native-switch-toggle";

import { showToast } from "_actions/toast_actions";
import {
  updateFundsTransfer,
  updateAccountType,
  getCustomerBeneficiaries,
  getTransferBeneficiaries,
} from "_actions/transfer_actions";
import { getBankOptions } from "_actions/config_actions";
import { Dictionary, Util } from "_utils";
import { Mixins, SharedStyle, FormStyle, Colors, Typography } from "_styles";
import { SubHeader, FloatingLabelInput, TouchItem, ProgressBar } from "_atoms";
import { default as ScrollView } from "_atoms/scroll_view";
import { PrimaryButton } from "_molecules";
import { MainHeader, Dropdown, ActionSheet } from "_organisms";

import { Network } from "_services";
import { account_type_data, banks } from "../../../src/data";
import { ResponseCodes } from "_utils";
import Summary from "_screens/transfers/summary_modal";

class Transfers extends Component {
  constructor(props) {
    super(props);

    const { navigation } = this.props;
    const account_type = navigation.getParam("account_type") ?? "";
    const { beneficiary_id, BankVerificationNumber } =
      this.props.transfers.funds_transfer;

    this.state = {
      amount: "",
      amount_error: "",
      isIntra: true,
      commaValues: "",
      account_type,
      account_number: "",
      account_number_error: "",
      bank: "",
      bank_error: "",
      account_name: "",
      processing: false,
      processingBeneficiary: false,
      show_beneficiary_list: false,
      recent_transactions: this.props.transfers.recent_transfers,
      BankVerificationNumber,
      beneficiary_id,
      save_beneficiary: false,
      bankCode: "",
      narration: "",
      narration_error: "",
      verified: false,
      modal_visible: false,
      selected_beneficiary: false,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);

    if (this.props.config.banks.length === 0) {
      this.props.getBankOptions();
    }

    let isIntra = this.state.account_type === "TOUCH_GOLD" ? true : false;
    this.props.updateAccountType({ account_type: this.state.account_type });

    this.setState({ isIntra }, () =>
      this.props.getCustomerBeneficiaries(
        this.props.user.user_data.bvn,
        this.state.isIntra
      )
    );
  }

  componentDidUpdate(prevProps) {
    if (
      this.state.isIntra &&
      this.state.account_number.length === 10 &&
      !this.state.verified &&
      !this.state.selected_beneficiary
    ) {
      this.handleSubmitIntraBank();
    }

    if (
      !this.state.isIntra &&
      this.state.account_number.length === 10 &&
      !!this.state.bank &&
      !this.state.verified &&
      !this.state.selected_beneficiary
    ) {
      this.handleSubmitInterBank();
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      let working = this.props.config.loading_banks || this.state.processing;
      !working && this.props.navigation.navigate("Dashboard");

      return true;
    }
  };

  getDataFromBankConfig = () => {
    let options = this.props.config.banks.map((bank) => {
      return {
        label: bank.name,
        value: bank.additional_code,
        link_id: bank.link_id,
      };
    });

    return options;
  };

  getBankLogo = (value) => {
    let preferred = banks.data.find((option) => {
      return option.code === value;
    });

    return preferred?.logo;
  };

  getBeneficiaryOptions = () => {
    let options = this.props.transfers.beneficiaries.map((beneficiary) => {
      return {
        ...beneficiary,
        label: beneficiary.name,
        subtitle: beneficiary.account_number,
        imageUrl: beneficiary.url,
      };
    });

    return options;
  };

  handleSelectBeneficiary = () => {
    if (!this.state.processing) {
      this.setState({
        show_beneficiary_list: true,
      });
    }
  };

  assertSelectedBeneficiary = (beneficiary) => {
    let bankName = Dictionary.TOUCHGOLD_BANK;
    let {
      id: beneficiary_id,
      name: account_name,
      accountNumber: account_number,
      beneficiaryBvn,
      bankCode,
      bank,
    } = beneficiary;

    this.props.updateFundsTransfer({
      account_number,
      account_name,
      bank: {
        label: bank === "TouchGold Bank" ? bankName : bank,
        value: bankCode || "",
      },
      beneficiary_id,
      bankCode,
      BankVerificationNumber: beneficiaryBvn,
      ChannelCode: 1,
      DestinationInstitutionCode: bankCode,
    });
    this.setState({
      account_name,
      account_number,
      bank: {
        label: bank === "TouchGold Bank" ? bankName : bank,
        value: bankCode || "",
      },
      bankCode,
      selected_beneficiary: true,
    });
  };

  validate = () => {
    let is_valid = true;
    let amount = this.state.amount;

    if (!Util.isValidAmount(amount)) {
      this.setState({
        amount_error: Dictionary.ENTER_VALID_AMOUNT,
      });

      is_valid = false;
    }

    if (+amount > Number(this.props.wallet.wallet_balance)) {
      this.setState({
        amount_error: Dictionary.CANNOT_EXECEED_BALANCE,
      });

      is_valid = false;
    }

    if (!this.state.account_number || this.state.account_number.length != 10) {
      this.setState({
        account_number_error: Dictionary.ENTER_VALID_NUBAN,
      });

      is_valid = false;
    }

    if (
      this.state.account_type !== "TOUCH_GOLD" &&
      !this.state.selected_beneficiary &&
      !this.state.bank
    ) {
      this.setState({
        bank_error: Dictionary.REQUIRED_FIELD,
      });

      is_valid = false;
    }

    if (!this.state.narration) {
      this.setState({
        narration_error: Dictionary.REQUIRED_FIELD,
      });

      return;
    }

    if (!this.state.account_name) {
      this.props.showToast("Failed to verify account number");

      return;
    }

    return is_valid;
  };

  //   handleSubmit = () => {
  //   if (!this.validate()) {
  //     return;
  //   }

  //   let { amount } = this.state;

  //   this.props.getCustomerBeneficiaries(
  //     this.props.user.user_data.bvn,
  //     this.state.isIntra
  //   );
  //   this.props.updateFundsTransfer({ amount });

  //   this.props.navigation.navigate("TransferBeneficiary");
  //   Util.logEventData("transactions_start_transfer", { amount });
  //   };

  formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  handleOnchangeText = (text) => {
    // remove any commas from the current value
    const currentValue = text.replace(/,/g, "");

    const removeDecimals = currentValue.replace(/\D/g, "");

    // add commas every three digits
    const formattedValue = removeDecimals.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    this.setState({
      amount: text.replace(/\D/g, ""),
      amount_error: "",
      commaValues: formattedValue,
    });
  };

  updateAccountNumber = (text) => {
    this.setState({
      account_number: text.replace(/\D/g, ""),
      account_number_error: "",
      account_name: "",
      verified: false,
    });
  };

  onCloseModal = () => {
    this.setState({
      modal_visible: false,
    });
  };

  handleSubmitIntraBank = () => {
    let { account_number } = this.state;

    this.setState({ processingBeneficiary: true, verified: true }, () => {
      Network.doIntraBankNameEnquiry(account_number)
        .then((result) => {
          this.setState({ processingBeneficiary: false }, () => {
            if (result.resp.code != ResponseCodes.SUCCESS_CODE) {
              this.props.showToast(Dictionary.GENERAL_ERROR);
            } else {
              let account_name = Util.toTitleCase(result.name);
              this.props.updateFundsTransfer({
                account_number,
                account_name,
                bank: Dictionary.TOUCHGOLD_BANK,
                beneficiary_id: null,
                ChannelCode: result.ChannelCode || 1,
              });
              //   this.props.navigation.navigate("TransferConfirmBeneficiary", {
              //     bankCode: result.bankCode,
              //   });
              this.setState({
                bankCode: result.bankCode,
                account_name,
                beneficiary_id: null,
              });
            }
          });
        })
        .catch((error) => {
          this.setState({ processingBeneficiary: false }, () => {
            this.props.showToast(error.message || "Cannot perform enquiry");
          });
        });
    });
  };

  handleSubmitInterBank = () => {
    let { account_number, bank } = this.state;

    this.setState({ processingBeneficiary: true, verified: true }, () => {
      const payload = {
        DestinationInstitutionCode: bank?.value,
        ChannelCode: "1",
        AccountNumber: account_number,
      };
      Network.doNameEnquiry(payload)
        .then((result) => {
          this.setState({ processingBeneficiary: false }, () => {
            if (result.resp.code != ResponseCodes.SUCCESS_CODE) {
              this.props.showToast(Dictionary.GENERAL_ERROR);
            } else {
              let account_name = Util.toTitleCase(
                result.nameEnquiry.accountName
              );
              this.props.updateFundsTransfer({
                KYCLevel: result.nameEnquiry.kycLevel || 1,
                SessionID: result.nameEnquiry.sessionId,
                DestinationInstitutionCode: bank.value || "999998",
                account_number,
                account_name,
                bank,
                beneficiary_id: null,
                BankVerificationNumber: result.nameEnquiry.bvn || "",
                ChannelCode: payload.ChannelCode,
              });
              this.setState({
                bankCode: bank.value || "",
                account_name,
                beneficiary_id: null,
              });
            }
          });
        })
        .catch((error) => {
          this.setState({ processingBeneficiary: false }, () => {
            this.props.showToast(error.message || "Cannot perform enquiry");
          });
        });
    });
  };

  handleSubmit = () => {
    if (!this.validate()) {
      return;
    }

    let { amount } = this.state;

    this.props.updateFundsTransfer({
      save_beneficiary: this.state.save_beneficiary,
      amount,
      narration: this.state.narration,
      fees:
        this.state.account_type === "TOUCH_GOLD"
          ? "0"
          : Util.transactionFee(Number(amount)),
      bank_logo: this.getBankLogo(this.state.bankCode),
    });
    if (this.state.save_beneficiary) {
      this.setState({
        processing: true,
      });
      let payload = {
        clientId: this.props.user.user_data.bvn,
        name: this.props.transfers.funds_transfer.account_name,
        bank:
          this.props.transfers.account_type ==
          account_type_data.ACCOUNT_TYPE.TOUCH_GOLD
            ? Dictionary.TOUCHGOLD_BANK
            : this.props.transfers.funds_transfer.bank.label,
        accountNumber: this.props.transfers.funds_transfer.account_number,
        beneficiaryBvn: this.state.BankVerificationNumber,
        bankCode: this.state.bankCode,
      };
      if (
        this.props.transfers.account_type ==
        account_type_data.ACCOUNT_TYPE.OTHERS
      ) {
        payload.bankCode = this.props.transfers.funds_transfer.bank.value;
      }
      Network.addTransferBeneficiary(payload)
        .then((result) => {
          this.setState({ processing: false }, () => {
            this.props.getTransferBeneficiaries(this.props.user.user_data.bvn);

            this.setState({ modal_visible: true });
          });
        })
        .catch((error) => {
          this.setState({ processing: false }, () => {
            this.props.showToast(
              error.message?.bankCode ?? "Cannot add beneficiary"
            );
          });
        });
    } else {
      this.setState({ modal_visible: true });
    }
  };

  render() {
    let loading = this.props.config.loading_banks;
    let transfer_beneficiaries = this.props.transfers.beneficiaries;
    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={
            this.state.account_type === "TOUCH_GOLD"
              ? Dictionary.TOUCHGOLD_BANK
              : Dictionary.OTHER_BANK
          }
        />
        <ScrollView {...this.props} hasButtomButtons={true}>
          <SubHeader text={Dictionary.TRANSFER_AMOUNT_SUB_HEADER} />
          <View style={FormStyle.formContainer}>
            {loading && (
              <View style={SharedStyle.loaderContainer}>
                <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
              </View>
            )}

            {!loading && (
              <View>
                {this.props.transfers.account_type ==
                  account_type_data.ACCOUNT_TYPE.OTHERS && (
                  <View style={FormStyle.formItem}>
                    <Dropdown
                      options={this.getDataFromBankConfig()}
                      value={""}
                      title={Dictionary.BANK_LABEL}
                      onChange={(obj) => {
                        this.setState({
                          bank: obj,
                          bank_error: "",
                          account_name: "",
                        });
                      }}
                    >
                      <FloatingLabelInput
                        pointerEvents="none"
                        label={Dictionary.BANK_LABEL}
                        value={this.state.bank.label || ""}
                        multiline={false}
                        autoCorrect={false}
                        editable={false}
                      />
                    </Dropdown>
                    <Text style={FormStyle.formError}>
                      {this.state.bank_error}
                    </Text>
                  </View>
                )}

                <View
                  style={[
                    FormStyle.formItem,
                    // { paddingTop: Mixins.scaleSize(10) },
                  ]}
                >
                  <FloatingLabelInput
                    label={
                      this.props.transfers.account_type ==
                      account_type_data.ACCOUNT_TYPE.OTHERS
                        ? Dictionary.ACCOUNT_NUMBER_LABEL
                        : Dictionary.TOUCHGOLD_ACCOUNT_NUMBER_LABEL
                    }
                    value={this.state.account_number}
                    keyboardType={"number-pad"}
                    multiline={false}
                    autoCorrect={false}
                    onChangeText={this.updateAccountNumber}
                    editable={
                      !this.state.processing ||
                      !this.state.processingBeneficiary
                    }
                    enterAccount
                  />
                  <Text style={FormStyle.formError}>
                    {this.state.account_number_error}
                  </Text>
                </View>

                {transfer_beneficiaries.length > 0 && (
                  <View style={FormStyle.formItem}>
                    <View style={[FormStyle.formButton, styles.formButton]}>
                      <TouchItem
                        style={styles.beneficiaryButton}
                        onPress={this.handleSelectBeneficiary}
                        disabled={this.state.processing}
                      >
                        <Icon.SimpleLineIcons
                          size={Mixins.scaleSize(15)}
                          style={styles.buttonIcon}
                          name="user-follow"
                        />
                        <Text style={styles.buttonText}>
                          {Dictionary.SELECT_BENEFICIARY}
                        </Text>
                      </TouchItem>
                    </View>
                  </View>
                )}

                {this.state.processingBeneficiary && (
                  <View style={styles.loader}>
                    <ActivityIndicator size="small" color={Colors.CV_YELLOW} />
                    <Text style={styles.text}>Verifying account number</Text>
                  </View>
                )}

                {!!this.state.account_name && (
                  <View style={styles.beneficiary}>
                    <FloatingLabelInput
                      label={Dictionary.BENEFICIARY_NAME_LABEL}
                      value={this.state.account_name}
                      multiline={false}
                      autoCorrect={false}
                      editable={false}
                    />
                  </View>
                )}

                {!this.state.beneficiary_id && (
                  <View
                    style={[
                      FormStyle.formItem,
                      styles.saveBeneficiary,
                      { paddingBottom: Mixins.scaleSize(5) },
                    ]}
                  >
                    <SwitchToggle
                      containerStyle={FormStyle.switchContainer}
                      circleStyle={FormStyle.switchCircle}
                      switchOn={this.state.save_beneficiary}
                      onPress={() =>
                        this.setState({
                          save_beneficiary: !this.state.save_beneficiary,
                        })
                      }
                      backgroundColorOn={Colors.GREEN}
                      backgroundColorOff={Colors.LIGHT_GREY}
                      circleColorOff={Colors.WHITE}
                      circleColorOn={Colors.WHITE}
                      duration={50}
                    />
                    <Text style={styles.saveBeneficiaryLabel}>
                      {Dictionary.SAVE_BENEFICIARY_LABEL}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* {!!this.state.account_name && ( */}

            {!loading && (
              <View style={FormStyle.formItem}>
                <FloatingLabelInput
                  label={Dictionary.AMOUNT_LABEL}
                  value={this.state.commaValues}
                  keyboardType={"number-pad"}
                  transfer
                  multiline={false}
                  autoCorrect={false}
                  onChangeText={this.handleOnchangeText}
                />
                <Text style={FormStyle.formError}>
                  {this.state.amount_error}
                </Text>
                <Text style={SharedStyle.balanceLabel}>
                  {Dictionary.BALANCE}{" "}
                  <Text style={SharedStyle.balanceValue}>
                    ₦
                    {Util.formatAmount(
                      Number(this.props.wallet.wallet_balance)
                    )}
                  </Text>
                </Text>
              </View>
            )}

            {!loading && (
              <View style={FormStyle.formItem}>
                <FloatingLabelInput
                  label={Dictionary.NARRATION_LABEL}
                  value={this.state.narration}
                  multiline={false}
                  autoCorrect={false}
                  onChangeText={(text) =>
                    this.setState({
                      narration: text,
                      narration_error: "",
                    })
                  }
                />
                <Text style={FormStyle.formError}>
                  {this.state.narration_error}
                </Text>
              </View>
            )}
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

        <ActionSheet
          options={this.getBeneficiaryOptions()}
          title={Dictionary.SELECT_BENEFICIARY}
          show={this.state.show_beneficiary_list}
          onChange={(beneficiary) =>
            this.assertSelectedBeneficiary(beneficiary)
          }
          close={() =>
            this.setState({
              show_beneficiary_list: false,
            })
          }
        />

        <Summary
          modal_visible={this.state.modal_visible}
          onCloseModal={this.onCloseModal}
          navigation={this.props.navigation}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  formButton: {
    marginHorizontal: Mixins.scaleSize(0),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountypeContainerStyle: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  saveBeneficiary: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveBeneficiaryLabel: {
    ...Typography.FONT_REGULAR,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.LIGHT_GREY,
    marginLeft: Mixins.scaleSize(10),
  },
  loader: {
    display: "flex",
    flexDirection: "row",
    ...Mixins.padding(0, 0, 16, 0),
  },
  text: {
    ...Typography.FONT_REGULAR,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.CV_BLUE,
    marginLeft: Mixins.scaleSize(10),
  },
  beneficiaryButton: {
    paddingBottom: Mixins.scaleSize(10),
    flexDirection: "row",
    alignItems: "center",
  },
  buttonIcon: {
    marginRight: Mixins.scaleSize(10),
    color: Colors.CV_YELLOW,
  },
  buttonText: {
    ...Typography.FONT_MEDIUM,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.CV_YELLOW,
  },
  beneficiary: {
    marginBottom: Mixins.scaleSize(26),
    backgroundColor: Colors.LIGHT_BG,
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    wallet: state.wallet,
    transfers: state.transfers,
    config: state.config,
  };
};

const mapDispatchToProps = {
  updateFundsTransfer,
  updateAccountType,
  getCustomerBeneficiaries,
  getTransferBeneficiaries,
  getBankOptions,
  showToast,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(Transfers));
