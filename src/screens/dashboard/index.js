import React, { Component } from "react";
import remoteConfig from "@react-native-firebase/remote-config";
import {
  BackHandler,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  Image,
  ImageBackground,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { connect } from "react-redux";
import { withNavigationFocus } from "react-navigation";
import * as Icon from "@expo/vector-icons";
import RNPaystack from "react-native-paystack";
import * as Progress from "react-native-progress";
import messaging from "@react-native-firebase/messaging";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import moment from "moment";
import analytics from "@react-native-firebase/analytics";
import crashlytics from "@react-native-firebase/crashlytics";
import _ from "lodash";
import Modal from "react-native-modal";
import Clipboard from "@react-native-community/clipboard";
import * as Animatable from "react-native-animatable";

import { showToast, showToastNav } from "_actions/toast_actions";
import {
  getDropdownOptions,
  getStateOptions,
  getLgaOptions,
} from "_actions/config_actions";
import { showExitDialog } from "_actions/util_actions";
import {
  getOrgPreferences,
  getUserProfile,
  showScreenInactivityDialog,
  hideScreenInactivityDialog,
  getReferalCode,
} from "_actions/user_actions";
import { getTransactionFeeTypes } from "_actions/transaction_actions";
import { getImage } from "_actions/information_actions";
import { getUserWallet } from "_actions/wallet_actions";
import {
  getUserSavings,
  getSavingsProducts,
  getSavingsCollectionModes,
  getSavingsFrequencies,
} from "_actions/savings_actions";
import {
  getLoanProducts,
  getLoanReasons,
  getUserLoans,
} from "_actions/loan_actions";
import { getUserCards, getUserAccounts } from "_actions/payment_actions";
import { resetDataPurchase } from "_actions/data_actions";
import { resetAirtimePurchase } from "_actions/airtime_actions";
import { getBillerCategories } from "_actions/bills_actions";
import {
  syncNotifications,
  saveNotification,
} from "_actions/notification_actions";
import { getUserNextOfKin } from "_actions/next_of_kin_actions";
import { getDocuments } from "_actions/document_actions";
import { clearDeepLinkPath } from "_actions/settings_actions";
import { env, Dictionary, Util } from "_utils";
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from "_styles";
import { TouchItem, ScrollView as _ScrollView } from "_atoms";
import { ActionButton, PrimaryButton } from "_molecules";
import TransactionReceipt from "_screens/shared/transaction_receipt";
import Lightbox from "react-native-lightbox";
import Banners from "_organisms/slider";
import AppIntroSlider from "react-native-app-intro-slider";

/** @typedef {object} imageObject
 * @property {number} id
 * @property {string} name
 * @property {string} ctaUrl
 * @property {string} url
 * @property {string} status
 * @property {string} description
 */

import { Network } from "_services";
let visible = false;

class Dashboard extends Component {
  constructor(props) {
    super(props);
    const { user_data } = this.props.user;
    // console.log({ information: this.props.information });
    this.state = {
      greeting: "",
      UserInactivityState: false,
      _isActive: true,
      refreshing: false,
      showAmount: false,
      showSavingsBalance: false,
      modal_visible: false,
      receipt_modal_visible: false,
      transaction_data: {},
      image: this.props.information.image,
      /** @type {{bannerList: imageObject[], imageActive: boolean}} */
      information: this.props.information,
      bannerActive: true,
      // isProfileModalVisible: false,
      imageModalVisible: false,
      showImage: true,
    };

    if (user_data.phone_hash) {
      analytics().setUserId(user_data.phone_hash);
      crashlytics().setUserId(user_data.phone_hash);
    }

    this.timer = null;
  }

  _onRefresh = () => {
    // this.props.getUserProfile();
    // if (this.props.user.user_data.deposit) {
    this.refreshUserWallet(this.props.user.wallet_id);
    //}

    // if (this.props.user.user_data && this.props.user.user_data.bvn) {
    if (this.props.user.user_data.bvn) {
      this.props.getUserSavings(this.props.user.user_data.bvn);
    }
  };

  async componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    // Initialize configs...
    this.initializePaystack();

    // Get banners if unable to fetch from the login page
    if (!this.state.information.bannerList?.length) {
      // console.log({ bannerList: this.state.information.bannerList });
      this.props.getImage();
    }
    // console.log({ information: this.state.information });
    // this.initializePushNotifications();

    // this.props.getDropdownOptions();
    // this.props.getStateOptions();
    // this.props.getLgaOptions();
    // this.props.getTransactionFeeTypes();
    // this.props.getLoanProducts();
    // this.props.getLoanReasons();
    this.props.getSavingsProducts();
    // this.props.getSavingsCollectionModes();
    this.props.getSavingsFrequencies();
    // this.props.getBillerCategories();

    // if (!this.props.user.preferences.organization) {
    //     this.props.getOrgPreferences();
    // }
    // this._unsubscribe = this.props.navigation.addListener('focus', () => {
    //if(this.props.user.user_data.deposit){

    //}
    //  });

    // Initialize user data
    this.props.getUserProfile();
    //this.refreshUserWallet(this.props.user.wallet_id);
    if (this.props.user.wallet_id) {
      this.props.getUserWallet(this.props.user.wallet_id);
    }
    // if(this.props.user.user_data.deposit && this.props.user.user_data.deposit.length>0){
    //     console.log("rttttt##rerer#")
    //      this.refreshUserWallet(this.props.user.user_data.deposit[0].ID);
    // }
    // const { user_data } = this.props.user;

    // if(user_data.firstName){

    // }
    if (this.props.user.user_data && this.props.user.user_data.bvn) {
      this.props.getUserSavings(this.props.user.user_data.bvn);
    }
    this.props.getReferalCode();
    // if (!visible) {
    //   this.timer = setTimeout(() => {
    //     this.setState({
    //       modal_visible: true
    //   })
    //   visible = true
    //   }, 10000);
    // } else {
    //   clearTimeout(this.timer)
    // }
    // this.props.getUserLoans();
    // this.props.getUserCards();
    // this.props.getUserAccounts();
    // this.props.getDocuments();
    // this.props.getUserNextOfKin();

    // Check and request permissions
  }
  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentDidUpdate(prevProps) {
    // if (!prevProps.isFocused && this.props.isFocused) {
    //     if (this.props.loans.user_loans.length > 0 && this.props.loans.user_loans[0].status.toLowerCase() === 'pending') {
    //         this.props.getUserLoans();
    //     }
    // }
    if (this.props.settings.deeplink_path) {
      this.props.navigation.navigate(this.props.settings.deeplink_path);
      this.props.clearDeepLinkPath();
    }

    if (!_.isEqual(this.props.user.user_data, prevProps.user.user_data)) {
      //  if(this.props.user.user_data.deposit){
      this.refreshUserWallet(this.props.user.wallet_id);

      // }
    }

    if (this.props.user.wallet_id !== prevProps.user.wallet_id) {
      this.props.getUserWallet(this.props.user.wallet_id);
    }

    if (this.props.information !== prevProps.information) {
      this.setState({
        information: this.props.information,
      });
    }
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      this.props.showExitDialog();
      return true;
    }
  };
  openImageModal = () => {
    this.setState({ imageModalVisible: true });
  };
  closeImageModal = () => {
    this.setState({ imageModalVisible: false });
  };

  navigateTo = (destination) => {
    if (destination === "Savings" || destination === "Loans") {
      const { user_data } = this.props.user;
      // if (!user_data.photoUrl) {
      //     this.props.showToastNav(Dictionary.COMPLETE_ONBOARDING, {
      //         action: this.handleCompleteSignUp,
      //         actionText: Dictionary.COMPLETE_ONBOARDING_BTN
      //     });
      //     return;
      // }
    }

    let event_name;
    switch (destination) {
      case "Settings":
        event_name = "dashboard_settings_menu";
        break;
      case "Notifications":
        event_name = "dashboard_notifications_button";
        break;
      case "Savings":
        event_name = "dashboard_investment_menu";
        break;
      case "Loans":
        event_name = "dashboard_loan_menu";
        break;
      case "Transfers":
        event_name = "dashboard_transfers_menu";
        break;
      case "Data":
        event_name = "dashboard_data_menu";
        break;
      case "Bills":
        event_name = "dashboard_bills_menu";
        break;
      case "Airtime":
        event_name = "dashboard_airtime_menu";
        break;
      case "Referrals":
        event_name = "dashboard_referrals_menu";
        break;
      case "Transactions":
        event_name = "dashboard_transactions_menu";
      case "AddDebitMethod":
        event_name = "dashboard_add_debit_method_menu";
        break;
      default:
        //
        break;
    }

    this.props.navigation.navigate(destination);
    Util.logEventData(event_name);
  };

  initializePaystack = () => {
    let publicKey = remoteConfig()
      .getValue(`paystack_key_${env().target}`)
      .asString();
    // console.log("dsddpubs", publicKey);
    RNPaystack.init({
      // publicKey: "pk_test_32e272bc5dcac5d9593787d9c713af4ba5eab1f5",
      publicKey: "pk_live_fed2ad4e9922a1226b5b6db113ddfc062a732a3f",
    });
  };

  initializePushNotifications = async () => {
    if (this.props.settings.app_notifications) {
      this.registerPushNotifications();
      //this.props.syncNotifications();
    } else {
      console.log("In-app notifications disabled by user");
    }
  };

  registerPushNotifications = async () => {
    const status = await messaging().requestPermission();
    const enabled =
      status === messaging.AuthorizationStatus.AUTHORIZED ||
      status === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled && Platform.OS === "android") {
      this.loadFcmToken();
    } else {
      console.log("Failed", "Push notification permission denied");
    }
  };

  loadFcmToken = async () => {
    try {
      await firebase.messaging().registerDeviceForRemoteMessages();
      let fcm_token = await messaging().getToken();
      if (fcm_token) {
        // console.log("Firebase Token:", fcm_token);
        Network.registerFcmToken(fcm_token)
          .then(() => {
            // console.log("FCM token registered successfully", fcm_token);
            this.openForegroundListener();
          })
          .catch((error) => {
            console.log("Unable to registerFCM token");
            console.log(JSON.stringify(error, null, 4));
          });
      } else {
        console.log("Unable to retrieve Firebase token");
      }
    } catch {}
  };

  openForegroundListener = async () => {
    try {
      const status = await messaging().requestPermission();
      const enabled =
        status === messaging.AuthorizationStatus.AUTHORIZED ||
        status === messaging.AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        messaging().onMessage(async (remoteMessage) => {
          this.handleNewNotification(remoteMessage);
        });

        messaging()
          .getInitialNotification()
          .then((remoteMessage) => {
            // Fallback for when server sends message that is not processible in quit state
            if (remoteMessage) {
              //this.handleNewNotification(remoteMessage);
            }
          });
      }
    } catch (error) {}
  };

  handleNewNotification = (remoteMessage) => {
    this.props.saveNotification(remoteMessage);
  };

  toggleProfileModal = () => {
    this.setState({ isProfileModalVisible: !this.state.isProfileModalVisible });
  };

  handleCompleteSignUp = () => {
    let { user_data } = this.props.user;
    if (!user_data.emailVerificationStatus) {
      this.props.navigation.navigate("EnterEmail");
    } else if (user_data.documents.length < 2) {
      if (
        (user_data?.documents[0]?.type &&
          user_data?.documents[0]?.type == "utility") ||
        user_data?.documents[0]?.type == "util"
      ) {
        this.props.navigation.navigate("UploadID", {
          update_user: true,
          redirectToDashboard: true,
        });
      } else {
        this.props.navigation.navigate("UploadUtility", {
          update_user: true,
        });
      }
      // } else if (!user_data.photoUrl) {
    } else if (!user_data.photoLocation) {
      this.props.navigation.navigate("OnboardSelfie");
    }
  };

  refreshUserWallet = (id) => {
    this.props.getUserWallet(id);
  };

  onTransfer = (account_type) => {
    this.setState(
      {
        modal_visible: false,
      },
      () => this.props.navigation.navigate("Transfers", { account_type })
    );
  };

  onCloseModal = () => {
    this.setState({
      modal_visible: false,
      information: false,
    });
  };

  render() {
    let { user_data } = this.props.user;
    let greeting = Dictionary.HI_USER;
    if (user_data.firstName) {
      greeting = greeting.replace(
        "%s",
        user_data.firstName.charAt(0).toUpperCase() +
          user_data.firstName.substring(1).toLowerCase()
      );
    } else {
      greeting = greeting.substring(0, 2);
    }
    let account_progress = 1;
    if (user_data.photoLocation && user_data.photoLocation != "") {
      account_progress += 1;
    }
    if (user_data.documents && user_data.documents.length > 1) {
      account_progress += 1;
    }
    if (user_data.emailVerificationStatus) {
      account_progress += 1;
    }

    let wallet = this.props.wallet.wallet_data;

    let highest_savings = null;
    const savings_products = [...this.props.savings.savings_products];
    if (savings_products.length > 0) {
      highest_savings = savings_products.sort(
        (a, b) => b.interest_rate - a.interest_rate
      )[0];
    }

    let lowest_loan = null;
    const loan_products = [...this.props.loans.loan_products];
    if (loan_products.length > 0) {
      lowest_loan = loan_products.sort(
        (a, b) => a.interest_rate - b.interest_rate
      )[0];
    }

    let outstanding_loans;
    try {
      let active_loans = this.props.loans.user_loans.filter(
        (loan) => loan.status.toLowerCase() === "running"
      );
      if (active_loans.length > 0) {
        outstanding_loans = active_loans.reduce((sum, loan) => {
          return sum + loan.schedule.amount_due;
        }, 0);
      }
    } catch (error) {
      console.log(JSON.stringify(error, null, 4));
    }

    let total_savings;
    try {
      let { user_savings } = this.props.savings;
      if (user_savings.length > 0) {
        total_savings = user_savings.reduce((sum, savings) => {
          return sum + Number(savings.balance);
        }, 0);
        total_savings = Util.formatAmount(total_savings);
      }
    } catch (error) {
      // console.log(JSON.stringify(error, null, 4));
    }

    let notifications = this.props.notifications?.user_notifications ?? [];
    let unread = notifications.filter((n) => !n?.is_read).length ?? 0;
    let unread_text = unread > 99 ? "99+" : unread;

    const transaction_count =
      (this.props.wallet.transaction_data &&
        this.props.wallet.transaction_data.length) ||
      0;
    const recent_transactions = this.props.wallet.transaction_data || [];
    let transaction_message =
      transaction_count > 0
        ? Dictionary.RECENT_TRANSACTIONS
        : `0 ${Dictionary.RECENT_TRANSACTIONS}`;

    const banners = this.state?.information?.bannerList?.map(
      (imageObj, index) => {
        return {
          key: index,
          ...imageObj,
        };
      }
    );

    if (this.state.showImage) {
      // console.log({ banners }); // Add this line

      return (
        <View style={SharedStyle.mainContainer}>
          <View style={styles.backdrop}>
            {banners?.length ? (
              <Banners
                finish={() => {
                  // Set the flag to false once the image is displayed
                }}
                banners={banners}
              />
            ) : (
              <ActivityIndicator />
            )}
          </View>
          <View style={styles.bannericonContainer}>
            <TouchItem
              onPress={() => {
                this.setState({ showImage: false });
              }}
            >
              <Icon.Feather
                size={Mixins.scaleSize(30)}
                style={{ color: Colors.PRIMARY_BLUE, textAlign: "center" }}
                name="x"
              />
            </TouchItem>
          </View>
        </View>
      );
    }

    return (
      <ScrollView
        style={SharedStyle.mainContainer}
        refreshControl={
          <RefreshControl
            refreshing={this.props.wallet.loading_wallet_data}
            onRefresh={this._onRefresh}
          />
        }
      >
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            {/* <Text style={styles.changeProfileText}>Change Profile Picture</Text> */}
            <TouchItem style={styles.navButton} onPress={this.openImageModal}>
              {!user_data.photoLocation || user_data.photoLocation === "" ? (
                <Image
                  style={styles.profileImage}
                  source={require("../../assets/images/shared/profile.png")}
                />
              ) : (
                <Image
                  style={styles.profileImage}
                  source={{ uri: user_data.photoLocation }}
                />
              )}
            </TouchItem>

            {/* <Lightbox
              useNativeDriver={false}
              activeProps={{
                style: { flex: 1, resizeMode: "contain" },
              }}
            >
              <Image
                style={styles.profileImage}
                source={
                  !user_data.photoLocation || user_data.photoLocation === ""
                    ? require("../../assets/images/shared/profile.png")
                    : { uri: user_data.photoLocation }
                }
              />
            </Lightbox> */}

            <Text style={styles.navText} numberOfLines={1}>
              {greeting}
            </Text>
            {user_data?.tier !== "" && (
              <View
                style={[
                  styles.tier,
                  {
                    backgroundColor:
                      user_data?.tier === "Tier 2"
                        ? Colors.LIGHT_BLUE_BG
                        : Colors.CV_YELLOW,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tierText,
                    {
                      color:
                        user_data?.tier === "Tier 2"
                          ? Colors.CV_BLUE
                          : Colors.WHITE,
                    },
                  ]}
                >{`${user_data?.tier}`}</Text>
              </View>
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              marginRight: 0,
              marginLeft: 0,
            }}
          >
            <TouchItem
              style={styles.navButton}
              onPress={() => this.navigateTo("Settings")}
            >
              <Icon.Ionicons
                name={"ios-settings-outline"}
                color={Colors.CV_BLUE}
                size={Mixins.scaleSize(28)}
              />
            </TouchItem>
            <TouchItem
              style={styles.navButton}
              onPress={() => this.navigateTo("Notifications")}
            >
              <Icon.Ionicons
                name={"ios-notifications-outline"}
                color={Colors.CV_BLUE}
                size={Mixins.scaleSize(28)}
              />

              {unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unread_text}</Text>
                </View>
              )}
            </TouchItem>
            {/* )} */}
          </View>
        </View>
        <_ScrollView {...this.props}>
          <Animatable.View
            animation="fadeInDown"
            duration={500}
            delay={500}
            style={{ paddingBottom: Mixins.scaleSize(15) }}
          >
            <View style={styles.wallet}>
              <View style={styles.walletDetails}>
                <View
                  style={[styles.walletIdContainer]}
                  disabled={this.props.wallet.loading_wallet_data}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <TouchItem
                      style={styles.copyButton}
                      onPress={() => {
                        Clipboard.setString(user_data?.nuban);
                        this.props.showToast(Dictionary.ACCOUNT_COPIED, false);
                      }}
                    >
                      <View style={styles.walletIdText}>
                        <Text
                          style={[SharedStyle.normalText, styles.walletId]}
                          numberOfLines={1}
                        >
                          {user_data.nuban || "- - -"}
                        </Text>
                      </View>
                      <Icon.MaterialCommunityIcons
                        size={Mixins.scaleSize(17)}
                        style={styles.copyIcon}
                        name="content-copy"
                      />
                    </TouchItem>
                    <Text
                      style={{
                        color: Colors.CV_YELLOW,
                        fontSize: Mixins.scaleSize(11),
                        marginLeft: Mixins.scaleSize(3),
                      }}
                    >
                      Copy
                    </Text>
                  </View>
                </View>
                {!this.props.wallet.loading_wallet_data && (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.walletBalance} numberOfLines={1}>
                      {this.state.showAmount
                        ? `₦${Util.formatAmount(
                            this.props.wallet.wallet_balance
                          )}`
                        : "* * * *"}
                    </Text>
                    <TouchItem
                      style={[{ backgroundColor: "white", marginLeft: 10 }]}
                      onPress={() => {
                        this.setState({
                          showAmount: !this.state.showAmount,
                        });
                      }}
                    >
                      <Icon.Ionicons
                        style={{ color: Colors.CV_YELLOW }}
                        size={Mixins.scaleSize(18)}
                        name={
                          !this.state.showAmount ? "ios-eye-off" : "ios-eye"
                        }
                      />
                    </TouchItem>
                    <Text
                      style={{
                        color: Colors.CV_YELLOW,
                        fontSize: Mixins.scaleSize(11),
                        marginLeft: Mixins.scaleSize(3),
                      }}
                    >
                      {!this.state.showAmount ? "Show" : "Hide"}
                    </Text>
                  </View>
                )}
              </View>
              <TouchItem
                style={styles.topup}
                onPress={() => this.navigateTo("FundWallet")}
                disabled={!this.props.user.wallet_id}
              >
                <View style={styles.topupButton}>
                  <Text style={styles.topupText} numberOfLines={1}>
                    {"Deposit"}
                  </Text>
                  <Icon.Entypo
                    size={Mixins.scaleSize(17)}
                    style={styles.topupIcon}
                    name="plus"
                  />
                </View>
              </TouchItem>
            </View>

            {account_progress < 4 && (
              <TouchItem
                style={styles.incomplete}
                onPress={() => this.handleCompleteSignUp()}
              >
                <View style={styles.incompleteText}>
                  <Text
                    style={[SharedStyle.normalText, styles.incompleteHeader]}
                    numberOfLines={1}
                  >
                    {Dictionary.COMPLETE_SIGNUP}
                  </Text>
                  <Text
                    style={[
                      SharedStyle.normalText,
                      styles.incompleteDescription,
                    ]}
                    numberOfLines={1}
                  >
                    {Dictionary.COMPLETE_SIGNUP_REASON}
                  </Text>
                </View>
                <View style={styles.incompleteProgress}>
                  <Progress.Bar
                    animated={false}
                    progress={account_progress}
                    width={null}
                    height={Mixins.scaleSize(12)}
                    borderRadius={Mixins.scaleSize(6)}
                    unfilledColor={Colors.PROGRESS_BG}
                    color={Colors.CV_GREEN}
                    borderWidth={0}
                  />
                </View>
              </TouchItem>
            )}
            <View style={styles.actionCards}>
              <View style={styles.cardContainer}>
                <TouchItem
                  style={[styles.card, styles.longCard]}
                  onPress={() => this.navigateTo("Savings")}
                >
                  <ImageBackground
                    style={styles.longCardBackground}
                    imageStyle={{ borderRadius: Mixins.scaleSize(8) }}
                    source={require("../../assets/images/dashboard/savings_card.png")}
                    resizeMode={"cover"}
                  >
                    <View style={styles.longCardContent}>
                      <View style={{ width: "100%" }}>
                        <View style={styles.longCardHeader}>
                          <Text style={styles.longCardHeaderText}>
                            {Dictionary.SAVINGS}
                          </Text>
                          <Image
                            style={styles.longCardIcon}
                            source={require("../../assets/images/dashboard/savings.png")}
                          />
                        </View>
                        {!total_savings && (
                          <View>
                            <Text
                              style={[
                                SharedStyle.normalText,
                                styles.longCardNormalText,
                              ]}
                            >
                              {Dictionary.ADD_SAVINGS}
                            </Text>
                            {!!highest_savings && (
                              <Text
                                style={[
                                  SharedStyle.normalText,
                                  styles.longCardNormalText,
                                  { ...Typography.FONT_BOLD },
                                ]}
                              >
                                {highest_savings.interest_rate}%{" "}
                                {Dictionary.INTEREST} {Dictionary.PER_ANNUM}
                              </Text>
                            )}
                          </View>
                        )}
                        {!!total_savings && (
                          <View>
                            <Text
                              style={[
                                SharedStyle.normalText,
                                styles.longCardNormalText,
                              ]}
                            >
                              {Dictionary.ADD_SAVINGS}
                            </Text>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <Text
                                style={[
                                  SharedStyle.normalText,
                                  styles.longCardNormalText,
                                  { ...Typography.FONT_BOLD },
                                ]}
                              >
                                11% interest
                              </Text>
                              <TouchItem
                                style={{ marginLeft: 10 }}
                                onPress={() => {
                                  this.setState({
                                    showSavingsBalance:
                                      !this.state.showSavingsBalance,
                                  });
                                }}
                              ></TouchItem>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  </ImageBackground>
                </TouchItem>
                <TouchItem
                  style={[styles.card, styles.longCard]}
                  onPress={() => {}}
                >
                  <ImageBackground
                    style={styles.longCardBackground}
                    imageStyle={{ borderRadius: Mixins.scaleSize(8) }}
                    source={require("../../assets/images/dashboard/loans_card.png")}
                    resizeMode={"cover"}
                  >
                    <View style={styles.longCardContent}>
                      <View style={{ width: "100%" }}>
                        <View style={styles.longCardHeader}>
                          <Text
                            style={[
                              styles.longCardHeaderText,
                              { color: Colors.CV_BLUE },
                            ]}
                          >
                            {Dictionary.LOANS}
                          </Text>
                          <Image
                            style={styles.longCardIcon}
                            source={require("../../assets/images/dashboard/loans.png")}
                          />
                        </View>
                        {!outstanding_loans && (
                          <View>
                            <Text
                              style={[
                                SharedStyle.normalText,
                                styles.longCardNormalText,
                                { color: Colors.CV_BLUE },
                              ]}
                            >
                              {Dictionary.GET_LOAN}
                            </Text>
                            <Animatable.Text
                              animation="zoomIn"
                              iterationCount={"infinite"}
                              direction="alternate"
                              style={[
                                SharedStyle.normalText,
                                styles.longCardNormalText,
                                {
                                  ...Typography.FONT_BOLD,
                                  color: Colors.CV_RED,
                                },
                              ]}
                            >
                              {Dictionary.COMING_SOON}
                            </Animatable.Text>
                            {!!lowest_loan && (
                              <Text
                                style={[
                                  SharedStyle.normalText,
                                  styles.longCardNormalText,
                                  {
                                    ...Typography.FONT_BOLD,
                                    color: Colors.CV_BLUE,
                                  },
                                ]}
                              >
                                {lowest_loan.interest_rate}%{" "}
                                {Dictionary.INTEREST}
                              </Text>
                            )}
                          </View>
                        )}
                        {!!outstanding_loans && (
                          <View>
                            <Text
                              style={[
                                SharedStyle.normalText,
                                styles.longCardNormalText,
                                { color: Colors.CV_BLUE },
                              ]}
                            >
                              {Dictionary.OUTSTANDING_LOAN}
                            </Text>
                            <Text
                              style={[
                                SharedStyle.normalText,
                                styles.longCardNormalText,
                                {
                                  ...Typography.FONT_BOLD,
                                  color: Colors.CV_BLUE,
                                },
                              ]}
                            >
                              ₦{Util.formatAmount(outstanding_loans)}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </ImageBackground>
                </TouchItem>
              </View>
              <View style={styles.cardContainer}>
                <TouchItem
                  style={[styles.card, styles.transfers]}
                  onPress={() => this.setState({ modal_visible: true })}
                >
                  <Text style={[SharedStyle.normalText, styles.transfersText]}>
                    {Dictionary.TRANSFERS}
                  </Text>
                  <Image
                    style={styles.shortCardIcon}
                    source={require("../../assets/images/dashboard/transfers.png")}
                  />
                </TouchItem>

                <TouchItem
                  style={[styles.card, styles.data]}
                  onPress={() => {
                    this.props.resetAirtimePurchase();
                    this.props.resetDataPurchase();
                    this.navigateTo("Data");
                  }}
                >
                  <Text style={[SharedStyle.normalText, styles.airtimeText]}>
                    {Dictionary.DATA}
                  </Text>
                  <Image
                    style={styles.shortCardIcon}
                    source={require("../../assets/images/dashboard/data.png")}
                  />
                </TouchItem>
              </View>

              <View style={styles.cardContainer}>
                <TouchItem
                  style={[styles.card, styles.bills]}
                  onPress={() => this.navigateTo("Bills")}
                >
                  <Text style={[SharedStyle.normalText, styles.billsText]}>
                    {Dictionary.BILL_PAYMENT}
                  </Text>
                  <Image
                    style={styles.shortCardIcon}
                    source={require("../../assets/images/dashboard/bill_payment.png")}
                  />
                </TouchItem>
                <TouchItem
                  style={[styles.card, styles.airtime]}
                  onPress={() => {
                    this.props.resetAirtimePurchase();
                    this.props.resetDataPurchase();
                    this.navigateTo("Airtime");
                  }}
                >
                  <Text style={[SharedStyle.normalText, styles.airtimeText]}>
                    {Dictionary.AIRTIME}
                  </Text>
                  <Image
                    style={styles.shortCardIcon}
                    source={require("../../assets/images/dashboard/airtime.png")}
                  />
                </TouchItem>
              </View>
              <View style={styles.cardContainer}>
                <TouchItem
                  style={[styles.card, styles.airtime]}
                  onPress={() => {
                    this.navigateTo("Referrals");
                  }}
                >
                  <Text style={[SharedStyle.normalText, styles.airtimeText]}>
                    {Dictionary.REFER_PEOPLE}
                  </Text>
                  <Image
                    style={styles.shortCardIcon}
                    source={require("../../assets/images/dashboard/airtime.png")}
                  />
                </TouchItem>
                <TouchItem
                  style={[
                    styles.card,
                    { backgroundColor: Colors.DARK_GREEN_BG },
                  ]}
                  onPress={() => {
                    this.navigateTo("Transactions");
                  }}
                >
                  <Text
                    style={[
                      SharedStyle.normalText,
                      styles.airtimeText,
                      { fontSize: 13 },
                    ]}
                  >
                    {Dictionary.TRANSACTIONS}
                  </Text>
                  <Icon.Feather
                    name="bar-chart-2"
                    color={Colors.CV_BLUE}
                    size={Mixins.scaleSize(28)}
                  />
                </TouchItem>
              </View>
            </View>
            <View style={styles.transactions}>
              {this.props.loading_wallet && (
                <SkeletonPlaceholder
                  backgroundColor={Colors.PILL_BG}
                  highlightColor={Colors.WHITE}
                >
                  <View style={styles.tLoader}>
                    <View>
                      <View style={styles.tRow}>
                        <View
                          style={[
                            styles.loaderPill,
                            styles.shortPill,
                            { marginRight: Mixins.scaleSize(8) },
                          ]}
                        />
                        <View style={[styles.loaderPill, styles.shortPill]} />
                      </View>
                      <View
                        style={[
                          styles.tRow,
                          { marginTop: Mixins.scaleSize(8) },
                        ]}
                      >
                        <View style={[styles.loaderPill, styles.longPill]} />
                      </View>
                    </View>
                    <View>
                      <View style={styles.tRow}>
                        <View
                          style={[
                            styles.loaderPill,
                            styles.shortPill,
                            { marginRight: Mixins.scaleSize(8) },
                          ]}
                        />
                        <View style={[styles.loaderPill, styles.tinyPill]} />
                      </View>
                      <View
                        style={[
                          styles.tRow,
                          {
                            marginTop: Mixins.scaleSize(8),
                            alignSelf: "flex-end",
                          },
                        ]}
                      >
                        <View style={[styles.loaderPill, styles.longPill]} />
                      </View>
                    </View>
                  </View>
                </SkeletonPlaceholder>
              )}
              {!this.props.loading_wallet && (
                <View>
                  <Text style={[SharedStyle.normalText, styles.summaryText]}>
                    {transaction_message}
                  </Text>
                  {transaction_count === 0 && (
                    <Image
                      style={styles.blankTransactions}
                      source={require("../../assets/images/dashboard/empty_transactions.png")}
                    />
                  )}
                  {recent_transactions.slice(0, 5).map((transaction, index) => {
                    return (
                      <TouchItem
                        key={index}
                        style={styles.transaction}
                        onPress={() => {
                          this.setState({
                            transaction_data: transaction,
                            receipt_modal_visible: true,
                          });
                          Util.logEventData("transactions_view", {
                            transaction_id: transaction.reference,
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
                                  Number(transaction.amount) < 1
                                    ? "#FDE3EA"
                                    : "#DFF1C8",
                                justifyContent: "center",
                                alignItems: "center",
                                alignSelf: "center",
                              }}
                            >
                              <Icon.Feather
                                name={
                                  Number(transaction.amount) < 1
                                    ? "arrow-up-right"
                                    : "arrow-down-left"
                                }
                                color={
                                  Number(transaction.amount) < 1
                                    ? "#BB0000"
                                    : "#00BB29"
                                }
                                size={Mixins.scaleSize(20)}
                              />
                            </View>

                            <View style={{ paddingLeft: 10 }}>
                              <Text numberOfLines={2} style={styles.walletId}>
                                {Util.returnNarration(
                                  transaction.notes,
                                  transaction.amount
                                )}
                              </Text>
                              <Text
                                numberOfLines={1}
                                style={[
                                  styles.transactionLabel,
                                  { paddingTop: 5 },
                                ]}
                              >
                                {moment(transaction.createdOn).format("DD-MMM")}{" "}
                                |{" "}
                                {moment(transaction.createdOn).format(
                                  "HH:mm A"
                                )}
                              </Text>
                            </View>
                          </View>

                          <View style={{ width: "auto" }}>
                            <Text
                              numberOfLines={1}
                              style={{
                                color:
                                  Number(transaction.amount) < 1
                                    ? "#BB0000"
                                    : "#00BB29",
                              }}
                            >
                              ₦
                              <Text style={{ fontSize: 16 }}>
                                {Util.formatAmount(
                                  Math.abs(transaction.amount)
                                )}
                              </Text>
                            </Text>
                          </View>
                        </View>
                      </TouchItem>
                    );
                  })}
                </View>
              )}
            </View>
          </Animatable.View>
        </_ScrollView>

        <Modal
          isVisible={this.state.modal_visible}
          animationIn={"slideInUp"}
          onBackdropPress={this.onCloseModal}
          swipeDirection="down"
          onSwipeComplete={this.onCloseModal}
          onBackButtonPress={this.onCloseModal}
          animationInTiming={300}
          animationOutTiming={500}
          backdropTransitionInTiming={300}
          backdropTransitionOutTiming={500}
          useNativeDriver={true}
          style={{ margin: 0 }}
        >
          <View
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              borderTopLeftRadius: Mixins.scaleSize(20),
              borderTopRightRadius: Mixins.scaleSize(20),
              backgroundColor: "white",
              ...Mixins.padding(15),
            }}
          >
            <View style={styles.modalHeader}>
              <TouchItem style={styles.icon} onPress={this.onCloseModal}>
                <Icon.Feather
                  size={Mixins.scaleSize(20)}
                  style={{ color: Colors.PRIMARY_BLUE }}
                  name="x"
                />
              </TouchItem>
            </View>
            <View>
              <Text style={styles.title} numberOfLines={1}>
                Transfer
              </Text>
              <View style={{ width: "90%", ...Mixins.padding(15, 0, 0, 0) }}>
                <Text style={styles.subtitle} numberOfLines={2}>
                  Sending money has never been easier. We can help you send
                  money with ease.
                </Text>
              </View>
            </View>
            <View style={{ ...Mixins.padding(25, 0, 0, 0) }}>
              <PrimaryButton
                hasLeftIcon
                title={Dictionary.TOUCHGOLD_BANK}
                icon="arrow-right"
                leftIcon="bank"
                onPress={() => this.onTransfer("TOUCH_GOLD")}
              />
            </View>
            <View style={{ ...Mixins.padding(15, 0, 15, 0) }}>
              <PrimaryButton
                hasLeftIcon
                title={Dictionary.OTHER_BANK}
                icon="arrow-right"
                leftIcon="bank"
                onPress={() => this.onTransfer("OTHERS")}
              />
            </View>
          </View>
        </Modal>
        <Modal
          transparent={true}
          animationIn={"slideInUp"}
          backdropOpacity={0.7}
          isVisible={this.state.imageModalVisible}
          style={{ margin: 0, width: "100%", bottom: 0 }}
          onBackdropPress={() => this.closeImageModal()}
        >
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: Mixins.scaleSize(350),
              borderTopLeftRadius: Mixins.scaleSize(10),
              borderTopRightRadius: Mixins.scaleSize(10),
              backgroundColor: "white",
              bottom: 0,
              paddingHorizontal: Mixins.scaleSize(18),
              paddingTop: Mixins.scaleSize(18),
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{
                  ...Typography.FONT_BOLD,
                  color: Colors.CV_BLUE,
                  fontSize: Mixins.scaleFont(20),
                  marginBottom: Mixins.scaleSize(20),
                }}
              >
                Profile Picture
              </Text>
              <TouchItem
                onPress={() => {
                  this.closeImageModal();
                }}
              >
                <Icon.Feather
                  size={Mixins.scaleSize(20)}
                  style={{ color: Colors.PRIMARY_BLUE, textAlign: "center" }}
                  name="x"
                />
              </TouchItem>
            </View>
            <Image
              style={styles.profileView}
              source={
                !user_data.photoLocation || user_data.photoLocation === ""
                  ? require("../../assets/images/shared/profile.png")
                  : { uri: user_data.photoLocation }
              }
              resizeMode="cover"
            />
            <View style={[SharedStyle.bottomPanel, { alignSelf: "center" }]}>
              <View>
                <PrimaryButton
                  title={"Choose New Photo"}
                  icon="arrow-right"
                  onPress={() => {
                    this.closeImageModal();
                    this.props.navigation.navigate("OnboardSelfie");
                  }}
                />
              </View>
            </View>
          </View>
        </Modal>
        <TransactionReceipt
          onCloseModal={() => this.setState({ receipt_modal_visible: false })}
          modal_visible={this.state.receipt_modal_visible}
          transaction_data={this.state.transaction_data}
          props={this.props}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  bannericonContainer: {
    position: "absolute",
    alignSelf: "center",
    justifyContent: "center",
    width: 50,
    height: 50,
    borderRadius: 50,
    borderColor: "white",
    backgroundColor: "#DCDCDC",
    opacity: 0.7,
    bottom: 15,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Adjust the opacity as needed
  },
  profileView: {
    width: 200,
    height: 200,
    // flex: 1,
    borderRadius: Mixins.scaleSize(100),
    alignSelf: "center",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  changeProfileText: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 8,
  },
  header: {
    // height: Mixins.scaleSize(64),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navButton: {
    ...Mixins.margin(16, 16, 16, 0), // Increase the bottom margin to 40\
  },
  navText: {
    ...Typography.FONT_REGULAR,
    fontSize: Mixins.scaleFont(18),
    // lineHeight: Mixins.scaleSize(21),
    // letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.DARK_GREY,
    // flex: 1,
    marginRight: 3,
    marginLeft: 5,
  },
  profileImage: {
    width: Mixins.scaleSize(30),
    height: Mixins.scaleSize(30),
    borderRadius: Mixins.scaleSize(8),
    resizeMode: "cover",
    backgroundColor: Colors.TAB_BG,
    ...Mixins.margin(0, 0, 0, 16), // Increase the bottom margin to 40\
  },
  badge: {
    position: "absolute",
    top: Mixins.scaleSize(11),
    right: Mixins.scaleSize(6),
    backgroundColor: Colors.LOGOUT_RED,
    borderRadius: Mixins.scaleSize(21),
    paddingHorizontal: Mixins.scaleSize(2),
    paddingVertical: Mixins.scaleSize(3.5),
    width: Mixins.scaleSize(18),
  },
  badgeText: {
    ...Typography.FONT_MEDIUM,
    color: Colors.WHITE,
    fontSize: Mixins.scaleFont(7),
    textAlign: "center",
  },
  wallet: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: Mixins.scaleSize(16),
    marginBottom: Mixins.scaleSize(3),
  },
  walletDetails: {
    paddingVertical: Mixins.scaleSize(12),
  },
  walletIdContainer: {
    flexDirection: "row",
    alignSelf: "flex-start",
    marginBottom: Mixins.scaleSize(5),
  },
  walletIdText: {
    ...Mixins.padding(2, 8, 2, 8),
    borderRadius: Mixins.scaleSize(4),
    backgroundColor: Colors.LIGHT_BG,
  },
  walletId: {
    ...Typography.FONT_REGULAR,
    color: Colors.DARK_GREY,
  },
  walletLoader: {
    marginLeft: Mixins.scaleSize(5),
    justifyContent: "center",
  },
  walletBalance: {
    ...Typography.FONT_BOLD,
    fontSize: Mixins.scaleFont(20),
    lineHeight: Mixins.scaleSize(37),
    color: Colors.DARK_GREY,
  },
  topup: {
    ...Mixins.padding(16, 12, 16, 12),
    //maxWidth: "30%"
  },
  topupText: {
    ...Typography.FONT_MEDIUM,
    marginRight: Mixins.scaleSize(6),
    fontSize: Mixins.scaleFont(14),
    color: Colors.CV_GREEN,
  },
  topupButton: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    width: Mixins.scaleSize(100),
    height: Mixins.scaleSize(32),
    backgroundColor: Colors.LIGHT_GREEN_BG,
    borderRadius: Mixins.scaleSize(5),
  },
  topupIcon: {
    color: Colors.CV_GREEN,
  },

  incomplete: {
    ...Mixins.padding(10),
    marginHorizontal: Mixins.scaleSize(16),
    marginBottom: Mixins.scaleSize(10),
    borderRadius: Mixins.scaleSize(4),
    backgroundColor: Colors.LIGHT_BG,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  incompleteText: {
    width: "60%",
  },
  incompleteHeader: {
    ...Typography.FONT_BOLD,
    color: Colors.DARK_GREY,
    marginBottom: Mixins.scaleSize(5),
  },
  incompleteDescription: {
    color: Colors.VERY_LIGHT_GREY,
  },
  incompleteProgress: {
    width: "35%",
  },
  actionCards: {
    marginBottom: Mixins.scaleSize(6),
  },
  cardContainer: {
    marginHorizontal: Mixins.scaleSize(16),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Mixins.scaleSize(16),
  },
  card: {
    ...Mixins.padding(10, 16, 10, 16),
    width: "48%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: Mixins.scaleSize(8),
  },
  longCard: {
    ...Mixins.padding(0),
    height: Mixins.scaleSize(225),
  },
  longCardBackground: {
    width: "100%",
    height: "100%",
  },
  longCardContent: {
    ...Mixins.padding(10, 16, 10, 16),
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  longCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Mixins.scaleSize(20),
  },
  longCardHeaderText: {
    ...Typography.FONT_BOLD,
    fontSize: Mixins.scaleFont(16),
    lineHeight: Mixins.scaleSize(19),
    letterSpacing: Mixins.scaleSize(0.01),
    textTransform: "uppercase",
    color: Colors.WHITE,
  },
  longCardIcon: {
    width: Mixins.scaleSize(25),
    height: Mixins.scaleSize(25),
  },
  longCardNormalText: {
    color: Colors.WHITE,
  },
  longCardButton: {
    backgroundColor: "rgba(0, 0 , 0, 0.15)",
    alignSelf: "flex-end",
    alignItems: "center",
    justifyContent: "center",
    width: Mixins.scaleSize(32),
    height: Mixins.scaleSize(32),
    borderRadius: Mixins.scaleSize(32),
  },
  longCardButtonIcon: {
    color: Colors.WHITE,
  },
  transfers: {
    backgroundColor: Colors.LIGHT_ORANGE_BG,
  },
  transfersText: {
    color: Colors.CV_YELLOW,
  },
  data: {
    backgroundColor: Colors.LIGHT_GREEN_BG,
  },
  dataText: {
    color: Colors.CV_GREEN,
  },
  bills: {
    backgroundColor: Colors.LIGHT_RED_BG,
  },
  billsText: {
    color: Colors.CV_RED,
  },
  airtime: {
    backgroundColor: Colors.LIGHT_BLUE_BG,
  },
  airtimeText: {
    color: Colors.CV_BLUE,
  },
  referral: {
    width: "100%",
    backgroundColor: Colors.LIGHT_GREEN_BG,
  },
  referralText: {
    color: Colors.CV_GREEN,
  },
  shortCardIcon: {
    width: Mixins.scaleSize(24),
    height: Mixins.scaleSize(24),
    resizeMode: "contain",
  },
  transactions: {
    marginHorizontal: Mixins.scaleSize(16),
  },
  summaryText: {
    ...Typography.FONT_MEDIUM,
    color: Colors.LIGHT_GREY,
    marginBottom: Mixins.scaleSize(10),
  },
  tLoader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tRow: {
    flexDirection: "row",
  },
  loaderPill: {
    height: Mixins.scaleSize(16),
    borderRadius: Mixins.scaleSize(10),
  },
  shortPill: {
    width: Mixins.scaleSize(56),
  },
  longPill: {
    width: Mixins.scaleSize(77),
  },
  tinyPill: {
    width: Mixins.scaleSize(20),
  },
  blankTransactions: {
    width: "100%",
    height: Mixins.scaleSize(50),
    resizeMode: "contain",
  },
  transaction: {
    borderTopWidth: Mixins.scaleSize(1),
    borderTopColor: Colors.FAINT_BORDER,
    paddingTop: Mixins.scaleSize(6),
  },
  transactionRow: {
    marginBottom: Mixins.scaleSize(3),
  },
  transactionLeft: {
    width: "68%",
  },
  transactionRight: {
    width: "30%",
    textAlign: "right",
  },
  transactionLabel: {
    ...SharedStyle.normalText,
    color: Colors.VERY_LIGHT_GREY,
  },
  transactionValue: {
    ...SharedStyle.normalText,
    color: Colors.LIGHT_GREY,
  },
  showAllButton: {
    paddingVertical: Mixins.scaleSize(5),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeader: {
    // backgroundColor: "#f6f7fe",
    width: "100%",
    display: "flex",
  },
  title: {
    color: Colors.CV_BLUE,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Mixins.scaleFont(24),
    fontWeight: "bold",
    lineHeight: 28.13,
  },
  subtitle: {
    color: Colors.CV_BLUE,
    fontFamily: Typography.FONT_FAMILY_REGULAR,
    fontSize: Mixins.scaleFont(14),
    lineHeight: 16.41,
  },
  shield: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 15,
    paddingBottom: 25,
  },
  shieldText: {
    fontSize: 8,
    color: "#EB001B",
  },
  greatJob: {
    color: Colors.DARK_GREY,
    fontSize: 22,
    paddingBottom: 10,
    ...Typography.FONT_BOLD,
  },
  icon: {
    alignSelf: "center",
    // display: "flex",
    justifyContent: "center",
    width: 50,
    height: 50,
    borderRadius: 50,
    borderColor: "white",
    backgroundColor: "#DCDCDC",
    opacity: 0.7,
    marginBottom: 50,
    alignItems: "center",
  },

  copyButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  copyIcon: {
    ...Mixins.margin(0, 0, 0, 0),
    color: Colors.CV_YELLOW,
  },
  tier: {
    width: Mixins.scaleSize(37),
    height: Mixins.scaleSize(15),
    borderRadius: 5,
    // marginBottom: 16,
    // display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  tierText: {
    ...Typography.FONT_REGULAR,
    fontSize: 12,
    textAlign: "center",
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    settings: state.settings,
    wallet: state.wallet,
    loading_wallet: state.wallet.loading_wallet_data,
    savings: state.savings,
    loans: state.loans,
    notifications: state.notifications,
    information: state.information,
  };
};

const mapDispatchToProps = {
  showToast,
  showToastNav,
  showExitDialog,
  getOrgPreferences,
  getDropdownOptions,
  getStateOptions,
  getLgaOptions,
  getUserProfile,
  getUserWallet,
  getUserNextOfKin,
  getTransactionFeeTypes,
  getLoanProducts,
  getLoanReasons,
  getUserSavings,
  getSavingsProducts,
  getSavingsCollectionModes,
  getSavingsFrequencies,
  getBillerCategories,
  getUserLoans,
  getUserCards,
  getUserAccounts,
  resetDataPurchase,
  resetAirtimePurchase,
  syncNotifications,
  saveNotification,
  getDocuments,
  showScreenInactivityDialog,
  hideScreenInactivityDialog,
  clearDeepLinkPath,
  getReferalCode,
  getImage,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(Dashboard));

// import React, { Component } from "react";
// import remoteConfig from "@react-native-firebase/remote-config";
// import {
//   BackHandler,
//   StyleSheet,
//   ActivityIndicator,
//   View,
//   Text,
//   Image,
//   ImageBackground,
//   ScrollView,
//   RefreshControl,
//   TouchableOpacity,
// } from "react-native";
// import { connect } from "react-redux";
// import { withNavigationFocus } from "react-navigation";
// import * as Icon from "@expo/vector-icons";
// import RNPaystack from "react-native-paystack";
// import * as Progress from "react-native-progress";
// import messaging from "@react-native-firebase/messaging";
// import SkeletonPlaceholder from "react-native-skeleton-placeholder";
// import moment from "moment";
// import analytics from "@react-native-firebase/analytics";
// import crashlytics from "@react-native-firebase/crashlytics";
// import _ from "lodash";
// import Modal from "react-native-modal";
// import Clipboard from "@react-native-community/clipboard";
// import * as Animatable from "react-native-animatable";

// import { showToast, showToastNav } from "_actions/toast_actions";
// import {
//   getDropdownOptions,
//   getStateOptions,
//   getLgaOptions,
// } from "_actions/config_actions";
// import { showExitDialog } from "_actions/util_actions";
// import {
//   getOrgPreferences,
//   getUserProfile,
//   showScreenInactivityDialog,
//   hideScreenInactivityDialog,
//   getReferalCode,
// } from "_actions/user_actions";
// import { getTransactionFeeTypes } from "_actions/transaction_actions";
// import { getImage } from "_actions/information_actions";
// import { getUserWallet } from "_actions/wallet_actions";
// import {
//   getUserSavings,
//   getSavingsProducts,
//   getSavingsCollectionModes,
//   getSavingsFrequencies,
// } from "_actions/savings_actions";
// import {
//   getLoanProducts,
//   getLoanReasons,
//   getUserLoans,
// } from "_actions/loan_actions";
// import { getUserCards, getUserAccounts } from "_actions/payment_actions";
// import { resetDataPurchase } from "_actions/data_actions";
// import { resetAirtimePurchase } from "_actions/airtime_actions";
// import { getBillerCategories } from "_actions/bills_actions";
// import {
//   syncNotifications,
//   saveNotification,
// } from "_actions/notification_actions";
// import { getUserNextOfKin } from "_actions/next_of_kin_actions";
// import { getDocuments } from "_actions/document_actions";
// import { clearDeepLinkPath } from "_actions/settings_actions";
// import { env, Dictionary, Util } from "_utils";
// import { Colors, Mixins, Typography, SharedStyle, FormStyle } from "_styles";
// import { TouchItem, ScrollView as _ScrollView } from "_atoms";
// import { ActionButton, PrimaryButton } from "_molecules";
// import TransactionReceipt from "_screens/shared/transaction_receipt";
// import Lightbox from "react-native-lightbox";
// import Banners from "_organisms/slider";
// import AppIntroSlider from "react-native-app-intro-slider";

// /** @typedef {object} imageObject
//  * @property {number} id
//  * @property {string} name
//  * @property {string} ctaUrl
//  * @property {string} url
//  * @property {string} status
//  * @property {string} description
//  */

// import { Network } from "_services";
// let visible = false;

// class Dashboard extends Component {
//   constructor(props) {
//     super(props);
//     const { user_data } = this.props.user;
//     console.log({ information: this.props.information });
//     this.state = {
//       greeting: "",
//       UserInactivityState: false,
//       _isActive: true,
//       refreshing: false,
//       showAmount: false,
//       showSavingsBalance: false,
//       modal_visible: false,
//       receipt_modal_visible: false,
//       transaction_data: {},
//       image: this.props.information.image,
//       /** @type {{bannerList: imageObject[], imageActive: boolean}} */
//       information: this.props.information,
//       bannerActive: true,
//       // isProfileModalVisible: false,
//       imageModalVisible: false,
//     };

//     if (user_data.phone_hash) {
//       analytics().setUserId(user_data.phone_hash);
//       crashlytics().setUserId(user_data.phone_hash);
//     }

//     this.timer = null;
//   }

//   _onRefresh = () => {
//     // this.props.getUserProfile();
//     // if (this.props.user.user_data.deposit) {
//     this.refreshUserWallet(this.props.user.wallet_id);
//     //}

//     // if (this.props.user.user_data && this.props.user.user_data.bvn) {
//     if (this.props.user.user_data.bvn) {
//       this.props.getUserSavings(this.props.user.user_data.bvn);
//     }
//   };

//   async componentDidMount() {
//     BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
//     // Initialize configs...
//     this.initializePaystack();

//     // Get banners if unable to fetch from the login page
//     if (!this.state.information.bannerList?.length) {
//       this.props.getImage();
//     }

//     // this.initializePushNotifications();

//     // this.props.getDropdownOptions();
//     // this.props.getStateOptions();
//     // this.props.getLgaOptions();
//     // this.props.getTransactionFeeTypes();
//     // this.props.getLoanProducts();
//     // this.props.getLoanReasons();
//     this.props.getSavingsProducts();
//     // this.props.getSavingsCollectionModes();
//     this.props.getSavingsFrequencies();
//     // this.props.getBillerCategories();

//     // if (!this.props.user.preferences.organization) {
//     //     this.props.getOrgPreferences();
//     // }
//     // this._unsubscribe = this.props.navigation.addListener('focus', () => {
//     //if(this.props.user.user_data.deposit){

//     //}
//     //  });

//     // Initialize user data
//     this.props.getUserProfile();
//     //this.refreshUserWallet(this.props.user.wallet_id);
//     if (this.props.user.wallet_id) {
//       this.props.getUserWallet(this.props.user.wallet_id);
//     }
//     // if(this.props.user.user_data.deposit && this.props.user.user_data.deposit.length>0){
//     //     console.log("rttttt##rerer#")
//     //      this.refreshUserWallet(this.props.user.user_data.deposit[0].ID);
//     // }
//     // const { user_data } = this.props.user;

//     // if(user_data.firstName){

//     // }
//     if (this.props.user.user_data && this.props.user.user_data.bvn) {
//       this.props.getUserSavings(this.props.user.user_data.bvn);
//     }
//     this.props.getReferalCode();
//     // if (!visible) {
//     //   this.timer = setTimeout(() => {
//     //     this.setState({
//     //       modal_visible: true
//     //   })
//     //   visible = true
//     //   }, 10000);
//     // } else {
//     //   clearTimeout(this.timer)
//     // }
//     // this.props.getUserLoans();
//     // this.props.getUserCards();
//     // this.props.getUserAccounts();
//     // this.props.getDocuments();
//     // this.props.getUserNextOfKin();

//     // Check and request permissions
//   }
//   componentWillUnmount() {
//     BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
//   }

//   componentDidUpdate(prevProps) {
//     // if (!prevProps.isFocused && this.props.isFocused) {
//     //     if (this.props.loans.user_loans.length > 0 && this.props.loans.user_loans[0].status.toLowerCase() === 'pending') {
//     //         this.props.getUserLoans();
//     //     }
//     // }
//     if (this.props.settings.deeplink_path) {
//       this.props.navigation.navigate(this.props.settings.deeplink_path);
//       this.props.clearDeepLinkPath();
//     }

//     if (!_.isEqual(this.props.user.user_data, prevProps.user.user_data)) {
//       //  if(this.props.user.user_data.deposit){
//       this.refreshUserWallet(this.props.user.wallet_id);

//       // }
//     }

//     if (this.props.user.wallet_id !== prevProps.user.wallet_id) {
//       this.props.getUserWallet(this.props.user.wallet_id);
//     }

//     if (this.props.information !== prevProps.information) {
//       this.setState({
//         information: this.props.information,
//       });
//     }
//   }

//   handleBackButton = () => {
//     if (this.props.isFocused) {
//       this.props.showExitDialog();
//       return true;
//     }
//   };
//   openImageModal = () => {
//     this.setState({ imageModalVisible: true });
//   };
//   closeImageModal = () => {
//     this.setState({ imageModalVisible: false });
//   };

//   navigateTo = (destination) => {
//     if (destination === "Savings" || destination === "Loans") {
//       const { user_data } = this.props.user;
//       // if (!user_data.photoUrl) {
//       //     this.props.showToastNav(Dictionary.COMPLETE_ONBOARDING, {
//       //         action: this.handleCompleteSignUp,
//       //         actionText: Dictionary.COMPLETE_ONBOARDING_BTN
//       //     });
//       //     return;
//       // }
//     }

//     let event_name;
//     switch (destination) {
//       case "Settings":
//         event_name = "dashboard_settings_menu";
//         break;
//       case "Notifications":
//         event_name = "dashboard_notifications_button";
//         break;
//       case "Savings":
//         event_name = "dashboard_investment_menu";
//         break;
//       case "Loans":
//         event_name = "dashboard_loan_menu";
//         break;
//       case "Transfers":
//         event_name = "dashboard_transfers_menu";
//         break;
//       case "Data":
//         event_name = "dashboard_data_menu";
//         break;
//       case "Bills":
//         event_name = "dashboard_bills_menu";
//         break;
//       case "Airtime":
//         event_name = "dashboard_airtime_menu";
//         break;
//       case "Referrals":
//         event_name = "dashboard_referrals_menu";
//         break;
//       case "Transactions":
//         event_name = "dashboard_transactions_menu";
//       case "AddDebitMethod":
//         event_name = "dashboard_add_debit_method_menu";
//         break;
//       default:
//         //
//         break;
//     }

//     this.props.navigation.navigate(destination);
//     Util.logEventData(event_name);
//   };

//   initializePaystack = () => {
//     // This part of this code has an issue, Please check what the paystack_key_$ is doing.
//     let publicKey = remoteConfig()
//       .getValue(paystack_key_$(env().target))
//       .asString();
//     console.log("dsddpubs", publicKey);
//     RNPaystack.init({
//       //publicKey: "pk_test_32e272bc5dcac5d9593787d9c713af4ba5eab1f5"
//       publicKey: "pk_live_fed2ad4e9922a1226b5b6db113ddfc062a732a3f",
//     });
//   };

//   initializePushNotifications = async () => {
//     if (this.props.settings.app_notifications) {
//       this.registerPushNotifications();
//       //this.props.syncNotifications();
//     } else {
//       console.log("In-app notifications disabled by user");
//     }
//   };

//   registerPushNotifications = async () => {
//     const status = await messaging().requestPermission();
//     const enabled =
//       status === messaging.AuthorizationStatus.AUTHORIZED ||
//       status === messaging.AuthorizationStatus.PROVISIONAL;
//     if (enabled && Platform.OS === "android") {
//       this.loadFcmToken();
//     } else {
//       console.log("Failed", "Push notification permission denied");
//     }
//   };

//   loadFcmToken = async () => {
//     try {
//       await firebase.messaging().registerDeviceForRemoteMessages();
//       let fcm_token = await messaging().getToken();
//       if (fcm_token) {
//         console.log("Firebase Token:", fcm_token);
//         Network.registerFcmToken(fcm_token)
//           .then(() => {
//             console.log("FCM token registered successfully", fcm_token);
//             this.openForegroundListener();
//           })
//           .catch((error) => {
//             console.log("Unable to registerFCM token");
//             console.log(JSON.stringify(error, null, 4));
//           });
//       } else {
//         console.log("Unable to retrieve Firebase token");
//       }
//     } catch {}
//   };

//   openForegroundListener = async () => {
//     try {
//       const status = await messaging().requestPermission();
//       const enabled =
//         status === messaging.AuthorizationStatus.AUTHORIZED ||
//         status === messaging.AuthorizationStatus.PROVISIONAL;
//       if (enabled) {
//         messaging().onMessage(async (remoteMessage) => {
//           this.handleNewNotification(remoteMessage);
//         });

//         messaging()
//           .getInitialNotification()
//           .then((remoteMessage) => {
//             // Fallback for when server sends message that is not processible in quit state
//             if (remoteMessage) {
//               //this.handleNewNotification(remoteMessage);
//             }
//           });
//       }
//     } catch (error) {}
//   };

//   handleNewNotification = (remoteMessage) => {
//     this.props.saveNotification(remoteMessage);
//   };

//   toggleProfileModal = () => {
//     this.setState({ isProfileModalVisible: !this.state.isProfileModalVisible });
//   };

//   handleCompleteSignUp = () => {
//     let { user_data } = this.props.user;
//     if (!user_data.emailVerificationStatus) {
//       this.props.navigation.navigate("EnterEmail");
//     } else if (user_data.documents.length < 2) {
//       if (
//         (user_data?.documents[0]?.type &&
//           user_data?.documents[0]?.type == "utility") ||
//         user_data?.documents[0]?.type == "util"
//       ) {
//         this.props.navigation.navigate("UploadID", {
//           update_user: true,
//           redirectToDashboard: true,
//         });
//       } else {
//         this.props.navigation.navigate("UploadUtility", {
//           update_user: true,
//         });
//       }
//       // } else if (!user_data.photoUrl) {
//     } else if (!user_data.photoLocation) {
//       this.props.navigation.navigate("OnboardSelfie");
//     }
//   };

//   refreshUserWallet = (id) => {
//     this.props.getUserWallet(id);
//   };

//   onTransfer = (account_type) => {
//     this.setState(
//       {
//         modal_visible: false,
//       },
//       () => this.props.navigation.navigate("Transfers", { account_type })
//     );
//   };

//   onCloseModal = () => {
//     this.setState({
//       modal_visible: false,
//       information: false,
//     });
//   };

//   render() {
//     let { user_data } = this.props.user;
//     let greeting = Dictionary.HI_USER;
//     if (user_data.firstName) {
//       greeting = greeting.replace(
//         "%s",
//         user_data.firstName.charAt(0).toUpperCase() +
//           user_data.firstName.substring(1).toLowerCase()
//       );
//     } else {
//       greeting = greeting.substring(0, 2);
//     }
//     let account_progress = 1;
//     if (user_data.photoLocation && user_data.photoLocation != "") {
//       account_progress += 1;
//     }
//     if (user_data.documents && user_data.documents.length > 1) {
//       account_progress += 1;
//     }
//     if (user_data.emailVerificationStatus) {
//       account_progress += 1;
//     }

//     let wallet = this.props.wallet.wallet_data;

//     let highest_savings = null;
//     const savings_products = [...this.props.savings.savings_products];
//     if (savings_products.length > 0) {
//       highest_savings = savings_products.sort(
//         (a, b) => b.interest_rate - a.interest_rate
//       )[0];
//     }

//     let lowest_loan = null;
//     const loan_products = [...this.props.loans.loan_products];
//     if (loan_products.length > 0) {
//       lowest_loan = loan_products.sort(
//         (a, b) => a.interest_rate - b.interest_rate
//       )[0];
//     }

//     let outstanding_loans;
//     try {
//       let active_loans = this.props.loans.user_loans.filter(
//         (loan) => loan.status.toLowerCase() === "running"
//       );
//       if (active_loans.length > 0) {
//         outstanding_loans = active_loans.reduce((sum, loan) => {
//           return sum + loan.schedule.amount_due;
//         }, 0);
//       }
//     } catch (error) {
//       console.log(JSON.stringify(error, null, 4));
//     }

//     let total_savings;
//     try {
//       let { user_savings } = this.props.savings;
//       if (user_savings.length > 0) {
//         total_savings = user_savings.reduce((sum, savings) => {
//           return sum + Number(savings.balance);
//         }, 0);
//         total_savings = Util.formatAmount(total_savings);
//       }
//     } catch (error) {
//       console.log(JSON.stringify(error, null, 4));
//     }

//     let notifications = this.props.notifications?.user_notifications ?? [];
//     let unread = notifications.filter((n) => !n?.is_read).length ?? 0;
//     let unread_text = unread > 99 ? "99+" : unread;

//     const transaction_count =
//       (this.props.wallet.transaction_data &&
//         this.props.wallet.transaction_data.length) ||
//       0;
//     const recent_transactions = this.props.wallet.transaction_data || [];
//     let transaction_message =
//       transaction_count > 0
//         ? Dictionary.RECENT_TRANSACTIONS
//         : `0 ${Dictionary.RECENT_TRANSACTIONS}`;

//     if (this.props.user.loading_profile || this.state.bannerActive) {
//       const banners = this.state?.information?.bannerList?.map(
//         (imageObj, index) => {
//           return {
//             key: index,
//             ...imageObj,
//           };
//         }
//       );

//       return (
//         <View
//           style={[
//             SharedStyle.mainContainer,
//             { alignItems: "center", justifyContent: "center", flex: 1 },
//           ]}
//         >
//           {Boolean(banners?.length) ? (
//             <>
//               <Banners
//                 finish={() => {
//                   this.setState({ bannerActive: false });
//                 }}
//                 banners={banners}
//               />
//               <TouchItem
//                 style={styles.icon}
//                 onPress={() => {
//                   this.setState({ bannerActive: false });

//                   // why is this line of code here
//                   // banners?.finish && banners.finish();
//                 }}
//               >
//                 <Icon.Feather
//                   size={Mixins.scaleSize(30)}
//                   style={{ color: Colors.PRIMARY_BLUE, textAlign: "center" }}
//                   name="x"
//                 />
//               </TouchItem>
//             </>
//           ) : (
//             <ActivityIndicator />
//           )}
//         </View>
//       );
//     }
//     return (
//       <ScrollView
//         style={SharedStyle.mainContainer}
//         refreshControl={
//           <RefreshControl
//             refreshing={this.props.wallet.loading_wallet_data}
//             onRefresh={this._onRefresh}
//           />
//         }
//       >
//         <View style={styles.header}>
//           <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
//             {/* <Text style={styles.changeProfileText}>Change Profile Picture</Text> */}
//             <TouchItem style={styles.navButton} onPress={this.openImageModal}>
//               {!user_data.photoLocation || user_data.photoLocation === "" ? (
//                 <Image
//                   style={styles.profileImage}
//                   source={require("../../assets/images/shared/profile.png")}
//                 />
//               ) : (
//                 <Image
//                   style={styles.profileImage}
//                   source={{ uri: user_data.photoLocation }}
//                 />
//               )}
//             </TouchItem>
//             <Text style={styles.navText} numberOfLines={1}>
//               {greeting}
//             </Text>
//             {user_data?.tier !== "" && (
//               <View
//                 style={[
//                   styles.tier,
//                   {
//                     backgroundColor:
//                       user_data?.tier === "Tier 2"
//                         ? Colors.LIGHT_BLUE_BG
//                         : Colors.CV_YELLOW,
//                   },
//                 ]}
//               >
//                 <Text
//                   style={[
//                     styles.tierText,
//                     {
//                       color:
//                         user_data?.tier === "Tier 2"
//                           ? Colors.CV_BLUE
//                           : Colors.WHITE,
//                     },
//                   ]}
//                 >{`${user_data?.tier}`}</Text>
//               </View>
//             )}
//           </View>
//           <View
//             style={{
//               flexDirection: "row",
//               marginRight: 0,
//               marginLeft: 0,
//             }}
//           >
//             <TouchItem
//               style={styles.navButton}
//               onPress={() => this.navigateTo("Settings")}
//             >
//               <Icon.Ionicons
//                 name={"ios-settings-outline"}
//                 color={Colors.CV_BLUE}
//                 size={Mixins.scaleSize(28)}
//               />
//             </TouchItem>
//             <TouchItem
//               style={styles.navButton}
//               onPress={() => this.navigateTo("Notifications")}
//             >
//               <Icon.Ionicons
//                 name={"ios-notifications-outline"}
//                 color={Colors.CV_BLUE}
//                 size={Mixins.scaleSize(28)}
//               />

//               {unread > 0 && (
//                 <View style={styles.badge}>
//                   <Text style={styles.badgeText}>{unread_text}</Text>
//                 </View>
//               )}
//             </TouchItem>
//             {/* )} */}
//           </View>
//         </View>
//         <_ScrollView {...this.props}>
//           <Animatable.View
//             animation="fadeInDown"
//             duration={500}
//             delay={500}
//             style={{ paddingBottom: Mixins.scaleSize(15) }}
//           >
//             <View style={styles.wallet}>
//               <View style={styles.walletDetails}>
//                 <View
//                   style={[styles.walletIdContainer]}
//                   disabled={this.props.wallet.loading_wallet_data}
//                 >
//                   <View
//                     style={{
//                       flexDirection: "row",
//                       justifyContent: "space-between",
//                     }}
//                   >
//                     <TouchItem
//                       style={styles.copyButton}
//                       onPress={() => {
//                         Clipboard.setString(user_data?.nuban);
//                         this.props.showToast(Dictionary.ACCOUNT_COPIED, false);
//                       }}
//                     >
//                       <View style={styles.walletIdText}>
//                         <Text
//                           style={[SharedStyle.normalText, styles.walletId]}
//                           numberOfLines={1}
//                         >
//                           {user_data.nuban || "- - -"}
//                         </Text>
//                       </View>
//                       <Icon.MaterialCommunityIcons
//                         size={Mixins.scaleSize(17)}
//                         style={styles.copyIcon}
//                         name="content-copy"
//                       />
//                     </TouchItem>
//                     <Text
//                       style={{
//                         color: Colors.CV_YELLOW,
//                         fontSize: Mixins.scaleSize(11),
//                         marginLeft: Mixins.scaleSize(3),
//                       }}
//                     >
//                       Copy
//                     </Text>
//                   </View>
//                 </View>
//                 {!this.props.wallet.loading_wallet_data && (
//                   <View style={{ flexDirection: "row", alignItems: "center" }}>
//                     <Text style={styles.walletBalance} numberOfLines={1}>
//                       {this.state.showAmount
//                         ? `₦${Util.formatAmount(
//                             this.props.wallet.wallet_balance
//                           )}`
//                         : "* * * *"}
//                     </Text>
//                     <TouchItem
//                       style={[{ backgroundColor: "white", marginLeft: 10 }]}
//                       onPress={() => {
//                         this.setState({
//                           showAmount: !this.state.showAmount,
//                         });
//                       }}
//                     >
//                       <Icon.Ionicons
//                         style={{ color: Colors.CV_YELLOW }}
//                         size={Mixins.scaleSize(18)}
//                         name={
//                           !this.state.showAmount ? "ios-eye-off" : "ios-eye"
//                         }
//                       />
//                     </TouchItem>
//                     <Text
//                       style={{
//                         color: Colors.CV_YELLOW,
//                         fontSize: Mixins.scaleSize(11),
//                         marginLeft: Mixins.scaleSize(3),
//                       }}
//                     >
//                       {!this.state.showAmount ? "Show" : "Hide"}
//                     </Text>
//                   </View>
//                 )}
//               </View>
//               <TouchItem
//                 style={styles.topup}
//                 onPress={() => this.navigateTo("FundWallet")}
//                 disabled={!this.props.user.wallet_id}
//               >
//                 <View style={styles.topupButton}>
//                   <Text style={styles.topupText} numberOfLines={1}>
//                     {"Deposit"}
//                   </Text>
//                   <Icon.Entypo
//                     size={Mixins.scaleSize(17)}
//                     style={styles.topupIcon}
//                     name="plus"
//                   />
//                 </View>
//               </TouchItem>
//             </View>

//             {account_progress < 4 && (
//               <TouchItem
//                 style={styles.incomplete}
//                 onPress={() => this.handleCompleteSignUp()}
//               >
//                 <View style={styles.incompleteText}>
//                   <Text
//                     style={[SharedStyle.normalText, styles.incompleteHeader]}
//                     numberOfLines={1}
//                   >
//                     {Dictionary.COMPLETE_SIGNUP}
//                   </Text>
//                   <Text
//                     style={[
//                       SharedStyle.normalText,
//                       styles.incompleteDescription,
//                     ]}
//                     numberOfLines={1}
//                   >
//                     {Dictionary.COMPLETE_SIGNUP_REASON}
//                   </Text>
//                 </View>
//                 <View style={styles.incompleteProgress}>
//                   <Progress.Bar
//                     animated={false}
//                     progress={account_progress}
//                     width={null}
//                     height={Mixins.scaleSize(12)}
//                     borderRadius={Mixins.scaleSize(6)}
//                     unfilledColor={Colors.PROGRESS_BG}
//                     color={Colors.CV_GREEN}
//                     borderWidth={0}
//                   />
//                 </View>
//               </TouchItem>
//             )}
//             <View style={styles.actionCards}>
//               <View style={styles.cardContainer}>
//                 <TouchItem
//                   style={[styles.card, styles.longCard]}
//                   onPress={() => this.navigateTo("Savings")}
//                 >
//                   <ImageBackground
//                     style={styles.longCardBackground}
//                     imageStyle={{ borderRadius: Mixins.scaleSize(8) }}
//                     source={require("../../assets/images/dashboard/savings_card.png")}
//                     resizeMode={"cover"}
//                   >
//                     <View style={styles.longCardContent}>
//                       <View style={{ width: "100%" }}>
//                         <View style={styles.longCardHeader}>
//                           <Text style={styles.longCardHeaderText}>
//                             {Dictionary.SAVINGS}
//                           </Text>
//                           <Image
//                             style={styles.longCardIcon}
//                             source={require("../../assets/images/dashboard/savings.png")}
//                           />
//                         </View>
//                         {!total_savings && (
//                           <View>
//                             <Text
//                               style={[
//                                 SharedStyle.normalText,
//                                 styles.longCardNormalText,
//                               ]}
//                             >
//                               {Dictionary.ADD_SAVINGS}
//                             </Text>
//                             {!!highest_savings && (
//                               <Text
//                                 style={[
//                                   SharedStyle.normalText,
//                                   styles.longCardNormalText,
//                                   { ...Typography.FONT_BOLD },
//                                 ]}
//                               >
//                                 {highest_savings.interest_rate}%{" "}
//                                 {Dictionary.INTEREST} {Dictionary.PER_ANNUM}
//                               </Text>
//                             )}
//                           </View>
//                         )}
//                         {!!total_savings && (
//                           <View>
//                             <Text
//                               style={[
//                                 SharedStyle.normalText,
//                                 styles.longCardNormalText,
//                               ]}
//                             >
//                               {Dictionary.ADD_SAVINGS}
//                             </Text>
//                             <View
//                               style={{
//                                 flexDirection: "row",
//                                 alignItems: "center",
//                               }}
//                             >
//                               <Text
//                                 style={[
//                                   SharedStyle.normalText,
//                                   styles.longCardNormalText,
//                                   { ...Typography.FONT_BOLD },
//                                 ]}
//                               >
//                                 11% interest
//                               </Text>
//                               <TouchItem
//                                 style={{ marginLeft: 10 }}
//                                 onPress={() => {
//                                   this.setState({
//                                     showSavingsBalance:
//                                       !this.state.showSavingsBalance,
//                                   });
//                                 }}
//                               ></TouchItem>
//                             </View>
//                           </View>
//                         )}
//                       </View>
//                     </View>
//                   </ImageBackground>
//                 </TouchItem>
//                 <TouchItem
//                   style={[styles.card, styles.longCard]}
//                   onPress={() => {}}
//                 >
//                   <ImageBackground
//                     style={styles.longCardBackground}
//                     imageStyle={{ borderRadius: Mixins.scaleSize(8) }}
//                     source={require("../../assets/images/dashboard/loans_card.png")}
//                     resizeMode={"cover"}
//                   >
//                     <View style={styles.longCardContent}>
//                       <View style={{ width: "100%" }}>
//                         <View style={styles.longCardHeader}>
//                           <Text
//                             style={[
//                               styles.longCardHeaderText,
//                               { color: Colors.CV_BLUE },
//                             ]}
//                           >
//                             {Dictionary.LOANS}
//                           </Text>
//                           <Image
//                             style={styles.longCardIcon}
//                             source={require("../../assets/images/dashboard/loans.png")}
//                           />
//                         </View>
//                         {!outstanding_loans && (
//                           <View>
//                             <Text
//                               style={[
//                                 SharedStyle.normalText,
//                                 styles.longCardNormalText,
//                                 { color: Colors.CV_BLUE },
//                               ]}
//                             >
//                               {Dictionary.GET_LOAN}
//                             </Text>
//                             <Animatable.Text
//                               animation="zoomIn"
//                               iterationCount={"infinite"}
//                               direction="alternate"
//                               style={[
//                                 SharedStyle.normalText,
//                                 styles.longCardNormalText,
//                                 {
//                                   ...Typography.FONT_BOLD,
//                                   color: Colors.CV_RED,
//                                 },
//                               ]}
//                             >
//                               {Dictionary.COMING_SOON}
//                             </Animatable.Text>
//                             {!!lowest_loan && (
//                               <Text
//                                 style={[
//                                   SharedStyle.normalText,
//                                   styles.longCardNormalText,
//                                   {
//                                     ...Typography.FONT_BOLD,
//                                     color: Colors.CV_BLUE,
//                                   },
//                                 ]}
//                               >
//                                 {lowest_loan.interest_rate}%{" "}
//                                 {Dictionary.INTEREST}
//                               </Text>
//                             )}
//                           </View>
//                         )}
//                         {!!outstanding_loans && (
//                           <View>
//                             <Text
//                               style={[
//                                 SharedStyle.normalText,
//                                 styles.longCardNormalText,
//                                 { color: Colors.CV_BLUE },
//                               ]}
//                             >
//                               {Dictionary.OUTSTANDING_LOAN}
//                             </Text>
//                             <Text
//                               style={[
//                                 SharedStyle.normalText,
//                                 styles.longCardNormalText,
//                                 {
//                                   ...Typography.FONT_BOLD,
//                                   color: Colors.CV_BLUE,
//                                 },
//                               ]}
//                             >
//                               ₦{Util.formatAmount(outstanding_loans)}
//                             </Text>
//                           </View>
//                         )}
//                       </View>
//                     </View>
//                   </ImageBackground>
//                 </TouchItem>
//               </View>
//               <View style={styles.cardContainer}>
//                 <TouchItem
//                   style={[styles.card, styles.transfers]}
//                   onPress={() => this.setState({ modal_visible: true })}
//                 >
//                   <Text style={[SharedStyle.normalText, styles.transfersText]}>
//                     {Dictionary.TRANSFERS}
//                   </Text>
//                   <Image
//                     style={styles.shortCardIcon}
//                     source={require("../../assets/images/dashboard/transfers.png")}
//                   />
//                 </TouchItem>

//                 <TouchItem
//                   style={[styles.card, styles.data]}
//                   onPress={() => {
//                     this.props.resetAirtimePurchase();
//                     this.props.resetDataPurchase();
//                     this.navigateTo("Data");
//                   }}
//                 >
//                   <Text style={[SharedStyle.normalText, styles.airtimeText]}>
//                     {Dictionary.DATA}
//                   </Text>
//                   <Image
//                     style={styles.shortCardIcon}
//                     source={require("../../assets/images/dashboard/data.png")}
//                   />
//                 </TouchItem>
//               </View>

//               <View style={styles.cardContainer}>
//                 <TouchItem
//                   style={[styles.card, styles.bills]}
//                   onPress={() => this.navigateTo("Bills")}
//                 >
//                   <Text style={[SharedStyle.normalText, styles.billsText]}>
//                     {Dictionary.BILL_PAYMENT}
//                   </Text>
//                   <Image
//                     style={styles.shortCardIcon}
//                     source={require("../../assets/images/dashboard/bill_payment.png")}
//                   />
//                 </TouchItem>
//                 <TouchItem
//                   style={[styles.card, styles.airtime]}
//                   onPress={() => {
//                     this.props.resetAirtimePurchase();
//                     this.props.resetDataPurchase();
//                     this.navigateTo("Airtime");
//                   }}
//                 >
//                   <Text style={[SharedStyle.normalText, styles.airtimeText]}>
//                     {Dictionary.AIRTIME}
//                   </Text>
//                   <Image
//                     style={styles.shortCardIcon}
//                     source={require("../../assets/images/dashboard/airtime.png")}
//                   />
//                 </TouchItem>
//               </View>
//               <View style={styles.cardContainer}>
//                 <TouchItem
//                   style={[styles.card, styles.airtime]}
//                   onPress={() => {
//                     this.navigateTo("Referrals");
//                   }}
//                 >
//                   <Text style={[SharedStyle.normalText, styles.airtimeText]}>
//                     {Dictionary.REFER_PEOPLE}
//                   </Text>
//                   <Image
//                     style={styles.shortCardIcon}
//                     source={require("../../assets/images/dashboard/airtime.png")}
//                   />
//                 </TouchItem>
//                 <TouchItem
//                   style={[
//                     styles.card,
//                     { backgroundColor: Colors.DARK_GREEN_BG },
//                   ]}
//                   onPress={() => {
//                     this.navigateTo("Transactions");
//                   }}
//                 >
//                   <Text
//                     style={[
//                       SharedStyle.normalText,
//                       styles.airtimeText,
//                       { fontSize: 13 },
//                     ]}
//                   >
//                     {Dictionary.TRANSACTIONS}
//                   </Text>
//                   <Icon.Feather
//                     name="bar-chart-2"
//                     color={Colors.CV_BLUE}
//                     size={Mixins.scaleSize(28)}
//                   />
//                 </TouchItem>
//               </View>
//             </View>
//             <View style={styles.transactions}>
//               {this.props.loading_wallet && (
//                 <SkeletonPlaceholder
//                   backgroundColor={Colors.PILL_BG}
//                   highlightColor={Colors.WHITE}
//                 >
//                   <View style={styles.tLoader}>
//                     <View>
//                       <View style={styles.tRow}>
//                         <View
//                           style={[
//                             styles.loaderPill,
//                             styles.shortPill,
//                             { marginRight: Mixins.scaleSize(8) },
//                           ]}
//                         />
//                         <View style={[styles.loaderPill, styles.shortPill]} />
//                       </View>
//                       <View
//                         style={[
//                           styles.tRow,
//                           { marginTop: Mixins.scaleSize(8) },
//                         ]}
//                       >
//                         <View style={[styles.loaderPill, styles.longPill]} />
//                       </View>
//                     </View>
//                     <View>
//                       <View style={styles.tRow}>
//                         <View
//                           style={[
//                             styles.loaderPill,
//                             styles.shortPill,
//                             { marginRight: Mixins.scaleSize(8) },
//                           ]}
//                         />
//                         <View style={[styles.loaderPill, styles.tinyPill]} />
//                       </View>
//                       <View
//                         style={[
//                           styles.tRow,
//                           {
//                             marginTop: Mixins.scaleSize(8),
//                             alignSelf: "flex-end",
//                           },
//                         ]}
//                       >
//                         <View style={[styles.loaderPill, styles.longPill]} />
//                       </View>
//                     </View>
//                   </View>
//                 </SkeletonPlaceholder>
//               )}
//               {!this.props.loading_wallet && (
//                 <View>
//                   <Text style={[SharedStyle.normalText, styles.summaryText]}>
//                     {transaction_message}
//                   </Text>
//                   {transaction_count === 0 && (
//                     <Image
//                       style={styles.blankTransactions}
//                       source={require("../../assets/images/dashboard/empty_transactions.png")}
//                     />
//                   )}
//                   {recent_transactions.slice(0, 5).map((transaction, index) => {
//                     return (
//                       <TouchItem
//                         key={index}
//                         style={styles.transaction}
//                         onPress={() => {
//                           this.setState({
//                             transaction_data: transaction,
//                             receipt_modal_visible: true,
//                           });
//                           Util.logEventData("transactions_view", {
//                             transaction_id: transaction.reference,
//                           });
//                         }}
//                       >
//                         <View style={SharedStyle.row}>
//                           <View style={{ flexDirection: "row", width: "60%" }}>
//                             <View
//                               style={{
//                                 width: Mixins.scaleSize(42),
//                                 height: Mixins.scaleSize(42),
//                                 borderRadius: 50,
//                                 backgroundColor:
//                                   Number(transaction.amount) < 1
//                                     ? "#FDE3EA"
//                                     : "#DFF1C8",
//                                 justifyContent: "center",
//                                 alignItems: "center",
//                                 alignSelf: "center",
//                               }}
//                             >
//                               <Icon.Feather
//                                 name={
//                                   Number(transaction.amount) < 1
//                                     ? "arrow-up-right"
//                                     : "arrow-down-left"
//                                 }
//                                 color={
//                                   Number(transaction.amount) < 1
//                                     ? "#BB0000"
//                                     : "#00BB29"
//                                 }
//                                 size={Mixins.scaleSize(20)}
//                               />
//                             </View>

//                             <View style={{ paddingLeft: 10 }}>
//                               <Text numberOfLines={2} style={styles.walletId}>
//                                 {Util.returnNarration(
//                                   transaction.notes,
//                                   transaction.amount
//                                 )}
//                               </Text>
//                               <Text
//                                 numberOfLines={1}
//                                 style={[
//                                   styles.transactionLabel,
//                                   { paddingTop: 5 },
//                                 ]}
//                               >
//                                 {moment(transaction.createdOn).format("DD-MMM")}

//                                 {moment(transaction.createdOn).format(
//                                   "HH:mm A"
//                                 )}
//                               </Text>
//                             </View>
//                           </View>

//                           <View style={{ width: "auto" }}>
//                             <Text
//                               numberOfLines={1}
//                               style={{
//                                 color:
//                                   Number(transaction.amount) < 1
//                                     ? "#BB0000"
//                                     : "#00BB29",
//                               }}
//                             >
//                               ₦
//                               <Text style={{ fontSize: 16 }}>
//                                 {Util.formatAmount(
//                                   Math.abs(transaction.amount)
//                                 )}
//                               </Text>
//                             </Text>
//                           </View>
//                         </View>
//                       </TouchItem>
//                     );
//                   })}
//                 </View>
//               )}
//             </View>
//           </Animatable.View>
//         </_ScrollView>

//         <Modal
//           isVisible={this.state.modal_visible}
//           animationIn={"slideInUp"}
//           onBackdropPress={this.onCloseModal}
//           swipeDirection="down"
//           onSwipeComplete={this.onCloseModal}
//           onBackButtonPress={this.onCloseModal}
//           animationInTiming={300}
//           animationOutTiming={500}
//           backdropTransitionInTiming={300}
//           backdropTransitionOutTiming={500}
//           useNativeDriver={true}
//           style={{ margin: 0 }}
//         >
//           <View
//             style={{
//               position: "absolute",
//               bottom: 0,
//               width: "100%",
//               borderTopLeftRadius: Mixins.scaleSize(20),
//               borderTopRightRadius: Mixins.scaleSize(20),
//               backgroundColor: "white",
//               ...Mixins.padding(15),
//             }}
//           >
//             <View style={styles.modalHeader}>
//               <TouchItem style={styles.icon} onPress={this.onCloseModal}>
//                 <Icon.Feather
//                   size={Mixins.scaleSize(20)}
//                   style={{ color: Colors.PRIMARY_BLUE }}
//                   name="x"
//                 />
//               </TouchItem>
//             </View>
//             <View>
//               <Text style={styles.title} numberOfLines={1}>
//                 Transfer
//               </Text>
//               <View style={{ width: "90%", ...Mixins.padding(15, 0, 0, 0) }}>
//                 <Text style={styles.subtitle} numberOfLines={2}>
//                   Sending money has never been easier. We can help you send
//                   money with ease.
//                 </Text>
//               </View>
//             </View>
//             <View style={{ ...Mixins.padding(25, 0, 0, 0) }}>
//               <PrimaryButton
//                 hasLeftIcon
//                 title={Dictionary.TOUCHGOLD_BANK}
//                 icon="arrow-right"
//                 leftIcon="bank"
//                 onPress={() => this.onTransfer("TOUCH_GOLD")}
//               />
//             </View>
//             <View style={{ ...Mixins.padding(15, 0, 15, 0) }}>
//               <PrimaryButton
//                 hasLeftIcon
//                 title={Dictionary.OTHER_BANK}
//                 icon="arrow-right"
//                 leftIcon="bank"
//                 onPress={() => this.onTransfer("OTHERS")}
//               />
//             </View>
//           </View>
//         </Modal>
//         <Modal
//           transparent={true}
//           animationIn={"slideInUp"}
//           backdropOpacity={0.5}
//           isVisible={this.state.imageModalVisible}
//           style={{ margin: 0, width: "100%", bottom: 0 }}
//           onBackdropPress={() => this.closeImageModal()}
//         >
//           <View
//             style={{
//               position: "absolute",
//               width: "100%",
//               height: Mixins.scaleSize(330),
//               borderTopLeftRadius: Mixins.scaleSize(10),
//               borderTopRightRadius: Mixins.scaleSize(10),
//               backgroundColor: "white",
//               bottom: 0,
//               paddingHorizontal: Mixins.scaleSize(18),
//               paddingTop: Mixins.scaleSize(18),
//             }}
//           >
//             <View
//               style={{ flexDirection: "row", justifyContent: "space-between" }}
//             >
//               <Text
//                 style={{
//                   ...Typography.FONT_BOLD,
//                   color: Colors.CV_BLUE,
//                   fontSize: Mixins.scaleFont(20),
//                   marginBottom: Mixins.scaleSize(20),
//                 }}
//               >
//                 Profile Picture
//               </Text>
//               <TouchItem
//                 onPress={() => {
//                   this.closeImageModal();
//                 }}
//               >
//                 <Icon.Feather
//                   size={Mixins.scaleSize(20)}
//                   style={{ color: Colors.PRIMARY_BLUE, textAlign: "center" }}
//                   name="x"
//                 />
//               </TouchItem>
//             </View>
//             <Image
//               style={styles.profileView}
//               source={
//                 !user_data.photoLocation || user_data.photoLocation === ""
//                   ? require("../../assets/images/shared/profile.png")
//                   : { uri: user_data.photoLocation }
//               }
//               resizeMode="cover"
//             />
//             <View style={[SharedStyle.bottomPanel, { alignSelf: "center" }]}>
//               <View>
//                 <PrimaryButton
//                   title={"Choose New Photo"}
//                   icon="arrow-right"
//                   onPress={() => {
//                     this.closeImageModal();
//                     this.props.navigation.navigate("OnboardSelfie");
//                   }}
//                 />
//               </View>
//             </View>
//           </View>
//         </Modal>
//         <TransactionReceipt
//           onCloseModal={() => this.setState({ receipt_modal_visible: false })}
//           modal_visible={this.state.receipt_modal_visible}
//           transaction_data={this.state.transaction_data}
//           props={this.props}
//         />
//       </ScrollView>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   profileView: {
//     width: 200,
//     height: 200,
//     // flex: 1,
//     borderRadius: Mixins.scaleSize(100),
//     alignSelf: "center",
//   },
//   profileImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//   },

//   changeProfileText: {
//     fontSize: 14,
//     color: Colors.primary,
//     marginTop: 8,
//   },
//   header: {
//     // height: Mixins.scaleSize(64),
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   navButton: {
//     ...Mixins.margin(16, 16, 16, 0), // Increase the bottom margin to 40\
//   },
//   navText: {
//     ...Typography.FONT_REGULAR,
//     fontSize: Mixins.scaleFont(18),
//     // lineHeight: Mixins.scaleSize(21),
//     // letterSpacing: Mixins.scaleSize(0.01),
//     color: Colors.DARK_GREY,
//     // flex: 1,
//     marginRight: 3,
//     marginLeft: 5,
//   },
//   profileImage: {
//     width: Mixins.scaleSize(30),
//     height: Mixins.scaleSize(30),
//     borderRadius: Mixins.scaleSize(8),
//     resizeMode: "cover",
//     backgroundColor: Colors.TAB_BG,
//     ...Mixins.margin(0, 0, 0, 16), // Increase the bottom margin to 40\
//   },
//   badge: {
//     position: "absolute",
//     top: Mixins.scaleSize(11),
//     right: Mixins.scaleSize(6),
//     backgroundColor: Colors.LOGOUT_RED,
//     borderRadius: Mixins.scaleSize(21),
//     paddingHorizontal: Mixins.scaleSize(2),
//     paddingVertical: Mixins.scaleSize(3.5),
//     width: Mixins.scaleSize(18),
//   },
//   badgeText: {
//     ...Typography.FONT_MEDIUM,
//     color: Colors.WHITE,
//     fontSize: Mixins.scaleFont(7),
//     textAlign: "center",
//   },
//   wallet: {
//     flex: 1,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginHorizontal: Mixins.scaleSize(16),
//     marginBottom: Mixins.scaleSize(3),
//   },
//   walletDetails: {
//     paddingVertical: Mixins.scaleSize(12),
//   },
//   walletIdContainer: {
//     flexDirection: "row",
//     alignSelf: "flex-start",
//     marginBottom: Mixins.scaleSize(5),
//   },
//   walletIdText: {
//     ...Mixins.padding(2, 8, 2, 8),
//     borderRadius: Mixins.scaleSize(4),
//     backgroundColor: Colors.LIGHT_BG,
//   },
//   walletId: {
//     ...Typography.FONT_REGULAR,
//     color: Colors.DARK_GREY,
//   },
//   walletLoader: {
//     marginLeft: Mixins.scaleSize(5),
//     justifyContent: "center",
//   },
//   walletBalance: {
//     ...Typography.FONT_BOLD,
//     fontSize: Mixins.scaleFont(20),
//     lineHeight: Mixins.scaleSize(37),
//     color: Colors.DARK_GREY,
//   },
//   topup: {
//     ...Mixins.padding(16, 12, 16, 12),
//     //maxWidth: "30%"
//   },
//   topupText: {
//     ...Typography.FONT_MEDIUM,
//     marginRight: Mixins.scaleSize(6),
//     fontSize: Mixins.scaleFont(14),
//     color: Colors.CV_GREEN,
//   },
//   topupButton: {
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//     width: Mixins.scaleSize(100),
//     height: Mixins.scaleSize(32),
//     backgroundColor: Colors.LIGHT_GREEN_BG,
//     borderRadius: Mixins.scaleSize(5),
//   },
//   topupIcon: {
//     color: Colors.CV_GREEN,
//   },

//   incomplete: {
//     ...Mixins.padding(10),
//     marginHorizontal: Mixins.scaleSize(16),
//     marginBottom: Mixins.scaleSize(10),
//     borderRadius: Mixins.scaleSize(4),
//     backgroundColor: Colors.LIGHT_BG,
//     flex: 1,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   incompleteText: {
//     width: "60%",
//   },
//   incompleteHeader: {
//     ...Typography.FONT_BOLD,
//     color: Colors.DARK_GREY,
//     marginBottom: Mixins.scaleSize(5),
//   },
//   incompleteDescription: {
//     color: Colors.VERY_LIGHT_GREY,
//   },
//   incompleteProgress: {
//     width: "35%",
//   },
//   actionCards: {
//     marginBottom: Mixins.scaleSize(6),
//   },
//   cardContainer: {
//     marginHorizontal: Mixins.scaleSize(16),
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: Mixins.scaleSize(16),
//   },
//   card: {
//     ...Mixins.padding(10, 16, 10, 16),
//     width: "48%",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderRadius: Mixins.scaleSize(8),
//   },
//   longCard: {
//     ...Mixins.padding(0),
//     height: Mixins.scaleSize(225),
//   },
//   longCardBackground: {
//     width: "100%",
//     height: "100%",
//   },
//   longCardContent: {
//     ...Mixins.padding(10, 16, 10, 16),
//     flex: 1,
//     flexDirection: "column",
//     justifyContent: "space-between",
//   },
//   longCardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: Mixins.scaleSize(20),
//   },
//   longCardHeaderText: {
//     ...Typography.FONT_BOLD,
//     fontSize: Mixins.scaleFont(16),
//     lineHeight: Mixins.scaleSize(19),
//     letterSpacing: Mixins.scaleSize(0.01),
//     textTransform: "uppercase",
//     color: Colors.WHITE,
//   },
//   longCardIcon: {
//     width: Mixins.scaleSize(25),
//     height: Mixins.scaleSize(25),
//   },
//   longCardNormalText: {
//     color: Colors.WHITE,
//   },
//   longCardButton: {
//     backgroundColor: "rgba(0, 0 , 0, 0.15)",
//     alignSelf: "flex-end",
//     alignItems: "center",
//     justifyContent: "center",
//     width: Mixins.scaleSize(32),
//     height: Mixins.scaleSize(32),
//     borderRadius: Mixins.scaleSize(32),
//   },
//   longCardButtonIcon: {
//     color: Colors.WHITE,
//   },
//   transfers: {
//     backgroundColor: Colors.LIGHT_ORANGE_BG,
//   },
//   transfersText: {
//     color: Colors.CV_YELLOW,
//   },
//   data: {
//     backgroundColor: Colors.LIGHT_GREEN_BG,
//   },
//   dataText: {
//     color: Colors.CV_GREEN,
//   },
//   bills: {
//     backgroundColor: Colors.LIGHT_RED_BG,
//   },
//   billsText: {
//     color: Colors.CV_RED,
//   },
//   airtime: {
//     backgroundColor: Colors.LIGHT_BLUE_BG,
//   },
//   airtimeText: {
//     color: Colors.CV_BLUE,
//   },
//   referral: {
//     width: "100%",
//     backgroundColor: Colors.LIGHT_GREEN_BG,
//   },
//   referralText: {
//     color: Colors.CV_GREEN,
//   },
//   shortCardIcon: {
//     width: Mixins.scaleSize(24),
//     height: Mixins.scaleSize(24),
//     resizeMode: "contain",
//   },
//   transactions: {
//     marginHorizontal: Mixins.scaleSize(16),
//   },
//   summaryText: {
//     ...Typography.FONT_MEDIUM,
//     color: Colors.LIGHT_GREY,
//     marginBottom: Mixins.scaleSize(10),
//   },
//   tLoader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   tRow: {
//     flexDirection: "row",
//   },
//   loaderPill: {
//     height: Mixins.scaleSize(16),
//     borderRadius: Mixins.scaleSize(10),
//   },
//   shortPill: {
//     width: Mixins.scaleSize(56),
//   },
//   longPill: {
//     width: Mixins.scaleSize(77),
//   },
//   tinyPill: {
//     width: Mixins.scaleSize(20),
//   },
//   blankTransactions: {
//     width: "100%",
//     height: Mixins.scaleSize(50),
//     resizeMode: "contain",
//   },
//   transaction: {
//     borderTopWidth: Mixins.scaleSize(1),
//     borderTopColor: Colors.FAINT_BORDER,
//     paddingTop: Mixins.scaleSize(6),
//   },
//   transactionRow: {
//     marginBottom: Mixins.scaleSize(3),
//   },
//   transactionLeft: {
//     width: "68%",
//   },
//   transactionRight: {
//     width: "30%",
//     textAlign: "right",
//   },
//   transactionLabel: {
//     ...SharedStyle.normalText,
//     color: Colors.VERY_LIGHT_GREY,
//   },
//   transactionValue: {
//     ...SharedStyle.normalText,
//     color: Colors.LIGHT_GREY,
//   },
//   showAllButton: {
//     paddingVertical: Mixins.scaleSize(5),
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalHeader: {
//     // backgroundColor: "#f6f7fe",
//     width: "100%",
//     display: "flex",
//   },
//   title: {
//     color: Colors.CV_BLUE,
//     fontFamily: Typography.FONT_FAMILY_REGULAR,
//     fontSize: Mixins.scaleFont(24),
//     fontWeight: "bold",
//     lineHeight: 28.13,
//   },
//   subtitle: {
//     color: Colors.CV_BLUE,
//     fontFamily: Typography.FONT_FAMILY_REGULAR,
//     fontSize: Mixins.scaleFont(14),
//     lineHeight: 16.41,
//   },
//   shield: {
//     display: "flex",
//     flexDirection: "row",
//     alignItems: "center",
//     paddingTop: 15,
//     paddingBottom: 25,
//   },
//   shieldText: {
//     fontSize: 8,
//     color: "#EB001B",
//   },
//   greatJob: {
//     color: Colors.DARK_GREY,
//     fontSize: 22,
//     paddingBottom: 10,
//     ...Typography.FONT_BOLD,
//   },
//   icon: {
//     alignSelf: "center",
//     display: "flex",
//     justifyContent: "center",
//     width: 50,
//     height: 50,
//     borderRadius: 50,
//     borderColor: "white",
//     backgroundColor: "#DCDCDC",
//     opacity: 0.7,
//     marginBottom: 50,
//   },
//   copyButton: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   copyIcon: {
//     ...Mixins.margin(0, 0, 0, 0),
//     color: Colors.CV_YELLOW,
//   },
//   tier: {
//     width: Mixins.scaleSize(37),
//     height: Mixins.scaleSize(15),
//     borderRadius: 5,
//     // marginBottom: 16,
//     // display: "flex",
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   tierText: {
//     ...Typography.FONT_REGULAR,
//     fontSize: 12,
//     textAlign: "center",
//   },
// });

// const mapStateToProps = (state) => {
//   return {
//     user: state.user,
//     settings: state.settings,
//     wallet: state.wallet,
//     loading_wallet: state.wallet.loading_wallet_data,
//     savings: state.savings,
//     loans: state.loans,
//     notifications: state.notifications,
//     information: state.information,
//   };
// };

// const mapDispatchToProps = {
//   showToast,
//   showToastNav,
//   showExitDialog,
//   getOrgPreferences,
//   getDropdownOptions,
//   getStateOptions,
//   getLgaOptions,
//   getUserProfile,
//   getUserWallet,
//   getUserNextOfKin,
//   getTransactionFeeTypes,
//   getLoanProducts,
//   getLoanReasons,
//   getUserSavings,
//   getSavingsProducts,
//   getSavingsCollectionModes,
//   getSavingsFrequencies,
//   getBillerCategories,
//   getUserLoans,
//   getUserCards,
//   getUserAccounts,
//   resetDataPurchase,
//   resetAirtimePurchase,
//   syncNotifications,
//   saveNotification,
//   getDocuments,
//   showScreenInactivityDialog,
//   hideScreenInactivityDialog,
//   clearDeepLinkPath,
//   getReferalCode,
//   getImage,
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(withNavigationFocus(Dashboard));
