import React, { Component } from "react";
import { BackHandler, StyleSheet, View, Text, Image } from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import moment, { isMoment } from "moment";
import * as Icon from "@expo/vector-icons";

import { showToast } from "_actions/toast_actions";
import {
  getUserSavings,
  updateSavingsArchivedStatus,
} from "_actions/savings_actions";

import { Network } from "_services";
import { Dictionary, Util } from "_utils";
import { Colors, Mixins, SharedStyle, Typography } from "_styles";
import { ScrollView, TouchItem } from "_atoms";
import { ArchiveSavingsWarning } from "_molecules";
import { MainHeader, SavingsSummary } from "_organisms";

class SavingsDetail extends Component {
  constructor(props) {
    super(props);

    const savings = this.props.navigation.getParam("savings", {});
    this.state = {
      savings,
      archive_warning_visible: false,
      archiving: false,
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
      !this.state.processing && this.props.navigation.goBack();

      return true;
    }
  };

  toggleArchiveSavings = () => {
    const { savings } = this.state;

    this.setState(
      {
        archive_warning_visible: false,
        archiving: true,
      },
      () => {
        const payload = savings.archived
          ? {
              accountNumber: savings.id,
              status: "R",
            }
          : {
              accountNumber: savings.id,
              status: "A",
            };
        Network.archiveSavingsPlan(payload)
          .then(() => {
            this.setState(
              {
                archiving: false,
              },
              () => {
                this.props.updateSavingsArchivedStatus(
                  savings.id,
                  !savings.archived
                );
                // this.props.getUserSavings();
              }
            );
          })
          .catch((error) => {
            this.setState(
              {
                archiving: false,
              },
              () => this.props.showToast(error.message)
            );
          });
      }
    );
  };

  render() {
    let { savings, archiving } = this.state;
    // Double Tap
    savings = this.props.savings.user_savings.find((s) => s.id === savings.id);

    const status_code =
      savings.is_matured === 1
        ? "matured"
        : savings.status === 2
        ? "onHold"
        : savings.status === 1
        ? "active"
        : "onHold";
    const status_name =
      savings.is_matured === 1
        ? "Matured"
        : savings.status === 2
        ? "In arrears"
        : savings.status === 1
        ? "Active"
        : "";
    const disable_actions =
      (savings.is_matured !== 1 && savings.locked) || savings.archived;

    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={savings.name}
        />
        <ScrollView {...this.props}>
          <View style={styles.topContainer}>
            <TouchItem
              style={styles.historyButton}
              onPress={() =>
                this.props.navigation.navigate("SavingsTransactions", {
                  savings,
                })
              }
            >
              <Text style={styles.historyButtonText}>
                {Dictionary.SAVINGS_HISTORY_BTN}
              </Text>
            </TouchItem>
            <SavingsSummary
              containerStyle={{ marginTop: Mixins.scaleSize(0) }}
              savings={savings}
              onArchive={() => {
                this.setState({ archive_warning_visible: true });
              }}
              archiving={archiving}
            />
            <View style={styles.actionPanel}>
              <TouchItem
                style={[
                  styles.actionButton,
                  // (!savings.data_sources?.pecunia || savings.is_fixed || savings.archived) ? styles.disabled : {}
                  savings.is_fixed || savings.archived ? styles.disabled : {},
                ]}
                onPress={() =>
                  this.props.navigation.navigate("SavingsTopUp", { savings })
                }
                //    disabled={!savings.data_sources?.pecunia || savings.is_fixed || savings.archived}>
                disabled={savings.is_fixed || savings.archived}
              >
                <Image
                  style={styles.actionButtonIcon}
                  source={require("../../assets/images/savings/top_up_savings.png")}
                />
                <Text style={[SharedStyle.normalText, styles.actionButtonText]}>
                  {Dictionary.TOP_UP}
                </Text>
              </TouchItem>
              <TouchItem
                style={[
                  styles.actionButton,
                  disable_actions ? styles.disabled : {},
                ]}
                onPress={() =>
                  this.props.navigation.navigate("SavingsWithdrawal", {
                    savings,
                  })
                }
                disabled={disable_actions}
              >
                <Image
                  style={styles.actionButtonIcon}
                  source={require("../../assets/images/savings/withdraw_savings.png")}
                />
                <Text style={[SharedStyle.normalText, styles.actionButtonText]}>
                  {Dictionary.WITHDRAW}
                </Text>
              </TouchItem>
              <TouchItem
                style={[
                  styles.actionButton,
                  !savings.data_sources?.pecunia ||
                  !savings.is_matured ||
                  disable_actions
                    ? styles.disabled
                    : {},
                ]}
                onPress={() =>
                  this.props.navigation.navigate("RolloverSavings", { savings })
                }
                disabled={
                  !savings.data_sources?.pecunia ||
                  !savings.is_matured ||
                  disable_actions
                }
              >
                <Image
                  style={styles.actionButtonIcon}
                  source={require("../../assets/images/savings/rollover_savings.png")}
                />
                <Text style={[SharedStyle.normalText, styles.actionButtonText]}>
                  {Dictionary.ROLLOVER}
                </Text>
              </TouchItem>
            </View>
          </View>
          <View style={styles.bottomContainer}>
            <View style={styles.row}>
              <View style={SharedStyle.halfColumn}>
                <Text
                  numberOfLines={1}
                  style={[SharedStyle.normalText, SharedStyle.label]}
                >
                  {Dictionary.NAME}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[SharedStyle.normalText, SharedStyle.value]}
                >
                  {savings.name}
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
                  {Dictionary.PERIODIC_AMOUNT}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    SharedStyle.normalText,
                    SharedStyle.value,
                    SharedStyle.right,
                  ]}
                >
                  ₦{Util.formatAmount(savings.depositAmount)}
                </Text>
              </View>
            </View>
            {
              // !!savings.target && !!savings.frequency && (
              !!savings.frequency && (
                <View style={styles.row}>
                  <View style={SharedStyle.halfColumn}>
                    <Text
                      numberOfLines={1}
                      style={[SharedStyle.normalText, SharedStyle.label]}
                    >
                      {Dictionary.TARGET}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[SharedStyle.normalText, SharedStyle.value]}
                    >
                      ₦{Util.formatAmount(savings.target)}
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
                      numberOfLines={1}
                      style={[
                        SharedStyle.normalText,
                        SharedStyle.value,
                        SharedStyle.right,
                      ]}
                    >
                      {savings.frequency || "- - -"}
                    </Text>
                  </View>
                </View>
              )
            }
            <View style={styles.row}>
              <View style={SharedStyle.halfColumn}>
                <Text
                  numberOfLines={1}
                  style={[SharedStyle.normalText, SharedStyle.label]}
                >
                  {Dictionary.TENOR}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[SharedStyle.normalText, SharedStyle.value]}
                >
                  {savings.tenor_period}
                </Text>
              </View>
              <View style={SharedStyle.halfColumn}>
                <Text
                  numberOfLines={1}
                  style={[
                    SharedStyle.normalText,
                    SharedStyle.label,
                    SharedStyle.right,
                    { textTransform: "capitalize" },
                  ]}
                >
                  {Dictionary.INTEREST_RATE}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    SharedStyle.normalText,
                    SharedStyle.value,
                    SharedStyle.right,
                    { textTransform: "none" },
                  ]}
                >
                  {savings.interest_rate}% {Dictionary.PER_ANNUM}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={SharedStyle.halfColumn}>
                <Text
                  numberOfLines={1}
                  style={[SharedStyle.normalText, SharedStyle.label]}
                >
                  {Dictionary.MATURITY_INTEREST}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[SharedStyle.normalText, SharedStyle.value]}
                >
                  ₦{Util.formatAmount(savings.interest_due_at_maturity)}
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
                  {Dictionary.ACCRUED_INTEREST}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    SharedStyle.normalText,
                    SharedStyle.value,
                    SharedStyle.right,
                  ]}
                >
                  ₦{Util.formatAmount(savings.accrued_interest)}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={SharedStyle.halfColumn}>
                <Text
                  numberOfLines={1}
                  style={[SharedStyle.normalText, SharedStyle.label]}
                >
                  {Dictionary._WITHOLDING_TAX}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[SharedStyle.normalText, SharedStyle.value]}
                >
                  {savings.witholding_tax}
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
                  {Dictionary.MATURITY_AMOUNT}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    SharedStyle.normalText,
                    SharedStyle.value,
                    SharedStyle.right,
                  ]}
                >
                  ₦{Util.formatAmount(savings.amount_at_maturity)}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={SharedStyle.halfColumn}>
                <Text
                  numberOfLines={1}
                  style={[SharedStyle.normalText, SharedStyle.label]}
                >
                  {Dictionary.START_DATE}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[SharedStyle.normalText, SharedStyle.value]}
                >
                  {isMoment(moment(savings.start_date))
                    ? moment(savings.start_date).format("D MMM, YYYY")
                    : "- - -"}
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
                  numberOfLines={1}
                  style={[
                    SharedStyle.normalText,
                    SharedStyle.value,
                    SharedStyle.right,
                  ]}
                >
                  {isMoment(moment(savings.end_date))
                    ? moment(savings.end_date).format("D MMM, YYYY")
                    : "- - -"}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={SharedStyle.halfColumn}>
                <Text
                  numberOfLines={1}
                  style={[SharedStyle.normalText, SharedStyle.label]}
                >
                  {Dictionary.MATURITY_DATE}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[SharedStyle.normalText, SharedStyle.value]}
                >
                  {isMoment(moment(savings.end_date))
                    ? moment(savings.end_date).format("D MMM, YYYY")
                    : "- - -"}
                </Text>
              </View>
              {!!savings.card && (
                <View style={SharedStyle.halfColumn}>
                  <Text
                    numberOfLines={1}
                    style={[
                      SharedStyle.normalText,
                      SharedStyle.label,
                      SharedStyle.right,
                    ]}
                  >
                    {Dictionary.DEBIT_CARD}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      SharedStyle.normalText,
                      SharedStyle.value,
                      SharedStyle.right,
                    ]}
                  >
                    {`${savings.card.card_type.trim() || ""} **** ${
                      savings.card.card_last4 || ""
                    }`}
                  </Text>
                </View>
              )}

              <View style={SharedStyle.halfColumn}>
                <Text
                  numberOfLines={1}
                  style={[
                    SharedStyle.normalText,
                    SharedStyle.label,
                    SharedStyle.right,
                  ]}
                >
                  {Dictionary.SAVINGS_MODE}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    SharedStyle.normalText,
                    SharedStyle.value,
                    SharedStyle.right,
                  ]}
                >
                  {" "}
                  {savings.isCollectionAuto
                    ? Dictionary.AUTOMATIC
                    : Dictionary.MANUAL}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={SharedStyle.fullColumn}>
                <Text
                  numberOfLines={1}
                  style={[SharedStyle.normalText, SharedStyle.label]}
                >
                  {Dictionary.STATUS_LABEL}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    SharedStyle.normalText,
                    SharedStyle.value,
                    styles.status,
                    styles[`${status_code}Status`],
                  ]}
                >
                  {status_name}
                </Text>
              </View>
            </View>
            {savings.data_sources?.pecunia &&
              !savings.is_fixed &&
              !savings.is_matured &&
              !savings.archived && (
                <TouchItem
                  style={styles.editButton}
                  onPress={() => {
                    this.props.navigation.navigate("EditSavingsPlan", {
                      savings,
                    });
                    Util.logEventData("investment_edit", {
                      savings_id: savings.id,
                    });
                  }}
                >
                  <Icon.Feather
                    size={Mixins.scaleSize(18)}
                    style={styles.editButtonIcon}
                    name="edit"
                  />
                  <Text style={[SharedStyle.normalText, styles.editButtonText]}>
                    {Dictionary.EDIT_PLAN_BTN}
                  </Text>
                </TouchItem>
              )}
          </View>
        </ScrollView>
        {this.state.archive_warning_visible && (
          <ArchiveSavingsWarning
            isVisible={this.state.archive_warning_visible}
            isRestore={savings.archived}
            onAgree={this.toggleArchiveSavings}
            onDisagree={() => {
              this.setState({ archive_warning_visible: false });
            }}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  topContainer: {
    backgroundColor: Colors.WHITE_FADE,
    elevation: 3,
  },
  historyButton: {
    ...Mixins.padding(8),
    ...Mixins.margin(8),
    alignSelf: "flex-start",
  },
  historyButtonText: {
    ...SharedStyle.normalText,
    color: Colors.CV_BLUE,
    textDecorationLine: "underline",
  },
  actionPanel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButton: {
    ...Mixins.padding(20, 15, 20, 15),
    flexDirection: "row",
    alignItems: "center",
    width: "33.333%",
  },
  actionButtonIcon: {
    width: Mixins.scaleSize(30),
    height: Mixins.scaleSize(30),
    marginRight: Mixins.scaleSize(5),
  },
  actionButtonText: {
    color: Colors.CV_BLUE,
  },
  disabled: {
    opacity: 0.4,
  },
  bottomContainer: {
    ...Mixins.margin(16),
  },
  row: {
    ...SharedStyle.row,
    paddingVertical: Mixins.scaleSize(16),
    marginBottom: 0,
    borderColor: Colors.FAINT_BORDER,
    borderBottomWidth: Mixins.scaleSize(1),
  },
  status: {
    ...Mixins.padding(5, 10, 5, 10),
    alignSelf: "flex-start",
    borderRadius: Mixins.scaleSize(3),
  },
  activeStatus: {
    backgroundColor: Colors.SUCCESS_BG,
    color: Colors.SUCCESS,
  },
  onHoldStatus: {
    backgroundColor: Colors.LIGHTER_ORANGE_BG,
    color: Colors.CV_YELLOW,
  },
  maturedStatus: {
    backgroundColor: Colors.LIGHT_PURPLE_BG,
    color: Colors.LIGHT_PURPLE,
  },
  editButton: {
    paddingVertical: Mixins.scaleSize(16),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  editButtonIcon: {
    color: Colors.CV_YELLOW,
    marginRight: Mixins.scaleSize(10),
  },
  editButtonText: {
    ...Typography.FONT_MEDIUM,
    color: Colors.CV_YELLOW,
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    savings: state.savings,
  };
};

const mapDispatchToProps = {
  showToast,
  getUserSavings,
  updateSavingsArchivedStatus,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(SavingsDetail));
