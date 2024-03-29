import React, { Component } from "react";
import {
  BackHandler,
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
  FlatList,
} from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import { showToast } from "_actions/toast_actions";
import { updateAirtimePurchase } from "_actions/airtime_actions";
import { updateDataPurchase } from "_actions/data_actions";
import { Dictionary, Util } from "_utils";
import { SharedStyle, FormStyle, Mixins, Colors, Typography } from "_styles";
import { FloatingLabelInput, TouchItem, RecentTransaction } from "_atoms";
import { default as ScrollView } from "_atoms/scroll_view";
import { PrimaryButton, PickItem, SelectListItem } from "_molecules";
import { MainHeader, ActionSheet, AuthorizeTransaction } from "_organisms";
import { getBillerCategories } from "_actions/bills_actions";
import * as Icon from "@expo/vector-icons";
import * as Permissions from "expo-permissions";
import { selectContactPhone } from "react-native-select-contact";
import { Network } from "_services";
import moment from "moment";
import { addNotification } from "_actions/notification_actions";
import { randomId } from "../../utils/util";
import { MaterialIcons } from "@expo/vector-icons";
import Modal from "react-native-modal";

const { width } = Dimensions.get("screen");

class Airtime extends Component {
  constructor(props) {
    super(props);
    const { network, data_package } = this.props.data.data_purchase;
    const { data_purchase } = this.props.data;
    const { amount, phone_number } = this.props.airtime.airtime_purchase;
    let networks = [
      {
        title: "9mobile",
        value: "9mobile",
        image: require("../../assets/images/shared/9mobile.png"),
      },
      {
        title: "Airtel",
        value: "airtel",
        image: require("../../assets/images/shared/airtel.png"),
      },

      {
        title: "Glo",
        value: "glo",
        image: require("../../assets/images/shared/glo.png"),
      },
      {
        title: "MTN",
        value: "mtn",
        image: require("../../assets/images/shared/mtn.png"),
      },
    ];
    this.state = {
      phone_number,
      data_package,
      phone_number: "",
      phone_number_error: "",
      processing: false,
      contact_phones: [],
      show_phone_list: false,
      type: "airtime",
      amount,
      amount_error: "",
      commaValues: "",
      auth_screen_visible: false,
      network: data_purchase.network,
      packages: [],
      data_package: null,
      package_name: "",
      pin_error: "",
      recent_transactions: [],
      data: [],
      animationTrigger: false,
      networks,
      network: null,
      network_value: "",
      dataBillSuccess: false,
      selectedPackage: null,
      modalVisible: false,
    };
    this.fadeAnim = new Animated.Value(0);
  }
  openModal = () => {
    this.setState({ modalVisible: true });
  };

  closeModal = () => {
    this.setState({ modalVisible: false });
  };

  handleItemPress = (item) => {
    this.setState({ selectedItem: item });
    this.closeModal();
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

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    if (this.props.bills.categories.length === 0) {
      this.props.getBillerCategories();
    }
    this.fetchDataBillers();
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

  setScrollRef = (scrollRef) => {
    this.scrollRef = scrollRef;
  };

  validate = () => {
    let is_valid = true;
    let amount = this.state.amount;

    if (!Util.isValidAmount(amount)) {
      this.setState({
        amount_error: Dictionary.ENTER_VALID_AMOUNT,
      });

      is_valid = false;
    }

    if (+amount > Number(this.props.wallet.wallet_data.account_balance)) {
      this.setState({
        amount_error: Dictionary.CANNOT_EXECEED_BALANCE,
      });

      is_valid = false;
    }
    return is_valid;
  };

  // handleSelectedPackage = (data_package) => {
  //   this.setState({
  //     selectedPackage: data_package,
  //     data_package,
  //     package_name: data_package.biller_name,
  //   });
  // };

  // getDataPackages = () => {
  //   this.setState({ processing: true }, () => {
  //     Network.getBillerItems(this.state.network?.biller_code)
  //       .then((result) => {
  //         this.setState({ processing: false }, () => {
  //           let packages = result.billscategories.billers;
  //           if (!packages || !Array.isArray(packages) || packages.length < 1) {
  //             this.props.showToast(result.message || Dictionary.GENERAL_ERROR);
  //             this.handleBackButton();
  //           } else {
  //             packages.forEach((_package, index) => {
  //               _package.index = index;
  //             });
  //             this.setState({
  //               packages,
  //             });
  //             let { data_package } = this.state;
  //             this.props.updateDataPurchase({ data_package });
  //           }
  //         });
  //       })
  //       .catch((error) => {
  //         this.setState({ processing: false }, () => {
  //           this.props.showToast(error.message);
  //           this.handleBackButton();
  //         });
  //       });
  //   });
  // };

  fetchDataBillers = () => {
    if (this.props.wallet.wallet_data_error) {
      this.props.showToast(this.props.wallet.wallet_data_error);
      return;
    }
    const { categories } = this.props.bills;
    const data_category = categories.find(
      (category) => category.slug?.trim()?.toLowerCase() === "data_bundle"
    );
    if (!data_category) {
    } else {
      Network.getCategoryBillers(data_category.slug)
        .then((result) => {
          this.setState({ processing: false }, () => {
            if (!result || result.length < 1) {
              this.props.showToast(Dictionary.GENERAL_ERROR);
            } else {
              const data_billers = result.billscategories.billers;
              let modNetworks = this.state.networks;
              modNetworks.forEach((network) => {
                let biller = data_billers.find(
                  (data_biller) =>
                    network.value ===
                    data_biller.name.replace(/ .*/, "").toLowerCase()
                );
                if (biller) {
                  network.biller_code = biller.billerCode;
                }
              });
              modNetworks = modNetworks.filter(
                (network) => network.biller_code
              );
              console.log({ modNetworks });

              this.setState((state) => ({ ...state, networks: modNetworks }));
            }
          });
        })
        .catch((error) => {
          this.setState({ processing: false }, () => {
            this.props.showToast(error.message);
          });
        });
    }
  };
  handleSubmit = (pin) => {
    if (!this.validate()) {
      return;
    }
    if (!this.props.user.user_data.emailVerificationStatus) {
      this.cancelTransactionAuthorization();
      this.props.showToast(Dictionary.EMAIL_NOT_VERIFIED);
      this.props.navigation.navigate("EnterEmail");
      return;
    }
    if (!this.props.user.user_data.photoUrl) {
      this.cancelTransactionAuthorization();
      this.props.showToast(Dictionary.NO_PHOTO_URL);
      this.props.navigation.navigate("OnboardSelfie");
      return;
    }
    this.setState(
      {
        processing: true,
      },
      () => {
        let { amount, phone_number } = this.state;
        let payload = {
          phoneNumber: phone_number,
          customerID: phone_number,
          amount: amount,
          accountID: this.props.user.user_data.nuban,
          billType: "airtime",
          pin,
        };

        Network.validatePIN(pin)
          .then(() => {
            Network.buyAirtime(payload)
              .then((result) => {
                this.setState(
                  {
                    processing: false,
                    auth_screen_visible: false,
                  },
                  () => {
                    let success_message = Dictionary.AIRTIME_PURCHASED;
                    success_message = success_message
                      .replace("%s", phone_number)
                      .replace("%s", Util.formatAmount(amount));
                    this.props.navigation.navigate("Success", {
                      event_name: "transactions_successful_airtime",
                      event_data: {
                        transaction_id: result.data?.reference || "",
                      },
                      success_message,
                      transaction_data: {
                        ...payload,
                        ...result.data,
                        transaction_date:
                          result.data?.transaction_date ||
                          moment().format("yyyy-MM-dd HH:mm:ss"),
                      },
                    });
                    this.props.addNotification({
                      id: randomId(),
                      is_read: false,
                      title: "Airtime recharge",
                      description: `You have successfully recharged ${phone_number} with NGN${amount}.`,
                      timestamp: moment().toString(),
                    });
                  }
                );
              })
              .catch((error) => {
                if (
                  error.message &&
                  error.message.toLowerCase().includes("pin")
                ) {
                  this.setState({
                    processing: false,
                    pin_error: error.message || "Pin is invalid",
                  });
                } else {
                  this.setState(
                    {
                      processing: false,
                      auth_screen_visible: false,
                    },
                    () => {
                      this.props.navigation.navigate("Error", {
                        event_name: "transactions_failed_airtime",
                        error_message:
                          error.message ||
                          "Could not perform transaction at this time.",
                      });
                    }
                  );
                }
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

  handleOnchangeText = (text) => {
    // remove any commas from the current value
    const currentValue = text.replace(/,/g, "");
    const removeDecimals = currentValue.replace(/\D/g, "");
    // add commas every three digits
    const formattedValue = removeDecimals.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    this.setState({
      amount: text.replace(/\D/g, ""),
      amount_error: "",
      commaValues: formattedValue,
    });
  };
  handleBuyForMe = async () => {
    this.setState({
      phone_number: this.props.user.user_data.phoneNumber,
      phone_number_error: "",
    });
  };
  handleSelectContact = async () => {
    const { status } = await Permissions.askAsync(Permissions.CONTACTS);
    if (status === "granted") {
      this.setState({ phoneNumber: "", contact_phones: [] });
      const { contact } = await selectContactPhone();
      if (contact) {
        let phones = Util.normalizeContactPhones(contact.phones);
        if (phones.length === 1) {
          this.assertContactPhone(phones[0]);
        } else if (phones.length > 1) {
          this.setState({
            contact_phones: phones,
            show_phone_list: true,
          });
        }
      }
    } else {
      this.props.showToast("Contacts permission is needed");
    }
  };
  getContactPhoneOptions = () => {
    let options = this.state.contact_phones.map((phone) => {
      return {
        label: phone.number,
        number: phone.number,
        subtitle: phone.type,
      };
    });
    return options;
  };
  assertContactPhone = (selectedPhone) => {
    let phone_number = selectedPhone.number;
    phone_number = phone_number
      ? phone_number.replace(/\s+/g, "").replace(/\D/g, "")
      : "";
    if (phone_number.length > 11) {
      phone_number = `0${phone_number.slice(-10)}`;
    }
    this.setState({
      phone_number,
      phone_number_error: "",
    });
  };
  validate = () => {
    let is_valid = true;

    if (!Util.isValidPhone(this.state.phone_number)) {
      this.setState({
        phone_number_error: Dictionary.ENTER_VALID_PHONE,
      });

      is_valid = false;
    }

    return is_valid;
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
  render() {
    let { data_package } = this.state;
    let amount_due =
      Number(data_package?.amount) + Number(data_package?.fee || 0);
    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.AIRTIME_HEADER}
        />
        <ScrollView
          {...this.props}
          hasButtomButtons={true}
          setScrollRef={this.setScrollRef}
        >
          <View style={styles.formContainer}>
            <Text style={styles.selectPckage}>Select Service Provider</Text>
            <View style={[styles.checkBox, FormStyle.formItem]}>
              {this.state.networks.map((network, index) => {
                return (
                  <PickItem
                    key={index}
                    image={network.image}
                    title={network.title}
                    onPress={() => {
                      this.setState({
                        network,
                        network_value: network.value,
                      });
                      this.props.updateDataPurchase({ network });
                    }}
                    selected={this.state.network_value === network.value}
                  />
                );
              })}
            </View>
            <>
              <View style={styles.formItem}>
                <FloatingLabelInput
                  label={Dictionary.MOBILE_NUMBER_LABEL}
                  value={this.state.phone_number}
                  keyboardType={"number-pad"}
                  multiline={false}
                  maxLength={11}
                  autoCorrect={false}
                  onChangeText={(text) =>
                    this.setState({
                      phone_number: text.replace(/\D/g, ""),
                      phone_number_error: "",
                    })
                  }
                  editable={!this.state.processing}
                />
                <Text style={FormStyle.formError}>
                  {this.state.phone_number_error}
                </Text>
              </View>
              <View style={FormStyle.formItem}>
                <View style={[FormStyle.formButton, styles.formButton]}>
                  <TouchItem
                    style={styles.contactButton}
                    onPress={this.handleBuyForMe}
                    disabled={this.state.processing}
                  >
                    <Icon.AntDesign
                      size={Mixins.scaleSize(20)}
                      style={styles.buttonIcon}
                      name="contacts"
                    />
                    <Text style={styles.buttonText}>
                      {Dictionary.MY_NUMBER_BTN}
                    </Text>
                  </TouchItem>
                  <TouchItem
                    style={styles.contactButton}
                    onPress={this.handleSelectContact}
                    disabled={this.state.processing}
                  >
                    <Icon.AntDesign
                      size={Mixins.scaleSize(20)}
                      style={styles.buttonIcon}
                      name="contacts"
                    />
                    <Text style={styles.buttonText}>
                      {Dictionary.FROM_DEVICE_BTN}
                    </Text>
                  </TouchItem>
                </View>
              </View>
              <View style={FormStyle.formItem}>
                <FloatingLabelInput
                  label={Dictionary.AMOUNT_LABEL}
                  value={this.state.commaValues}
                  keyboardType={"number-pad"}
                  multiline={false}
                  autoCorrect={false}
                  onChangeText={this.handleOnchangeText}
                />
                <Text style={FormStyle.formError}>
                  {this.state.amount_error}
                </Text>
                <Text style={SharedStyle.balanceLabel}>
                  {Dictionary.BALANCE}{" "}
                  <Text style={SharedStyle.balanceValue}>
                    ₦
                    {Util.formatAmount(
                      Number(this.props.wallet.wallet_balance)
                    )}
                  </Text>
                </Text>
              </View>
              {this.state.recent_transactions.length > 0 && (
                <View>
                  <View style={FormStyle.formItem}>
                    <Text style={FormStyle.sectionLabel}>
                      {Dictionary.RECENT_TRANSACTIONS}
                    </Text>
                  </View>
                  <View style={FormStyle.formItem}>
                    {this.state.recent_transactions.map(
                      (transaction, index) => {
                        let isEven = index % 2 === 0;
                        return (
                          <RecentTransaction
                            key={index}
                            initialsBackgroundColor={
                              isEven
                                ? Colors.LIGHT_GREEN_BG
                                : Colors.LIGHT_ORANGE_BG
                            }
                            initialsTextColor={
                              isEven ? Colors.CV_GREEN : Colors.CV_YELLOW
                            }
                            customerName={transaction.customerName}
                            customerId={transaction.customerId}
                            transactionAmount={transaction.amount}
                            onPress={() => {
                              this.setState(
                                {
                                  phone_number: transaction.customerId,
                                  phone_number_error: "",
                                },
                                () => this.handleSubmit()
                              );
                            }}
                          />
                        );
                      }
                    )}
                  </View>
                </View>
              )}
            </>
          </View>
          <View style={SharedStyle.bottomPanel}>
            <View style={FormStyle.formButton}>
              <PrimaryButton
                title={Dictionary.CONTINUE_BTN}
                icon="arrow-right"
                onPress={this.handleTransactionAuthorization}
              />
            </View>
          </View>
          {this.state.auth_screen_visible && (
            <AuthorizeTransaction
              title={Dictionary.BUY_AIRTIME}
              isVisible={this.state.auth_screen_visible}
              isProcessing={this.state.processing}
              pinError={this.state.pin_error}
              resetError={() => this.setState({ pin_error: "" })}
              onSubmit={this.handleSubmit}
              onCancel={this.cancelTransactionAuthorization}
            />
          )}
          <ActionSheet
            options={this.getContactPhoneOptions()}
            title={Dictionary.SELECT_PHONE}
            show={this.state.show_phone_list}
            onChange={(phone) => this.assertContactPhone(phone)}
            close={() =>
              this.setState({
                show_phone_list: false,
              })
            }
          />
        </ScrollView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  formItem: {
    ...Mixins.margin(5, 0, 5, 0), // Increase the bottom margin to 40
  },
  // packagesBox: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   alignItems: "center",
  // },
  selectPackages: {
    fontSize: Mixins.scaleFont(11),
    color: "#8397B1",
    marginTop: Mixins.scaleSize(5),
    ...Typography.FONT_MEDIUM,
  },
  select: {
    fontSize: Mixins.scaleFont(11),
    color: "#28374C",
    marginTop: Mixins.scaleSize(5),
    ...Typography.FONT_REGULAR,
  },

  categoryBox: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  packageContainer: {
    width: "100%",
    height: Mixins.scaleSize(55),
    borderColor: Colors.GREY,
    borderWidth: 1,
    borderRadius: Mixins.scaleSize(3),
    marginBottom: Mixins.scaleSize(26),
    paddingHorizontal: Mixins.scaleSize(5),

    // alignItems: "center",
  },
  checkBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    ...Mixins.margin(20, 0, 20, 0), // Increase the bottom margin to 40\
  },
  formContainer: {
    // ...Mixins.margin(10, 0, 10, 0),
    ...Mixins.padding(16),
  },
  selectPckage: {
    ...Typography.FONT_BOLD,
    fontSize: Mixins.scaleFont(16),
    color: Colors.BLACK,
    ...Mixins.margin(20, 0, 20, 0), // Increase the bottom margin to 40\
  },
  pillContainer: {
    ...Mixins.margin(10, 0, 10, 0),
    ...Mixins.padding(10),
    backgroundColor: "#F5F5F5",
    width: width * 0.9,
    height: Mixins.scaleSize(44),
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "center",
  },
  pills: {
    width: width * 0.4,
    borderRadius: 5,
    height: Mixins.scaleSize(30),
    alignItems: "center",
    justifyContent: "center",
  },
  pillsText: {
    color: Colors.WHITE,
    ...Typography.FONT_REGULAR,
  },
  formButton: {
    marginHorizontal: Mixins.scaleSize(0),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Mixins.margin(0, 0, 15, 0),
  },
  contactButton: {
    // paddingVertical: Mixins.scaleSize(10),
    flexDirection: "row",
    alignItems: "center",
  },
  buttonIcon: {
    marginRight: Mixins.scaleSize(12),
    color: Colors.CV_YELLOW,
  },
  buttonText: {
    ...Typography.FONT_MEDIUM,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.CV_YELLOW,
  },
});

const mapStateToProps = (state) => {
  return {
    wallet: state.wallet,
    user: state.user,
    bills: state.bills,
    airtime: state.airtime,
    data: state.data,
  };
};

const mapDispatchToProps = {
  showToast,
  updateDataPurchase,
  updateAirtimePurchase,
  getBillerCategories,
  addNotification,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(Airtime));

// import React, { Component } from "react";
// import { BackHandler, Text, View } from "react-native";
// import { withNavigationFocus } from "react-navigation";
// import { connect } from "react-redux";

// import { showToast } from "_actions/toast_actions";
// import { updateAirtimePurchase } from "_actions/airtime_actions";

// import { Dictionary, Util } from "_utils";
// import { SharedStyle, FormStyle } from "_styles";
// import { SubHeader, FloatingLabelInput, ProgressBar } from "_atoms";
// import { default as ScrollView } from "_atoms/scroll_view";
// import { PrimaryButton } from "_molecules";
// import { MainHeader } from "_organisms";

// class Airtime extends Component {
//   state = {
//     amount: "",
//     amount_error: "",
//     commaValues: "",
//   };

//   componentDidMount() {
//     BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
//   }

//   componentWillUnmount() {
//     BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
//   }

//   handleBackButton = () => {
//     if (this.props.isFocused) {
//       this.props.navigation.navigate("Dashboard");

//       return true;
//     }
//   };

//   validate = () => {
//     let is_valid = true;
//     let amount = this.state.amount;

//     if (!Util.isValidAmount(amount)) {
//       this.setState({
//         amount_error: Dictionary.ENTER_VALID_AMOUNT,
//       });

//       is_valid = false;
//     }

//     if (+amount > Number(this.props.wallet.wallet_data.account_balance)) {
//       this.setState({
//         amount_error: Dictionary.CANNOT_EXECEED_BALANCE,
//       });

//       is_valid = false;
//     }

//     return is_valid;
//   };

//   handleSubmit = () => {
//     if (!this.validate()) {
//       return;
//     }

//     if (this.props.wallet.wallet_data_error) {
//       this.props.showToast(this.props.wallet.wallet_data_error);
//       return;
//     }

//     let { amount } = this.state;

//     this.props.updateAirtimePurchase({ amount });

//     this.props.navigation.navigate("AirtimeBeneficiary");
//     Util.logEventData("transactions_start_airtime", { amount });
//   };

//   handleOnchangeText = (text) => {
//     // remove any commas from the current value
//     const currentValue = text.replace(/,/g, "");

//     const removeDecimals = currentValue.replace(/\D/g, "");

//     // add commas every three digits
//     const formattedValue = removeDecimals.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

//     // const formatDecimal = _d.length < 2 ? formattedValue : `${text}`

//     this.setState({
//       amount: text.replace(/\D/g, ""),
//       amount_error: "",
//       commaValues: formattedValue,
//     });
//   };

//   render() {
//     return (
//       <View style={SharedStyle.mainContainer}>
//         <MainHeader
//           leftIcon="arrow-left"
//           onPressLeftIcon={this.handleBackButton}
//           title={Dictionary.AIRTIME_HEADER}
//         />
//         <ScrollView {...this.props} hasButtomButtons={true}>
//           <SubHeader text={Dictionary.AIRTIME_AMOUNT_SUB_HEADER} />
//           <ProgressBar progress={0.4} />
//           <View style={FormStyle.formContainer}>
//             <View style={FormStyle.formItem}>
//               <FloatingLabelInput
//                 label={Dictionary.AMOUNT_LABEL}
//                 value={this.state.commaValues}
//                 keyboardType={"number-pad"}
//                 multiline={false}
//                 autoCorrect={false}
//                 onChangeText={this.handleOnchangeText}
//                 // onChangeText={text => this.setState({
//                 //     amount: text.replace(/\D/g, ''),
//                 //     amount_error: ''
//                 // })}
//               />
//               <Text style={FormStyle.formError}>{this.state.amount_error}</Text>
//               <Text style={SharedStyle.balanceLabel}>
//                 {Dictionary.BALANCE}{" "}
//                 <Text style={SharedStyle.balanceValue}>
//                   ₦{Util.formatAmount(Number(this.props.wallet.wallet_balance))}
//                 </Text>
//               </Text>
//             </View>
//           </View>
//           <View style={SharedStyle.bottomPanel}>
//             <View style={FormStyle.formButton}>
//               <PrimaryButton
//                 title={Dictionary.CONTINUE_BTN}
//                 icon="arrow-right"
//                 onPress={this.handleSubmit}
//               />
//             </View>
//           </View>
//         </ScrollView>
//       </View>
//     );
//   }
// }

// const mapStateToProps = (state) => {
//   return {
//     wallet: state.wallet,
//     user: state.user,
//   };
// };

// const mapDispatchToProps = {
//   showToast,
//   updateAirtimePurchase,
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(withNavigationFocus(Airtime));
