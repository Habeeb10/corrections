// import React, { Component } from "react";
// import {
//   BackHandler,
//   StyleSheet,
//   ImageBackground,
//   View,
//   Text,
// } from "react-native";
// import { withNavigationFocus } from "react-navigation";
// import { connect } from "react-redux";
// import moment from "moment";

// import { Network } from "_services";

// import { getUserSavings } from "_actions/savings_actions";

// import { Dictionary, Util } from "_utils";
// import { Colors, Mixins, SharedStyle, FormStyle, Typography } from "_styles";
// import { ScrollView } from "_atoms";
// import { PrimaryButton } from "_molecules";
// import { MainHeader, AuthorizeTransaction } from "_organisms";
// import { addNotification } from "_actions/notification_actions";
// import { randomId } from "../../utils/util";
// import { createIconSetFromFontello } from "@expo/vector-icons";

// class SavingsSummary extends Component {
//   constructor(props) {
//     super(props);

//     const payment_method = this.props.navigation.getParam("payment_method");
//     const {
//       amount,
//       target,
//       preferred_offer,
//       savings_product,
//       duration,
//       plan_name,
//       start_date,
//       collection_mode,
//       saving_frequency,
//       breakdown,
//       interestAtMaturity,
//       end_date,
//     } = this.props.savings.savings_application;

//     this.state = {
//       amount,
//       target,
//       breakdown,
//       preferred_offer,
//       savings_product,
//       duration,
//       end_date,
//       plan_name,
//       start_date,
//       collection_mode,
//       saving_frequency,
//       payment_method,
//       auth_screen_visible: false,
//       pin_error: "",
//       processing: false,
//       interestAtMaturity,
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
//         if (this.state.auth_screen_visible) {
//           this.cancelTransactionAuthorization();
//         } else {
//           this.props.navigation.goBack();
//         }
//       }

//       return true;
//     }
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
//             let {
//               amount,
//               target,
//               preferred_offer,
//               savings_product,
//               duration,
//               plan_name,
//               start_date,
//               end_date,
//               collection_mode,
//               saving_frequency,
//               payment_method,
//               interestAtMaturity,
//             } = this.state;

//             let payload = {
//               clientID: this.props.user.user_data.bvn,
//               name: plan_name.trim(),
//               productName: savings_product.name,
//               depositAmount: amount,
//               period: saving_frequency.name,
//               target,
//               interestRate: savings_product.interest_rate,
//               isFixed: preferred_offer.isFixed,
//               isLocked: preferred_offer.is_locked,
//               productRangeCode: preferred_offer.productRangeCode,
//               product_id: savings_product.id,
//               offer_id: preferred_offer.id,
//               frequency: saving_frequency.name,
//               tenor_period: preferred_offer.tenor_period,
//               interestAtMaturity,
//               schedule: {
//                 scheduleStartDate: moment(start_date, "DD/MM/YYYY").format(
//                   "YYYY-MM-DD"
//                 ),
//                 //   scheduleEndDate: "2022-09-17",
//                 scheduleEndDate: moment(end_date, "MM/DD/YYYY").format(
//                   "YYYY-MM-DD"
//                 ),
//               },
//               //  start_date: moment(end_date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
//             };

//             if (collection_mode && collection_mode.name == "automated") {
//               payload.isCollectionAuto = true;
//             } else if (collection_mode && collection_mode.name == "manual") {
//               payload.isCollectionAuto = false;
//             } else {
//               payload.isCollectionAuto = false;
//             }
//             if (saving_frequency) {
//               payload.frequency_id = saving_frequency.id;
//             }
//             if (payment_method) {
//               if (payment_method.payment_method_type === "card") {
//                 payload.cardId = payment_method.id;
//                 payload.channel = "card";
//                 // payload.channel = "wallet";
//               } else {
//                 payload.walletAccount = payment_method.id;
//                 payload.channel = "wallet";
//               }
//             }
//             console.log("payload", payload);

//             Network.createSavingsPlan(payload)
//               .then((result) => {
//                 this.setState(
//                   {
//                     processing: false,
//                     auth_screen_visible: false,
//                   },
//                   () => {
//                     this.props.getUserSavings(this.props.user.user_data.bvn);
//                     this.props.navigation.navigate("Success", {
//                       event_name: "investment_successful",
//                       event_data: { amount },
//                       success_message:
//                         result.message ||
//                         `Hurray! We have created your ${savings_product.name} plan. You can now start saving and earning interest.`,
//                     });
//                     this.props.addNotification({
//                       id: randomId(),
//                       is_read: false,
//                       title: "Savings plan created",
//                       description: `Hurray! We have created your ${savings_product.name} plan. You can now start saving and earning interest.`,
//                       timestamp: moment().toString(),
//                     });
//                   }
//                 );
//               })
//               .catch((error) => {
//                 this.setState(
//                   {
//                     processing: false,
//                     auth_screen_visible: false,
//                   },
//                   () => {
//                     this.props.navigation.navigate("Error", {
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
//       amount,
//       target,
//       preferred_offer,
//       savings_product,
//       duration,
//       plan_name,
//       start_date,
//       collection_mode,
//       saving_frequency,
//     } = this.state;

//     let starts_on = moment(start_date, "DD/MM/YYYY").format("D MMM, YYYY");
//     let matures_on = moment(start_date, "DD/MM/YYYY")
//       .add(duration, preferred_offer.tenor_period)
//       .format("D MMM, YYYY");
//     return (
//       <ImageBackground
//         style={[SharedStyle.container, styles.container]}
//         imageStyle={{ height: "100%" }}
//         source={require("../../assets/images/savings/savings_summary.png")}
//         resizeMode={"contain"}
//       >
//         <MainHeader
//           leftIcon="arrow-left"
//           onPressLeftIcon={this.handleBackButton}
//           title={Dictionary.NEW_SAVINGS}
//         />
//         <ScrollView {...this.props} hasButtomButtons={true}>
//           <Text style={styles.subheader}>
//             {Dictionary.SAVINGS_PLAN_SUMMARY}
//           </Text>
//           <View style={[SharedStyle.section, styles.section]}>
//             <View style={SharedStyle.row}>
//               <View style={SharedStyle.halfColumn}>
//                 <Text
//                   numberOfLines={1}
//                   style={[SharedStyle.normalText, SharedStyle.label]}
//                 >
//                   {Dictionary.PLAN_NAME}
//                 </Text>
//                 <Text
//                   numberOfLines={2}
//                   style={[
//                     SharedStyle.normalText,
//                     SharedStyle.value,
//                     { textTransform: "none" },
//                   ]}
//                 >
//                   {plan_name}
//                 </Text>
//               </View>
//               <View style={SharedStyle.halfColumn}>
//                 <Text
//                   numberOfLines={1}
//                   style={[
//                     SharedStyle.normalText,
//                     SharedStyle.label,
//                     SharedStyle.right,
//                   ]}
//                 >
//                   {Dictionary.PLAN_TYPE}
//                 </Text>
//                 <Text
//                   numberOfLines={2}
//                   style={[
//                     SharedStyle.normalText,
//                     SharedStyle.value,
//                     SharedStyle.right,
//                     { textTransform: "none" },
//                   ]}
//                 >
//                   {savings_product.name}
//                 </Text>
//               </View>
//             </View>
//             <View style={SharedStyle.row}>
//               <View style={SharedStyle.halfColumn}>
//                 <Text
//                   numberOfLines={1}
//                   style={[SharedStyle.normalText, SharedStyle.label]}
//                 >
//                   {Dictionary.SAVINGS}
//                 </Text>
//                 <Text
//                   numberOfLines={2}
//                   style={[SharedStyle.normalText, SharedStyle.value]}
//                 >
//                   ₦{Util.formatAmount(amount)}
//                 </Text>
//               </View>
//               <View style={SharedStyle.halfColumn}>
//                 <Text
//                   numberOfLines={1}
//                   style={[
//                     SharedStyle.normalText,
//                     SharedStyle.label,
//                     SharedStyle.right,
//                   ]}
//                 >
//                   {Dictionary.FREQUENCY}
//                 </Text>
//                 <Text
//                   numberOfLines={2}
//                   style={[
//                     SharedStyle.normalText,
//                     SharedStyle.value,
//                     SharedStyle.right,
//                   ]}
//                 >
//                   {saving_frequency ? saving_frequency.name : "- - -"}
//                 </Text>
//               </View>
//             </View>
//             <View style={SharedStyle.row}>
//               <View style={SharedStyle.halfColumn}>
//                 <Text
//                   numberOfLines={1}
//                   style={[SharedStyle.normalText, SharedStyle.label]}
//                 >
//                   {Dictionary.SAVINGS_TARGET}
//                 </Text>
//                 <Text
//                   numberOfLines={2}
//                   style={[SharedStyle.normalText, SharedStyle.value]}
//                 >
//                   ₦{Util.formatAmount(target)}
//                 </Text>
//               </View>
//               <View style={SharedStyle.halfColumn}>
//                 <Text
//                   numberOfLines={1}
//                   style={[
//                     SharedStyle.normalText,
//                     SharedStyle.label,
//                     SharedStyle.right,
//                   ]}
//                 >
//                   {Dictionary.SAVINGS_TYPE}
//                 </Text>
//                 <Text
//                   numberOfLines={2}
//                   style={[
//                     SharedStyle.normalText,
//                     SharedStyle.value,
//                     SharedStyle.right,
//                   ]}
//                 >
//                   {collection_mode.name}
//                 </Text>
//               </View>
//             </View>
//             <View style={SharedStyle.row}>
//               <View style={SharedStyle.halfColumn}>
//                 <Text
//                   numberOfLines={1}
//                   style={[SharedStyle.normalText, SharedStyle.label]}
//                 >
//                   {Dictionary.START_BY}
//                 </Text>
//                 <Text
//                   numberOfLines={2}
//                   style={[SharedStyle.normalText, SharedStyle.value]}
//                 >
//                   {starts_on}
//                 </Text>
//               </View>
//               <View style={SharedStyle.halfColumn}>
//                 <Text
//                   numberOfLines={1}
//                   style={[
//                     SharedStyle.normalText,
//                     SharedStyle.label,
//                     SharedStyle.right,
//                   ]}
//                 >
//                   {Dictionary.WITHDRAW_DATE}
//                 </Text>
//                 <Text
//                   numberOfLines={2}
//                   style={[
//                     SharedStyle.normalText,
//                     SharedStyle.value,
//                     SharedStyle.right,
//                   ]}
//                 >
//                   {matures_on}
//                 </Text>
//               </View>
//             </View>
//           </View>
//           <View style={[SharedStyle.bottomPanel, styles.bottomPanel]}>
//             <View style={FormStyle.formButton}>
//               <PrimaryButton
//                 loading={this.state.processing}
//                 title={Dictionary.CREATE_PLAN_BTN}
//                 icon="arrow-right"
//                 onPress={this.handleTransactionAuthorization}
//               />
//             </View>
//           </View>
//         </ScrollView>
//         {this.state.auth_screen_visible && (
//           <AuthorizeTransaction
//             title={Dictionary.NEW_SAVINGS}
//             isVisible={this.state.auth_screen_visible}
//             isProcessing={this.state.processing}
//             pinError={this.state.pin_error}
//             resetError={() => this.setState({ pin_error: "" })}
//             onSubmit={this.handleSubmit}
//             onCancel={this.cancelTransactionAuthorization}
//           />
//         )}
//       </ImageBackground>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: Colors.LIGHT_ASH_BG,
//   },
//   subheader: {
//     ...Mixins.margin(32, 16, 32, 16),
//     ...Typography.FONT_BOLD,
//     fontSize: Mixins.scaleFont(22),
//     lineHeight: Mixins.scaleSize(25),
//     letterSpacing: Mixins.scaleSize(0.01),
//     color: Colors.CV_BLUE,
//     textAlign: "center",
//   },
//   section: {
//     marginHorizontal: Mixins.scaleSize(16),
//     backgroundColor: Colors.WHITE,
//   },
//   row: {
//     marginBottom: Mixins.scaleSize(30),
//   },
//   bottomPanel: {
//     backgroundColor: Colors.WHITE,
//   },
// });

// const mapStateToProps = (state) => {
//   return {
//     user: state.user,
//     wallet: state.wallet,
//     savings: state.savings,
//   };
// };

// const mapDispatchToProps = {
//   getUserSavings,
//   addNotification,
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(withNavigationFocus(SavingsSummary));

import React, { Component } from "react";
import {
  BackHandler,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import moment from "moment";

import {
  updateSavingsApplicationData,
  getSavingsCollectionModes,
  getUserSavings,
} from "_actions/savings_actions";
import { showToast } from "_actions/toast_actions";

import { Dictionary, Util } from "_utils";
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from "_styles";
import { SubHeader, InfoPanel, ScrollView as _ScrollView } from "_atoms";
import { PrimaryButton, _DateTimePicker } from "_molecules";
import { Network } from "_services";

import { MainHeader, AuthorizeTransaction } from "_organisms";
import { addNotification } from "_actions/notification_actions";
import { randomId } from "../../utils/util";
import { createIconSetFromFontello } from "@expo/vector-icons";
// import Modal from "react-native-modal";
const { width } = Dimensions.get("screen");

class SavingsSummary extends Component {
  constructor(props) {
    super(props);
    const { savings_product, preferred_offer } =
      this.props.savings.savings_application;

    let amount_range = Dictionary.AMOUNT_RANGE.replace(
      "{{min_amount}}",
      Util.formatAmount(preferred_offer.minimumAmount)
    ).replace(
      "{{max_amount}}",
      Util.formatAmount(preferred_offer.maximumAmount)
    );
    const payment_method = this.props.navigation.getParam("payment_method");
    const {
      amount,
      target,

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
      savings_product,
      preferred_offer,
      amount: preferred_offer.minimumAmount?.toString(),
      amount_error: "",
      amount_range,
      duration: preferred_offer.tenorStart,
      frequency: "",
      frequency_error: "",
      start_date: moment().format("DD/MM/YYYY"),
      start_date_error: "",
      show_date_picker: false,
      processing: false,
      breakdown: null,
      is_plan_name_modal_visible: false,
      plan_name: "",
      plan_name_error: "",
      auto_collection_mode: true,
      finalizing: false,
      modalVisible: false,
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
      type: "breakdown", // Set the default type to "breakdown"
    };
    this.fadeAnim = new Animated.Value(0);
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

  updateBreakdown = () => {
    if (!this.validFields()) {
      return;
    }

    const {
      savings_product,
      preferred_offer,
      frequency,
      amount,
      duration,
      start_date,
    } = this.state;
    const periodic_amount = Number(amount);
    let period = preferred_offer.tenor_period || "days";
    period = period.endsWith("s") ? period : period + "s"; // Normalize in case server returns singular instead

    let multiplier =
      period === "months"
        ? 30
        : period === "weeks"
        ? 7
        : period === "days"
        ? 1
        : 1;
    let saving_days = duration * multiplier;
    let interest_rate = preferred_offer.interest_rate || 0;
    let withholding_tax_rate = savings_product.withholding_tax_rate || 0;
    let maturity_date = moment(start_date, "DD/MM/YYYY")
      .add(saving_days, "days")
      .format("yyyy-MM-DD");

    let total_contribution = 0;
    let interest_earned = 0;
    let schedules = [];

    if (savings_product.is_fixed) {
      schedules.push({
        index: 0,
        due_date: moment(start_date, "DD/MM/YYYY").format("yyyy-MM-DD"),
        amount_saved: periodic_amount,
        balance: periodic_amount,
      });

      total_contribution = periodic_amount;
      interest_earned = this.proRatedInterest(
        periodic_amount,
        interest_rate,
        saving_days
      );
    } else {
      const interval =
        frequency.slug == "monthly" ? 30 : frequency.slug == "weekly" ? 7 : 1;
      const duration_type =
        frequency.slug == "monthly"
          ? "months"
          : frequency.slug == "weekly"
          ? "weeks"
          : "days";

      const mod = Math.floor(saving_days / interval);
      let savings_balance = 0;

      for (let i = 0; i < mod; i++) {
        let periodic_interest = 0;
        if (i > 0) {
          periodic_interest = this.proRatedInterest(
            savings_balance,
            interest_rate,
            duration_type
          );
          interest_earned += periodic_interest;
        }

        savings_balance = savings_balance + periodic_amount + periodic_interest;
        //savings_balance = periodic_amount + (periodic_amount * i) + interest_earned;
        schedules.push({
          index: i,
          due_date: moment(start_date, "DD/MM/YYYY")
            .add(i, duration_type)
            .format("yyyy-MM-DD"),
          amount_saved: periodic_amount,
          balance: savings_balance,
        });

        total_contribution += periodic_amount;
      }
    }

    let withholding_tax = (withholding_tax_rate / 100) * interest_earned;
    let maturity_value = total_contribution + interest_earned;

    let breakdown = {
      total_contribution,
      maturity_value,
      maturity_date,
      interest_earned,
      interest_rate,
      withholding_tax,
      withholding_tax_rate,
      schedules,
    };

    this.setState({
      breakdown,
    });
  };

  proRatedInterest = (amount_saved, interest_rate, duration_type) => {
    let toatl_period =
      duration_type === "days" ? 365 : duration_type === "months" ? 12 : 52;
    let interest = interest_rate / 100 / toatl_period;

    let pro_rated_interest = amount_saved * interest * 0.9;
    pro_rated_interest = Number(pro_rated_interest.toFixed(2));

    return pro_rated_interest;
  };

  renderSchedules = ({ item }) => {
    return (
      <View style={SharedStyle.row}>
        <View style={SharedStyle.triColumn}>
          <Text numberOfLines={1} style={styles.value}>
            {moment(item.due_date, "yyyy-MM-DD").format("DD/MM/YYYY")}
          </Text>
        </View>
        <View style={SharedStyle.triColumn}>
          <Text numberOfLines={1} style={styles.value}>
            ₦{Util.formatAmount(item.amount_saved)}
          </Text>
        </View>
        <View style={SharedStyle.triColumn}>
          <Text numberOfLines={1} style={[styles.value, SharedStyle.right]}>
            ₦{Util.formatAmount(item.balance)}
          </Text>
        </View>
      </View>
    );
  };

  render() {
    let { saving_frequencies } = this.props.savings;
    let {
      savings_product,
      preferred_offer,
      amount,
      duration,
      frequency,
      start_date,
      breakdown,
    } = this.state;
    let penal_charge = savings_product.penal_charge || 0;
    let penal_notice = Dictionary.SAVINGS_PENALTY;
    penal_notice = penal_notice.replace("%s", penal_charge);

    const show_penal = false; // !!breakdown && penal_charge && penal_charge > 0;
    let how_much_label = Dictionary.HOW_MUCH_TO_SAVE;
    if (frequency) {
      how_much_label = how_much_label.replace("%s", frequency.slug);
    } else {
      how_much_label = how_much_label.replace(" %s", "");
    }

    let starts_on = moment(start_date, "DD/MM/YYYY").format("D MMM, YYYY");
    let matures_on = moment(start_date, "DD/MM/YYYY")
      .add(duration, preferred_offer.tenor_period)
      .format("D MMM, YYYY");
    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
        />
        <View
          style={{
            paddingHorizontal: Mixins.scaleSize(18),
            marginTop: Mixins.scaleSize(15),
          }}
        >
          <Text
            style={{
              ...Typography.FONT_BOLD,
              fontSize: Mixins.scaleFont(16),
              color: Colors.CV_BLUE,
            }}
          >
            Savings Details
          </Text>
          <Text
            style={{
              ...Typography.FONT_REGULAR,
              fontSize: Mixins.scaleFont(13),
              color: "#8397B1",
              marginTop: Mixins.scaleSize(5),
            }}
          >
            See all Breakdown and Savings Schedule
          </Text>
        </View>

        <View style={styles.pillContainer}>
          <TouchableOpacity onPress={() => this.changeType("breakdown")}>
            <Text
              style={[
                styles.pillsText,
                {
                  color:
                    this.state.type === "breakdown" ? "#1A3550" : "#1A35504D",
                },
              ]}
            >
              BREAKDOWN
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            // style={[
            //   styles.pills,
            //   {
            //     backgroundColor:
            //       this.state.type === "schedule"
            //         ? Colors.CV_YELLOW
            //         : Colors.WHITE,
            //   },
            // ]}
            onPress={() => this.changeType("schedule")}
          >
            <Text
              style={[
                styles.pillsText,
                {
                  color:
                    this.state.type === "schedule" ? "#1A3550" : "#1A35504D",
                },
              ]}
            >
              SAVING SCHEDULE
            </Text>
          </TouchableOpacity>
        </View>
        {this.state.type === "breakdown" && (
          <>
            {!!breakdown && (
              <View style={styles.breakdown}>
                <View style={SharedStyle.row}>
                  <View style={SharedStyle.halfColumn}>
                    <Text
                      numberOfLines={1}
                      style={[SharedStyle.normalText, SharedStyle.label]}
                    >
                      {Dictionary.AMOUNT_SAVED}
                    </Text>
                    <Text numberOfLines={2} style={[styles.value]}>
                      ₦{Util.formatAmount(breakdown.total_contribution)}
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
                    >{`Interest at Maturity`}</Text>
                    <Text
                      numberOfLines={2}
                      style={[styles.value, SharedStyle.right]}
                    >
                      ₦{Util.formatAmount(breakdown.interest_earned)}
                    </Text>
                  </View>
                </View>
                <View style={SharedStyle.row}>
                  <View style={SharedStyle.halfColumn}>
                    <Text
                      numberOfLines={1}
                      style={[SharedStyle.normalText, SharedStyle.label]}
                    >
                      {Dictionary.TENOR}
                    </Text>
                    <Text numberOfLines={2} style={[styles.value]}>
                      {`${Dictionary.FROM} ${moment(
                        start_date,
                        "DD/MM/YYYY"
                      ).format("D MMM, YYYY")} ${Dictionary.TO} ${moment(
                        breakdown.maturity_date,
                        "yyyy-MM-DD"
                      ).format("D MMM, YYYY")}`}
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
                      style={[styles.value, SharedStyle.right]}
                    >
                      ₦{Util.formatAmount(amount)}{" "}
                      {frequency.name?.toLowerCase()} {Dictionary.FOR}{" "}
                      {duration} {preferred_offer.tenor_period}
                    </Text>
                  </View>
                </View>
                <View style={SharedStyle.row}>
                  <View style={SharedStyle.halfColumn}>
                    <Text
                      numberOfLines={1}
                      style={[SharedStyle.normalText, SharedStyle.label]}
                    >
                      {Dictionary.WITHOLDING_TAX}
                    </Text>
                    <Text numberOfLines={2} style={[styles.value]}>
                      {breakdown.withholding_tax_rate}
                      {Dictionary.PERCENT_OF_INTEREST}
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
                      numberOfLines={2}
                      style={[styles.value, SharedStyle.right]}
                    >
                      ₦{Util.formatAmount(breakdown.maturity_value)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
        {this.state.type === "schedule" && (
          <>
            {breakdown?.schedules?.length > 0 && (
              <View style={styles.breakdown}>
                <View style={SharedStyle.row}>
                  <View style={SharedStyle.triColumn}>
                    <Text
                      numberOfLines={1}
                      style={[SharedStyle.normalText, SharedStyle.label]}
                    >
                      {Dictionary.DATE_LABEL}
                    </Text>
                  </View>
                  <View style={SharedStyle.triColumn}>
                    <Text
                      numberOfLines={1}
                      style={[SharedStyle.normalText, SharedStyle.label]}
                    >
                      {Dictionary.SAVED}
                    </Text>
                  </View>
                  <View style={SharedStyle.triColumn}>
                    <Text
                      numberOfLines={1}
                      style={[
                        SharedStyle.normalText,
                        SharedStyle.label,
                        SharedStyle.right,
                      ]}
                    >
                      {Dictionary.BALANCE}
                    </Text>
                  </View>
                </View>
                <FlatList
                  data={breakdown.schedules}
                  renderItem={this.renderSchedules}
                  keyExtractor={(schedule) => schedule.index}
                />
              </View>
            )}
          </>
        )}
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  pillContainer: {
    ...Mixins.margin(20, 0, 0, 0),
    width: width * 0.9,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#DADADA",

    alignSelf: "center",
  },
  pills: {
    width: width * 0.2,
    borderRadius: 5,
    height: Mixins.scaleSize(30),
    alignItems: "center",
    justifyContent: "center",
  },
  pillsText: {
    // color: Colors.WHITE,
    ...Typography.FONT_BOLD,
    fontSize: Mixins.scaleFont(14),
  },

  breakdown: {
    ...Mixins.padding(20, 16, 0, 16),
    marginBottom: Mixins.scaleSize(30),
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
  showToast,
  updateSavingsApplicationData,
  getSavingsCollectionModes,
  getUserSavings,
  addNotification,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(SavingsSummary));
