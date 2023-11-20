// import React, { Component } from "react";
// import {
//   BackHandler,
//   ActivityIndicator,
//   StyleSheet,
//   View,
//   Text,
//   Image,
//   Share,
//   Dimensions,
// } from "react-native";
// import { connect } from "react-redux";
// import { withNavigationFocus } from "react-navigation";
// import remoteConfig from "@react-native-firebase/remote-config";
// import Clipboard from "@react-native-community/clipboard";
// import * as Icon from "@expo/vector-icons";

// import { showToast } from "_actions/toast_actions";
// import { getReferralActivities, getReferalCode } from "_actions/user_actions";

// import { env, Dictionary, Util, AppConstants } from "_utils";
// import { Colors, Mixins, Typography, SharedStyle, FormStyle } from "_styles";
// import { ScrollView, TouchItem } from "_atoms";
// import { PrimaryButton } from "_molecules";
// import { MainHeader } from "_organisms";
// import axios from "axios";
// import { setStatusBarStyle, resetStatusBarStyle } from "_actions/util_actions";

// //5v6mYz53!

// const { width } = Dimensions.get("window");

// class Referrals extends Component {
//   constructor(props) {
//     super(props);

//     const linkPrefix = remoteConfig()
//       .getValue(`referral_link_prefix_${env().target}`)
//       .asString();
//     const default_ref = remoteConfig()
//       .getValue(`default_referral_code_${env().target}`)
//       .asString();
//     const referral_message = remoteConfig()
//       .getValue(`referral_message_${env().target}`)
//       .asString();
//     const referral_code = this.props.user.referal_code || default_ref;

//     this.state = {
//       referral_message,
//       referral_link: `${linkPrefix}${referral_code}`,
//       referral_code,
//       shareURL: "",
//     };
//   }

//   componentDidMount = async () => {
//     BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
//     this.props.setStatusBarStyle(AppConstants.ORANGE_STATUS_BAR);
//     this.props.getReferralActivities(this.props.user.referal_code);

//     if (this.state.shareURL === "") {
//       await this.buildLink();
//     }
//   };

//   componentWillUnmount() {
//     BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
//     this.props.resetStatusBarStyle();
//   }

//   handleBackButton = () => {
//     if (this.props.isFocused) {
//       this.props.navigation.navigate("Dashboard");
//       return true;
//     }
//   };

//   handleShareLink = async () => {
//     try {
//       await Share.share({
//         message: this.state.shareURL,
//       });
//     } catch (error) {
//       this.props.showToast(Dictionary.SHARE_LINK_ERROR);
//     }
//   };

//   buildLink = async () => {
//     const headers = { "Content-Type": "application/json" };
//     const url = `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyBTK1gur_86QYgsA6aWKMOjq6aF1ms9a9o`;
//     const data = {
//       longDynamicLink: `https://creditville.page.link/?link=https://www.creditvillegroup.com?r%3D${this.state.referral_code}&apn=com.creditville&isi=1547983942&ibi=ng.creditville.mobile&st=Promotions&sd=Create+a+free+account+%E2%80%A2+Sign+up+in+seconds+%E2%80%A2+Apply+for+a+loan+%E2%80%A2+Start+savings+%E2%80%A2+Invest`,
//     };

//     try {
//       let link = await axios.post(`${url}`, data, {
//         headers: headers,
//       });
//       if (link.status === 200) {
//         this.setState({ shareURL: link.data.shortLink });
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   render() {
//     let { referral_activities, referal_code } = this.props.user;

//     if (this.props.user.loading_referral_activities) {
//       return (
//         <View
//           style={[
//             SharedStyle.mainContainer,
//             { alignItems: "center", justifyContent: "center" },
//           ]}
//         >
//           <ActivityIndicator color={Colors.CV_YELLOW} />
//           <Text style={{ fontWeight: "bold", fontSize: 11 }}>
//             Loading Referral Page...
//           </Text>
//         </View>
//       );
//     }

//     return (
//       <View style={SharedStyle.mainContainer}>
//         <MainHeader
//           leftIcon="arrow-left"
//           onPressLeftIcon={this.handleBackButton}
//           backgroundStyle={{
//             backgroundColor: Colors.CV_YELLOW,
//             height: Mixins.scaleSize(150),
//           }}
//         >
//           <View style={styles.mainHeaderContainer}>
//             <View style={styles.row}>
//               <View style={{ marginRight: Mixins.scaleSize(20) }}>
//                 <Text style={styles.mainContentTextHeader}>Earn N1000/-</Text>
//                 <Text style={styles.mainContentTextSubHeader} numberOfLines={2}>
//                   For each friend that signs up through
//                 </Text>
//                 <Text style={styles.mainContentTextSubHeader}>
//                   your referral code
//                 </Text>
//               </View>
//               <View>
//                 <Image
//                   style={styles.presentImage}
//                   source={require("../../assets/images/referrals/present.png")}
//                 />
//               </View>
//             </View>
//             <View style={styles.cardContainer}>
//               <View
//                 style={[
//                   styles.cardSmall,
//                   { marginRight: Mixins.scaleSize(10) },
//                 ]}
//               >
//                 <Text style={styles.cardText}>
//                   {referral_activities?.totalSignUp || 0}
//                 </Text>
//                 <Text style={styles.cardSubText}>Total Signups</Text>
//               </View>
//               <View style={styles.cardSmall}>
//                 <Text style={styles.cardText} numberOfLines={2}>
//                   ₦{Util.formatAmount(referral_activities?.totalBalance)}
//                 </Text>
//                 <Text style={styles.cardSubText}>Total Earning</Text>
//               </View>
//             </View>
//           </View>
//         </MainHeader>
//         {/* {!this.props.loading_referral_activities && ( */}
//         <ScrollView {...this.props} hasButtomButtons={true}>
//           <View style={styles.container}>
//             <TouchItem
//               style={{ flexDirection: "row", alignItems: "center" }}
//               onPress={() =>
//                 this.props.navigation.navigate("ReferralActivities")
//               }
//             >
//               <Text
//                 style={{ color: Colors.CV_YELLOW, ...Typography.FONT_MEDIUM }}
//               >
//                 Check Referral Status
//               </Text>
//               <Icon.SimpleLineIcons
//                 size={Mixins.scaleSize(12)}
//                 style={{
//                   color: Colors.CV_YELLOW,
//                   fontWeight: "700",
//                   marginLeft: 5,
//                   fontWeight: "900",
//                 }}
//                 name={"arrow-right"}
//               />
//             </TouchItem>

//             <View style={styles.howItWorks}>
//               <View style={styles.separator} />
//               <Text
//                 style={{
//                   ...Mixins.padding(0, 16, 0, 16),
//                   ...Typography.FONT_BOLD,
//                   color: Colors.BLACK,
//                 }}
//               >
//                 How it works!
//               </Text>
//               <View style={styles.separator} />
//             </View>

//             <View
//               style={{
//                 marginTop: Mixins.scaleSize(20),
//                 position: "relative",
//               }}
//             >
//               <View style={styles.howItWorksBody}>
//                 <View style={styles.roundedBg}>
//                   <Image
//                     style={{ width: 21, height: 21 }}
//                     source={require("../../assets/images/referrals/chain.png")}
//                   />
//                 </View>
//                 <View
//                   style={{
//                     width: width * 0.8,
//                     paddingLeft: Mixins.scaleSize(15),
//                   }}
//                 >
//                   <Text
//                     style={{ ...Typography.FONT_MEDIUM, color: Colors.BLACK }}
//                   >
//                     Invite your friends
//                   </Text>
//                   <Text
//                     style={{
//                       color: Colors.CV_BLACK,
//                       fontSize: Mixins.scaleFont(12),
//                     }}
//                   >
//                     Share the link with you Friends over whatsapp or any other
//                     social platform.
//                   </Text>
//                 </View>
//               </View>
//               <View style={styles.howItWorksBody}>
//                 <View style={styles.roundedBg}>
//                   <Image
//                     style={{ width: 21, height: 21 }}
//                     source={require("../../assets/images/referrals/card.png")}
//                   />
//                 </View>
//                 <View
//                   style={{
//                     width: width * 0.8,
//                     paddingLeft: Mixins.scaleSize(15),
//                   }}
//                 >
//                   <Text
//                     style={{ ...Typography.FONT_MEDIUM, color: Colors.BLACK }}
//                   >
//                     Make Bills Payment
//                   </Text>
//                   <Text
//                     style={{
//                       color: Colors.CV_BLACK,
//                       fontSize: Mixins.scaleFont(12),
//                     }}
//                   >
//                     When your friend sign up on the app, fund their wallet with
//                     N1000 and make Bills Payment, you will receive N1000.
//                   </Text>
//                 </View>
//               </View>
//               <View style={styles.howItWorksBody}>
//                 <View style={styles.roundedBg}>
//                   <Image
//                     style={{ width: 21, height: 21 }}
//                     source={require("../../assets/images/referrals/medal.png")}
//                   />
//                 </View>
//                 <View
//                   style={{
//                     width: width * 0.8,
//                     paddingLeft: Mixins.scaleSize(15),
//                   }}
//                 >
//                   <Text
//                     style={{ ...Typography.FONT_MEDIUM, color: Colors.BLACK }}
//                   >
//                     Fund Wallet for 30days
//                   </Text>
//                   <Text
//                     style={{
//                       color: Colors.CV_BLACK,
//                       fontSize: Mixins.scaleFont(12),
//                     }}
//                   >
//                     When your friend sign up on the app, fund their wallet with
//                     N1000 for a period of 30days
//                   </Text>
//                 </View>
//               </View>
//               <View style={{ position: "absolute", top: 10, left: 10 }}>
//                 <Image
//                   style={styles.lineImage}
//                   source={require("../../assets/images/referrals/line.png")}
//                 />
//               </View>
//             </View>
//           </View>
//           <View
//             style={[SharedStyle.bottomPanel, { bottom: Mixins.scaleSize(110) }]}
//           >
//             <View style={[FormStyle.formButton, styles.invite]}>
//               <View style={styles.inviteTextView}>
//                 <Text style={styles.inviteCode}>{referal_code}</Text>
//               </View>
//               <TouchItem
//                 style={styles.inviteButton}
//                 onPress={() => {
//                   Clipboard.setString(referal_code);
//                   this.props.showToast(Dictionary.REFERRAL_CODE_COPIED, false);
//                 }}
//               >
//                 <Icon.Ionicons
//                   name={"copy-outline"}
//                   color={Colors.WHITE}
//                   size={Mixins.scaleSize(14)}
//                 />
//                 <Text style={styles.inviteButtonText}>
//                   {Dictionary.COPY_LINK}
//                 </Text>
//               </TouchItem>
//             </View>
//             <View style={FormStyle.formButton}>
//               <PrimaryButton
//                 title={Dictionary.SHARE_LINK_BTN}
//                 icon="arrow-right"
//                 onPress={this.handleShareLink}
//               />
//             </View>
//           </View>
//         </ScrollView>
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     ...Mixins.padding(74, 16, 50, 16),
//     flex: 1,
//   },
//   header: {
//     marginBottom: Mixins.scaleSize(30),
//   },
//   title: {
//     ...Typography.FONT_BOLD,
//     fontSize: Mixins.scaleFont(24),
//     lineHeight: Mixins.scaleSize(28),
//     color: Colors.CV_BLUE,
//     marginBottom: Mixins.scaleSize(8),
//   },
//   description: {
//     ...SharedStyle.normalText,
//     color: Colors.CV_BLUE,
//   },
//   card: {
//     ...Mixins.padding(15),
//     borderRadius: Mixins.scaleSize(8),
//     backgroundColor: Colors.REFERRAL_CARD_BG,
//     marginBottom: Mixins.scaleSize(24),
//   },
//   label: {
//     ...SharedStyle.normalText,
//     color: Colors.CV_BLUE,
//   },
//   value: {
//     ...Typography.FONT_BOLD,
//     color: Colors.CV_BLUE,
//     fontSize: Mixins.scaleFont(16),
//     lineHeight: Mixins.scaleSize(19),
//     letterSpacing: Mixins.scaleSize(0.01),
//     marginTop: Mixins.scaleSize(10),
//   },
//   cardTitle: {
//     ...Typography.FONT_BOLD,
//     color: Colors.CV_BLUE,
//     fontSize: Mixins.scaleFont(14),
//     lineHeight: Mixins.scaleSize(16),
//     letterSpacing: Mixins.scaleSize(0.03),
//   },
//   link: {
//     ...Typography.FONT_MEDIUM,
//     textDecorationLine: "underline",
//   },
//   empty: {
//     alignItems: "center",
//   },
//   emptyImage: {
//     width: Mixins.scaleSize(240),
//     height: Mixins.scaleSize(135),
//     resizeMode: "contain",
//     marginBottom: Mixins.scaleSize(16),
//   },
//   emptyText: {
//     ...SharedStyle.normalText,
//     fontSize: Mixins.scaleFont(13),
//     lineHeight: Mixins.scaleSize(18),
//     color: Colors.CV_BLUE,
//     width: Mixins.scaleSize(220),
//     textAlign: "center",
//   },
//   activity: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: Mixins.scaleSize(16),
//   },
//   activityDescription: {
//     ...SharedStyle.normalText,
//     color: Colors.CV_BLUE,
//     flex: 1,
//   },
//   activityTime: {
//     ...SharedStyle.normalText,
//     ...Typography.FONT_MEDIUM,
//     color: Colors.CV_BLUE,
//     marginLeft: Mixins.scaleSize(20),
//   },
//   invite: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignContent: "center",
//     alignItems: "center",
//     marginBottom: Mixins.scaleSize(20),
//   },
//   inviteTextView: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     height: Mixins.scaleSize(50),
//     borderWidth: Mixins.scaleSize(1),
//     borderRightWidth: Mixins.scaleSize(0),
//     borderColor: Colors.CV_YELLOW,
//     borderTopLeftRadius: Mixins.scaleSize(8),
//     borderBottomLeftRadius: Mixins.scaleSize(8),
//   },
//   inviteCode: {
//     ...SharedStyle.normalText,
//     ...Typography.FONT_MEDIUM,
//     ...Mixins.padding(10),
//     color: Colors.CV_BLUE,
//   },
//   inviteButton: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     height: Mixins.scaleSize(50),
//     paddingHorizontal: Mixins.scaleSize(10),
//     backgroundColor: Colors.CV_YELLOW,
//     borderTopRightRadius: Mixins.scaleSize(8),
//     borderBottomRightRadius: Mixins.scaleSize(8),
//   },
//   inviteButtonText: {
//     ...SharedStyle.normalText,
//     color: Colors.WHITE,
//     marginLeft: Mixins.scaleSize(8),
//   },
//   mainHeaderContainer: {
//     // flexDirection: "row",
//     marginLeft: Mixins.scaleSize(32),
//     marginRight: Mixins.scaleSize(32),
//   },
//   mainContentTextHeader: {
//     fontSize: Mixins.scaleFont(26),
//     ...Typography.FONT_BOLD,
//     color: Colors.WHITE,
//   },
//   mainContentTextSubHeader: {
//     fontSize: Mixins.scaleFont(12),
//     ...Typography.FONT_BOLD,
//     color: Colors.WHITE,
//   },
//   lineImage: {
//     width: Mixins.scaleSize(17),
//     height: Mixins.scaleSize(180),
//     resizeMode: "contain",
//   },
//   presentImage: {
//     width: Mixins.scaleSize(80),
//     height: Mixins.scaleSize(99),
//     resizeMode: "contain",
//   },
//   line: {
//     width: Mixins.scaleSize(190),
//     height: Mixins.scaleSize(16),
//     resizeMode: "contain",
//   },
//   cardContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: Mixins.scaleSize(-80),
//     // zIndex: 5
//   },
//   cardSmall: {
//     width: width * 0.4,
//     height: 73,
//     borderRadius: 10,
//     backgroundColor: "#F5F5F5",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   cardText: {
//     fontSize: Mixins.scaleFont(20),
//     ...Typography.FONT_BOLD,
//     color: Colors.BLACK,
//   },
//   cardSubText: {
//     fontSize: Mixins.scaleFont(12),
//     ...Typography.FONT_REGULAR,
//     color: Colors.BLACK,
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "center",
//   },
//   separator: {
//     width: width * 0.3,
//     height: 1,
//     backgroundColor: "#174375",
//     opacity: 0.1,
//   },
//   howItWorks: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: Mixins.scaleSize(20),
//   },
//   roundedBg: {
//     width: 39,
//     height: 39,
//     borderRadius: 200,
//     backgroundColor: "#F5F5F5",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   howItWorksBody: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: Mixins.scaleSize(20),
//     zIndex: 5,
//   },
// });

// const mapStateToProps = (state) => {
//   return {
//     user: state.user,
//   };
// };

// const mapDispatchToProps = {
//   showToast,
//   getReferralActivities,
//   getReferalCode,
//   setStatusBarStyle,
//   resetStatusBarStyle,
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(withNavigationFocus(Referrals));

import React, { Component } from "react";
import {
  BackHandler,
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  Image,
  Share,
  Dimensions,
  TextInput,
} from "react-native";
import { connect } from "react-redux";
import { withNavigationFocus } from "react-navigation";
import remoteConfig from "@react-native-firebase/remote-config";
import Clipboard from "@react-native-community/clipboard";
import * as Icon from "@expo/vector-icons";

import { showToast } from "_actions/toast_actions";
import { getReferralActivities, getReferalCode } from "_actions/user_actions";

import { env, Dictionary, Util, AppConstants } from "_utils";
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from "_styles";
import { ScrollView, TouchItem } from "_atoms";
import { PrimaryButton } from "_molecules";
import { MainHeader } from "_organisms";
import axios from "axios";
import { Network } from "_services";

const { width } = Dimensions.get("window");

class Referrals extends Component {
  constructor(props) {
    super(props);

    const linkPrefix = remoteConfig()
      .getValue(`referral_link_prefix_${env().target}`)
      .asString();
    const default_ref = remoteConfig()
      .getValue(`default_referral_code_${env().target}`)
      .asString();
    const referral_message = remoteConfig()
      .getValue(`referral_message_${env().target}`)
      .asString();
    const referral_code = this.props.user.referal_code || default_ref;

    this.state = {
      referral_message,
      referral_link: `${linkPrefix}${referral_code}`,
      referral_code,
      edited_referral_code: referral_code,
      shareURL: "",
      isEdited: false, // Track if the input has been edited
      isUpdating: false,
      disabled: false,
    };
  }

  componentDidMount = async () => {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    this.props.getReferralActivities(this.props.user.referal_code);

    if (this.state.shareURL === "") {
      await this.buildLink();
    }
  };

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      this.props.navigation.navigate("Dashboard");
      return true;
    }
  };

  handleShareLink = async () => {
    try {
      await Share.share({
        message: this.state.shareURL,
      });
    } catch (error) {
      this.props.showToast(Dictionary.SHARE_LINK_ERROR);
    }
  };

  buildLink = async () => {
    const headers = { "Content-Type": "application/json" };
    const url = `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyBTK1gur_86QYgsA6aWKMOjq6aF1ms9a9o`;
    const data = {
      longDynamicLink: `https://creditville.page.link/?link=https://www.creditvillegroup.com?r%3D${this.state.referral_code}&apn=com.creditville&isi=1547983942&ibi=ng.creditville.mobile&st=C+Money+Refer+and+earn+Promotion&sd=Create+a+free+account+with+my+invitation+link+and+get+₦500+bonus+%E2%80%A2+Start+savings+%E2%80%A2+Invest&si=https://res.cloudinary.com/creditville-ng/image/upload/v1663147679/CREDIT_VILLE_LOGO_LATEST_2_c1279dd50d_d6a968ba3e.svg`,
    };

    try {
      let link = await axios.post(`${url}`, data, {
        headers: headers,
      });
      if (link.status === 200) {
        this.setState({ shareURL: link.data.shortLink });
      }
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    let { referral_message } = this.state;

    let { referral_activities, referal_code } = this.props.user;
    let isEdited = this.state.referral_code != this.state.edited_referral_code;

    if (this.props.user.loading_referral_activities) {
      return (
        <View
          style={[
            SharedStyle.mainContainer,
            { alignItems: "center", justifyContent: "center" },
          ]}
        >
          <ActivityIndicator color={Colors.CV_YELLOW} />
          <Text style={{ fontWeight: "bold", fontSize: 11 }}>
            Loading Referral Page...
          </Text>
        </View>
      );
    }
    console.log({ referral_activities });
    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.REFERRALS_HEADER}
        />
        {/* {this.props.loading_referral_activities && (
          <View style={SharedStyle.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
          </View>
        )} */}

        <ScrollView {...this.props} hasButtomButtons={true}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>{Dictionary.REFERRALS_TITLE}</Text>
              <Text style={styles.description}>{referral_message}</Text>
            </View>
            <View style={[SharedStyle.row, styles.card]}>
              <View style={SharedStyle.halfColumn}>
                <Text numberOfLines={1} style={styles.label}>
                  {Dictionary.TOTAL_SIGN_UPS}
                </Text>
                <Text numberOfLines={1} style={styles.value}>
                  {referral_activities?.totalSignUp || 0}
                </Text>
              </View>
              <View style={SharedStyle.halfColumn}>
                <Text
                  numberOfLines={1}
                  style={[styles.label, SharedStyle.right]}
                >
                  {Dictionary.TOTAL_EARNINGS}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.value, SharedStyle.right]}
                >
                  ₦{Util.formatAmount(referral_activities?.totalAmountEarn)}
                </Text>
              </View>
            </View>
            <View style={styles.card}>
              <View style={SharedStyle.row}>
                <View style={SharedStyle.halfColumn}>
                  {/* <Text numberOfLines={1} style={styles.cardTitle}>
                    {Dictionary.ACTIVITIES}
                  </Text> */}
                </View>
                {/* {referral_activities.length > 0 && (
                  <View style={SharedStyle.halfColumn}>
                    <TouchItem
                      style={{ paddingVertical: Mixins.scaleSize(5) }}
                      onPress={() =>
                        this.props.navigation.navigate("ReferralActivities", {
                          referal_code,
                          referral_link,
                        })
                      }
                    >
                      <Text
                        numberOfLines={1}
                        style={[styles.label, styles.link, SharedStyle.right]}
                      >
                        {Dictionary.VIEW_MORE}
                      </Text>
                    </TouchItem>
                  </View>
                )} */}
              </View>
              {/* {recent_activities.length === 0 && ( */}
              <View style={styles.empty}>
                <Image
                  style={styles.emptyImage}
                  source={require("../../assets/images/referrals/referrals.png")}
                />
                {/* <Text style={styles.emptyText}>{Dictionary.NO_REFERRAL}</Text> */}
                <Text style={styles.emptyText}>
                  Earn N1000/- For each friend that signs up through your
                  referral code
                </Text>
              </View>
              {/* )} */}
              {/* {recent_activities.length > 0 && (
                <View>
                  {recent_activities.map((activity, index) => {
                    let timeline = moment(activity.created_on);
                    let activity_date = timeline.format("DD/MM/YYYY");

                    if (timeline.isSame(moment(), "day")) {
                      activity_date = timeline.format("h:mm A");
                    }

                    return (
                      <View key={index} style={styles.activity}>
                        <Text
                          numberOfLines={2}
                          style={styles.activityDescription}
                        >
                          {activity.description || "- - -"}
                        </Text>
                        <Text numberOfLines={1} style={styles.activityTime}>
                          {activity_date}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )} */}
            </View>
          </View>
          <View style={SharedStyle.bottomPanel}>
            <View style={[FormStyle.formButton, styles.invite]}>
              <TextInput
                style={styles.inviteTextView}
                value={this.state.edited_referral_code}
                onChangeText={(text) => {
                  this.setState({ ...this.state, edited_referral_code: text });
                }}
              />
              <TouchItem
                style={styles.inviteButton}
                onPress={async () => {
                  try {
                    // if the isEdited, update the referral_code
                    if (isEdited) {
                      this.setState({ isUpdating: true });
                      await Network.updateReferralCode({
                        oldReferralCode: this.state.referral_code,
                        newReferralCode: this.state.edited_referral_code,
                      });
                      // if success request, update referral_code
                      this.setState({
                        ...this.state,
                        referral_code: this.state.edited_referral_code,
                        isUpdating: false, // Turn off the ActivityIndicator,
                      });
                    } else {
                      Clipboard.setString(this.state.edited_referral_code);
                      this.props.showToast(
                        Dictionary.REFERRAL_CODE_COPIED,
                        false
                      );
                    }
                  } catch (error) {
                    // Handle the error here
                    console.error(error);
                    this.setState({ isUpdating: false });
                    this.props.showToast(
                      Dictionary.REFERRAL_CODE_BELONGS_TO_ANOTHER_CUSTOMER,
                      true
                    );
                    // You can also show an error message to the user if needed
                    // For example: this.props.showToast("An error occurred", true);
                  }
                }}
              >
                {this.state.isUpdating ? (
                  // Check the isUpdating state to determine whether to show ActivityIndicator
                  <ActivityIndicator color={Colors.WHITE} size="small" />
                ) : (
                  <>
                    {!isEdited && (
                      <Icon.Ionicons
                        name={"copy-outline"}
                        color={Colors.WHITE}
                        size={Mixins.scaleSize(14)}
                      />
                    )}
                    <Text style={styles.inviteButtonText}>
                      {isEdited ? Dictionary.UPDATE_LINK : Dictionary.COPY_LINK}
                    </Text>
                  </>
                )}
              </TouchItem>
            </View>
            <View style={FormStyle.formButton}>
              <PrimaryButton
                title={Dictionary.SHARE_LINK_BTN}
                icon="arrow-right"
                onPress={this.handleShareLink}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...Mixins.padding(24, 16, 50, 16),
    flex: 1,
  },
  header: {
    marginBottom: Mixins.scaleSize(30),
  },
  title: {
    ...Typography.FONT_BOLD,
    fontSize: Mixins.scaleFont(24),
    lineHeight: Mixins.scaleSize(28),
    color: Colors.CV_BLUE,
    marginBottom: Mixins.scaleSize(8),
  },
  description: {
    ...SharedStyle.normalText,
    color: Colors.CV_BLUE,
  },
  card: {
    ...Mixins.padding(15),
    borderRadius: Mixins.scaleSize(8),
    backgroundColor: Colors.REFERRAL_CARD_BG,
    marginBottom: Mixins.scaleSize(24),
  },
  label: {
    ...SharedStyle.normalText,
    color: Colors.CV_BLUE,
  },
  value: {
    ...Typography.FONT_BOLD,
    color: Colors.CV_BLUE,
    fontSize: Mixins.scaleFont(16),
    lineHeight: Mixins.scaleSize(19),
    letterSpacing: Mixins.scaleSize(0.01),
    marginTop: Mixins.scaleSize(10),
  },
  cardTitle: {
    ...Typography.FONT_BOLD,
    color: Colors.CV_BLUE,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.03),
  },
  link: {
    ...Typography.FONT_MEDIUM,
    textDecorationLine: "underline",
  },
  empty: {
    alignItems: "center",
  },
  emptyImage: {
    width: Mixins.scaleSize(240),
    height: Mixins.scaleSize(135),
    resizeMode: "contain",
    marginBottom: Mixins.scaleSize(16),
  },
  emptyText: {
    ...SharedStyle.normalText,
    fontSize: Mixins.scaleFont(13),
    lineHeight: Mixins.scaleSize(18),
    color: Colors.CV_BLUE,
    width: Mixins.scaleSize(220),
    textAlign: "center",
  },
  activity: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Mixins.scaleSize(16),
  },
  activityDescription: {
    ...SharedStyle.normalText,
    color: Colors.CV_BLUE,
    flex: 1,
  },
  activityTime: {
    ...SharedStyle.normalText,
    ...Typography.FONT_MEDIUM,
    color: Colors.CV_BLUE,
    marginLeft: Mixins.scaleSize(20),
  },
  invite: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
    alignItems: "center",
    marginBottom: Mixins.scaleSize(20),
  },
  inviteTextView: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: Mixins.scaleSize(50),
    borderWidth: Mixins.scaleSize(1),
    borderRightWidth: Mixins.scaleSize(0),
    borderColor: Colors.CV_YELLOW,
    borderTopLeftRadius: Mixins.scaleSize(8),
    borderBottomLeftRadius: Mixins.scaleSize(8),
  },
  inviteCode: {
    ...SharedStyle.normalText,
    ...Typography.FONT_MEDIUM,
    ...Mixins.padding(10),
    color: Colors.CV_BLUE,
  },
  inviteButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: Mixins.scaleSize(50),
    paddingHorizontal: Mixins.scaleSize(10),
    backgroundColor: Colors.CV_YELLOW,
    borderTopRightRadius: Mixins.scaleSize(8),
    borderBottomRightRadius: Mixins.scaleSize(8),
  },
  inviteButtonText: {
    ...SharedStyle.normalText,
    color: Colors.WHITE,
    marginLeft: Mixins.scaleSize(8),
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = {
  showToast,
  getReferralActivities,
  getReferalCode,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(Referrals));
