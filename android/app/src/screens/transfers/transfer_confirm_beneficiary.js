import React, { Component } from "react";
import { BackHandler, StyleSheet, Text, View } from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import SwitchToggle from "@dooboo-ui/native-switch-toggle";
import { Network } from '_services';
import { updateFundsTransfer,getTransferBeneficiaries } from "_actions/transfer_actions";
import { showToast } from '_actions/toast_actions';



import { Dictionary ,ResponseCodes} from "_utils";
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from "_styles";
import { SubHeader, ScrollView, FloatingLabelInput, ProgressBar } from "_atoms";
import { MainHeader, Dropdown } from "_organisms";
import { PrimaryButton } from "_molecules";
import { account_type_data } from "../../../src/data";

class TransferConfirmBeneficiary extends Component {
  constructor(props) {
    super(props);

    const { account_number, account_name, bank, beneficiary_id,BankVerificationNumber } =
      this.props.transfers.funds_transfer;

      const { navigation } = this.props;
      const bankCode = navigation.getParam("bankCode") ?? "";
      
    this.state = {
      BankVerificationNumber,
      beneficiary_id,
      account_number,
      account_number_error: "",
      account_name,
      bank: this.getDropDownOption(bank.value),
      //  bank: this.getDropDownOption(bank.code),
      bank_error: "",
      save_beneficiary: false,
      processing: false,
      bankCode
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
      let working = this.props.config.loading_banks || this.state.processing;
      !working && this.props.navigation.goBack();

      return true;
    }
  };

  getDataFromBankConfig = () => {
    let options = this.props.config.banks.map((bank) => {
      return {
        label: bank.name,
        value: bank.additional_code
      };
    });

    return options;
  };

  getDropDownOption = (value) => {
    let options = this.getDataFromBankConfig();
    let preferred = options.filter((option) => {
      return option.value === value;
    });

    return preferred.length > 0 ? preferred[0] : "";
  };

  handleSubmit = () => {
    this.props.updateFundsTransfer({
      save_beneficiary: this.state.save_beneficiary
    });
    if (this.state.save_beneficiary) {
        this.setState({
            processing:true
        })
      let payload = {
        clientId:  this.props.user.user_data.bvn,
        name: this.props.transfers.funds_transfer.account_name,
        bank:this.props.transfers.account_type==account_type_data.ACCOUNT_TYPE.TOUCH_GOLD?Dictionary.TOUCHGOLD_BANK: this.props.transfers.funds_transfer.bank.label,
        accountNumber: this.props.transfers.funds_transfer.account_number,
        beneficiaryBvn:this.state.BankVerificationNumber,
        bankCode: this.state.bankCode
       
      };
      if(this.props.transfers.account_type==account_type_data.ACCOUNT_TYPE.OTHERS){
        payload.bankCode=this.props.transfers.funds_transfer.bank.value
      }
      Network.addTransferBeneficiary(payload)
        .then((result) => {
          this.setState({ processing: false }, () => {
            // if (result.resp.code != ResponseCodes.SUCCESS_CODE) {
            //   this.props.showToast(Dictionary.GENERAL_ERROR);
            // } else {
              this.props.getTransferBeneficiaries(this.props.user.user_data.bvn);
              
              this.props.navigation.navigate("TransferNarration");
           // }
          });
        })
        .catch((error) => {
          this.setState({ processing: false }, () => {
            this.props.showToast(error.message?.bankCode ?? "Cannot add beneficiary");
          });
        });
    }else{
        this.props.navigation.navigate("TransferNarration");

    }
  };

  render() {
    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.TRANSFERS}
        />
        <ScrollView {...this.props} hasButtomButtons={true}>
          <SubHeader
            text={Dictionary.TRANSFER_CONFIRM_BENEFICIARY_SUB_HEADER}
          />
          <ProgressBar progress={0.6} />
          <View style={FormStyle.formContainer}>
            <View style={FormStyle.formItem}>
              <FloatingLabelInput
                label={Dictionary.ACCOUNT_NUMBER_LABEL}
                value={this.state.account_number}
                keyboardType={"number-pad"}
                multiline={false}
                autoCorrect={false}
                // maxLength={10}
                onChangeText={(text) =>
                  this.setState({
                    account_number: text,
                    account_number_error: ""
                  })
                }
                editable={false}
              />
              <Text style={FormStyle.formError}>
                {this.state.account_number_error}
              </Text>
            </View>
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
                      bank_error: ""
                    });
                  }}
                  disabled={true}
                >
                  <FloatingLabelInput
                    label={Dictionary.BANK_LABEL}
                    value={this.state.bank.label || ""}
                    multiline={false}
                    autoCorrect={false}
                    editable={false}
                  />
                </Dropdown>
                <Text style={FormStyle.formError}>{this.state.bank_error}</Text>
              </View>
            )}
            <View style={FormStyle.formItem}>
              <FloatingLabelInput
                label={Dictionary.BENEFICIARY_NAME_LABEL}
                value={this.state.account_name}
                multiline={false}
                autoCorrect={false}
                editable={false}
              />
            </View>
            {!this.state.beneficiary_id && (
              <View style={[FormStyle.formItem, styles.saveBeneficiary]}>
                <SwitchToggle
                  containerStyle={FormStyle.switchContainer}
                  circleStyle={FormStyle.switchCircle}
                  switchOn={this.state.save_beneficiary}
                  onPress={() =>
                    this.setState({
                      save_beneficiary: !this.state.save_beneficiary
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

const styles = StyleSheet.create({
  formButton: {
    marginHorizontal: Mixins.scaleSize(0),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  saveBeneficiary: {
    flexDirection: "row",
    alignItems: "center"
  },
  saveBeneficiaryLabel: {
    ...Typography.FONT_REGULAR,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.LIGHT_GREY,
    marginLeft: Mixins.scaleSize(10)
  }
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    config: state.config,
    transfers: state.transfers
  };
};

const mapDispatchToProps = {
    showToast,
    getTransferBeneficiaries,
  updateFundsTransfer
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(TransferConfirmBeneficiary));
