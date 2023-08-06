import React, { Component } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  BackHandler,
  View,
  Text,
  Image,
  FlatList,
} from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import moment from "moment";
import * as Icon from "@expo/vector-icons";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";

import { showToast } from "_actions/toast_actions";
import { Network } from "_services";

import { Dictionary, Util } from "_utils";
import { SharedStyle, Mixins, Colors, Typography } from "_styles";
import { ScrollView, TouchItem } from "_atoms";
import { MainHeader } from "_organisms";

class SavingsTransactions extends Component {
  constructor(props) {
    super(props);

    const savings = this.props.navigation.getParam("savings", {});

    this.state = {
      savings,
      loading: false,
      transactions: [],
      transaction_groups: [],
      transaction_type: {
        label: "All transactions",
        value: "ALL",
      },
      transaction_types: [
        {
          label: "All transactions",
          value: "ALL",
        },
        {
          label: "Credit",
          value: "IN_WARD",
        },
        {
          label: "Debit",
          value: "OUT_WARD",
        },
      ],
      page: 0,
      pageSize: 20,
      allTransactions: [],
      inwardTransactions: [],
      outwardTransactions: [],
      lastPage: false,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    this.loadTransactions();
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

  loadTransactions = () => {
    this.setState(
      {
        loading: true,
      },
      () => {
        const {
          savings,
          page,
          pageSize,
          transaction_type,
          allTransactions,
          inwardTransactions,
          outwardTransactions,
        } = this.state;
        Network.getSavingsTransactions(
          savings.id,
          page,
          pageSize,
          transaction_type.value
        )
          .then((result) => {
            this.setState({
              loading: false,
              transaction_groups:
                transaction_type.value === "ALL"
                  ? [
                      ...allTransactions,
                      ...Util.dateGroupTransactions(
                        result?.transaction.content
                      ),
                    ]
                  : transaction_type.value === "IN_WARD"
                  ? [
                      ...inwardTransactions,
                      ...Util.dateGroupTransactions(
                        result?.transaction.content
                      ),
                    ]
                  : [
                      ...outwardTransactions,
                      ...Util.dateGroupTransactions(
                        result?.transaction.content
                      ),
                    ],
              lastPage: result?.transaction.last,
            });
          })
          .catch((error) => {
            this.setState(
              {
                loading: false,
              },
              () => {
                this.props.showToast(error.message);
              }
            );
          });
      }
    );
  };

  filterTransactions = (transaction_type) => {
    if (this.state.transaction_type.value !== transaction_type.value) {
      this.setState(
        {
          transaction_type,
        },
        () => this.loadTransactions()
      );
    }
  };

  renderTransactionGroup = ({ item }) => (
    <View>
      <Text style={styles.calendar}>{item.calendar_day}</Text>
      <FlatList
        data={item.transaction_data}
        renderItem={this.renderTransaction}
        keyExtractor={(transaction) => transaction.id}
      />
    </View>
  );

  renderTransaction = ({ item }) => {
    const transaction_type = item.debitCreditType.toLowerCase();
    return (
      <View style={[SharedStyle.section, styles.section]}>
        <View style={styles.row}>
          <View>
            <Image
              style={styles.icon}
              source={
                transaction_type === "dt"
                  ? require(`../../assets/images/transactions/debit.png`)
                  : transaction_type === "cr"
                  ? require("../../assets/images/transactions/credit.png")
                  : null
              }
            />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.row}>
              <Text numberOfLines={1} style={styles.reference}>
                {item.notes || "- - -"}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.amount, styles[transaction_type]]}
              >
                {`${
                  transaction_type === "dt"
                    ? "-"
                    : transaction_type === "cr"
                    ? "+"
                    : ""
                }₦${Util.formatAmount(Math.abs(item.amount))}`}
              </Text>
            </View>
            <View style={[styles.row, { alignItems: "flex-end" }]}>
              <Text numberOfLines={2} style={styles.description}>
                {item.referenceNumber || "- - -"}
              </Text>
              <Text numberOfLines={1} style={styles.balance}>
                {`${item.balance < 0 ? "-" : ""}₦${Util.formatAmount(
                  Math.abs(item.balance)
                )}`}
              </Text>
            </View>
            <View style={styles.row}>
              <Text numberOfLines={1} style={styles.time}>
                {moment(item.createdOn).format("hh:mm a")}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  render() {
    const { loading, transaction_types, transaction_type, transaction_groups } =
      this.state;

    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.SAVINGS_TRANSACTIONS}
        />
        <Menu onSelect={this.filterTransactions}>
          <MenuTrigger disabled={loading} style={styles.dropdown}>
            <Text style={styles.dropdownLabel}>{transaction_type.label}</Text>
            <Icon.SimpleLineIcons
              name={"arrow-down"}
              size={Mixins.scaleFont(15)}
              color={Colors.WHITE}
            />
          </MenuTrigger>
          <MenuOptions customStyles={{ optionsContainer: styles.menuOptions }}>
            {transaction_types.map((option, index) => {
              return (
                <MenuOption
                  key={index}
                  customStyles={{ optionText: styles.menuItem }}
                  value={option}
                  text={option.label}
                />
              );
            })}
          </MenuOptions>
        </Menu>

        {/* {loading && (
          <View style={SharedStyle.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
          </View>
        )} */}

        {/* {!loading && transaction_groups.length === 0 && (
          <View style={SharedStyle.loaderContainer}>
            <Text style={SharedStyle.normalText}>
              {Dictionary.NO_TRANSACTIONS}
            </Text>
          </View>
        )} */}

        {/* {!loading && !!transaction_groups?.[0]?.transaction_data && (
          <>
            <View style={styles.formContainer}>
              <FlatList
                data={transaction_groups}
                renderItem={this.renderTransactionGroup}
                keyExtractor={(transaction) =>
                  `${transaction.calendar_day}${Util.randomId()}`
                }
              />
            </View>
          </>
        )} */}

        {/* Remove on next sprint, an uncomment the above */}
        <View style={SharedStyle.loaderContainer}>
          <Text style={SharedStyle.normalText}>
            {Dictionary.NO_TRANSACTIONS}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  dropdown: {
    ...Mixins.padding(20),
    backgroundColor: Colors.CV_BLUE,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownLabel: {
    ...SharedStyle.normalText,
    color: Colors.WHITE,
  },
  menuOptions: {
    marginTop: Mixins.scaleSize(55),
    paddingHorizontal: Mixins.scaleSize(32),
    width: "100%",
  },
  menuItem: {
    ...SharedStyle.normalText,
    paddingVertical: Mixins.scaleSize(10),
    color: Colors.LIGHT_GREY,
    borderBottomWidth: Mixins.scaleSize(1),
    borderColor: Colors.FAINT_BORDER,
  },
  formContainer: {
    ...Mixins.margin(0, 16, 0, 16),
  },
  calendar: {
    ...SharedStyle.normalText,
    color: Colors.LIGHT_GREY,
    marginTop: Mixins.scaleSize(20),
    marginBottom: Mixins.scaleSize(10),
  },
  section: {
    ...Mixins.padding(10),
    marginBottom: Mixins.scaleSize(10),
    borderColor: Colors.INPUT_BORDER,
    elevation: 0,
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
  deposit: {
    color: Colors.SUCCESS,
  },
  withdrawal: {
    color: Colors.LOGOUT_RED,
  },
  balance: {
    ...SharedStyle.normalText,
    color: Colors.LIGHT_GREY,
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
});

const mapDispatchToProps = {
  showToast,
};

export default connect(
  null,
  mapDispatchToProps
)(withNavigationFocus(SavingsTransactions));
