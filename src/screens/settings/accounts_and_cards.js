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
import Modal from "react-native-modal";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import * as Icon from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { showToast } from "_actions/toast_actions";
import { getUserCards, getUserAccounts } from "_actions/payment_actions";

import { Dictionary } from "_utils";
import { Colors, Mixins, SharedStyle, Typography } from "_styles";
import { TouchItem, ScrollView as _ScrollView } from "_atoms";
import { MainHeader } from "_organisms";
import { Network } from "_services";

class AccountsAndCards extends Component {
  state = {
    show_delete_dialog: false,
    is_deleting_card: false,
    is_deleting_account: false,
    delete_id: null,
    delete_message: null,
    deleting: false,
    processing: false,
  };

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);

    this.props.getUserCards(this.props.user.user_data.id);
    //this.props.getUserAccounts();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      if (this.state.show_delete_dialog) {
        this.cancelDelete();
      } else {
        !this.state.deleting &&
          !this.props.loading &&
          this.props.navigation.goBack();
      }

      return true;
    }
  };

  deleteCard = (card) => {
    let delete_message = Dictionary.CONFIRM_DELETE_CARD;
    delete_message = delete_message.replace("%s", card.bankName);
    delete_message = delete_message.replace("%s", card.lastFourDigit);
    this.setState({
      show_delete_dialog: true,
      is_deleting_card: true,
      delete_id: card.id,
      delete_message,
    });
  };

  deleteAccount = (account) => {
    let delete_message = Dictionary.CONFIRM_DELETE_ACCOUNT;
    delete_message = delete_message.replace("%s", account.code_description);
    this.setState({
      show_delete_dialog: true,
      is_deleting_account: true,
      delete_id: account.id,
      delete_message,
    });
  };

  cancelDelete = () => {
    this.setState({
      show_delete_dialog: false,
      is_deleting_card: false,
      is_deleting_account: false,
      delete_id: null,
      delete_message: null,
      deleting: false,
    });
  };

  executeDelete = () => {
    this.setState({
      show_delete_dialog: false,
      deleting: true,
    });
    if (this.state.is_deleting_card) {
      this.handleCardDeletion();
    } else if (this.state.is_deleting_account) {
      this.handleAccountDeletion();
    }
  };

  handleCardDeletion = () => {
    Network.deleteUserCard(this.state.delete_id)
      .then(() => {
        this.cancelDelete();
        this.props.showToast(Dictionary.CARD_DELETED, false);
        this.props.getUserCards(this.props.user.user_data.id);
      })
      .catch((error) => {
        this.cancelDelete();
        this.props.showToast(error.message);
      });
  };

  handleAccountDeletion = () => {
    Network.deleteUserBank(this.state.delete_id)
      .then(() => {
        this.cancelDelete();
        this.props.showToast(Dictionary.ACCOUNT_DELETED, false);
        this.props.getUserAccounts();
      })
      .catch((error) => {
        this.cancelDelete();
        this.props.showToast(error.message);
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
          console.log("myTest", { result });
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

    let accountSize = this.props.payment.accounts.length;
    let accountCountText = Dictionary.ACCOUNT_COUNT;
    accountCountText = accountCountText.replace("%s", accountSize);

    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.ACCOUNTS_AND_CARDS_HEADER}
        />
        <_ScrollView {...this.props}>
          {(this.state.deleting || this.props.loading) && (
            <View style={SharedStyle.loaderContainer}>
              <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
            </View>
          )}
          {!this.state.deleting && !this.props.loading && (
            <View>
              <View style={styles.summary}>
                <Text style={[styles.text, styles.summaryText]}>
                  {cardCountText}
                </Text>
                {this.state.processing ? (
                  <View style={styles.summaryButton}>
                    <ActivityIndicator color={Colors.CV_YELLOW} />
                  </View>
                ) : (
                  <TouchItem
                    style={styles.summaryButton}
                    onPress={() => this.addCard()}
                    //onPress={() => this.props.navigation.navigate('AddCard')}
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
                    let expiry = card.expMonth + "/" + card.expYear.substr(-2);
                    console.log("Bank Logo URL:", card.bankLogo);

                    return (
                      <LinearGradient
                        key={card.id}
                        colors={[
                          isEven ? "#D9D9D9" : "#DFC905",
                          isEven ? "#551CF7" : "#3AB449",
                        ]}
                        start={{ x: 0.8, y: 2 }}
                        end={{ x: 1, y: 0.2 }}
                        style={[styles.card, styles.userCard]}
                      >
                        <View style={styles.cardTop}>
                          <TouchItem
                            style={styles.cardAction}
                            onPress={() => this.deleteCard(card)}
                          >
                            <Icon.MaterialCommunityIcons
                              size={Mixins.scaleSize(16)}
                              style={styles.deleteIcon}
                              name="delete-sweep-outline"
                            />
                          </TouchItem>
                          {card.bankLogo && (
                            <Image
                              style={styles.cardLogo}
                              source={{ uri: card.bankLogo }}
                              resizeMode="cover"
                            />
                          )}
                        </View>
                        <View>
                          <View>
                            <Text
                              style={[styles.text, styles.value, styles.right]}
                            >
                              {card.cardName}
                            </Text>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                // justifyContent: "space-between",
                                marginBottom: Mixins.scaleSize(5),
                              }}
                            >
                              {/* <Text
                                numberOfLines={1}
                                style={[styles.labelCard, styles.namelabel]}
                              >
                                {Dictionary.CARD_NUMBER_LABEL}
                              </Text> */}
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
                            </View>
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
                                <Text style={styles.mask}>XXX XX XX </Text>
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

                          {/* <Text
                              numberOfLines={1}
                              style={[styles.text, styles.label, styles.right]}
                            >
                              {Dictionary.CARD_EXP_LABEL}
                            </Text> */}
                        </View>
                      </LinearGradient>
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
        </_ScrollView>
        <Modal
          isVisible={this.state.show_delete_dialog}
          swipeDirection="down"
          onSwipeComplete={this.handleBackButton}
          onBackButtonPress={this.handleBackButton}
          animationInTiming={500}
          animationOutTiming={800}
          backdropTransitionInTiming={500}
          backdropTransitionOutTiming={800}
          useNativeDriver={true}
          style={styles.confirmDialog}
        >
          <View style={styles.dialog}>
            <View style={styles.slider} />
            <View style={styles.modalContainer}>
              <Text style={styles.header}>{Dictionary.CONFIRM}</Text>
              <Text numberOfLines={2} style={styles.message}>
                {this.state.delete_message}
              </Text>
              <View style={styles.buttons}>
                <TouchItem style={styles.button} onPress={this.cancelDelete}>
                  <Text style={styles.buttonText}>{Dictionary.NO_BTN}</Text>
                </TouchItem>
                <TouchItem style={styles.button} onPress={this.executeDelete}>
                  <Text style={styles.buttonText}>{Dictionary.YES_BTN}</Text>
                </TouchItem>
              </View>
            </View>
          </View>
        </Modal>
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
  text: {
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
  },
  labelCard: {
    fontSize: Mixins.scaleFont(13),
    // lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
    marginRight: Mixins.scaleSize(20),
    maxWidth: "50%",
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
    // ...Mixins.boxShadow(Colors.BLACK, { height: 2, width: 2 }, 1, 1),
    marginLeft: Mixins.scaleSize(16),
    marginRight: Mixins.scaleSize(10),
    marginBottom: Mixins.scaleSize(8),
    /// elevation: 5,
    // borderWidth: Mixins.scaleSize(2),
    borderRadius: Mixins.scaleSize(10),
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLogo: {
    width: Mixins.scaleSize(50),
    height: Mixins.scaleSize(30),
    // resizeMode: "contain",
    borderRadius: Mixins.scaleSize(32),
  },
  cardAction: {
    ...Mixins.padding(8),
    backgroundColor: Colors.WHITE,
    width: Mixins.scaleSize(32),
    height: Mixins.scaleSize(32),
    borderRadius: Mixins.scaleSize(32),
    /// elevation: 2,
    // borderWidth: Mixins.scaleSize(2),
    // ...Mixins.boxShadow(Colors.BLACK, { height: 2, width: 2 }, 1, 1),
    borderColor: Colors.WHITE,
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
  namelabel: {
    ...Typography.FONT_REGULAR,
    color: Colors.WHITE,
    textTransform: "uppercase",
    // marginBottom: Mixins.scaleSize(10),
  },

  value: {
    ...Typography.FONT_MEDIUM,
    fontSize: Mixins.scaleFont(18),
    lineHeight: Mixins.scaleSize(20),
    color: Colors.WHITE,
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
  account: {
    flexDirection: "row",
    alignItems: "center",
    /// elevation: 0.5,
    borderWidth: Mixins.scaleSize(2),
    borderRadius: Mixins.scaleSize(10),
    borderColor: Colors.FAINT_BORDER,
    marginBottom: Mixins.scaleSize(12),
  },
  bankLogo: {
    marginHorizontal: Mixins.scaleSize(12),
    width: Mixins.scaleSize(40),
    height: Mixins.scaleSize(40),
    // resizeMode: "contain",
  },
  accountDetails: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    ...Mixins.padding(16, 12, 16, 12),
  },
  deleteIcon: {
    color: Colors.CV_RED,
  },
  // Extract to shareable space along with exit's own
  confirmDialog: {
    justifyContent: "flex-end",
    margin: 0,
  },
  dialog: {
    ...Mixins.padding(0, 16, 16, 16),
    height: Mixins.scaleSize(255),
    alignItems: "center",
  },
  slider: {
    width: Mixins.scaleSize(50),
    height: Mixins.scaleSize(5),
    marginBottom: Mixins.scaleSize(12),
    backgroundColor: Colors.WHITE,
    borderRadius: Mixins.scaleSize(80),
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: Colors.WHITE,
    flex: 1,
    width: "100%",
    borderRadius: Mixins.scaleSize(8),
  },
  header: {
    ...Mixins.padding(24, 16, 24, 16),
    ...Typography.FONT_BOLD,
    fontSize: Mixins.scaleFont(16),
    lineHeight: Mixins.scaleSize(19),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.DARK_GREY,
    borderBottomColor: Colors.FAINT_BORDER,
    borderBottomWidth: Mixins.scaleSize(1),
  },
  message: {
    ...Mixins.padding(32, 16, 32, 16),
    flexDirection: "row",
    justifyContent: "space-between",
    ...Typography.FONT_MEDIUM,
    color: Colors.DARK_GREY,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
  },
  buttons: {
    flex: 1,
    flexDirection: "row",
    borderTopColor: Colors.FAINT_BORDER,
    borderTopWidth: Mixins.scaleSize(1),
  },
  button: {
    flex: 1,
    justifyContent: "center",
  },
  buttonText: {
    textAlign: "center",
    ...Typography.FONT_MEDIUM,
    color: Colors.CV_YELLOW,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    settings: state.settings,
    payment: state.payment,
    loading:
      (state.payment.cards.length === 0 && state.payment.loading_cards) ||
      (state.payment.accounts.length === 0 && state.payment.loading_accounts),
  };
};

const mapDispatchToProps = {
  showToast,
  getUserCards,
  getUserAccounts,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(AccountsAndCards));

{
  /* <View style={styles.summary}>
                                <Text style={[styles.text, styles.summaryText]}>{accountCountText}</Text>
                                <TouchItem
                                    style={styles.summaryButton}
                                    onPress={() => this.props.navigation.navigate('AddAccount')}>
                                    <Icon.SimpleLineIcons
                                        size={Mixins.scaleSize(18)}
                                        style={styles.buttonIcon}
                                        name="plus" />
                                    <Text style={styles.buttonText}>{Dictionary.NEW_ACCOUNT_BTN}</Text>
                                </TouchItem>
                            </View>
                            <View style={styles.accountList}>
                                {accountSize === 0 && (
                                    <Image
                                        style={styles.blankAccount}
                                        source={require('../../assets/images/shared/empty_account.png')}
                                    />
                                )}
                                {accountSize > 0 && (
                                    this.props.payment.accounts.map(account => {
                                        return <View key={account.id} style={styles.account}>
                                            <Image
                                                style={styles.bankLogo}
                                                source={{ uri: account.url }}
                                            />
                                            <View style={styles.accountDetails}>
                                                <View style={styles.accountText}>
                                                    <Text
                                                        style={[styles.text, styles.accountName]}
                                                        numberOfLines={1}>
                                                        {account.account_name}
                                                    </Text>
                                                    <Text
                                                        style={[styles.text, styles.accountNumber]}
                                                        numberOfLines={1}>
                                                        {account.account_number}
                                                    </Text>
                                                </View>
                                                <TouchItem style={styles.accountAction} onPress={() => this.deleteAccount(account)}>
                                                    <Icon.MaterialCommunityIcons
                                                        size={Mixins.scaleSize(25)}
                                                        style={styles.deleteIcon}
                                                        name="delete-sweep-outline" />
                                                </TouchItem>
                                            </View>
                                        </View>
                                    })
                                )}
                            </View> */
}
