import React, { Component } from "react";
import {
  BackHandler,
  StyleSheet,
  ImageBackground,
  View,
  Text,
} from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import moment from "moment";

import { Network } from "_services";

import { getUserSavings } from "_actions/savings_actions";

import { Dictionary, Util } from "_utils";
import { Colors, Mixins, SharedStyle, FormStyle, Typography } from "_styles";
import { ScrollView } from "_atoms";
import { PrimaryButton } from "_molecules";
import { MainHeader, AuthorizeTransaction } from "_organisms";
import { addNotification } from "_actions/notification_actions";
import { randomId } from "../../utils/util";
import { createIconSetFromFontello } from "@expo/vector-icons";

class SavingsSummary extends Component {
  constructor(props) {
    super(props);

    const payment_method = this.props.navigation.getParam("payment_method");
    const {
      amount,
      target,
      preferred_offer,
      savings_product,
      duration,
      plan_name,
      start_date,
      collection_mode,
      saving_frequency,
      breakdown,
      interestAtMaturity,
      end_date,
    } = this.props.savings.savings_application;

    this.state = {
      amount,
      target,
      breakdown,
      preferred_offer,
      savings_product,
      duration,
      end_date,
      plan_name,
      start_date,
      collection_mode,
      saving_frequency,
      payment_method,
      auth_screen_visible: false,
      pin_error: "",
      processing: false,
      interestAtMaturity,
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
    this.setState(
      {
        processing: true,
      },
      () => {
        Network.validatePIN(pin)
          .then(() => {
            let {
              amount,
              target,
              preferred_offer,
              savings_product,
              duration,
              plan_name,
              start_date,
              end_date,
              collection_mode,
              saving_frequency,
              payment_method,
              interestAtMaturity,
            } = this.state;

            let payload = {
              clientID: this.props.user.user_data.bvn,
              name: plan_name.trim(),
              productName: savings_product.name,
              depositAmount: amount,
              period: saving_frequency.name,
              target,
              interestRate: savings_product.interest_rate,
              isFixed: preferred_offer.isFixed,
              isLocked: preferred_offer.is_locked,
              productRangeCode: preferred_offer.productRangeCode,
              product_id: savings_product.id,
              offer_id: preferred_offer.id,
              frequency: saving_frequency.name,
              tenor_period: preferred_offer.tenor_period,
              interestAtMaturity,
              schedule: {
                scheduleStartDate: moment(start_date, "DD/MM/YYYY").format(
                  "YYYY-MM-DD"
                ),
                //   scheduleEndDate: "2022-09-17",
                scheduleEndDate: moment(end_date, "MM/DD/YYYY").format(
                  "YYYY-MM-DD"
                ),
              },
              //  start_date: moment(end_date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
            };

            if (collection_mode && collection_mode.name == "automated") {
              payload.isCollectionAuto = true;
            } else if (collection_mode && collection_mode.name == "manual") {
              payload.isCollectionAuto = false;
            } else {
              payload.isCollectionAuto = false;
            }
            if (saving_frequency) {
              payload.frequency_id = saving_frequency.id;
            }
            if (payment_method) {
              if (payment_method.payment_method_type === "card") {
                payload.cardId = payment_method.id;
                payload.channel = "card";
                // payload.channel = "wallet";
              } else {
                payload.walletAccount = payment_method.id;
                payload.channel = "wallet";
              }
            }
            console.log("payload", payload);

            Network.createSavingsPlan(payload)
              .then((result) => {
                this.setState(
                  {
                    processing: false,
                    auth_screen_visible: false,
                  },
                  () => {
                    this.props.getUserSavings(this.props.user.user_data.bvn);
                    this.props.navigation.navigate("Success", {
                      event_name: "investment_successful",
                      event_data: { amount },
                      success_message:
                        result.message ||
                        `Hurray! We have created your ${savings_product.name} plan. You can now start saving and earning interest.`,
                    });
                    this.props.addNotification({
                      id: randomId(),
                      is_read: false,
                      title: "Savings plan created",
                      description: `Hurray! We have created your ${savings_product.name} plan. You can now start saving and earning interest.`,
                      timestamp: moment().toString(),
                    });
                  }
                );
              })
              .catch((error) => {
                this.setState(
                  {
                    processing: false,
                    auth_screen_visible: false,
                  },
                  () => {
                    this.props.navigation.navigate("Error", {
                      error_message: error.message,
                    });
                  }
                );
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
    const {
      amount,
      target,
      preferred_offer,
      savings_product,
      duration,
      plan_name,
      start_date,
      collection_mode,
      saving_frequency,
    } = this.state;

    let starts_on = moment(start_date, "DD/MM/YYYY").format("D MMM, YYYY");
    let matures_on = moment(start_date, "DD/MM/YYYY")
      .add(duration, preferred_offer.tenor_period)
      .format("D MMM, YYYY");
    return (
      <ImageBackground
        style={[SharedStyle.container, styles.container]}
        imageStyle={{ height: "100%" }}
        source={require("../../assets/images/savings/savings_summary.png")}
        resizeMode={"contain"}
      >
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.NEW_SAVINGS}
        />
        <ScrollView {...this.props} hasButtomButtons={true}>
          <Text style={styles.subheader}>
            {Dictionary.SAVINGS_PLAN_SUMMARY}
          </Text>
          <View style={[SharedStyle.section, styles.section]}>
            <View style={SharedStyle.row}>
              <View style={SharedStyle.halfColumn}>
                <Text
                  numberOfLines={1}
                  style={[SharedStyle.normalText, SharedStyle.label]}
                >
                  {Dictionary.PLAN_NAME}
                </Text>
                <Text
                  numberOfLines={2}
                  style={[
                    SharedStyle.normalText,
                    SharedStyle.value,
                    { textTransform: "none" },
                  ]}
                >
                  {plan_name}
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
                  {Dictionary.PLAN_TYPE}
                </Text>
                <Text
                  numberOfLines={2}
                  style={[
                    SharedStyle.normalText,
                    SharedStyle.value,
                    SharedStyle.right,
                    { textTransform: "none" },
                  ]}
                >
                  {savings_product.name}
                </Text>
              </View>
            </View>
            <View style={SharedStyle.row}>
              <View style={SharedStyle.halfColumn}>
                <Text
                  numberOfLines={1}
                  style={[SharedStyle.normalText, SharedStyle.label]}
                >
                  {Dictionary.SAVINGS}
                </Text>
                <Text
                  numberOfLines={2}
                  style={[SharedStyle.normalText, SharedStyle.value]}
                >
                  ₦{Util.formatAmount(amount)}
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
                  {Dictionary.FREQUENCY}
                </Text>
                <Text
                  numberOfLines={2}
                  style={[
                    SharedStyle.normalText,
                    SharedStyle.value,
                    SharedStyle.right,
                  ]}
                >
                  {saving_frequency ? saving_frequency.name : "- - -"}
                </Text>
              </View>
            </View>
            <View style={SharedStyle.row}>
              <View style={SharedStyle.halfColumn}>
                <Text
                  numberOfLines={1}
                  style={[SharedStyle.normalText, SharedStyle.label]}
                >
                  {Dictionary.SAVINGS_TARGET}
                </Text>
                <Text
                  numberOfLines={2}
                  style={[SharedStyle.normalText, SharedStyle.value]}
                >
                  ₦{Util.formatAmount(target)}
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
                  {Dictionary.SAVINGS_TYPE}
                </Text>
                <Text
                  numberOfLines={2}
                  style={[
                    SharedStyle.normalText,
                    SharedStyle.value,
                    SharedStyle.right,
                  ]}
                >
                  {collection_mode.name}
                </Text>
              </View>
            </View>
            <View style={SharedStyle.row}>
              <View style={SharedStyle.halfColumn}>
                <Text
                  numberOfLines={1}
                  style={[SharedStyle.normalText, SharedStyle.label]}
                >
                  {Dictionary.START_BY}
                </Text>
                <Text
                  numberOfLines={2}
                  style={[SharedStyle.normalText, SharedStyle.value]}
                >
                  {starts_on}
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
                  {Dictionary.WITHDRAW_DATE}
                </Text>
                <Text
                  numberOfLines={2}
                  style={[
                    SharedStyle.normalText,
                    SharedStyle.value,
                    SharedStyle.right,
                  ]}
                >
                  {matures_on}
                </Text>
              </View>
            </View>
          </View>
          <View style={[SharedStyle.bottomPanel, styles.bottomPanel]}>
            <View style={FormStyle.formButton}>
              <PrimaryButton
                loading={this.state.processing}
                title={Dictionary.CREATE_PLAN_BTN}
                icon="arrow-right"
                onPress={this.handleTransactionAuthorization}
              />
            </View>
          </View>
        </ScrollView>
        {this.state.auth_screen_visible && (
          <AuthorizeTransaction
            title={Dictionary.NEW_SAVINGS}
            isVisible={this.state.auth_screen_visible}
            isProcessing={this.state.processing}
            pinError={this.state.pin_error}
            resetError={() => this.setState({ pin_error: "" })}
            onSubmit={this.handleSubmit}
            onCancel={this.cancelTransactionAuthorization}
          />
        )}
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.LIGHT_ASH_BG,
  },
  subheader: {
    ...Mixins.margin(32, 16, 32, 16),
    ...Typography.FONT_BOLD,
    fontSize: Mixins.scaleFont(22),
    lineHeight: Mixins.scaleSize(25),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.CV_BLUE,
    textAlign: "center",
  },
  section: {
    marginHorizontal: Mixins.scaleSize(16),
    backgroundColor: Colors.WHITE,
  },
  row: {
    marginBottom: Mixins.scaleSize(30),
  },
  bottomPanel: {
    backgroundColor: Colors.WHITE,
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    wallet: state.wallet,
    savings: state.savings,
  };
};

const mapDispatchToProps = {
  getUserSavings,
  addNotification,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(SavingsSummary));
