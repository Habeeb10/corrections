import React, { Component } from "react";
import {
  BackHandler,
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
} from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import * as Icon from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { showToast } from "_actions/toast_actions";
import { getUserWallet } from "_actions/wallet_actions";
import { getUserCards, getUserAccounts } from "_actions/payment_actions";

import { Dictionary, Util } from "_utils";
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from "_styles";
import { TouchItem, ProgressBar, ScrollView as _ScrollView } from "_atoms";
import { PrimaryButton } from "_molecules";
import { MainHeader } from "_organisms";

import { Network } from "_services";

class PaymentMethods extends Component {
  state = {
    selected_payment_method: "",
    card: null,
    account: null,
    enable_wallet: false,
    enable_cards: false,
    enable_accounts: false,
    processing: false,
  };

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);

    const { navigation } = this.props;
    const enable_wallet = navigation.getParam("enable_wallet", true);
    const enable_cards = navigation.getParam("enable_cards", true);
    const enable_accounts = navigation.getParam("enable_accounts", true);

    if (enable_wallet) {
      // this.props.getUserWallet(this.props.user.user_data.deposit[0].ID);
    }

    if (enable_cards) {
      this.props.getUserCards(this.props.user.user_data.id);
    }

    // if (enable_accounts) {
    //     this.props.getUserAccounts();
    // }

    this.setState({ enable_wallet, enable_cards, enable_accounts });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      !this.props.loading && this.props.navigation.goBack();

      return true;
    }
  };

  // handleInitiateFundByPaystack=()=>{
  //     var payload={

  //     }
  //     this.setState({ processing: true }, () => {

  //         Network.fundWalletPaystack()
  //             .then((result) => {
  //                 this.chargeCard(result.data.access_code);
  //             })
  //             .catch((error) => {
  //                 this.setState({ processing: false }, () => {
  //                     this.props.showToast(error.message);
  //                 });
  //             });
  //     });
  // }

  handleSubmit = () => {
    const navigation = this.props.navigation;
    const payment_data = navigation.getParam("payment_data", {});
    const redirect = navigation.getParam("redirect", "");
    const add_card = navigation.getParam("add_card") ?? false;
    const add_wallet = navigation.getParam("add_wallet") ?? false;

    let { selected_payment_method, card, account } = this.state;
    let payment_method =
      selected_payment_method === "card"
        ? { ...card }
        : selected_payment_method === "account"
        ? { ...account }
        : {
            code_description: Dictionary.CREDITVILLE,
            account_number: this.props.user.wallet_id,
          };
    payment_method.payment_method_type = selected_payment_method;

    if (add_card) {
      this.props.navigation.navigate("SelectDebitMethod", {
        add_card: true,
      });
    } else
      this.props.navigation.navigate(redirect, {
        payment_data,
        payment_method,
      });
  };

  addCard = () => {
    this.setState({ processing: true }, () => {
      let payload = {
        customerId: this.props.user.user_data.id,
        accountId: this.props.user.wallet_id,
        //accountId:"12330015129",

        amount: "50",
      };

      //this.onCloseModal()

      Network.initAddCard(payload)
        .then((result) => {
          this.setState({ processing: false }, () => {
            this.props.navigation.navigate("AddCard", {
              payload: result?.transactionResponse,
            });
          });
        })
        .catch((error) => {
          this.setState({ processing: false }, () => {
            this.props.showToast(error.message);
          });
        });
    });
  };
  render() {
    let cardSize = this.props.payment.cards.length;
    let cardCountText = Dictionary.CARD_COUNT;
    cardCountText = cardCountText.replace("%s", cardSize);

    let wallet = this.props.wallet.wallet_data;
    let accounts = this.state.enable_accounts
      ? this.props.payment.accounts
      : [];

    let accountSize = accounts.length;
    let accountCountText = Dictionary.ACCOUNT_COUNT;
    accountCountText = accountCountText.replace(
      "%s",
      accountSize + (this.state.enable_wallet ? 1 : 0)
    );

    const progress = this.props.navigation.getParam("progress");

    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.PAYMENT_METHODS_HEADER}
        />
        <_ScrollView {...this.props}>
          {this.props.loading && (
            <View style={SharedStyle.loaderContainer}>
              <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
            </View>
          )}
          {!this.props.loading && (
            <View>
              {progress && <ProgressBar progress={progress} />}
              {this.state.enable_cards && (
                <View>
                  <View style={styles.summary}>
                    <Text style={[SharedStyle.normalText, styles.summaryText]}>
                      {cardCountText}
                    </Text>
                    {this.state.processing ? (
                      <View style={styles.summaryButton}>
                        <ActivityIndicator color={Colors.CV_YELLOW} />
                      </View>
                    ) : (
                      <TouchItem
                        style={styles.summaryButton}
                        //onPress={() => this.props.navigation.navigate('AddCard')}
                        onPress={() => this.addCard()}
                      >
                        <Icon.SimpleLineIcons
                          size={Mixins.scaleSize(18)}
                          style={styles.buttonIcon}
                          name="plus"
                        />
                        <Text style={styles.buttonText}>
                          {Dictionary.NEW_CARD_BTN}
                        </Text>
                      </TouchItem>
                    )}
                  </View>
                  {cardSize === 0 && (
                    <ScrollView
                      style={styles.cardSlider}
                      horizontal={true}
                      scrollEnabled={false}
                      showsHorizontalScrollIndicator={false}
                    >
                      <Image
                        style={[styles.card, styles.blankCard]}
                        source={require("../../assets/images/shared/empty_card.png")}
                      />
                      <Image
                        style={[styles.card, styles.blankCard]}
                        source={require("../../assets/images/shared/empty_card.png")}
                      />
                    </ScrollView>
                  )}
                  {cardSize > 0 && (
                    <ScrollView
                      style={styles.cardSlider}
                      horizontal={true}
                      scrollEnabled={cardSize > 1}
                      showsHorizontalScrollIndicator={false}
                    >
                      {this.props.payment.cards.map((card, index) => {
                        let isEven = index % 2 === 0;
                        let expiry =
                          card.expMonth + " / " + card.expYear.substr(-2);
                        return (
                          <TouchItem
                            key={index}
                            style={[styles.cardContainer]}
                            onPress={() =>
                              this.setState({
                                selected_payment_method: "card",
                                card,
                              })
                            }
                          >
                            <LinearGradient
                              key={card.id}
                              colors={[
                                isEven ? "#E561FA" : "#DFC905",
                                isEven ? "#551CF7" : "#3AB449",
                              ]}
                              start={{ x: 0.8, y: 2 }}
                              end={{ x: 1, y: 0.2 }}
                              style={[styles.card, styles.userCard]}
                            >
                              <View style={styles.cardTop}>
                                <View>
                                  {!(
                                    !!this.state.selected_payment_method &&
                                    this.state.selected_payment_method ===
                                      "card" &&
                                    this.state.card.id === card.id
                                  ) && (
                                    <Icon.FontAwesome
                                      name={"circle"}
                                      size={Mixins.scaleFont(32)}
                                      color={Colors.LIGHT_UNCHECKED_BG}
                                    />
                                  )}
                                  {!!this.state.selected_payment_method &&
                                    this.state.selected_payment_method ===
                                      "card" &&
                                    this.state.card.id === card.id && (
                                      <Icon.Ionicons
                                        name={"ios-checkmark-circle"}
                                        size={Mixins.scaleFont(32)}
                                        color={Colors.SUCCESS}
                                      />
                                    )}
                                </View>
                                <Image
                                  style={styles.cardLogo}
                                  source={{ uri: card.bankLogo }}
                                />
                              </View>
                              <View>
                                <View>
                                  <Text
                                    style={[styles.text, styles.value]}
                                    numberOfLines={1}
                                  >
                                    {card.cardName}
                                  </Text>
                                  <Text
                                    numberOfLines={1}
                                    style={[
                                      styles.text,
                                      styles.value,
                                      // styles.right,
                                    ]}
                                  >
                                    {expiry}
                                  </Text>
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      // alignItems: "center",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <Text
                                      numberOfLines={1}
                                      style={[styles.text, styles.value]}
                                    >
                                      <Text style={styles.mask}>
                                        XXX XX XX{" "}
                                      </Text>
                                      <Text>{card.lastFourDigit}</Text>
                                    </Text>
                                    <Text
                                      style={[
                                        styles.text,
                                        styles.value,
                                        styles.right,
                                      ]}
                                    >
                                      {card.cardType}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </LinearGradient>
                          </TouchItem>
                        );
                      })}
                      {cardSize === 1 && (
                        <Image
                          style={[styles.card, styles.blankCard]}
                          source={require("../../assets/images/shared/empty_card.png")}
                        />
                      )}
                    </ScrollView>
                  )}
                </View>
              )}
              {(this.state.enable_accounts || this.state.enable_wallet) && (
                <View>
                  <View style={styles.summary}>
                    <Text style={[SharedStyle.normalText, styles.summaryText]}>
                      {accountCountText}
                    </Text>
                    {this.state.enable_accounts && (
                      <TouchItem
                        style={styles.summaryButton}
                        onPress={() =>
                          this.props.navigation.navigate("AddAccount")
                        }
                      >
                        <Icon.SimpleLineIcons
                          size={Mixins.scaleSize(18)}
                          style={styles.buttonIcon}
                          name="plus"
                        />
                        <Text style={styles.buttonText}>
                          {Dictionary.NEW_ACCOUNT_BTN}
                        </Text>
                      </TouchItem>
                    )}
                  </View>
                  <View style={styles.accountList}>
                    {accountSize === 0 && !this.state.enable_wallet && (
                      <Image
                        style={styles.blankAccount}
                        source={require("../../assets/images/shared/empty_account.png")}
                      />
                    )}
                    {this.state.enable_wallet && (
                      <TouchItem
                        style={styles.wallet}
                        onPress={() =>
                          this.setState({
                            selected_payment_method: "wallet",
                          })
                        }
                      >
                        <View style={styles.walletDetails}>
                          <View style={styles.walletAction}>
                            {!!this.state.selected_payment_method &&
                              this.state.selected_payment_method ===
                                "wallet" && (
                                <Icon.Ionicons
                                  name={"ios-checkmark-circle"}
                                  size={Mixins.scaleFont(22)}
                                  color={Colors.SUCCESS}
                                />
                              )}
                          </View>
                          <View>
                            <Text
                              style={[
                                SharedStyle.normalText,
                                styles.walletName,
                              ]}
                              numberOfLines={1}
                            >
                              {Dictionary.CREDITVILLE}
                            </Text>
                            <Text
                              style={[
                                SharedStyle.normalText,
                                styles.walletNumber,
                              ]}
                              numberOfLines={1}
                            >
                              {this.props.user.wallet_id}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={[SharedStyle.normalText, styles.walletBalance]}
                          numberOfLines={1}
                        >
                          ₦
                          {Util.formatAmount(
                            this.props.user.user_data.deposit[
                              this.props.user.user_data.deposit.length - 1
                            ]?.balance ||
                              this.props.wallet.wallet_balance ||
                              0
                          )}
                        </Text>
                      </TouchItem>
                    )}
                    {accounts.map((account, index) => {
                      return (
                        <TouchItem
                          key={index}
                          style={styles.account}
                          onPress={() =>
                            this.setState({
                              selected_payment_method: "account",
                              account,
                            })
                          }
                        >
                          <View style={styles.accountAction}>
                            {!!this.state.selected_payment_method &&
                              this.state.selected_payment_method ===
                                "account" &&
                              this.state.account.id === account.id && (
                                <Icon.Ionicons
                                  name={"ios-checkmark-circle"}
                                  size={Mixins.scaleFont(22)}
                                  color={Colors.SUCCESS}
                                />
                              )}
                          </View>
                          <View style={styles.accountText}>
                            <Text
                              style={[
                                SharedStyle.normalText,
                                styles.accountName,
                              ]}
                              numberOfLines={1}
                            >
                              {account.account_name}
                            </Text>
                            <Text
                              style={[
                                SharedStyle.normalText,
                                styles.accountNumber,
                              ]}
                              numberOfLines={1}
                            >
                              {account.account_number}
                            </Text>
                          </View>
                        </TouchItem>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          )}
          {!this.props.loading && !!this.state.selected_payment_method && (
            <View style={SharedStyle.bottomPanel}>
              <View style={FormStyle.formButton}>
                <PrimaryButton
                  title={Dictionary.PROCEED_BTN}
                  icon="arrow-right"
                  onPress={this.handleSubmit}
                />
              </View>
            </View>
          )}
        </_ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  summary: {
    ...Mixins.margin(16, 8, 16, 16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryText: {
    ...Typography.FONT_MEDIUM,
    color: Colors.CV_BLUE,
  },
  summaryButton: {
    ...Mixins.padding(16, 8, 16, 16),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonIcon: {
    color: Colors.CV_YELLOW,
    marginRight: Mixins.scaleSize(10),
  },
  buttonText: {
    ...Typography.FONT_BOLD,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.CV_YELLOW,
  },
  cardSlider: {
    marginBottom: Mixins.scaleSize(50),
  },
  cardContainer: {
    width: Mixins.scaleSize(300),
    height: Mixins.scaleSize(180),
    ...Mixins.boxShadow(Colors.BLACK, { height: 2, width: 2 }, 1, 1),
    marginLeft: Mixins.scaleSize(16),
    marginRight: Mixins.scaleSize(10),
    marginBottom: Mixins.scaleSize(8),
    /// elevation: 5,
    borderWidth: Mixins.scaleSize(2),
    borderRadius: Mixins.scaleSize(10),
  },
  card: {
    width: Mixins.scaleSize(300),
    height: Mixins.scaleSize(180),
  },
  blankCard: {
    marginLeft: Mixins.scaleSize(16),
    marginRight: Mixins.scaleSize(4),
  },
  userCard: {
    ...Mixins.padding(16),
    flexDirection: "column",
    justifyContent: "space-between",
    borderRadius: Mixins.scaleSize(10),
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLogo: {
    width: Mixins.scaleSize(50),
    height: Mixins.scaleSize(30),
    resizeMode: "contain",
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  halfColumn: {
    width: "50%",
  },
  label: {
    ...Typography.FONT_REGULAR,
    color: Colors.WHITE,
    textTransform: "uppercase",
    marginBottom: Mixins.scaleSize(10),
  },
  value: {
    ...Typography.FONT_MEDIUM,
    fontSize: Mixins.scaleFont(15),
    lineHeight: Mixins.scaleSize(20),
    color: Colors.WHITE,
  },
  text: {
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
  },
  mask: {
    ...Typography.FONT_BOLD,
    color: Colors.DARK_GREY,
    letterSpacing: Mixins.scaleSize(3),
  },
  right: {
    textAlign: "right",
  },
  accountList: {
    marginHorizontal: Mixins.scaleSize(16),
  },
  blankAccount: {
    width: "100%",
    height: Mixins.scaleSize(70),
  },
  wallet: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: Mixins.scaleSize(3),
    borderRadius: Mixins.scaleSize(10),
    borderColor: Colors.FAINT_BORDER,
    marginBottom: Mixins.scaleSize(12),
    paddingHorizontal: Mixins.scaleSize(12),
    paddingVertical: Mixins.scaleSize(16),
  },
  walletDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignContent: "center",
    width: "40%",
  },
  walletAction: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.LIGHT_UNCHECKED_BG,
    width: Mixins.scaleSize(20),
    height: Mixins.scaleSize(20),
    borderRadius: Mixins.scaleSize(50),
    marginRight: Mixins.scaleSize(20),
  },
  walletName: {
    ...Typography.FONT_REGULAR,
    color: Colors.DARK_GREY,
    marginBottom: Mixins.scaleSize(5),
  },
  walletNumber: {
    ...Typography.FONT_MEDIUM,
    color: Colors.DARK_GREY,
  },
  walletBalance: {
    ...Typography.FONT_MEDIUM,
    color: Colors.DARK_GREY,
    paddingLeft: Mixins.scaleSize(20),
    fontSize: Mixins.scaleFont(20),
    lineHeight: Mixins.scaleSize(23),
    textAlign: "right",
    width: "60%",
  },
  account: {
    flexDirection: "row",
    alignItems: "center",
    /// elevation: 0.5,
    borderWidth: Mixins.scaleSize(2),
    borderRadius: Mixins.scaleSize(10),
    borderColor: Colors.FAINT_BORDER,
    marginBottom: Mixins.scaleSize(12),
  },
  accountText: {
    paddingVertical: Mixins.scaleSize(12),
    maxWidth: "80%",
  },
  accountName: {
    ...Typography.FONT_MEDIUM,
    color: Colors.DARK_GREY,
    marginBottom: Mixins.scaleSize(5),
  },
  accountNumber: {
    ...Typography.FONT_REGULAR,
    color: Colors.LIGHT_GREY,
  },
  accountAction: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.LIGHT_UNCHECKED_BG,
    width: Mixins.scaleSize(20),
    height: Mixins.scaleSize(20),
    borderRadius: Mixins.scaleSize(50),
    ...Mixins.margin(0, 20, 0, 12),
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    wallet: state.wallet,
    payment: state.payment,
    // loading: (state.payment.cards.length === 0 && state.payment.loading_cards)
    //     || (state.payment.accounts.length === 0 && state.payment.loading_accounts)
    loading: false,
  };
};

const mapDispatchToProps = {
  showToast,
  getUserWallet,
  getUserCards,
  getUserAccounts,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(PaymentMethods));
