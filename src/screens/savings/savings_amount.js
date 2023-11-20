import React, { Component } from "react";
import {
  BackHandler,
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  FlatList,
} from "react-native";
import Modal from "react-native-modal";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import * as Icon from "@expo/vector-icons";
import moment from "moment";
import { Slider } from "@sharcoux/slider";
import SwitchToggle from "@dooboo-ui/native-switch-toggle";

import {
  updateSavingsApplicationData,
  getSavingsCollectionModes,
} from "_actions/savings_actions";
import { showToast } from "_actions/toast_actions";

import { Dictionary, Util } from "_utils";
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from "_styles";
import {
  SubHeader,
  FloatingLabelInput,
  InfoPanel,
  TouchItem,
  ScrollView as _ScrollView,
} from "_atoms";
import { PrimaryButton, _DateTimePicker } from "_molecules";
import { MainHeader } from "_organisms";
import { Network } from "_services";

class SavingsAmount extends Component {
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
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    if (this.props.savings.collection_modes.length === 0) {
      this.props.getSavingsCollectionModes();
    }
    this.state.savings_product.is_fixed && this.updateBreakdown();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      if (!this.state.processing && this.state.is_plan_name_modal_visible) {
        this.hidePlanNameModal();
      } else {
        !this.state.processing && this.props.navigation.goBack();
      }

      return true;
    }
  };

  hidePlanNameModal = () => {
    this.setState({ is_plan_name_modal_visible: false });
  };

  handleDurationChange = (duration) => {
    this.setState(
      {
        duration: Math.ceil(duration),
      },
      () => {
        this.updateBreakdown();
      }
    );
  };

  handleFrequencyChange = (frequency) => {
    this.setState(
      {
        frequency,
        frequency_error: "",
      },
      () => {
        this.updateBreakdown();
      }
    );
  };

  handleDateChange = (date) => {
    this.setState(
      {
        start_date: moment(date).format("DD/MM/YYYY"),
        start_date_error: "",
      },
      () => {
        this.updateBreakdown();
      }
    );
  };

  handleCollectionModeChange = () => {
    if (!this.state.savings_product.is_fixed) {
      this.setState({ auto_collection_mode: !this.state.auto_collection_mode });
    }
  };

  toggleSelectDate = (show_date_picker) => {
    this.setState({ show_date_picker });
  };

  prcessSelectedDate = (event, date) => {
    if (Platform.OS === "android") {
      this.closeDatePicker();
      if (event.type === "set") {
        this.handleDateChange(date);
      }
    } else {
      this.handleDateChange(date);
    }
  };

  closeDatePicker = () => {
    this.toggleSelectDate(false);
  };

  validFields = () => {
    const { savings_product, preferred_offer, frequency, amount, start_date } =
      this.state;
    let is_valid = true;
    if (!savings_product.is_fixed && !frequency) {
      this.setState({ frequency_error: Dictionary.SELECT_SAVING_FREQUENCY });
      is_valid = false;
    }

    if (
      !Util.isValidAmount(amount) ||
      +amount < preferred_offer.min_amount ||
      +amount > preferred_offer.max_amount
    ) {
      this.setState({ amount_error: Dictionary.INVALID_AMOUNT });
      is_valid = false;
    }

    if (!start_date) {
      this.setState({ start_date_error: Dictionary.SELECT_START_DATE });
      is_valid = false;
    }

    return is_valid;
  };

  // updateBreakdown = () => {
  //     if (!this.validFields()) {
  //         return;
  //     }

  //     const { savings_product, preferred_offer, frequency, amount, duration, start_date } = this.state;
  //     const periodic_amount = Number(amount);
  //     let period = preferred_offer.tenor_period || 'days';
  //     period = period.endsWith('s') ? period : period + 's'; // Normalize in case server returns singular instead

  //     let multiplier = period === 'months' ? 30 : period === 'weeks' ? 7 : period === 'days' ? 1 : 1;
  //     let saving_days = duration * multiplier;
  //     let interest_rate = preferred_offer.interest_rate || 0;
  //     let withholding_tax_rate = savings_product.withholding_tax_rate || 0;
  //     let maturity_date = moment(start_date, 'DD/MM/YYYY').add(saving_days, 'days').format('yyyy-MM-DD');

  //     let total_contribution = 0;
  //     let interest_earned = 0;
  //     let schedules = [];

  //     if (savings_product.is_fixed) {
  //         schedules.push({
  //             index: 0,
  //             due_date: moment(start_date, 'DD/MM/YYYY').format('yyyy-MM-DD'),
  //             amount_saved: periodic_amount,
  //             balance: periodic_amount
  //         });

  //         total_contribution = periodic_amount;
  //         interest_earned = this.proRatedInterest(periodic_amount, interest_rate, saving_days);
  //     } else {
  //         const interval = frequency.slug == 'monthly' ? 30 : frequency.slug == 'weekly' ? 7 : 1;
  //         const duration_type = frequency.slug == 'monthly' ? 'months' : frequency.slug == 'weekly' ? 'weeks' : 'days';

  //         const mod = Math.floor(saving_days / interval);
  //         let savings_balance = 0;

  //         for (let i = 0; i < mod; i++) {
  //             let periodic_interest = 0;
  //             if (i > 0) {
  //                 periodic_interest = this.proRatedInterest(savings_balance, interest_rate, interval);
  //                 interest_earned += periodic_interest;
  //             }

  //             savings_balance = savings_balance + periodic_amount + periodic_interest;
  //             schedules.push({
  //                 index: i,
  //                 due_date: moment(start_date, 'DD/MM/YYYY').add(i, duration_type).format('yyyy-MM-DD'),
  //                 amount_saved: periodic_amount,
  //                 balance: savings_balance
  //             });

  //             total_contribution += periodic_amount;
  //         }
  //     }

  //     let withholding_tax = (withholding_tax_rate / 100) * interest_earned;
  //     let maturity_value = total_contribution + interest_earned;

  //     let breakdown = {
  //         total_contribution,
  //         maturity_value,
  //         maturity_date,
  //         interest_earned,
  //         interest_rate,
  //         withholding_tax,
  //         withholding_tax_rate,
  //         schedules
  //     };

  //     this.setState({
  //         breakdown
  //     });
  // }

  // proRatedInterest = (amount_saved, interest_rate, no_of_days) => {
  //     let year_interest = (amount_saved * Math.pow((1 + (interest_rate / 100)), 1)) - amount_saved;
  //     let pro_rated_interest = (year_interest / 360) * no_of_days;
  //     pro_rated_interest = Number(pro_rated_interest.toFixed(2));

  //     return pro_rated_interest;
  // }
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

  handleSubmit = () => {
    if (!this.validFields()) {
      return;
    }
    //
    this.setState({ processing: true }, () => {
      const {
        savings_product,
        preferred_offer,
        amount,
        frequency,
        duration,
        start_date,
        breakdown,
      } = this.state;
      let formatted_start_date = moment(start_date, "DD/MM/YYYY").format(
        "MM/DD/YYYY"
      );
      let end_date = moment(start_date, "DD/MM/YYYY")
        .add(duration, preferred_offer.tenor_period)
        .format("MM/DD/YYYY");

      // if (!savings_product.is_fixed) {
      this.props.updateSavingsApplicationData({
        savings_product,
        preferred_offer,
        depositAmount: amount,
        amount,
        breakdown,
        target: breakdown.maturity_value,
        duration,
        start_date,
        end_date,
        saving_frequency: frequency,
        interestAtMaturity: breakdown.interest_earned,
      });

      this.setState({
        processing: false,
        is_plan_name_modal_visible: true,
      });
      Util.logEventData("investment_apply_new", { amount });
      // } else {
      //     Network.getSavingsBreakdown({
      //         periodic_amount: amount,
      //         product_id: savings_product.id,
      //         frequency_id: frequency.id,
      //         start_date: formatted_start_date,
      //         end_date,
      //         offer_id: preferred_offer.id,
      //         tenor: duration
      //     }).then((result) => {
      //         let result_data = result.data;
      //         if (result_data.interest_earned) {
      //             result_data.withholding_tax = ((savings_product.withholding_tax_rate / 100) * result_data.interest_earned).toFixed(2);
      //         }

      //         this.props.updateSavingsApplicationData({
      //             savings_product,
      //             preferred_offer,
      //             amount,
      //             target: result_data.maturity_value,
      //             duration,
      //             start_date,
      //             saving_frequency: frequency,
      //             breakdown: result_data
      //         });

      //         this.setState({
      //             processing: false,
      //             is_plan_name_modal_visible: true
      //         });
      //         Util.logEventData('investment_apply_new', { amount });
      //     }).catch((error) => {
      //         this.setState({
      //             processing: false
      //         }, () => {
      //             this.props.showToast(error.message);
      //         });
      //     });
      // }
    });
  };

  handleSavePlanName = () => {
    const { collection_modes } = this.props.savings;
    const { plan_name, auto_collection_mode } = this.state;

    if (!plan_name || plan_name.length < 2) {
      this.setState({ plan_name_error: Dictionary.ENTER_VALID_PLAN_NAME });
      return;
    }

    let collection_mode = collection_modes.find(
      (mode) => mode.slug === (auto_collection_mode ? "automated" : "manual")
    );

    if (!collection_mode) {
      this.props.showToast(Dictionary.GENERAL_ERROR);
      this.handleBackButton();
      this.props.getSavingsCollectionModes();
      return;
    }

    this.props.updateSavingsApplicationData({
      plan_name,
      collection_mode,
    });

    this.setState({ is_plan_name_modal_visible: false }, () => {
      if (auto_collection_mode) {
        this.props.navigation.navigate("PaymentMethods", {
          redirect: "SavingsSummary",
          enable_wallet: true,
          enable_accounts: false,
        });
      } else {
        this.props.navigation.navigate("SavingsSummary");
      }
    });
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

    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.NEW_SAVINGS}
        />
        <_ScrollView {...this.props} hasButtomButtons={true}>
          <SubHeader text={Dictionary.HOW_TO_SAVE} />
          <View
            style={[
              FormStyle.formContainer,
              show_penal ? styles.formContainer : {},
            ]}
          >
            <View style={!!breakdown ? styles.palette : {}}>
              {!savings_product.is_fixed && (
                <View>
                  <View style={FormStyle.formItem}>
                    <Text style={styles.duration}>
                      {Dictionary.HOW_OFTEN_TO_SAVE}
                    </Text>
                  </View>
                  <View style={FormStyle.formItem}>
                    <ScrollView
                      style={styles.frequencySlider}
                      horizontal={true}
                      scrollEnabled={true}
                      showsHorizontalScrollIndicator={false}
                    >
                      {saving_frequencies.map((frequency, index) => {
                        return (
                          <TouchItem
                            key={index}
                            style={[
                              styles.durationOptions,
                              this.state.frequency &&
                              this.state.frequency.id === frequency.id
                                ? styles.selectedFrequency
                                : {},
                              index === saving_frequencies.length - 1
                                ? { marginRight: Mixins.scaleSize(16) }
                                : {},
                            ]}
                            onPress={() =>
                              this.handleFrequencyChange(frequency)
                            }
                          >
                            <View>
                              {(!this.state.frequency ||
                                (this.state.frequency &&
                                  this.state.frequency.id != frequency.id)) && (
                                <View
                                  style={[styles.blank, styles.icon]}
                                ></View>
                              )}
                              {!!this.state.frequency &&
                                this.state.frequency.id === frequency.id && (
                                  <Icon.Ionicons
                                    style={styles.icon}
                                    name={"ios-checkmark-circle"}
                                    size={Mixins.scaleFont(22)}
                                    color={Colors.SUCCESS}
                                  />
                                )}
                            </View>
                            <View>
                              <Text style={styles.frequencyHeader}>
                                {frequency.name}
                              </Text>
                            </View>
                          </TouchItem>
                        );
                      })}
                    </ScrollView>
                    <Text style={FormStyle.formError}>
                      {this.state.frequency_error}
                    </Text>
                  </View>
                </View>
              )}
              <View style={FormStyle.formItem}>
                <Text style={FormStyle.sectionLabel}>{how_much_label}</Text>
              </View>
              <View style={FormStyle.formItem}>
                <FloatingLabelInput
                  label={Dictionary.AMOUNT_LABEL}
                  value={this.state.amount}
                  keyboardType={"decimal-pad"}
                  multiline={false}
                  autoCorrect={false}
                  onChangeText={(text) =>
                    this.setState(
                      {
                        amount: text.replace(/\D/g, ""),
                        amount_error: "",
                      },
                      () => {
                        this.updateBreakdown();
                      }
                    )
                  }
                />
                <Text style={styles.amountRange}>
                  {this.state.amount_range}
                </Text>
                <Text style={FormStyle.formError}>
                  {this.state.amount_error}
                </Text>
              </View>
              <View style={FormStyle.formItem}>
                <Text style={FormStyle.sectionLabel}>
                  {Dictionary.HOW_LONG_TO_SAVE}
                </Text>
              </View>
              <View style={FormStyle.formItem}>
                <Text numberOfLines={1} style={styles.sliderValue}>
                  {duration} {preferred_offer.tenor_period}
                </Text>
                <Slider
                  style={styles.slider}
                  step={1}
                  thumbStyle={styles.sliderThumb}
                  trackStyle={styles.sliderTrack}
                  thumbTintColor={Colors.CV_YELLOW}
                  value={duration}
                  minimumValue={+preferred_offer.min_tenor}
                  maximumValue={+preferred_offer.max_tenor}
                  minimumTrackTintColor={Colors.CV_YELLOW}
                  maximumTrackTintColor={Colors.LIGHT_UNCHECKED_BG}
                  onValueChange={this.handleDurationChange}
                />
              </View>
              <View style={FormStyle.formItem}>
                <Text style={styles.duration}>
                  {Dictionary.WHEN_TO_START_SAVING}
                </Text>
              </View>
              <View style={FormStyle.formItem}>
                <TouchItem onPress={() => this.toggleSelectDate(true)}>
                  <FloatingLabelInput
                    pointerEvents="none"
                    label={Dictionary.DATE_LABEL}
                    value={this.state.start_date}
                    multiline={false}
                    autoCorrect={false}
                    editable={false}
                  />
                </TouchItem>
                <Text style={FormStyle.formError}>
                  {this.state.start_date_error}
                </Text>
              </View>
            </View>
            {!!breakdown && (
              <View>
                <View style={FormStyle.formItem}>
                  <Text style={styles.breakdownHeader}>
                    {Dictionary.BREAKDOWN}
                  </Text>
                </View>
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
                {breakdown.schedules.length > 0 && (
                  <View>
                    <View style={FormStyle.formItem}>
                      <Text style={styles.breakdownHeader}>
                        {Dictionary.SCHEDULES}
                      </Text>
                    </View>
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
                  </View>
                )}
              </View>
            )}
          </View>
          {!!breakdown && (
            <View style={SharedStyle.bottomPanel}>
              {!!show_penal && <InfoPanel text={penal_notice} />}
              <View style={FormStyle.formButton}>
                <PrimaryButton
                  loading={this.state.processing}
                  disabled={this.state.processing}
                  title={Dictionary.PROCEED_BTN}
                  icon="arrow-right"
                  onPress={this.handleSubmit}
                />
              </View>
            </View>
          )}
        </_ScrollView>
        <_DateTimePicker
          show={this.state.show_date_picker}
          value={this.state.start_date}
          minimumDate={new Date()}
          onChange={this.prcessSelectedDate}
          onClose={this.closeDatePicker}
        />
        <Modal
          isVisible={this.state.is_plan_name_modal_visible}
          swipeDirection="down"
          onSwipeComplete={this.handleBackButton}
          onBackButtonPress={this.handleBackButton}
          animationInTiming={500}
          animationOutTiming={500}
          backdropTransitionInTiming={500}
          backdropTransitionOutTiming={500}
          useNativeDriver={true}
          style={SharedStyle.modal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "position" : ""}
          >
            <View
              style={[
                SharedStyle.modalContent,
                {
                  height: savings_product.is_fixed
                    ? Mixins.scaleSize(200)
                    : Mixins.scaleSize(300),
                },
              ]}
            >
              <View style={SharedStyle.modalSlider} />
              <View style={SharedStyle.modalPanel}>
                <View style={styles.modalMiddle}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalLabel}>
                      {Dictionary.NAME_YOUR_SAVINGS}
                    </Text>
                    <FloatingLabelInput
                      label={Dictionary.PLAN_NAME}
                      value={this.state.plan_name}
                      multiline={false}
                      autoCorrect={false}
                      autoFocus={true}
                      onChangeText={(text) =>
                        this.setState({
                          plan_name: text,
                          plan_name_error: "",
                        })
                      }
                    />
                    <Text style={FormStyle.formError}>
                      {this.state.plan_name_error}
                    </Text>
                    {!savings_product.is_fixed && (
                      <View>
                        <View style={styles.switchHead}>
                          <Text style={styles.modalLabel}>
                            {Dictionary.AUTOMATE_YOUR_SAVINGS}
                          </Text>
                          <SwitchToggle
                            containerStyle={FormStyle.switchContainer}
                            circleStyle={FormStyle.switchCircle}
                            switchOn={this.state.auto_collection_mode}
                            onPress={this.handleCollectionModeChange}
                            backgroundColorOn={Colors.GREEN}
                            backgroundColorOff={Colors.LIGHT_GREY}
                            circleColorOff={Colors.WHITE}
                            circleColorOn={Colors.WHITE}
                            duration={100}
                          />
                        </View>
                        <View>
                          <Text style={styles.switchBody}>
                            {Dictionary.AUTOMATE_YOUR_SAVINGS_DESCRIPTION}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.modalBottom}>
              <PrimaryButton
                title={Dictionary.CONTINUE_BTN}
                icon="arrow-right"
                onPress={this.handleSavePlanName}
                loading={this.state.finalizing}
              />
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  formContainer: {
    paddingBottom: Mixins.scaleSize(70),
  },
  palette: {
    ...Mixins.margin(-40, -16, 30, -16),
    ...Mixins.padding(40, 16, 0, 16),
    elevation: 5,
    marginBottom: Mixins.scaleSize(30),
    backgroundColor: Colors.WHITE,
  },
  duration: {
    ...Typography.FONT_REGULAR,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.LIGHT_GREY,
  },
  frequencySlider: {
    marginHorizontal: Mixins.scaleSize(-16),
  },
  durationOptions: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    width: Mixins.scaleSize(148),
    marginLeft: Mixins.scaleSize(16),
    marginBottom: Mixins.scaleSize(8),
    padding: Mixins.scaleSize(16),
    backgroundColor: Colors.LIGHT_BG,
    borderColor: Colors.FAINT_BORDER,
    borderWidth: Mixins.scaleSize(1),
    borderRadius: Mixins.scaleSize(10),
  },
  selectedFrequency: {
    backgroundColor: Colors.LIGHTER_ORANGE_BG,
    borderColor: Colors.ORANGE_BORDER,
    elevation: 2,
  },
  icon: {
    marginRight: Mixins.scaleSize(12),
  },
  blank: {
    width: Mixins.scaleSize(20),
    height: Mixins.scaleSize(20),
    backgroundColor: Colors.LIGHT_UNCHECKED_BG,
    borderRadius: Mixins.scaleSize(50),
  },
  frequencyHeader: {
    ...Typography.FONT_MEDIUM,
    fontSize: Mixins.scaleFont(19),
    lineHeight: Mixins.scaleSize(23),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.DARK_GREY,
    textTransform: "capitalize",
  },
  amountRange: {
    ...FormStyle.formError,
    color: Colors.SUCCESS,
  },
  slider: {
    margin: 0,
    padding: 0,
  },
  sliderThumb: {
    marginTop: Mixins.scaleSize(14),
    width: Mixins.scaleSize(14),
    color: Colors.CV_YELLOW,
    borderColor: Colors.WHITE,
    borderWidth: Mixins.scaleSize(1),
    borderTopLeftRadius: Mixins.scaleSize(0),
    borderTopRightRadius: Mixins.scaleSize(50),
    borderBottomLeftRadius: Mixins.scaleSize(50),
    borderBottomRightRadius: Mixins.scaleSize(50),
    transform: [{ rotate: "45deg" }],
  },
  sliderTrack: {
    height: Mixins.scaleSize(7),
  },
  sliderValue: {
    ...SharedStyle.normalText,
    ...Typography.FONT_BOLD,
    fontSize: Mixins.scaleFont(20),
    lineHeight: Mixins.scaleSize(23),
    textTransform: "capitalize",
    color: Colors.CV_BLUE,
    marginBottom: Mixins.scaleSize(10),
  },
  breakdownHeader: {
    ...SharedStyle.normalText,
    ...Typography.FONT_BOLD,
    textTransform: "uppercase",
    color: Colors.DARK_GREY,
  },
  breakdown: {
    ...Mixins.padding(20, 16, 0, 16),
    borderWidth: Mixins.scaleSize(1),
    borderColor: Colors.INPUT_BORDER,
    backgroundColor: Colors.WHITE,
    borderRadius: Mixins.scaleSize(10),
    marginBottom: Mixins.scaleSize(30),
  },
  value: {
    ...SharedStyle.normalText,
    ...SharedStyle.value,
    textTransform: "none",
  },
  modalMiddle: {
    ...SharedStyle.modalMiddle,
  },
  modalLabel: {
    ...Typography.FONT_REGULAR,
    fontSize: Mixins.scaleFont(16),
    lineHeight: Mixins.scaleSize(19),
    color: Colors.DARK_GREY,
    marginBottom: Mixins.scaleSize(10),
  },
  modalBottom: {
    ...SharedStyle.modalBottom,
    borderTopWidth: Mixins.scaleSize(0),
    marginBottom: Mixins.scaleSize(16),
  },
  switchHead: {
    marginTop: Mixins.scaleSize(16),
    flexDirection: "row",
    justifyContent: "space-between",
  },
  switchBody: {
    ...Typography.FONT_REGULAR,
    color: Colors.LIGHT_GREY,
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
  updateSavingsApplicationData,
  getSavingsCollectionModes,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(SavingsAmount));
