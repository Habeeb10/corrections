import React, { Component } from "react";
import {
  BackHandler,
  StyleSheet,
  ActivityIndicator,
  Text,
  View,
} from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import * as Icon from "@expo/vector-icons";

import { showToast } from "_actions/toast_actions";
import {
  getUserSavings,
  getSavingsProducts,
  resetSavingsApplicationData,
  updateSavingsApplicationData,
} from "_actions/savings_actions";

import { Dictionary, Util } from "_utils";
import { Colors, Mixins, SharedStyle, Typography, FormStyle } from "_styles";
import { SubHeader, ScrollView, TouchItem } from "_atoms";
import { MainHeader, NewSavings, SavingsCard } from "_organisms";
import { PrimaryButton } from "_molecules";

class SelectDebitMethod extends Component {
  constructor(props) {
    super(props);

    this.state = {
      savings: [],
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    this.props.getSavingsProducts();
    if (this.props.savings.user_savings.length === 0) {
      this.props.getUserSavings(this.props.user.user_data.bvn);
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      this.props.navigation.goBack();

      return true;
    }
  };

  handleSelected = (savings) => {
    let updatedSavings = [...this.state.savings];

    if (this.state.savings.includes(savings)) {
      updatedSavings.splice(this.state.savings.indexOf(savings), 1);
    } else {
      updatedSavings.push(savings);
    }

    this.setState({ savings: updatedSavings });
  };

  render() {
    let { user_savings } = this.props.savings;
    const active_savings = user_savings.filter((savings) => {
      return !savings.archived;
    });

    let saved_total;
    let has_savings = user_savings.length > 0;
    if (has_savings) {
      saved_total = user_savings.reduce((sum, savings) => {
        return sum + Number(savings.balance);
      }, 0);
    }

    return (
      <View style={[SharedStyle.mainContainer]}>
        <TouchItem style={styles.leftIcon} onPress={this.handleBackButton}>
          <Icon.SimpleLineIcons
            size={Mixins.scaleSize(15)}
            style={{ color: "#090A0A" }}
            name={"arrow-left"}
          />
        </TouchItem>
        {this.props.loading_savings && (
          <View
            style={[
              SharedStyle.loaderContainer,
              { backgroundColor: "rgba(0,0,0,0.3)" },
            ]}
          >
            <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
          </View>
        )}
        {!this.props.loading_savings && (
          <ScrollView {...this.props}>
            {/* {!has_savings && (
                            <View>
                                <SubHeader text={Dictionary.CHOOSE_SAVINGS_PLAN} />
                                <NewSavings onSelectOffer={this.handleAddSavingsPlan} />
                            </View>
                        )} */}
            <View style={{ paddingTop: 20, paddingLeft: 20 }}>
              <Text style={styles.headerText}>Select Debit Method</Text>
            </View>
            {has_savings && (
              <View>
                <View style={styles.savingsCards}>
                  {active_savings.length === 0 && (
                    <View style={styles.noData}>
                      <Text style={styles.noDataText}>
                        {Dictionary.NO_ACTIVE_SAVINGS}
                      </Text>
                    </View>
                  )}
                  {active_savings.map((savings, index) => {
                    return (
                      <SavingsCard
                        key={index}
                        savings={savings}
                        addDebit={true}
                        selected={this.state.savings.includes(savings)}
                        onPress={() => this.handleSelected(savings)}
                      />
                    );
                  })}
                </View>
              </View>
            )}
            <View style={SharedStyle.bottomPanel}>
              <View style={FormStyle.formButton}>
                <PrimaryButton
                  title={"Save"}
                  icon="arrow-right"
                  //onPress={this.handleSubmit}
                />
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  savingsSummary: {
    ...Mixins.padding(32, 16, 28, 16),
    height: Mixins.scaleSize(200),
  },
  totalSavingsLabel: {
    ...SharedStyle.normalText,
    color: Colors.WHITE,
    marginBottom: Mixins.scaleSize(12),
  },
  totalSavingsValue: {
    ...Typography.FONT_BOLD,
    fontSize: Mixins.scaleFont(28),
    lineHeight: Mixins.scaleSize(33),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.WHITE,
    marginBottom: Mixins.scaleSize(40),
  },
  archivedSavings: {
    ...Mixins.padding(12, 22, 12, 22),
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    borderColor: Colors.WHITE,
    borderWidth: Mixins.scaleSize(1),
    borderRadius: Mixins.scaleSize(4),
  },
  archivedSavingsText: {
    ...SharedStyle.normalText,
    color: Colors.WHITE,
    marginLeft: Mixins.scaleSize(10),
  },
  savingsCards: {
    ...Mixins.padding(24, 8, 24, 8),
    flexDirection: "row",
    flexWrap: "wrap",
  },
  floatingButton: {
    width: Mixins.scaleSize(50),
    height: Mixins.scaleSize(50),
    marginBottom: Mixins.scaleSize(20),
    backgroundColor: Colors.CV_BLUE,
    borderRadius: Mixins.scaleSize(50),
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: Mixins.scaleSize(16),
    bottom: Mixins.scaleSize(0),
    elevation: 3,
  },
  floatingButtonIcon: {
    color: Colors.WHITE,
  },
  noData: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  noDataText: {
    ...Typography.normalText,
    opacity: 0.8,
  },
  headerText: {
    fontSize: 20,
    color: Colors.CV_BLUE,
    paddingBottom: 8,
    ...Typography.FONT_BOLD,
  },
  leftIcon: {
    ...Mixins.padding(16),
    marginRight: Mixins.scaleSize(32),
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    savings: state.savings,
    loading_savings:
      (state.savings.savings_products.length < 1 &&
        state.savings.loading_savings_products) ||
      state.savings.loading_user_savings,
  };
};

const mapDispatchToProps = {
  showToast,
  getUserSavings,
  getSavingsProducts,
  resetSavingsApplicationData,
  updateSavingsApplicationData,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(SelectDebitMethod));
