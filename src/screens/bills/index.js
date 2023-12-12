import React, { Component } from "react";
import {
  BackHandler,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { default as ScrollView } from "_atoms/scroll_view";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import { showToast } from "_actions/toast_actions";
import { addNotification } from "_actions/notification_actions";
import {
  getBillerCategories,
  resetBillPayment,
  updateBillPayment,
} from "_actions/bills_actions";
import { Dictionary, Util } from "_utils";
import { Colors, Mixins, SharedStyle, FormStyle, Typography } from "_styles";
import { MainHeader, AuthorizeTransaction } from "_organisms";
import { MaterialIcons } from "@expo/vector-icons";
import Modal from "react-native-modal";
import { PrimaryButton, SelectListItem } from "_molecules";
import { Network } from "_services";

class Bills extends Component {
  constructor(props) {
    super(props);
    const { category } = this.props.bills.bill_payment;
    const categories = this.props.bills.categories.filter(
      (item) => item.slug != "data_bundle" && item.slug != "airtime"
    );
    this.state = {
      categories,
      category: categories[0],
      category_value: "",
      modalVisible: false,
      billerModalVisible: false,
      packageModalVisible: false,
      action: "cable",
      uniqueNumber: "",
      biller: null,
      amount: null,
      bill_package: null,
      billers: [],
      packages: [],
      processing: false,
      auth_screen_visible: false,
      pin_error: "",
      fetchingBillers: false,
      fetchingPackages: false,
      customer: null,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    if (this.props.bills.categories.length === 0) {
      this.props.getBillerCategories();
    }

    this.getCategoryBillers("cable");
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
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

  handleBackButton = () => {
    if (this.props.isFocused) {
      this.props.navigation.navigate("Dashboard");

      return true;
    }
  };

  setScrollRef = (scrollRef) => {
    this.scrollRef = scrollRef;
  };

  handleSelectedCategory = (category) => {
    if (category.name != this.state.category?.name) {
      this.setState({
        category,
        modalVisible: false,
        biller: null,
        bill_package: null,
      });

      this.getCategoryBillers(category.slug);
    } else {
      this.setState({
        modalVisible: false,
      });
    }
  };

  handleSelectedBller = (biller) => {
    if (biller.billerCode != this.state.biller?.billerCode) {
      this.setState({
        biller,
        bill_package: null,
        biller_value: biller.billerCode,
        billerModalVisible: false,
      });

      this.getBillerPackages(biller.billerCode);
    } else {
      this.setState({
        billerModalVisible: false,
      });
    }
  };

  handleSelectedPackage = (bill_package) => {
    this.setState({
      bill_package,
      packageModalVisible: false,
      amount: this.state.category?.slug == "cable" ? bill_package.amount : null,
    });
  };

  getCategoryBillers = (slug) => {
    this.setState({ fetchingBillers: true });
    Network.getCategoryBillers(slug)
      .then((result) => {
        this.setState({ fetchingBillers: false }, () => {
          let billers = result.billscategories.billers;
          if (!billers || !Array.isArray(billers) || billers.length < 1) {
            this.props.showToast(
              result.data.message || Dictionary.GENERAL_ERROR
            );
            this.handleBackButton();
          } else {
            this.setState({
              billers,
            });
          }
        });
      })
      .catch((error) => {
        this.setState({ processing: false }, () => {
          this.props.showToast(error.message);
          this.handleBackButton();
        });
      });
  };

  getBillerPackages = (billerCode) => {
    this.setState({ fetchingPackages: true }, () => {
      Network.getBillerItems(billerCode)
        .then((result) => {
          this.setState({ fetchingPackages: false }, () => {
            let packages = result.billscategories.billers || [];
            if (!packages || !Array.isArray(packages) || packages.length < 1) {
              this.props.showToast(
                result.data.message || Dictionary.GENERAL_ERROR
              );
              this.handleBackButton();
            } else {
              this.setState({
                packages,
              });
            }
          });
        })
        .catch((error) => {
          this.setState({ processing: false }, () => {
            this.props.showToast(error.message);
            this.handleBackButton();
          });
        });
    });
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
            let { bill_package, customer, transaction_amount, category } =
              this.state;
            let payload;
            if (category.slug == "cable") {
              payload = {
                amount: transaction_amount,
                paymentCode: bill_package.billerName,
                customerID: customer?.customer_id,
                pin,
                billType: category.slug,
                accountID: this.props.user.user_data.nuban,
              };
            } else {
              payload = {
                amount: transaction_amount,
                paymentCode: bill_package.billerName,
                customerID: customer?.customer_id,
                pin,
                billType: category.slug,
                accountID: this.props.user.user_data.nuban,
              };
            }
            let apiCall =
              category.slug == "cable" ? Network.payCableBill : Network.payBill;

            apiCall(payload)
              .then((result) => {
                this.setState(
                  {
                    processing: false,
                    auth_screen_visible: false,
                  },
                  () => {
                    let success_message = Dictionary.BILL_PURCHASED;
                    success_message = success_message
                      .replace("%s", bill_package.name)
                      .replace("%s", transaction_amount);
                    this.props.navigation.navigate("Success", {
                      event_name: "Transactions_successful_bills",
                      event_data: { transaction_id: result.data?.reference },
                      success_message,
                      transaction_data: {
                        ...result.data,
                        transaction_date:
                          result.data?.transaction_date ||
                          moment().format("yyyy-MM-dd HH:mm:ss"),
                      },
                    });
                    this.props.addNotification({
                      id: randomId(),
                      is_read: false,
                      title: "Bills payment",
                      description: `You have successfully paid for ${bill_package.billerName} on ${customer.customer_id} for NGN${transaction_amount}.`,
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
                    pin_error: error.message,
                  });
                } else {
                  this.setState(
                    {
                      processing: false,
                      auth_screen_visible: false,
                    },
                    () => {
                      this.props.navigation.navigate("Error", {
                        event_name: "transactions_failed_bills",
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

  render() {
    const disabledButton =
      !this.state.biller ||
      !this.state.bill_package ||
      !this.state.amount ||
      !this.state.uniqueNumber;
    let { biller, bill_package, transaction_amount, customer } = this.state;

    let amount_due =
      Number(transaction_amount) + Number(bill_package?.fee || 0);
    return (
      <View style={{ flex: 1 }}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.BILL_PAYMENT}
        />
        <View
          style={{
            padding: 10,
            flex: 1,
            paddingHorizontal: Mixins.scaleSize(17),
          }}
        >
          <Text
            style={{
              ...Typography.FONT_BOLD,
              fontSize: Mixins.scaleFont(16),
              color: Colors.BLACK,
              marginBottom: Mixins.scaleSize(23),
              marginTop: Mixins.scaleSize(25),
            }}
          >
            Select Category
          </Text>
          <View
            style={[
              styles.packageContainer,
              {
                paddingHorizontal: Mixins.scaleSize(17),
              },
            ]}
          >
            <Text style={styles.selectPackages}>Select Category</Text>
            <View style={styles.categoryBox}>
              <Text>
                {this.state.category ? this.state.category?.name : null}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  this.openModal();
                }}
              >
                <MaterialIcons
                  name={"keyboard-arrow-down"}
                  size={Mixins.scaleSize(30)}
                  color={"#8397B1"}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={[
              styles.packageContainer,
              {
                paddingHorizontal: Mixins.scaleSize(17),
              },
            ]}
          >
            <Text style={styles.selectPackages}>Select Preferred Biller</Text>
            <View style={styles.categoryBox}>
              <Text>
                {this.state.biller ? this.state.biller.name : "-:-:-"}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  this.setState({ billerModalVisible: true });
                }}
              >
                <MaterialIcons
                  name={"keyboard-arrow-down"}
                  size={Mixins.scaleSize(30)}
                  color={"#8397B1"}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={[
              styles.packageContainer,
              {
                paddingHorizontal: Mixins.scaleSize(17),
              },
            ]}
          >
            <Text style={styles.selectPackages}>Select Package</Text>
            <View style={styles.categoryBox}>
              <Text>
                {this.state.bill_package
                  ? this.state.bill_package.name
                  : "-:-:-"}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  this.setState({ packageModalVisible: true });
                }}
              >
                <MaterialIcons
                  name={"keyboard-arrow-down"}
                  size={Mixins.scaleSize(30)}
                  color={"#8397B1"}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={[
              styles.packageContainer,
              {
                paddingHorizontal: Mixins.scaleSize(17),
              },
            ]}
          >
            <TextInput
              value={this.state.uniqueNumber}
              placeholder="Unique Number"
              onChangeText={(value) => {
                this.setState({ uniqueNumber: value });
              }}
              style={{ marginTop: 10 }}
              {...customer?.customer_id}
            />
          </View>
          <View
            style={[
              styles.packageContainer,
              {
                paddingHorizontal: Mixins.scaleSize(17),
              },
            ]}
          >
            <TextInput
              keyboardType="number-pad"
              disabled={this.state.category?.slug == "cable"}
              // value={this.state.amount}
              value={this.state.amount}
              placeholder="Enter Amount"
              onChangeText={(amount) => {
                this.setState({ amount });
              }}
              style={{ marginTop: 10 }}
            />
          </View>
          <View style={[SharedStyle.bottomPanel, styles.bottomPanel]}>
            <View style={FormStyle.formButton}>
              <PrimaryButton
                title={Dictionary.CONTINUE_BTN}
                icon="arrow-right"
                disabled={disabledButton}
                onPress={this.handleTransactionAuthorization}
              />
            </View>
          </View>
        </View>
        {this.state.auth_screen_visible && (
          <AuthorizeTransaction
            title={bill_package.name}
            isVisible={this.state.auth_screen_visible}
            isProcessing={this.state.processing}
            pinError={this.state.pin_error}
            resetError={() => this.setState({ pin_error: "" })}
            onSubmit={this.handleSubmit}
            onCancel={this.cancelTransactionAuthorization}
          />
        )}
        <Modal
          // transparent={true}
          isVisible={this.state.modalVisible}
          style={{
            margin: 0,
            width: "100%",
            bottom: 0,
            height: 0,
            alignSelf: "center",
          }}
          animationIn={"slideInUp"}
          backdropOpacity={0.5}
          onBackdropPress={() => this.closeModal()}
        >
          <View
            style={{
              position: "absolute",
              width: "100%",
              top: Mixins.scaleSize(120),
              borderTopLeftRadius: Mixins.scaleSize(10),
              borderTopRightRadius: Mixins.scaleSize(10),
              borderBottomLeftRadius: Mixins.scaleSize(10),
              borderBottomRightRadius: Mixins.scaleSize(10),
              backgroundColor: "white",
              // flex: 1,
            }}
          >
            {this.state.categories.map((category, index) => {
              return (
                <SelectListItem
                  key={index}
                  image={{ uri: category.logo_url }}
                  title={category.name}
                  description={category.description}
                  onPress={() => this.handleSelectedCategory(category)}
                  selected={
                    this.state.category.short_code === category?.short_code
                  }
                />
              );
            })}
          </View>
        </Modal>
        <Modal
          isVisible={this.state.billerModalVisible}
          animationIn={"slideInUp"}
          backdropOpacity={0.5}
          style={{ margin: 0, width: "100%", bottom: 0 }}
          onBackdropPress={() => this.setState({ billerModalVisible: false })}
        >
          <View
            // style={{
            //   position: "absolute",
            //   width: "100%",
            //   top: Mixins.scaleSize(280),
            //   borderTopLeftRadius: Mixins.scaleSize(10),
            //   borderTopRightRadius: Mixins.scaleSize(10),
            //   borderBottomLeftRadius: Mixins.scaleSize(10),
            //   borderBottomRightRadius: Mixins.scaleSize(10),
            //   backgroundColor: "white",
            //   // flex: 1,
            // }}
            style={{
              position: "absolute",
              width: "100%",
              height: Mixins.scaleSize(480),
              borderTopLeftRadius: Mixins.scaleSize(10),
              borderTopRightRadius: Mixins.scaleSize(10),
              backgroundColor: "white",
              bottom: 0,
              paddingHorizontal: Mixins.scaleSize(18),
              paddingTop: Mixins.scaleSize(18),
            }}
          >
            <FlatList
              data={this.state.billers}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item: biller, index }) => (
                <SelectListItem
                  key={index}
                  title={biller.name}
                  onPress={() => this.handleSelectedBiller(biller)}
                  selected={this.state.biller?.name === biller.name}
                />
              )}
              contentContainerStyle={{
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false} // Add this line
            />
          </View>
        </Modal>
        <Modal
          // transparent={true}
          // isVisible={this.state.packageModalVisible}
          // style={{ margin: 0, width: "100%", bottom: 0 }}
          // animationIn={"slideInUp"}
          // backdropOpacity={0.5}
          // onBackdropPress={() => this.setState({ packageModalVisible: false })}
          isVisible={this.state.packageModalVisible}
          animationIn={"slideInUp"}
          backdropOpacity={0.5}
          style={{ margin: 0, width: "100%", bottom: 0 }}
          onBackdropPress={() => this.setState({ packageModalVisible: false })}
        >
          <View
            // style={{
            //   position: "absolute",
            //   width: "100%",
            //   top: Mixins.scaleSize(280),
            //   borderTopLeftRadius: Mixins.scaleSize(10),
            //   borderTopRightRadius: Mixins.scaleSize(10),
            //   borderBottomLeftRadius: Mixins.scaleSize(10),
            //   borderBottomRightRadius: Mixins.scaleSize(10),
            //   backgroundColor: "white",
            //   borderRadius: Mixins.scaleSize(10),
            //   // flex: 1,
            // }}
            style={{
              position: "absolute",
              width: "100%",
              height: Mixins.scaleSize(480),
              borderTopLeftRadius: Mixins.scaleSize(10),
              borderTopRightRadius: Mixins.scaleSize(10),
              backgroundColor: "white",
              bottom: 0,
              paddingHorizontal: Mixins.scaleSize(18),
              paddingTop: Mixins.scaleSize(18),
            }}
          >
            <FlatList
              data={this.state.packages}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item: bill_package, index }) => (
                <SelectListItem
                  key={index}
                  title={bill_package.name}
                  onPress={() => this.handleSelectedPackage(bill_package)}
                  selected={this.state.bill_package?.name === bill_package.name}
                />
              )}
              contentContainerStyle={{
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false} // Add this line
            />
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  selectPackages: {
    fontSize: Mixins.scaleFont(11),
    color: "#8397B1",
    marginTop: Mixins.scaleSize(5),
    ...Typography.FONT_MEDIUM,
  },
  select: {
    fontSize: Mixins.scaleFont(11),
    color: "#28374C",
    paddingTop: Mixins.scaleSize(7),
    ...Typography.FONT_REGULAR,
  },
  categoryBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  container: {
    flex: 1,
  },
  header: {
    ...Mixins.margin(60, 20, 20, 20),
    ...Typography.FONT_MEDIUM,
    fontSize: Mixins.scaleFont(36),
    lineHeight: Mixins.scaleSize(42),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.CV_BLUE,
  },
  subheader: {
    ...Typography.FONT_REGULAR,
    fontSize: Mixins.scaleFont(16),
    lineHeight: Mixins.scaleSize(19),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.CV_BLUE,
    marginHorizontal: Mixins.scaleSize(20),
  },
  content: {
    flex: 1,
    paddingBottom: Mixins.scaleSize(65),
  },
  bottomPanel: {
    // backgroundColor: Colors.WHITE,
    alignSelf: "center",
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    wallet: state.wallet,
    bills: state.bills,
  };
};

const mapDispatchToProps = {
  showToast,
  getBillerCategories,
  resetBillPayment,
  updateBillPayment,
  addNotification,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(Bills));

// import React, { Component } from "react";
// import {
//   BackHandler,
//   StyleSheet,
//   ActivityIndicator,
//   ImageBackground,
//   View,
//   Text,
//   Flatlist,
//   TouchableOpacity,
//   ScrollView,
//   TextInput,
// } from "react-native";
// import { withNavigationFocus } from "react-navigation";
// import { connect } from "react-redux";
// import { showToast } from "_actions/toast_actions";
// import { addNotification } from "_actions/notification_actions";
// import {
//   getBillerCategories,
//   resetBillPayment,
//   updateBillPayment,
// } from "_actions/bills_actions";
// import { Dictionary, Util } from "_utils";
// import { Colors, Mixins, SharedStyle, FormStyle, Typography } from "_styles";
// // import { ScrollView } from "_atoms";
// import { MaterialIcons } from "@expo/vector-icons";
// import Modal from "react-native-modal";
// import { PrimaryButton, SelectListItem } from "_molecules";
// import { Network } from "_services";
// import { MainHeader, AuthorizeTransaction } from "_organisms";

// class Bills extends Component {
//   constructor(props) {
//     super(props);

//     const { category } = this.props.bills.bill_payment;
//     const categories = this.props.bills.categories.filter(
//       (item) => item.slug != "data_bundle" && item.slug != "airtime"
//     );
//     this.state = {
//       categories,
//       category: categories[0],
//       category_value: "",
//       modalVisible: false,
//       billerModalVisible: false,
//       packageModalVisible: false,
//       action: "cable",
//       uniqueNumber: "",
//       biller: null,
//       amount: null,
//       bill_package: null,
//       billers: [],
//       packages: [],
//       processing: false,
//       auth_screen_visible: false,
//       pin_error: "",
//       fetchingBillers: false,
//       fetchingPackages: false,
//     };
//   }

//   componentDidMount() {
//     // console.log({ props: this.props });
//     BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
//     if (this.props.bills.categories.length === 0) {
//       this.props.getBillerCategories();
//     }

//     this.getCategoryBillers("cable");
//   }

//   componentWillUnmount() {
//     BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
//   }

//   openModal = () => {
//     this.setState({ modalVisible: true });
//   };
//   closeModal = () => {
//     this.setState({ modalVisible: false });
//   };
//   handleItemPress = (item) => {
//     this.setState({ selectedItem: item });
//     this.closeModal();
//   };
//   handleBackButton = () => {
//     if (this.props.isFocused) {
//       this.props.navigation.navigate("Dashboard");

//       return true;
//     }
//   };
//   setScrollRef = (scrollRef) => {
//     this.scrollRef = scrollRef;
//   };

//   handleSelectedCategory = (category) => {
//     if (category.name != this.state.category?.name) {
//       this.setState({
//         category,
//         modalVisible: false,
//         biller: null,
//         bill_package: null,
//       });

//       this.getCategoryBillers(category.slug);
//     } else {
//       this.setState({
//         modalVisible: false,
//       });
//     }
//   };

//   handleSelectedBller = (biller) => {
//     if (biller.billerCode != this.state.biller?.billerCode) {
//       this.setState({
//         biller,
//         bill_package: null,
//         biller_value: biller.billerCode,
//         billerModalVisible: false,
//       });

//       this.getBillerPackages(biller.billerCode);
//     } else {
//       this.setState({
//         billerModalVisible: false,
//       });
//     }
//   };

//   handleSelectedPackage = (bill_package) => {
//     this.setState({
//       bill_package,
//       packageModalVisible: false,
//       amount: this.state.category?.slug == "cable" ? bill_package?.amount : null,
//     });
//   };

//   getCategoryBillers = (slug) => {
//     this.setState({ fetchingBillers: true });
//     // let code = "";

//     // console.log({ slug: this.state.category.slug });
//     Network.getCategoryBillers(slug)
//       .then((result) => {
//         // console.log({ result });
//         this.setState({ fetchingBillers: false }, () => {
//           let billers = result.billscategories.billers;
//           if (!billers || !Array.isArray(billers) || billers.length < 1) {
//             this.props.showToast(
//               result.data.message || Dictionary.GENERAL_ERROR
//             );
//             this.handleBackButton();
//           } else {
//             this.setState({
//               billers,
//             });
//           }
//         });
//       })
//       .catch((error) => {
//         this.setState({ processing: false }, () => {
//           this.props.showToast(error.message);
//           this.handleBackButton();
//         });
//       });
//   };

//   getBillerPackages = (billerCode) => {
//     this.setState({ fetchingPackages: true }, () => {
//       Network.getBillerItems(billerCode)
//         .then((result) => {
//           this.setState({ fetchingPackages: false }, () => {
//             let packages = result.billscategories.billers || [];
//             if (!packages || !Array.isArray(packages) || packages.length < 1) {
//               this.props.showToast(
//                 result.data.message || Dictionary.GENERAL_ERROR
//               );
//               this.handleBackButton();
//             } else {
//               this.setState({
//                 packages,
//               });
//             }
//           });
//         })
//         .catch((error) => {
//           this.setState({ processing: false }, () => {
//             this.props.showToast(error.message);
//             this.handleBackButton();
//           });
//         });
//     });
//   };

//   handleTransactionAuthorization = () => {
//     this.setState({
//       auth_screen_visible: true,
//       pin_error: "",
//     });
//   };

//   cancelTransactionAuthorization = () => {
//     this.setState({
//       auth_screen_visible: false,
//     });
//   };

//   handleSubmit = (pin) => {
//     this.setState(
//       {
//         processing: true,
//       },
//       () => {
//         Network.validatePIN(pin)
//           .then(() => {
//             let { bill_package, customer, transaction_amount, category } =
//               this.state;
//             let payload;
//             if (category.slug == "cable") {
//               payload = {
//                 amount: transaction_amount,
//                 paymentCode: bill_package?.billerName,
//                 customerID: customer?.customer_id,
//                 pin,
//                 billType: category?.slug,
//                 accountID: this.props.user.user_data.nuban,
//               };
//             } else {
//               payload = {
//                 amount: transaction_amount,
//                 paymentCode: bill_package?.billerName,
//                 customerID: customer?.customer_id,
//                 pin,
//                 billType: category?.slug,
//                 accountID: this.props.user.user_data.nuban,
//               };
//             }
//             // let payload = {
//             //     amount: transaction_amount,
//             //     paymentCode: bill_package.biller_name,
//             //     customerID: customer.customer_id,
//             //     pin,
//             //     billType:category.slug,
//             //     accountID: this.props.user.wallet_id,
//             // };

//             // let payload = {
//             //     transaction_amount: transaction_amount,
//             //     payment_code: category.slug=="cable"?"DSTV Payment":"IKEDC TOP UP (PREPAID)",
//             //     customer_id:category.slug=="cable"? "0025401100":"45053878653",
//             //     pin,
//             //     bill_type:category.slug,
//             //     account_id: "01500112732",
//             // };

//             let apiCall =
//               category.slug == "cable" ? Network.payCableBill : Network.payBill;

//             apiCall(payload)
//               .then((result) => {
//                 this.setState(
//                   {
//                     processing: false,
//                     auth_screen_visible: false,
//                   },
//                   () => {
//                     let success_message = Dictionary.BILL_PURCHASED;
//                     success_message = success_message
//                       .replace("%s", bill_package?.name)
//                       .replace("%s", transaction_amount);
//                     this.props.navigation.navigate("Success", {
//                       event_name: "Transactions_successful_bills",
//                       event_data: { transaction_id: result.data?.reference },
//                       success_message,
//                       transaction_data: {
//                         ...result.data,
//                         transaction_date:
//                           result.data?.transaction_date ||
//                           moment().format("yyyy-MM-dd HH:mm:ss"),
//                       },
//                     });
//                     this.props.addNotification({
//                       id: randomId(),
//                       is_read: false,
//                       title: "Bills payment",
//                       description: `You have successfully paid for ${bill_package?.billerName} on ${customer?.customer_id} for NGN${transaction_amount}.`,
//                       timestamp: moment().toString(),
//                     });
//                   }
//                 );
//               })
//               .catch((error) => {
//                 if (
//                   error.message &&
//                   error.message.toLowerCase().includes("pin")
//                 ) {
//                   this.setState({
//                     processing: false,
//                     pin_error: error.message,
//                   });
//                 } else {
//                   this.setState(
//                     {
//                       processing: false,
//                       auth_screen_visible: false,
//                     },
//                     () => {
//                       this.props.navigation.navigate("Error", {
//                         event_name: "transactions_failed_bills",
//                         error_message:
//                           error.message ||
//                           "Could not perform transaction at this time.",
//                       });
//                     }
//                   );
//                 }
//               });
//           })
//           .catch((error) => {
//             this.setState({
//               processing: false,
//               pin_error: error.message,
//             });
//           });
//       }
//     );
//   };

//   render() {
//     const disabledButton =
//       !this.state.biller ||
//       !this.state.bill_package ||
//       !this.state.amount ||
//       !this.state.uniqueNumber;

//     return (
//       <View style={{ flex: 1 }}>
//         <MainHeader
//           leftIcon="arrow-left"
//           onPressLeftIcon={this.handleBackButton}
//           title={Dictionary.BILL_PAYMENT}
//         />
//         <ScrollView
//           // {...this.props}
//           // setScrollRef={this.setScrollRef}
//           contentContainerStyle={{ flexGrow: 1 }}
//           style={{ padding: 10, flex: 1 }}
//         >
//           <Text
//             style={{
//               fontSize: 16,
//               marginBottom: 10,
//               ...Typography.FONT_MEDIUM,
//             }}
//           >
//             Select Category
//           </Text>
//           <View
//             style={[
//               styles.packageContainer,
//               {
//                 paddingHorizontal: 10,
//               },
//             ]}
//           >
//             <Text style={styles.selectPackages}>Select Category</Text>

//             <View style={styles.categoryBox}>
//               <Text>
//                 {this.state.category ? this.state.category.name : null}
//               </Text>
//               <TouchableOpacity
//                 onPress={() => {
//                   // this.props.getBillerCategories();
//                   this.openModal();
//                 }}
//               >
//                 <MaterialIcons
//                   name={"keyboard-arrow-down"}
//                   size={Mixins.scaleSize(30)}
//                   color={"#666"}
//                 />
//               </TouchableOpacity>
//             </View>
//           </View>
//           <View
//             style={[
//               styles.packageContainer,
//               {
//                 paddingHorizontal: 10,
//               },
//             ]}
//           >
//             <Text style={styles.selectPackages}>Select Preferred Biller</Text>

//             <View style={styles.categoryBox}>
//               <Text>
//                 {this.state.biller ? this.state.biller.name : "-:-:-"}
//               </Text>
//               {this.state.fetchingBillers ? (
//                 <ActivityIndicator color={"grey"} />
//               ) : (
//                 <TouchableOpacity
//                   onPress={() => {
//                     // this.props.getBillerCategories();
//                     this.setState({ billerModalVisible: true });
//                   }}
//                 >
//                   <MaterialIcons
//                     name={"keyboard-arrow-down"}
//                     size={Mixins.scaleSize(30)}
//                     color={"#666"}
//                   />
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>
//           <View
//             style={[
//               styles.packageContainer,
//               {
//                 paddingHorizontal: 10,
//               },
//             ]}
//           >
//             <Text style={styles.selectPackages}>Select Package</Text>

//             <View style={styles.categoryBox}>
//               <Text>
//                 {this.state.bill_package
//                   ? this.state.bill_package?.name
//                   : "-:-:-"}
//               </Text>
//               {this.state.fetchingPackages ? (
//                 <ActivityIndicator color={"grey"} />
//               ) : (
//                 <TouchableOpacity
//                   onPress={() => {
//                     // this.props.getBillerCategories();
//                     this.setState({ packageModalVisible: true });
//                   }}
//                 >
//                   <MaterialIcons
//                     name={"keyboard-arrow-down"}
//                     size={Mixins.scaleSize(30)}
//                     color={"#666"}
//                   />
//                 </TouchableOpacity>
//               )}
//             </View>
//           </View>

//           <View style={{ marginBottom: 16 }}>
//             <TextInput
//               style={{
//                 borderWidth: 2,
//                 borderColor: "gray",
//                 borderRadius: 10,
//                 paddingHorizontal: 10,
//               }}
//               value={this.state.uniqueNumber}
//               placeholder="Unique Number"
//               onChangeText={(value) => {
//                 this.setState({ uniqueNumber: value });
//               }}
//             />
//           </View>
//           <View>
//             <TextInput
//               style={{
//                 borderWidth: 2,
//                 borderColor: "gray",
//                 borderRadius: 10,
//                 paddingHorizontal: 10,
//               }}
//               keyboardType="number-pad"
//               disabled={this.state.category?.slug == "cable"}
//               value={this.state.amount}
//               placeholder="Enter Amount"
//               onChangeText={(amount) => {
//                 this.setState({ amount });
//               }}
//             />
//           </View>

//           <View style={[SharedStyle.bottomPanel, styles.bottomPanel]}>
//             <View style={FormStyle.formButton}>
//               <PrimaryButton
//                 title={Dictionary.CONTINUE_BTN}
//                 icon="arrow-right"
//                 disable={disabledButton}
//                 onPress={this.handleTransactionAuthorization}
//               />
//             </View>
//           </View>
//         </ScrollView>
//         <Modal
//           // transparent={true}
//           isVisible={this.state.modalVisible}
//           style={{ margin: 0, width: "100%", bottom: 0 }}
//           animationIn={"slideInUp"}
//           backdropOpacity={0.5}
//           onBackdropPress={() => this.closeModal()}
//         >
//           <View
//             style={{
//               position: "absolute",
//               width: "100%",
//               top: Mixins.scaleSize(280),
//               borderTopLeftRadius: Mixins.scaleSize(10),
//               borderTopRightRadius: Mixins.scaleSize(10),
//               backgroundColor: "white",
//               // flex: 1,
//             }}
//           >
//             {this.state.categories.map((category, index) => {
//               return (
//                 <SelectListItem
//                   key={index}
//                   image={{ uri: category.logo_url }}
//                   title={category.name}
//                   description={category.description}
//                   onPress={() => this.handleSelectedCategory(category)}
//                   selected={
//                     this.state.category.short_code === category?.short_code
//                   }
//                 />
//               );
//             })}
//           </View>
//         </Modal>
//         <Modal
//           // transparent={true}
//           isVisible={this.state.billerModalVisible}
//           style={{ margin: 0, width: "100%", bottom: 0 }}
//           animationIn={"slideInUp"}
//           backdropOpacity={0.5}
//           onBackdropPress={() => this.setState({ billerModalVisible: false })}
//         >
//           <View
//             style={{
//               position: "absolute",
//               width: "100%",
//               top: Mixins.scaleSize(280),
//               borderTopLeftRadius: Mixins.scaleSize(10),
//               borderTopRightRadius: Mixins.scaleSize(10),
//               backgroundColor: "white",
//               // flex: 1,
//             }}
//           >
//             {this.state.billers.map((biller, index) => {
//               return (
//                 <SelectListItem
//                   key={index}
//                   title={biller.name}
//                   onPress={() => this.handleSelectedBller(biller)}
//                   selected={this.state.biller?.name == biller.name}
//                 />
//               );
//             })}
//           </View>
//         </Modal>
//         <Modal
//           // transparent={true}
//           isVisible={this.state.packageModalVisible}
//           style={{ margin: 0, width: "100%", bottom: 0 }}
//           animationIn={"slideInUp"}
//           backdropOpacity={0.5}
//           onBackdropPress={() => this.setState({ packageModalVisible: false })}
//         >
//           <View
//             style={{
//               position: "absolute",
//               width: "100%",
//               top: Mixins.scaleSize(280),
//               borderTopLeftRadius: Mixins.scaleSize(10),
//               borderTopRightRadius: Mixins.scaleSize(10),
//               backgroundColor: "white",
//               // flex: 1,
//             }}
//           >
//             {this.state.packages.map((bill_package, index) => {
//               return (
//                 <SelectListItem
//                   key={index}
//                   title={bill_package?.name}
//                   onPress={() => this.handleSelectedPackage(bill_package)}
//                   selected={
//                     this.state.biller_package?.name === bill_package?.name
//                   }
//                 />
//               );
//             })}
//           </View>
//         </Modal>
//         {this.state.auth_screen_visible && (
//           <AuthorizeTransaction
//             title={bill_package?.name}
//             isVisible={this.state.auth_screen_visible}
//             isProcessing={this.state.processing}
//             pinError={this.state.pin_error}
//             resetError={() => this.setState({ pin_error: "" })}
//             onSubmit={this.handleSubmit}
//             onCancel={this.cancelTransactionAuthorization}
//           />
//         )}
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   selectPackages: {
//     fontSize: Mixins.scaleFont(11),
//     color: Colors.LIGHT_GREY,
//     marginTop: Mixins.scaleSize(5),
//     paddingVertical: 5,
//   },
//   categoryBox: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   packageContainer: {
//     width: "100%",
//     height: Mixins.scaleSize(55),
//     borderColor: Colors.GREY,
//     borderWidth: 1,
//     borderRadius: Mixins.scaleSize(3),
//     marginBottom: Mixins.scaleSize(10),
//     paddingHorizontal: Mixins.scaleSize(5),

//     // alignItems: "center",
//   },
//   container: {
//     flex: 1,
//   },
//   header: {
//     ...Mixins.margin(60, 20, 20, 20),
//     ...Typography.FONT_MEDIUM,
//     fontSize: Mixins.scaleFont(36),
//     lineHeight: Mixins.scaleSize(42),
//     letterSpacing: Mixins.scaleSize(0.01),
//     color: Colors.CV_BLUE,
//   },
//   subheader: {
//     ...Typography.FONT_REGULAR,
//     fontSize: Mixins.scaleFont(16),
//     lineHeight: Mixins.scaleSize(19),
//     letterSpacing: Mixins.scaleSize(0.01),
//     color: Colors.CV_BLUE,
//     marginHorizontal: Mixins.scaleSize(20),
//   },
//   content: {
//     flex: 1,
//     paddingBottom: Mixins.scaleSize(65),
//   },
//   bottomPanel: {
//     backgroundColor: Colors.WHITE,
//   },
// });

// const mapStateToProps = (state) => {
//   return {
//     user: state.user,
//     wallet: state.wallet,
//     bills: state.bills,
//   };
// };

// const mapDispatchToProps = {
//   showToast,
//   getBillerCategories,
//   resetBillPayment,
//   updateBillPayment,
//   addNotification,
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(withNavigationFocus(Bills));
