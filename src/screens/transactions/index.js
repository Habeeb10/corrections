import React, { Component } from "react";
import {
  StyleSheet,
  BackHandler,
  View,
  Text,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import moment from "moment";
import * as Icon from "@expo/vector-icons";

import {
  getWalletTransactions,
  getWalletDebitTransactions,
  getWalletCreditTransactions,
} from "_actions/wallet_actions";

import { Dictionary, Util } from "_utils";
import { SharedStyle, Mixins, Colors, Typography } from "_styles";
import { ScrollView, TouchItem } from "_atoms";
import TransactionReceipt from "_screens/shared/transaction_receipt";

const { width } = Dimensions.get("screen");

class Transactions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      type: "all",
      receipt_modal_visible: false,
      transaction_data: {},
      page: 0,
      pageCredit: 0,
      pageDebit: 0,
      data: [],
      pageSize: 20,
      animationTrigger: false,
      refreshing: false,
    };

    this.fadeAnim = new Animated.Value(0);
  }

  componentDidMount() {
    const { page, pageSize, pageCredit, pageDebit } = this.state;

    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    this.animate();
    if (this.props.wallet?.transaction_groups.length === 0) {
      this.props.getWalletTransactions(
        this.props.user.wallet_id,
        page,
        pageSize
      );
    }

    if (this.props.wallet?.transaction_groups_credit.length === 0) {
      this.props.getWalletCreditTransactions(
        this.props.user.wallet_id,
        pageCredit,
        pageSize
      );
    }

    if (this.props.wallet?.transaction_groups_debit.length === 0) {
      this.props.getWalletDebitTransactions(
        this.props.user.wallet_id,
        pageDebit,
        pageSize
      );
    }
    Util.logEventData("transactions_view_all");
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

  _onRefresh = () => {
    const { page, pageSize, pageCredit, pageDebit } = this.state;

    this.setState({ refreshing: true }, () => {
      this.props.getWalletTransactions(
        this.props.user.wallet_id,
        page,
        pageSize
      );

      this.props.getWalletCreditTransactions(
        this.props.user.wallet_id,
        pageCredit,
        pageSize
      );

      this.props.getWalletDebitTransactions(
        this.props.user.wallet_id,
        pageDebit,
        pageSize
      );
    });
  };

  changeType = (type) => {
    this.setState({ type, animationTrigger: true }, () => {
      this.animate();
    });
  };

  animate = () => {
    this.fadeAnim.setValue(0);
    Animated.timing(this.fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  renderTransaction = ({ item }) => {
    return (
      <TouchItem
        onPress={() => {
          this.setState({
            transaction_data: item,
            receipt_modal_visible: true,
          });
          Util.logEventData("transactions_view", {
            transaction_id: item.reference,
          });
        }}
      >
        <View style={SharedStyle.row}>
          <View style={{ flexDirection: "row", width: "60%" }}>
            <View
              style={{
                width: Mixins.scaleSize(42),
                height: Mixins.scaleSize(42),
                borderRadius: 50,
                backgroundColor:
                  Number(item.amount) < 1 ? "#FDE3EA" : "#DFF1C8",
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
              }}
            >
              <Icon.Feather
                name={
                  Number(item.amount) < 1 ? "arrow-up-right" : "arrow-down-left"
                }
                color={Number(item.amount) < 1 ? "#BB0000" : "#00BB29"}
                size={Mixins.scaleSize(20)}
              />
            </View>

            <View style={{ paddingLeft: 10 }}>
              <Text numberOfLines={2} style={styles.walletId}>
                {Util.returnNarration(item.notes, item.amount)}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.transactionLabel, { paddingTop: 5 }]}
              >
                {moment(item.createdOn).format("DD-MMM")} |{" "}
                {moment(item.createdOn).format("HH:mm A")}
              </Text>
            </View>
          </View>

          <View style={{ width: "auto" }}>
            <Text
              numberOfLines={1}
              style={{
                color: Number(item.amount) < 1 ? "#BB0000" : "#00BB29",
              }}
            >
              ₦
              <Text style={{ fontSize: 16 }}>
                {Util.formatAmount(Math.abs(item.amount))}
              </Text>
            </Text>
          </View>
        </View>
      </TouchItem>
    );
  };

  //   handleLoadMore = () => {
  //     const { page, pageCredit, pageDebit, type, pageSize } = this.state;

  //     const {
  //       last_transaction,
  //       last_transaction_credit,
  //       last_transaction_debit,
  //     } = this.props.wallet;

  //     const lastTransaction =
  //       this.state.type === "inward"
  //         ? last_transaction_credit
  //         : this.state.type === "outward"
  //         ? last_transaction_debit
  //         : last_transaction;

  //     if (!lastTransaction) {
  //         if (type === "all") {
  //         this.setState({ page: page + 1 }, () => {
  //           this.props.getWalletTransactions(
  //             this.props.user.wallet_id,
  //             page,
  //             pageSize
  //           );
  //         });
  //       }

  //       if (type === "inward") {
  //         this.setState({ pageCredit: pageCredit + 1 }, () => {
  //           this.props.getWalletCreditTransactions(
  //             this.props.user.wallet_id,
  //             pageCredit,
  //             pageSize
  //           );
  //         });
  //       }

  //       if (type === "outward") {
  //         this.setState({ pageDebit: pageDebit + 1 }, () => {
  //           this.props.getWalletDebitTransactions(
  //             this.props.user.wallet_id,
  //             pageDebit,
  //             pageSize
  //           );
  //         });
  //       }
  //     }
  //   };

  handleLoadMore = () => {
    const { last_transaction } = this.props.wallet;

    if (!last_transaction) {
      this.setState(
        (prevState) => ({ page: prevState.page + 1 }),
        () => {
          this.props.getWalletTransactions(
            this.props.user.wallet_id,
            this.state.page,
            this.state.pageSize
          );
        }
      );
    }
  };

  handleLoadMoreCredit = () => {
    const { last_transaction_credit } = this.props.wallet;

    if (!last_transaction_credit) {
      this.setState(
        (prevState) => ({ pageCredit: prevState.pageCredit + 1 }),
        () => {
          this.props.getWalletCreditTransactions(
            this.props.user.wallet_id,
            this.state.pageCredit,
            this.state.pageSize
          );
        }
      );
    }
  };

  handleLoadMoreDebit = () => {
    const { last_transaction_debit } = this.props.wallet;

    if (!last_transaction_debit) {
      this.setState(
        (prevState) => ({ pageDebit: prevState.pageDebit + 1 }),
        () => {
          this.props.getWalletDebitTransactions(
            this.props.user.wallet_id,
            this.state.pageDebit,
            this.state.pageSize
          );
        }
      );
    }

    return null;
  };

  //   renderFooter = () => {
  //     const {
  //       transaction_groups,
  //       transaction_groups_credit,
  //       transaction_groups_debit,
  //       loading_wallet_transactions,
  //       loading_wallet_transactions_credit,
  //       loading_wallet_transactions_debit,
  //     } = this.props.wallet;

  //     const transactions =
  //       this.state.type === "inward"
  //         ? transaction_groups_credit
  //         : this.state.type === "outward"
  //         ? transaction_groups_debit
  //         : transaction_groups;

  //     const loading =
  //       this.state.type === "inward"
  //         ? loading_wallet_transactions_credit
  //         : this.state.type === "outward"
  //         ? loading_wallet_transactions_debit
  //         : loading_wallet_transactions;

  //     if (loading && transactions.length > 0) {
  //       return (
  //         <View style={{ paddingBottom: Mixins.scaleSize(50) }}>
  //           <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
  //         </View>
  //       );
  //     }

  //     return null;
  //   };

  renderFooter = () => {
    const { transaction_groups, loading_wallet_transactions } =
      this.props.wallet;

    if (loading_wallet_transactions && transaction_groups.length > 0) {
      return (
        <View style={{ paddingBottom: Mixins.scaleSize(50) }}>
          <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
        </View>
      );
    }

    return null;
  };

  renderCreditFooter = () => {
    const { transaction_groups_credit, loading_wallet_transactions_credit } =
      this.props.wallet;

    if (
      loading_wallet_transactions_credit &&
      transaction_groups_credit.length > 0
    ) {
      return (
        <View style={{ paddingBottom: Mixins.scaleSize(50) }}>
          <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
        </View>
      );
    }

    return null;
  };

  renderDebitFooter = () => {
    const { transaction_groups_debit, loading_wallet_transactions_debit } =
      this.props.wallet;

    if (
      loading_wallet_transactions_debit &&
      transaction_groups_debit.length > 0
    ) {
      return (
        <View style={{ paddingBottom: Mixins.scaleSize(50) }}>
          <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
        </View>
      );
    }

    return null;
  };

  render() {
    const {
      transaction_groups,
      transaction_groups_credit,
      transaction_groups_debit,
      loading_wallet_transactions,
      loading_wallet_transactions_credit,
      loading_wallet_transactions_debit,
    } = this.props.wallet;

    const transactions =
      this.state.type === "inward"
        ? transaction_groups_credit
        : this.state.type === "outward"
        ? transaction_groups_debit
        : transaction_groups;

    const loading =
      this.state.type === "inward"
        ? loading_wallet_transactions_credit
        : this.state.type === "outward"
        ? loading_wallet_transactions_debit
        : loading_wallet_transactions;

    const opacity = this.state.animationTrigger
      ? this.fadeAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 1, 1],
        })
      : 1;

    return (
      <View style={[SharedStyle.mainContainer, { padding: 10 }]}>
        <View style={styles.header}>
          <TouchItem onPress={this.handleBackButton}>
            <Icon.SimpleLineIcons
              size={Mixins.scaleSize(17)}
              color={"#090A0A"}
              style={{ fontWeight: "900" }}
              name="arrow-left"
            />
          </TouchItem>
          <Text style={styles.headerText}>Transaction History</Text>
          <Text />
        </View>

        <View style={styles.pillContainer}>
          <TouchableOpacity
            style={[
              styles.pills,
              {
                backgroundColor:
                  this.state.type === "all" ? Colors.CV_YELLOW : Colors.WHITE,
                width: width * 0.3,
              },
            ]}
            onPress={() => this.changeType("all")}
          >
            <Text
              style={[
                styles.pillsText,
                {
                  color:
                    this.state.type === "all" ? Colors.WHITE : Colors.BLACK,
                },
              ]}
            >
              All Transaction
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.pills,
              {
                backgroundColor:
                  this.state.type === "inward"
                    ? Colors.CV_YELLOW
                    : Colors.WHITE,
              },
            ]}
            onPress={() => this.changeType("inward")}
          >
            <Text
              style={[
                styles.pillsText,
                {
                  color:
                    this.state.type === "inward" ? Colors.WHITE : Colors.BLACK,
                },
              ]}
            >
              Inward
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.pills,
              {
                backgroundColor:
                  this.state.type === "outward"
                    ? Colors.CV_YELLOW
                    : Colors.WHITE,
              },
            ]}
            onPress={() => this.changeType("outward")}
          >
            <Text
              style={[
                styles.pillsText,
                {
                  color:
                    this.state.type === "outward" ? Colors.WHITE : Colors.BLACK,
                },
              ]}
            >
              Outward
            </Text>
          </TouchableOpacity>
        </View>

        {loading && transactions.length < 1 && (
          <View style={SharedStyle.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
          </View>
        )}

        {transactions.length < 1 && !loading && (
          <Animated.View
            style={[
              SharedStyle.loaderContainer,
              {
                opacity,
              },
            ]}
          >
            <Text style={SharedStyle.normalText}>
              {Dictionary.NO_TRANSACTIONS}
            </Text>
          </Animated.View>
        )}

        {/* {transactions.length > 0 && (
            <ScrollView
              {...this.props}
              style={{ paddingBottom: Mixins.scaleSize(20) }}
            >
              <Animated.View
                style={[
                  styles.formContainer,
                  {
                    opacity,
                  },
                ]}
              >
          <Animated.FlatList
            data={transactions}
            renderItem={this.renderTransaction}
            keyExtractor={(group) => `${group.referenceNumber}${group.id}`}
            showsVerticalScrollIndicator={false}
            onEndReached={
              this.state.type === "inward"
                ? this.handleLoadMoreCredit
                : this.state.type === "outward"
                ? this.handleLoadMoreDebit
                : this.handleLoadMore
            }
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              this.state.type === "inward"
                ? this.renderCreditFooter
                : this.state.type === "outward"
                ? this.renderDebitFooter
                : this.renderFooter
            }
            refreshing={loading && this.state.refreshing}
            onRefresh={this._onRefresh}
            style={[
              styles.formContainer,
              { paddingBottom: Mixins.scaleSize(20), opacity: opacity },
            ]}
          />
              </Animated.View>
            </ScrollView>
        )} */}

        {transactions.length > 0 && this.state.type === "inward" && (
          <>
            <Animated.FlatList
              data={transaction_groups_credit}
              renderItem={this.renderTransaction}
              keyExtractor={(group) => `${group.referenceNumber}${group.id}`}
              showsVerticalScrollIndicator={false}
              onEndReached={this.handleLoadMoreCredit}
              onEndReachedThreshold={0.5}
              ListFooterComponent={this.renderCreditFooter}
              refreshing={loading && this.state.refreshing}
              onRefresh={this._onRefresh}
              style={[
                styles.formContainer,
                { paddingBottom: Mixins.scaleSize(20), opacity: opacity },
              ]}
            />
          </>
        )}

        {transactions.length > 0 && this.state.type === "outward" && (
          <>
            <Animated.FlatList
              data={transaction_groups_debit}
              renderItem={this.renderTransaction}
              keyExtractor={(group) => `${group.referenceNumber}${group.id}`}
              showsVerticalScrollIndicator={false}
              onEndReached={this.handleLoadMoreDebit}
              onEndReachedThreshold={0.5}
              ListFooterComponent={this.renderDebitFooter}
              refreshing={loading && this.state.refreshing}
              onRefresh={this._onRefresh}
              style={[
                styles.formContainer,
                { paddingBottom: Mixins.scaleSize(20), opacity: opacity },
              ]}
            />
          </>
        )}

        {transactions.length > 0 && this.state.type === "all" && (
          <>
            <Animated.FlatList
              data={transaction_groups}
              renderItem={this.renderTransaction}
              keyExtractor={(group) => `${group.referenceNumber}${group.id}`}
              showsVerticalScrollIndicator={false}
              onEndReached={this.handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={this.renderFooter}
              refreshing={loading && this.state.refreshing}
              onRefresh={this._onRefresh}
              style={[
                styles.formContainer,
                { paddingBottom: Mixins.scaleSize(20), opacity: opacity },
              ]}
            />
          </>
        )}

        <TransactionReceipt
          onCloseModal={() => this.setState({ receipt_modal_visible: false })}
          modal_visible={this.state.receipt_modal_visible}
          transaction_data={this.state.transaction_data}
          props={this.props}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Mixins.padding(10),
  },
  headerText: {
    color: "#090A0A",
    ...Typography.FONT_MEDIUM,
    fontSize: Mixins.scaleFont(16),
  },
  pillContainer: {
    ...Mixins.margin(20, 0, 20, 10),
    ...Mixins.padding(10),
    backgroundColor: "#F5F5F5",
    width: width * 0.9,
    height: Mixins.scaleSize(44),
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  pills: {
    width: width * 0.2,
    borderRadius: 5,
    height: Mixins.scaleSize(30),
    alignItems: "center",
    justifyContent: "center",
  },
  pillsText: {
    color: Colors.WHITE,
    ...Typography.FONT_REGULAR,
  },
  formContainer: {
    ...Mixins.padding(10, 16, 0, 16),
  },
  calendar: {
    ...SharedStyle.normalText,
    color: Colors.LIGHT_GREY,
    marginTop: Mixins.scaleSize(20),
    marginBottom: Mixins.scaleSize(10),
  },
  row: {
    flexDirection: "row",
  },
  icon: {
    width: Mixins.scaleSize(15),
    height: Mixins.scaleSize(15),
    marginRight: Mixins.scaleSize(10),
  },
  textContainer: {
    flex: 1,
  },
  reference: {
    ...SharedStyle.normalText,
    ...Typography.FONT_MEDIUM,
    color: Colors.CV_BLUE,
    flex: 1,
  },
  amount: {
    ...SharedStyle.normalText,
    ...Typography.FONT_BOLD,
    marginLeft: Mixins.scaleSize(5),
    textAlign: "right",
  },
  credit: {
    color: Colors.SUCCESS,
  },
  debit: {
    color: Colors.LOGOUT_RED,
  },
  description: {
    ...SharedStyle.normalText,
    marginTop: Mixins.scaleSize(5),
    color: Colors.LIGHT_GREY,
    flex: 1,
  },
  time: {
    ...Typography.FONT_REGULAR,
    color: Colors.LIGHT_GREY,
    fontSize: Mixins.scaleFont(12),
    lineHeight: Mixins.scaleSize(14),
    marginTop: Mixins.scaleSize(10),
  },
  transactionLabel: {
    ...SharedStyle.normalText,
    color: Colors.VERY_LIGHT_GREY,
  },
  walletId: {
    ...Typography.FONT_REGULAR,
    color: Colors.DARK_GREY,
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    wallet: state.wallet,
  };
};

const mapDispatchToProps = {
  getWalletTransactions,
  getWalletDebitTransactions,
  getWalletCreditTransactions,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(Transactions));
