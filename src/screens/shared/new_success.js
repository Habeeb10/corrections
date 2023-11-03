import React, { Component } from "react";
import { BackHandler, StyleSheet, View, Text, Image } from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";

import { showToast } from "_actions/toast_actions";
import { getUserWallet } from "_actions/wallet_actions";
import { getTransferBeneficiaries } from "_actions/transfer_actions";
import { getUserProfile } from "_actions/user_actions";
import { Dictionary, Util } from "_utils";
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from "_styles";
import { ScrollView } from "_atoms";
import { PrimaryButton, SecondaryButton } from "_molecules";
import { Network } from "_services";
import { account_type_data } from "../../data";
import TransactionReceipt from "./transaction_receipt";

class Success extends Component {
  constructor(props) {
    super(props);

    const navigation = this.props.navigation;
    const success_message = navigation.getParam(
      "success_message",
      Dictionary.GENERAL_SUCCESS
    );
    const transaction_data = navigation.getParam("transaction_data");
    const transaction_payload = navigation.getParam("transaction_payload");
    const event_name = navigation.getParam("event_name");
    const event_data = navigation.getParam("event_data");

    this.state = {
      success_message,
      transaction_data,
      transaction_payload,
      event_name,
      event_data,
      processingBeneficiary: false,
      receipt_modal_visible: false,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    //this.props.getUserProfile();
    this.props.getUserWallet(this.props.user.wallet_id);
    const { event_name, event_data } = this.state;
    if (event_name) {
      Util.logEventData(event_name, event_data);
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      this.props.navigation.navigate("Dashboard");

      return true;
    }
  };

  handleShowReceipt = () => {
    // this.props.navigation.navigate("Receipt", {
    //   transaction_payload: this.state.transaction_payload,
    //   transaction_data: this.state.transaction_data,
    // });
    this.setState({ receipt_modal_visible: true });
  };

  handleSaveBeneficiary = () => {
    const {
      BankVerificationNumber,
      account_number,
      account_name,
      bankCode,
      bank,
    } = this.props.transfers.funds_transfer;

    let payload = {
      clientId: this.props.user.user_data.bvn,
      name: account_name,
      bank:
        this.props.transfers.account_type ==
        account_type_data.ACCOUNT_TYPE.TOUCH_GOLD
          ? Dictionary.TOUCHGOLD_BANK
          : this.props.transfers.funds_transfer?.bank?.label,
      accountNumber: account_number,
      beneficiaryBvn: BankVerificationNumber,
      bankCode: bankCode,
    };

    if (
      this.props.transfers.account_type == account_type_data.ACCOUNT_TYPE.OTHERS
    ) {
      payload.bankCode = bank.value;
    }

    this.setState({ processingBeneficiary: true }, () => {
      Network.addTransferBeneficiary(payload)
        .then(() => {
          this.setState({ processingBeneficiary: false }, () => {
            this.props.getTransferBeneficiaries(this.props.user.user_data.bvn);
            this.props.navigation.navigate("Dashboard");
            this.props.showToast("Beneficiary added successfully", false);
          });
        })
        .catch((error) => {
          this.setState({ processingBeneficiary: false }, () => {
            this.props.showToast(
              error.message?.bankCode ?? "Cannot add beneficiary"
            );
          });
        });
    });
  };

  // refreshUserWallet = (id) => {
  //   this.props.getUserWallet(id);
  // };

  render() {
    const { transaction_data } = this.state;

    let amount = transaction_data.Amount || transaction_data.amount;
    let number =
      transaction_data.beneficiaryAccountNumber ??
      transaction_data.BeneficiaryAccountNumber;
    let name =
      transaction_data.beneficiaryAccountName ??
      transaction_data.BeneficiaryAccountName;
    let success_message = Dictionary.TRANSFER_PROCESSING;
    success_message = success_message
      .replace("%s", Util.formatAmount(amount))
      .replace("%s", number)
      .replace("%s", name);

    return (
      <View style={SharedStyle.mainContainer}>
        <ScrollView {...this.props} hasNavBar={false}>
          <LinearGradient
            style={styles.container}
            colors={["#FFF", "#FFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.content}>
              <Image
                style={styles.icon}
                source={require("../../assets/images/logo.png")}
              />

              <View style={styles.message}>
                <Image
                  style={{ resizeMode: "contain" }}
                  source={require("../../assets/images/shared/success.png")}
                />
              </View>
            </View>

            <View style={styles.buttonPanel}>
              <Text style={styles.messageHeader}>{Dictionary.THANK_YOU}</Text>
              <Text style={styles.messageDescription}>{success_message}</Text>
              <View style={styles.pane}>
                <>
                  <View style={styles.buttons}>
                    <View style={FormStyle.formButton}>
                      <PrimaryButton
                        title={Dictionary.SHARE_RECEIPT_BTN}
                        onPress={() => this.handleShowReceipt()}
                      />
                    </View>
                    <View style={FormStyle.formButton}>
                      <PrimaryButton
                        title={"Save beneficiary"}
                        onPress={() => this.handleSaveBeneficiary()}
                        loading={this.state.processingBeneficiary}
                      />
                    </View>
                  </View>
                  <View style={styles.buttons}>
                    <View style={FormStyle.formButton}>
                      <SecondaryButton
                        title={"Done"}
                        center
                        onPress={() => this.handleBackButton()}
                      />
                    </View>
                  </View>
                </>
              </View>
            </View>
          </LinearGradient>
        </ScrollView>

        <TransactionReceipt
          onCloseModal={() => this.setState({ receipt_modal_visible: false })}
          modal_visible={this.state.receipt_modal_visible}
          transaction_data={this.state.transaction_data}
          props={this.props}
          fromTransferPage
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    ...Mixins.padding(60, 20, 20, 20),
    alignSelf: "center",
  },
  icon: {
    width: Mixins.scaleSize(109),
    height: Mixins.scaleSize(36),
    resizeMode: "contain",
  },
  message: {
    alignSelf: "center",
    paddingTop: Mixins.scaleSize(70),
  },
  messageHeader: {
    ...Typography.FONT_MEDIUM,
    fontSize: Mixins.scaleFont(24),
    // lineHeight: Mixins.scaleSize(18),
    color: Colors.CV_BLUE,
    // marginTop: Mixins.scaleSize(27),
    marginBottom: Mixins.scaleSize(12),
  },
  messageDescription: {
    ...Typography.REGULAR,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(19),
    textAlign: "center",
    width: "70%",
    // letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.CV_BLUE,
  },
  buttonPanel: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // position: "absolute",
    // bottom: 0,
    // width: "100%",
  },
  pane: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    ...Mixins.padding(80, 20, 0, 20),
  },
  buttons: {
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 0,
    height: Mixins.scaleSize(70),
    // backgroundColor: Colors.WHITE,
  },
  buttonContainer: {
    ...Mixins.padding(80, 20, 0, 20),
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    documents: state.documents,
    transfers: state.transfers,
  };
};

const mapDispatchToProps = {
  getUserWallet,
  getUserProfile,
  showToast,
  getTransferBeneficiaries,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(Success));
