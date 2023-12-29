// import React, { Component } from "react";
// import { BackHandler, StyleSheet, Text, View } from "react-native";
// import { withNavigationFocus } from "react-navigation";
// import { connect } from "react-redux";
// import moment from "moment";

// import { showToast } from "_actions/toast_actions";
// import { getTransactionFeeTypes } from "_actions/transaction_actions";
// import { getUserSavings } from "_actions/savings_actions";

// import { Dictionary, Util, ResponseCodes } from "_utils";
// import { Colors, Mixins, FormStyle, SharedStyle } from "_styles";
// import { SubHeader, FloatingLabelInput } from "_atoms";
// import { default as ScrollView } from "_atoms/scroll_view";
// import { PrimaryButton, SavingsPenalWarning } from "_molecules";
// import { MainHeader, AuthorizeTransaction } from "_organisms";

// import { Network } from "_services";
// import { addNotification } from "_actions/notification_actions";
// import { randomId } from "../../utils/util";

// class SavingsWithdrawal extends Component {
//   constructor(props) {
//     super(props);

//     const savings = this.props.navigation.getParam("savings");
//     this.state = {
//       savings,
//       amount: "",
//       amount_error: "",
//       penal_charge: null,
//       processing: false,
//       penal_warning_visible: false,
//       auth_modal_visible: false,
//       pin_error: "",
//     };
//   }

//   componentDidMount() {
//     BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
//   }

//   componentWillUnmount() {
//     BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
//   }

//   handleBackButton = () => {
//     if (this.props.isFocused) {
//       if (!this.state.processing) {
//         const { penal_warning_visible, auth_modal_visible } = this.state;
//         if (penal_warning_visible) {
//           this.hidePenalModal();
//         } else if (auth_modal_visible) {
//           this.hideAuthorizationModal();
//         } else {
//           this.props.navigation.goBack();
//         }
//       }

//       return true;
//     }
//   };

//   validateWithdrawal = () => {
//     const { savings, amount } = this.state;
//     if (!Util.isValidAmount(amount)) {
//       this.setState({
//         amount_error: Dictionary.ENTER_VALID_AMOUNT,
//       });

//       return;
//     }

//     if (+amount > Number(savings.balance)) {
//       this.setState({
//         amount_error: Dictionary.CANNOT_EXECEED_BALANCE,
//       });

//       return;
//     }

//     if (!savings.is_matured) {
//       this.setState(
//         {
//           processing: true,
//         },
//         () => {
//           Network.getWithdrawalWarning(savings.id, amount)
//             .then((result) => {
//               // console.log(result);
//               this.setState(
//                 {
//                   processing: false,
//                 },
//                 () => {
//                   if (
//                     result?.resp &&
//                     result?.resp.code == ResponseCodes.SUCCESS_CODE
//                   ) {
//                     this.setState({
//                       penal_warning: result?.resp.message,
//                       penal_warning_visible: true,
//                     });
//                   } else {
//                     this.showAuthorizationModal();
//                   }
//                 }
//               );
//             })
//             .catch((error) => {
//               this.setState(
//                 {
//                   processing: false,
//                 },
//                 () => {
//                   this.props.showToast(error.message);
//                 }
//               );
//             });
//         }
//       );
//     } else {
//       this.showAuthorizationModal();
//     }
//   };

//   hidePenalModal = () => {
//     this.setState({
//       penal_warning_visible: false,
//     });
//   };

//   showAuthorizationModal = () => {
//     this.setState({
//       penal_warning_visible: false,
//       auth_modal_visible: true,
//     });
//   };

//   hideAuthorizationModal = () => {
//     this.setState({
//       auth_modal_visible: false,
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
//             let { savings, amount } = this.state;
//             let payload = {
//               amount,
//               fromAccountId: savings.id,
//               notes: `Savings withdrawal from ${savings.name}`,
//               toAccountId: this.props.user.wallet_id,
//             };
//             //const withdrawalAction = savings.data_sources?.pecunia ? Network.withdrawSavings : Network.withdrawExternalSavings;
//             Network.withdrawSavings(payload)
//               .then((result) => {
//                 console.log("habeeb", { payload });
//                 this.setState(
//                   {
//                     processing: false,
//                     auth_modal_visible: false,
//                   },
//                   () => {
//                     this.props.getUserSavings();
//                     this.props.navigation.navigate("Success", {
//                       event_name: "investment_successful_withdraw",
//                       event_data: {
//                         amount,
//                         savings_id: savings.id,
//                       },
//                       success_message:
//                         result.data?.message || Dictionary.SAVINGS_WITHDRAWN,
//                     });
//                     this.props.addNotification({
//                       id: randomId(),
//                       is_read: false,
//                       title: "Savings withdrawal request",
//                       description: `Your withdrawal request of ${amount} from your ${savings.name} has been sent successfully and will be treated within 24hours.`,
//                       timestamp: moment().toString(),
//                     });
//                   }
//                 );
//               })
//               .catch((error) => {
//                 this.setState(
//                   {
//                     processing: false,
//                     auth_modal_visible: false,
//                   },
//                   () => {
//                     this.props.navigation.navigate("Error", {
//                       event_name: "investment_failed_withdraw",
//                       event_data: {
//                         amount,
//                         savings_id: savings.id,
//                       },
//                       error_message: error.message,
//                     });
//                   }
//                 );
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
//     const {
//       savings,
//       processing,
//       penal_warning,
//       penal_warning_visible,
//       auth_modal_visible,
//     } = this.state;
//     return (
//       <View style={SharedStyle.mainContainer}>
//         <MainHeader
//           leftIcon="arrow-left"
//           onPressLeftIcon={this.handleBackButton}
//           title={Dictionary.SAVINGS_WITHDRAWAL}
//         />
//         <ScrollView {...this.props}>
//           <SubHeader text={Dictionary.SAVINGS_WITHDRAWAL_SUB_HEADER} />
//           <View style={FormStyle.formContainer}>
//             <View style={FormStyle.formItem}>
//               <FloatingLabelInput
//                 label={Dictionary.AMOUNT_LABEL}
//                 value={this.state.amount}
//                 keyboardType={"decimal-pad"}
//                 multiline={false}
//                 autoCorrect={false}
//                 onChangeText={(text) => {
//                   this.setState({
//                     amount: text.replace(/[^0-9.]/g, ""),
//                     // amount: text,
//                     amount_error: "",
//                   });
//                 }}
//               />
//               <Text style={FormStyle.formError}>{this.state.amount_error}</Text>
//               <Text style={SharedStyle.balanceLabel}>
//                 {Dictionary.BALANCE}{" "}
//                 <Text style={SharedStyle.balanceValue}>
//                   ₦{Util.formatAmount(Number(savings.balance))}
//                 </Text>
//               </Text>
//             </View>
//           </View>
//           <View style={SharedStyle.bottomPanel}>
//             <View style={FormStyle.formButton}>
//               <PrimaryButton
//                 title={Dictionary.WITHDRAW}
//                 icon="arrow-right"
//                 loading={processing}
//                 onPress={this.validateWithdrawal}
//               />
//             </View>
//           </View>
//         </ScrollView>
//         {penal_warning_visible && (
//           <SavingsPenalWarning
//             message={penal_warning}
//             isVisible={penal_warning_visible}
//             onAgree={this.showAuthorizationModal}
//             onDisagree={this.hidePenalModal}
//           />
//         )}
//         {auth_modal_visible && (
//           <AuthorizeTransaction
//             title={Dictionary.SAVINGS_WITHDRAWAL}
//             isVisible={auth_modal_visible}
//             isProcessing={processing}
//             pinError={this.state.pin_error}
//             resetError={() => this.setState({ pin_error: "" })}
//             onSubmit={this.handleSubmit}
//             onCancel={this.hideAuthorizationModal}
//           />
//         )}
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   cancelOption: {
//     paddingTop: Mixins.scaleSize(20),
//     paddingBottom: Mixins.scaleSize(25),
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     borderBottomWidth: Mixins.scaleSize(1),
//     borderColor: Colors.LIGHT_BG,
//   },
//   optionContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     width: "90%",
//   },
//   optionIcon: {
//     width: Mixins.scaleSize(32),
//     height: Mixins.scaleSize(32),
//     marginRight: Mixins.scaleSize(16),
//   },
//   optionText: {
//     color: Colors.DARK_GREY,
//   },
//   checkbox: {
//     width: "10%",
//   },
//   blank: {
//     width: Mixins.scaleSize(20),
//     height: Mixins.scaleSize(20),
//     backgroundColor: Colors.LIGHT_UNCHECKED_BG,
//     borderRadius: Mixins.scaleSize(50),
//   },
//   modalBottom: {
//     borderTopWidth: Mixins.scaleSize(0),
//     marginBottom: Mixins.scaleSize(16),
//   },
// });

// const mapStateToProps = (state) => {
//   return {
//     user: state.user,
//     transactions: state.transactions,
//   };
// };

// const mapDispatchToProps = {
//   showToast,
//   getTransactionFeeTypes,
//   getUserSavings,
//   addNotification,
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(withNavigationFocus(SavingsWithdrawal));

import React, { Component } from "react";
import { BackHandler, StyleSheet, Text, View } from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import moment from "moment";

import { showToast } from "_actions/toast_actions";
import { getTransactionFeeTypes } from "_actions/transaction_actions";
import { getUserSavings } from "_actions/savings_actions";

import { Dictionary, Util, ResponseCodes } from "_utils";
import { Colors, Mixins, FormStyle, SharedStyle } from "_styles";
import { SubHeader, FloatingLabelInput } from "_atoms";
import { default as ScrollView } from "_atoms/scroll_view";
import { PrimaryButton, SavingsPenalWarning } from "_molecules";
import { MainHeader, AuthorizeTransaction } from "_organisms";

import { Network } from "_services";
import { addNotification } from "_actions/notification_actions";
import { randomId } from "../../utils/util";

class SavingsWithdrawal extends Component {
  constructor(props) {
    super(props);

    const savings = this.props.navigation.getParam("savings");
    this.state = {
      savings,
      amount: "",
      amount_error: "",
      penal_charge: null,
      processing: false,
      penal_warning_visible: false,
      auth_modal_visible: false,
      pin_error: "",
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
        const { penal_warning_visible, auth_modal_visible } = this.state;
        if (penal_warning_visible) {
          this.hidePenalModal();
        } else if (auth_modal_visible) {
          this.hideAuthorizationModal();
        } else {
          this.props.navigation.goBack();
        }
      }

      return true;
    }
  };

  validateWithdrawal = () => {
    const { savings, amount } = this.state;
    if (!Util.isValidAmount(amount)) {
      this.setState({
        amount_error: Dictionary.ENTER_VALID_AMOUNT,
      });

      return;
    }

    if (+amount > Number(savings.balance)) {
      this.setState({
        amount_error: Dictionary.CANNOT_EXECEED_BALANCE,
      });

      return;
    }

    if (!savings.is_matured) {
      this.setState(
        {
          processing: true,
        },
        () => {
          Network.getWithdrawalWarning(savings.id, amount)
            .then((result) => {
              this.setState(
                {
                  processing: false,
                },
                () => {
                  if (
                    result?.resp &&
                    result?.resp.code == ResponseCodes.SUCCESS_CODE
                  ) {
                    this.setState({
                      penal_warning: result?.resp.message,
                      penal_warning_visible: true,
                    });
                  } else {
                    this.showAuthorizationModal();
                  }
                }
              );
            })
            .catch((error) => {
              this.setState(
                {
                  processing: false,
                },
                () => {
                  this.props.showToast(error.message);
                }
              );
            });
        }
      );
    } else {
      this.showAuthorizationModal();
    }
  };

  hidePenalModal = () => {
    this.setState({
      penal_warning_visible: false,
    });
  };

  showAuthorizationModal = () => {
    this.setState({
      penal_warning_visible: false,
      auth_modal_visible: true,
    });
  };

  hideAuthorizationModal = () => {
    this.setState({
      auth_modal_visible: false,
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
            let { savings, amount } = this.state;
            let payload = {
              amount,
              fromAccountId: savings.id,
              notes: `Savings withdrawal from ${savings.name}`,
              toAccountId: this.props.user.wallet_id,
            };
            //const withdrawalAction = savings.data_sources?.pecunia ? Network.withdrawSavings : Network.withdrawExternalSavings;
            Network.withdrawSavings(payload)
              .then((result) => {
                console.log("ope", result.resp.message);

                this.setState(
                  {
                    processing: false,
                    auth_modal_visible: false,
                  },
                  () => {
                    this.props.getUserSavings();
                    this.props.navigation.navigate("Success", {
                      event_name: "investment_successful_withdraw",
                      event_data: {
                        amount,
                        savings_id: savings.id,
                      },
                      success_message: result?.resp?.message, // Updated this line
                    });
                    this.props.addNotification({
                      id: randomId(),
                      is_read: false,
                      title: "Savings withdrawal",
                      description: `You have successfully withdrawn ${amount} from your ${savings.name} into your bank account.`,
                      timestamp: moment().toString(),
                    });
                  }
                );
              })
              .catch((error) => {
                this.setState(
                  {
                    processing: false,
                    auth_modal_visible: false,
                  },
                  () => {
                    this.props.navigation.navigate("Error", {
                      event_name: "investment_failed_withdraw",
                      event_data: {
                        amount,
                        savings_id: savings.id,
                      },
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
      savings,
      processing,
      penal_warning,
      penal_warning_visible,
      auth_modal_visible,
    } = this.state;
    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.SAVINGS_WITHDRAWAL}
        />
        <ScrollView {...this.props}>
          <SubHeader text={Dictionary.SAVINGS_WITHDRAWAL_SUB_HEADER} />
          <View style={FormStyle.formContainer}>
            <View style={FormStyle.formItem}>
              <FloatingLabelInput
                label={Dictionary.AMOUNT_LABEL}
                value={this.state.amount}
                keyboardType={"decimal-pad"}
                multiline={false}
                autoCorrect={false}
                onChangeText={(text) => {
                  this.setState({
                    amount: text.replace(/[^0-9.]/g, ""),
                    // amount: text,
                    amount_error: "",
                  });
                }}
              />
              <Text style={FormStyle.formError}>{this.state.amount_error}</Text>
              <Text style={SharedStyle.balanceLabel}>
                {Dictionary.BALANCE}{" "}
                <Text style={SharedStyle.balanceValue}>
                  ₦{Util.formatAmount(Number(savings.balance))}
                </Text>
              </Text>
            </View>
          </View>
          <View style={SharedStyle.bottomPanel}>
            <View style={FormStyle.formButton}>
              <PrimaryButton
                title={Dictionary.WITHDRAW}
                icon="arrow-right"
                loading={processing}
                onPress={this.validateWithdrawal}
              />
            </View>
          </View>
        </ScrollView>
        {penal_warning_visible && (
          <SavingsPenalWarning
            message={penal_warning}
            isVisible={penal_warning_visible}
            onAgree={this.showAuthorizationModal}
            onDisagree={this.hidePenalModal}
          />
        )}
        {auth_modal_visible && (
          <AuthorizeTransaction
            title={Dictionary.SAVINGS_WITHDRAWAL}
            isVisible={auth_modal_visible}
            isProcessing={processing}
            pinError={this.state.pin_error}
            resetError={() => this.setState({ pin_error: "" })}
            onSubmit={this.handleSubmit}
            onCancel={this.hideAuthorizationModal}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cancelOption: {
    paddingTop: Mixins.scaleSize(20),
    paddingBottom: Mixins.scaleSize(25),
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: Mixins.scaleSize(1),
    borderColor: Colors.LIGHT_BG,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
  },
  optionIcon: {
    width: Mixins.scaleSize(32),
    height: Mixins.scaleSize(32),
    marginRight: Mixins.scaleSize(16),
  },
  optionText: {
    color: Colors.DARK_GREY,
  },
  checkbox: {
    width: "10%",
  },
  blank: {
    width: Mixins.scaleSize(20),
    height: Mixins.scaleSize(20),
    backgroundColor: Colors.LIGHT_UNCHECKED_BG,
    borderRadius: Mixins.scaleSize(50),
  },
  modalBottom: {
    borderTopWidth: Mixins.scaleSize(0),
    marginBottom: Mixins.scaleSize(16),
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    transactions: state.transactions,
  };
};

const mapDispatchToProps = {
  showToast,
  getTransactionFeeTypes,
  getUserSavings,
  addNotification,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(SavingsWithdrawal));
