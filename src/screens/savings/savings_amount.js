import React, { Component } from "react";
import {
  BackHandler,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Modal from "react-native-modal";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import moment from "moment";
import { Slider } from "@sharcoux/slider";
import SwitchToggle from "@dooboo-ui/native-switch-toggle";

import {
  updateSavingsApplicationData,
  getSavingsCollectionModes,
  getUserSavings,
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
import { PrimaryButton, _DateTimePicker, SelectListItem } from "_molecules";
import { MainHeader } from "_organisms";
import { MaterialIcons } from "@expo/vector-icons";
import { addNotification } from "_actions/notification_actions";

const { width } = Dimensions.get("screen");

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
      modalVisible: false,
      animationTrigger: false,
      frequency: "daily",
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
  openModal = () => {
    this.setState({ modalVisible: true });
  };

  closeModal = () => {
    this.setState({ modalVisible: false });
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
        modalVisible: false,
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
    this.setState({ processing: true }, () => {
      const {
        savings_product,
        preferred_offer,
        amount,
        frequency,
        duration,
        start_date,
        breakdown,
        plan_name,
        auto_collection_mode,
      } = this.state;

      // Validate plan_name
      if (!plan_name || plan_name.length < 2) {
        this.setState({
          plan_name_error: Dictionary.ENTER_VALID_PLAN_NAME,
          processing: false,
        });
        return;
      }

      // Validate auto_collection_mode
      let collection_modes = this.props.savings.collection_modes;
      let collection_mode = collection_modes.find(
        (mode) => mode.slug === (auto_collection_mode ? "automated" : "manual")
      );

      if (!collection_mode) {
        this.props.showToast(Dictionary.GENERAL_ERROR);
        this.handleBackButton();
        this.props.getSavingsCollectionModes();
        this.setState({ processing: false });
        return;
      }

      let formatted_start_date = moment(start_date, "DD/MM/YYYY").format(
        "MM/DD/YYYY"
      );
      let end_date = moment(start_date, "DD/MM/YYYY")
        .add(duration, preferred_offer.tenor_period)
        .format("MM/DD/YYYY");

      // Update savings application data including plan_name
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
        plan_name, // Include plan_name here
        collection_mode,
      });

      // Reset state and navigate to the appropriate screen
      this.setState(
        {
          processing: false,
          is_plan_name_modal_visible: false,
          breakdownModalVisible: false,
        },
        () => {
          if (auto_collection_mode) {
            this.props.navigation.navigate("PaymentMethods", {
              redirect: "SavingsSummary",
              enable_wallet: true,
              enable_accounts: false,
            });
          } else {
            this.props.navigation.navigate("SavingsSummary");
          }
        }
      );

      Util.logEventData("investment_apply_new", { amount });
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
    const opacity = this.state.animationTrigger
      ? this.fadeAnim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 1, 1],
        })
      : 1;
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
                <>
                  <View style={[styles.packageContainer]}>
                    <Text
                      style={{
                        ...Typography.FONT_REGULAR,
                        fontSize: Mixins.scaleFont(14),
                        lineHeight: Mixins.scaleSize(16),
                        letterSpacing: Mixins.scaleSize(0.01),
                        color: Colors.LIGHT_GREY,
                        paddingTop: Mixins.scaleSize(5),
                      }}
                    >
                      {Dictionary.HOW_OFTEN_TO_SAVE}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{
                          ...Typography.FONT_MEDIUM,
                          fontSize: Mixins.scaleFont(14),
                          color: "#28374C",
                        }}
                      >
                        {this.state.frequency
                          ? this.state.frequency.name
                          : "-:-:-"}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          this.setState({ modalVisible: true });
                        }}
                      >
                        <MaterialIcons
                          name={"keyboard-arrow-down"}
                          size={Mixins.scaleSize(25)}
                          color={"#8397B1"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={FormStyle.formError}>
                    {this.state.frequency_error}
                  </Text>
                </>
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
                <Text style={styles.duration}>
                  {Dictionary.WHEN_TO_START_SAVING}
                </Text>
              </View>
              <View style={FormStyle.formItem}>
                <TouchItem onPress={() => this.toggleSelectDate(true)}>
                  <FloatingLabelInput
                    pointerEvents="none"
                    label={"Start date"}
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
                  {Dictionary.NAME_YOUR_SAVINGS}
                </Text>
              </View>
              <View style={SharedStyle.FormStyle}>
                <FloatingLabelInput
                  label={"Enter Name"}
                  value={this.state.plan_name}
                  multiline={false}
                  autoCorrect={false}
                  // autoFocus={true}
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
        </_ScrollView>
        <_DateTimePicker
          show={this.state.show_date_picker}
          value={this.state.start_date}
          minimumDate={new Date()}
          onChange={this.prcessSelectedDate}
          onClose={this.closeDatePicker}
        />

        <Modal
          // transparent={true}
          isVisible={this.state.modalVisible}
          style={{ margin: 0, width: "100%", bottom: 0 }}
          animationIn={"slideInUp"}
          backdropOpacity={0.5}
          onBackdropPress={() => this.closeModal()}
        >
          <View
            style={{
              position: "absolute",
              width: "100%",
              top: Mixins.scaleSize(200),
              borderTopLeftRadius: Mixins.scaleSize(10),
              borderTopRightRadius: Mixins.scaleSize(10),
              borderBottomLeftRadius: Mixins.scaleSize(10),
              borderBottomRightRadius: Mixins.scaleSize(10),
              backgroundColor: "white",
              borderRadius: Mixins.scaleSize(10),
              // flex: 1,
            }}
          >
            {saving_frequencies.map((frequency, index) => {
              return (
                <SelectListItem
                  key={index}
                  title={frequency.name}
                  onPress={() => this.handleFrequencyChange(frequency)}
                  selected={this.state.frequency.id === frequency.id}
                />
              );
            })}
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  pillContainer: {
    ...Mixins.margin(20, 0, 20, 0),
    ...Mixins.padding(10),
    width: width * 0.9,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#A4A4A4",
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
    ...Typography.FONT_REGULAR,
    fontSize: Mixins.scaleFont(14),
  },
  packageContainer: {
    width: "100%",
    height: Mixins.scaleSize(55),
    borderColor: Colors.GREY,
    borderWidth: 1,
    borderRadius: Mixins.scaleSize(5),
    marginBottom: Mixins.scaleSize(16),
    paddingHorizontal: Mixins.scaleSize(5),

    // alignItems: "center",
  },
  formContainer: {
    paddingBottom: Mixins.scaleSize(70),
  },
  palette: {
    ...Mixins.margin(-40, -16, 30, -16),
    ...Mixins.padding(40, 16, 0, 16),
    // marginBottom: Mixins.scaleSize(30),
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
    // borderWidth: Mixins.scaleSize(1),
    // borderColor: Colors.INPUT_BORDER,
    // backgroundColor: Colors.WHITE,
    // borderRadius: Mixins.scaleSize(10),
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
    ...Typography.FONT_MEDIUM,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(19),
    color: Colors.SUCCESS,
    marginBottom: Mixins.scaleSize(10),
  },
  // modalBottom: {
  //   ...SharedStyle.modalBottom,
  //   borderTopWidth: Mixins.scaleSize(0),
  //   marginBottom: Mixins.scaleSize(16),
  // },
  switchHead: {
    // marginTop: Mixins.scaleSize(16),
    flexDirection: "row",
    justifyContent: "space-between",
  },
  switchBody: {
    ...Typography.FONT_REGULAR,
    color: "#28374C",
    maxWidth: 300,
    fontSize: Mixins.scaleFont(12),
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    savings: state.savings,
    wallet: state.wallet,
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
)(withNavigationFocus(SavingsAmount));
