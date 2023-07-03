import React, { Component } from "react";
import { BackHandler, View, Text } from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";

import { showToast } from "_actions/toast_actions";
import { updateFundsTransfer } from "_actions/transfer_actions";

import { Dictionary } from "_utils";
import { SharedStyle, FormStyle } from "_styles";
import { SubHeader, FloatingLabelInput, ProgressBar } from "_atoms";
import { default as ScrollView } from "_atoms/scroll_view";
import { PrimaryButton } from "_molecules";
import { MainHeader } from "_organisms";

import { Network } from "_services";

class TransferNarration extends Component {
  state = {
    narration: "",
    narration_error: "",
    processing:false,
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

  handleSubmit = () => {
    if (!this.state.narration) {
      this.setState({
        narration_error: Dictionary.REQUIRED_FIELD
      });

      return;
    }

    this.setState({ processing: true }, () => {
      let { narration } = this.state;
      narration = narration.trim();
      const { amount } = this.props.transfers.funds_transfer;
      this.props.updateFundsTransfer({ narration, fees: [] });
      this.props.navigation.navigate("TransferSummary");
      // Network.getCvTransactionFee('interbank', amount)
      //     .then((result) => {
      //         this.setState({ processing: false }, () => {
      //             let { narration } = this.state;
      //             narration = narration.trim();

      //             this.props.updateFundsTransfer({ narration, fees: result.data.fees });
      //             this.props.navigation.navigate('TransferSummary');
      //         });
      //     }).catch((error) => {
      //         this.setState({ processing: false }, () => {
      //             this.props.showToast(error.message)
      //         });
      //     });
    });
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
          <SubHeader text={Dictionary.TRANSFER_NARRATION_SUB_HEADER} />
          <ProgressBar progress={0.8} />
          <View style={FormStyle.formContainer}>
            <View style={FormStyle.formItem}>
              <FloatingLabelInput
                label={Dictionary.NARRATION_LABEL}
                value={this.state.narration}
                multiline={false}
                autoCorrect={false}
                onChangeText={(text) =>
                  this.setState({
                    narration: text,
                    narration_error: ""
                  })
                }
              />
              <Text style={FormStyle.formError}>
                {this.state.narration_error}
              </Text>
            </View>
          </View>
          <View style={SharedStyle.bottomPanel}>
            <View style={FormStyle.formButton}>
              <PrimaryButton
                title={Dictionary.CONTINUE_BTN}
                loading={this.state.processing}
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

const mapStateToProps = (state) => {
  return {
    user: state.user,
    transfers: state.transfers
  };
};

const mapDispatchToProps = {
  showToast,
  updateFundsTransfer
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(TransferNarration));
