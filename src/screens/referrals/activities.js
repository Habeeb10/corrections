import React, { Component } from "react";
import { BackHandler, StyleSheet, View, Text, Share } from "react-native";
import { connect } from "react-redux";
import { withNavigationFocus } from "react-navigation";
import Clipboard from "@react-native-community/clipboard";
import * as Icon from "@expo/vector-icons";
import moment from "moment";

import { showToast } from "_actions/toast_actions";

import { Dictionary } from "_utils";
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from "_styles";
import { ScrollView, TouchItem } from "_atoms";
import { Tabs, PrimaryButton } from "_molecules";
import { MainHeader } from "_organisms";

class ReferralActivities extends Component {
  constructor(props) {
    super(props);

    const navigation = this.props.navigation;
    const referral_code = navigation.getParam("referral_code");
    const referral_link = navigation.getParam("referral_link");

    const { referral_activities } = this.props.user;
    const sign_ups = referral_activities.filter(
      (referral) => referral.activity?.toLowerCase() === "sign_up"
    );
    const other_activities = referral_activities.filter(
      (referral) => referral.activity?.toLowerCase() !== "sign_up"
    );

    this.state = {
      referral_link,
      referral_code,
      sign_ups,
      other_activities,
    };
  }

  componentDidMount = () => {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  };

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      this.props.navigation.goBack();
      return true;
    }
  };

  handleShareLink = async () => {
    try {
      await Share.share({ message: this.state.referral_link });
    } catch (error) {
      this.props.showToast(Dictionary.SHARE_LINK_ERROR);
    }
  };

  render() {
    let { referral_code, sign_ups, other_activities } = this.state;
    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.REFERRALS_HEADER}
        />
        <ScrollView {...this.props}>
          <View style={styles.container}>
            <Tabs
              tabberStyle={styles.tabber}
              tabStyle={styles.tab}
              activeTabStyle={styles.activeTab}
              tabTextStyle={styles.tabText}
              activeTabTextStyle={styles.activeTabTextStyle}
            >
              <View title={Dictionary.SIGN_UPS}>
                {sign_ups.length === 0 && (
                  <View style={SharedStyle.loaderContainer}>
                    <Text>{Dictionary.NO_DATA}</Text>
                  </View>
                )}
                {sign_ups.length > 0 && (
                  <View>
                    {sign_ups.map((activity, index) => {
                      let timeline = moment(activity.created_on);
                      let activity_date = timeline.format("DD/MM/YYYY");

                      if (timeline.isSame(moment(), "day")) {
                        activity_date = timeline.format("h:mm A");
                      }

                      return (
                        <View style={styles.card}>
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
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
              <View title={Dictionary.REFERRAL_ACTIVITIES}>
                {other_activities.length === 0 && (
                  <View style={SharedStyle.loaderContainer}>
                    <Text>{Dictionary.NO_DATA}</Text>
                  </View>
                )}
                {other_activities.length > 0 && (
                  <View>
                    {other_activities.map((activity, index) => {
                      let timeline = moment(activity.created_on);
                      let activity_date = timeline.format("DD/MM/YYYY");

                      if (timeline.isSame(moment(), "day")) {
                        activity_date = timeline.format("h:mm A");
                      }

                      return (
                        <View key={index} style={styles.card}>
                          <View style={styles.activity}>
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
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </Tabs>
          </View>
          <View style={SharedStyle.bottomPanel}>
            <View style={[FormStyle.formButton, styles.invite]}>
              <View style={styles.inviteTextView}>
                <Text style={styles.inviteCode}>{referral_code}</Text>
              </View>
              <TouchItem
                style={styles.inviteButton}
                onPress={() => {
                  Clipboard.setString(referral_code);
                  this.props.showToast(Dictionary.REFERRAL_CODE_COPIED, false);
                }}
              >
                <Icon.Ionicons
                  name={"copy-outline"}
                  color={Colors.WHITE}
                  size={Mixins.scaleSize(14)}
                />
                <Text style={styles.inviteButtonText}>
                  {Dictionary.COPY_LINK}
                </Text>
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
    ...Mixins.padding(24, 16, 70, 16),
    flex: 1,
  },
  tabber: {
    backgroundColor: Colors.WHITE,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: Mixins.scaleSize(8),
    borderBottomWidth: Mixins.scaleSize(1),
    borderColor: Colors.TAB_BORDER,
  },
  tab: {
    ...Mixins.padding(8, 16, 8, 16),
    borderBottomWidth: Mixins.scaleSize(3),
    borderBottomColor: Colors.WHITE,
  },
  tabText: {
    ...Typography.FONT_BOLD,
    fontSize: Mixins.scaleFont(16),
    lineHeight: Mixins.scaleSize(19),
    letterSpacing: Mixins.scaleSize(0.03),
    color: Colors.CV_BLUE,
    opacity: 0.6,
  },
  activeTab: {
    borderBottomWidth: Mixins.scaleSize(3),
    borderBottomColor: Colors.CV_BLUE,
  },
  activeTabTextStyle: {
    ...Typography.FONT_BOLD,
    color: Colors.CV_BLUE,
    opacity: 1,
  },
  card: {
    ...Mixins.padding(15),
    borderRadius: Mixins.scaleSize(8),
    backgroundColor: Colors.REFERRAL_CARD_BG,
    marginBottom: Mixins.scaleSize(24),
  },
  activity: {
    flexDirection: "row",
    justifyContent: "space-between",
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
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(ReferralActivities));

// import React, { Component } from "react";
// import {
//   StyleSheet,
//   BackHandler,
//   View,
//   Text,
//   Dimensions,
//   TouchableOpacity,
//   ActivityIndicator,
//   Animated,
//   Easing,
//   Image,
// } from "react-native";
// import { withNavigationFocus } from "react-navigation";
// import { connect } from "react-redux";
// import * as Icon from "@expo/vector-icons";

// import {
//   getReferralActivities,
//   getReferralActivitiesRunning,
//   getReferralActivitiesMatured,
// } from "_actions/user_actions";
// import { Dictionary, Util } from "_utils";
// import { SharedStyle, Mixins, Colors, Typography } from "_styles";
// import { TouchItem } from "_atoms";
// import Summary from "_screens/referrals/summary_modal";

// const { width } = Dimensions.get("screen");

// class ReferralActivities extends Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       type: "all",
//       receipt_modal_visible: false,
//       transaction_data: {},
//       page: 0,
//       pageCredit: 0,
//       pageDebit: 0,
//       data: [],
//       pageSize: 20,
//       animationTrigger: false,
//       refreshing: false,
//     };

//     this.fadeAnim = new Animated.Value(0);
//   }

//   componentDidMount() {
//     BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
//     this.animate();
//     this.props.getReferralActivities(this.props.user.referal_code);
//     this.props.getReferralActivitiesRunning(this.props.user.referal_code);
//     this.props.getReferralActivitiesMatured(this.props.user.referal_code);
//   }

//   componentWillUnmount() {
//     BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
//   }

//   handleBackButton = () => {
//     if (this.props.isFocused) {
//       this.props.navigation.goBack();

//       return true;
//     }
//   };

//   _onRefresh = () => {
//     this.setState({ refreshing: true }, () => {
//       this.props.getReferralActivities(this.props.user.referal_code);
//       this.props.getReferralActivitiesRunning(this.props.user.referal_code);
//       this.props.getReferralActivitiesMatured(this.props.user.referal_code);
//     });
//   };

//   changeType = (type) => {
//     this.setState({ type, animationTrigger: true }, () => {
//       this.animate();
//     });
//   };

//   animate = () => {
//     this.fadeAnim.setValue(0);
//     Animated.timing(this.fadeAnim, {
//       toValue: 1,
//       duration: 1000,
//       easing: Easing.linear,
//       useNativeDriver: true,
//     }).start();
//   };

//   renderTransaction = ({ item }) => {
//     return (
//       <TouchItem
//         onPress={() => {
//           this.setState({
//             transaction_data: item,
//             receipt_modal_visible: true,
//           });
//         }}
//       >
//         <View style={SharedStyle.row}>
//           <View style={{ flexDirection: "row", width: "60%" }}>
//             <Image
//               style={{
//                 width: Mixins.scaleSize(40),
//                 height: Mixins.scaleSize(40),
//               }}
//               source={require("../../assets/images/referrals/avatar.png")}
//             />

//             <View style={{ paddingLeft: 10 }}>
//               <Text numberOfLines={2} style={styles.walletId}>
//                 {item.referredFullName}
//               </Text>
//               <Text
//                 numberOfLines={1}
//                 style={[styles.transactionLabel, { paddingTop: 5 }]}
//               >
//                 Whatsapp
//               </Text>
//             </View>
//           </View>

//           <View
//             style={[
//               styles.pill,
//               {
//                 backgroundColor:
//                   item.status === "MATURED" || item.status === "COMPLETED"
//                     ? "#ECFDF3"
//                     : "rgba(200, 149, 26, 0.10)",
//               },
//             ]}
//           >
//             <View
//               style={[
//                 styles.pillSmall,
//                 {
//                   backgroundColor:
//                     item.status === "MATURED" || item.status === "COMPLETED" ? "#12B76A" : "#C8951A",
//                 },
//               ]}
//             />
//             <Text
//               numberOfLines={1}
//               style={{
//                 color: item.status === "MATURED" || item.status === "COMPLETED" ? "#12B76A" : "#C8951A",
//               }}
//             >
//               {item.status}
//             </Text>
//           </View>
//         </View>
//       </TouchItem>
//     );
//   };

//   render() {
//     const {
//       referral_activities,
//       referral_activities_running,
//       referral_activities_matured,
//       loading_referral_activities,
//       loading_referral_activities_running,
//       loading_referral_activities_matured,
//     } = this.props.user;

//     const RUNNING = referral_activities_running?.refDetailsDtos ?? [];
//     const MATURED = referral_activities_matured?.refDetailsDtos ?? [];
//     const ALL = referral_activities?.refDetailsDtos ?? [];

//     const transactions =
//       this.state.type === "running"
//         ? RUNNING
//         : this.state.type === "active"
//         ? MATURED
//         : ALL;

//     const loading =
//       this.state.type === "running"
//         ? loading_referral_activities_running
//         : this.state.type === "active"
//         ? loading_referral_activities_matured
//         : loading_referral_activities;

//     const opacity = this.state.animationTrigger
//       ? this.fadeAnim.interpolate({
//           inputRange: [0, 0.5, 1],
//           outputRange: [0, 1, 1],
//         })
//       : 1;

//       return (
//       <View style={[SharedStyle.mainContainer, { padding: 10 }]}>
//         <View style={styles.header}>
//           <TouchItem onPress={this.handleBackButton}>
//             <Icon.SimpleLineIcons
//               size={Mixins.scaleSize(17)}
//               color={"#090A0A"}
//               style={{ fontWeight: "900" }}
//               name="arrow-left"
//             />
//           </TouchItem>
//           <Text style={styles.headerText}>Referral Status</Text>
//           <Text />
//         </View>

//         <View style={styles.pillContainer}>
//           <TouchableOpacity
//             style={[
//               styles.pills,
//               {
//                 backgroundColor:
//                   this.state.type === "all" ? Colors.CV_YELLOW : Colors.WHITE,
//                 width: width * 0.3,
//               },
//             ]}
//             onPress={() => this.changeType("all")}
//           >
//             <Text
//               style={[
//                 styles.pillsText,
//                 {
//                   color:
//                     this.state.type === "all" ? Colors.WHITE : Colors.BLACK,
//                 },
//               ]}
//             >
//               All
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[
//               styles.pills,
//               {
//                 backgroundColor:
//                   this.state.type === "running"
//                     ? Colors.CV_YELLOW
//                     : Colors.WHITE,
//               },
//             ]}
//             onPress={() => this.changeType("running")}
//           >
//             <Text
//               style={[
//                 styles.pillsText,
//                 {
//                   color:
//                     this.state.type === "running" ? Colors.WHITE : Colors.BLACK,
//                 },
//               ]}
//             >
//               Running
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[
//               styles.pills,
//               {
//                 backgroundColor:
//                   this.state.type === "active"
//                     ? Colors.CV_YELLOW
//                     : Colors.WHITE,
//               },
//             ]}
//             onPress={() => this.changeType("active")}
//           >
//             <Text
//               style={[
//                 styles.pillsText,
//                 {
//                   color:
//                     this.state.type === "active" ? Colors.WHITE : Colors.BLACK,
//                 },
//               ]}
//             >
//               Active
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {loading && transactions.length < 1 && (
//           <View style={SharedStyle.loaderContainer}>
//             <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
//           </View>
//         )}

//         {transactions.length < 1 && !loading && (
//           <Animated.View
//             style={[
//               SharedStyle.loaderContainer,
//               {
//                 opacity,
//               },
//             ]}
//           >
//             <Text style={SharedStyle.normalText}>
//               {Dictionary.NO_TRANSACTIONS}
//             </Text>
//           </Animated.View>
//         )}

//         {transactions.length > 0 && this.state.type === "running" && (
//           <>
//             <Animated.FlatList
//               data={transactions}
//               renderItem={this.renderTransaction}
//               keyExtractor={() => Util.randomId()}
//               showsVerticalScrollIndicator={false}
//               refreshing={loading && this.state.refreshing}
//               onRefresh={this._onRefresh}
//               style={[
//                 styles.formContainer,
//                 { paddingBottom: Mixins.scaleSize(20), opacity: opacity },
//               ]}
//             />
//           </>
//         )}

//         {transactions.length > 0 && this.state.type === "active" && (
//           <>
//             <Animated.FlatList
//               data={transactions}
//               renderItem={this.renderTransaction}
//               keyExtractor={() => Util.randomId()}
//               showsVerticalScrollIndicator={false}
//               refreshing={loading && this.state.refreshing}
//               onRefresh={this._onRefresh}
//               style={[
//                 styles.formContainer,
//                 { paddingBottom: Mixins.scaleSize(20), opacity: opacity },
//               ]}
//             />
//           </>
//         )}

//         {transactions.length > 0 && this.state.type === "all" && (
//           <>
//             <Animated.FlatList
//               data={transactions}
//               renderItem={this.renderTransaction}
//               keyExtractor={() => Util.randomId()}
//               showsVerticalScrollIndicator={false}
//               refreshing={loading && this.state.refreshing}
//               onRefresh={this._onRefresh}
//               style={[
//                 styles.formContainer,
//                 { paddingBottom: Mixins.scaleSize(20), opacity: opacity },
//               ]}
//             />
//           </>
//         )}

//         <Summary
//           onCloseModal={() => this.setState({ receipt_modal_visible: false })}
//           modal_visible={this.state.receipt_modal_visible}
//           navigation={this.props.navigation}
//           transaction_data={this.state.transaction_data}
//         />
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     ...Mixins.padding(10),
//   },
//   headerText: {
//     color: "#090A0A",
//     ...Typography.FONT_MEDIUM,
//     fontSize: Mixins.scaleFont(16),
//   },
//   pillContainer: {
//     ...Mixins.margin(20, 0, 20, 10),
//     ...Mixins.padding(10),
//     backgroundColor: "#F5F5F5",
//     width: width * 0.9,
//     height: Mixins.scaleSize(44),
//     justifyContent: "space-between",
//     alignItems: "center",
//     flexDirection: "row",
//   },
//   pills: {
//     width: width * 0.2,
//     borderRadius: 5,
//     height: Mixins.scaleSize(30),
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   pillsText: {
//     color: Colors.WHITE,
//     ...Typography.FONT_REGULAR,
//   },
//   formContainer: {
//     ...Mixins.padding(10, 16, 0, 16),
//   },
//   calendar: {
//     ...SharedStyle.normalText,
//     color: Colors.LIGHT_GREY,
//     marginTop: Mixins.scaleSize(20),
//     marginBottom: Mixins.scaleSize(10),
//   },
//   row: {
//     flexDirection: "row",
//   },
//   icon: {
//     width: Mixins.scaleSize(15),
//     height: Mixins.scaleSize(15),
//     marginRight: Mixins.scaleSize(10),
//   },
//   textContainer: {
//     flex: 1,
//   },
//   reference: {
//     ...SharedStyle.normalText,
//     ...Typography.FONT_MEDIUM,
//     color: Colors.CV_BLUE,
//     flex: 1,
//   },
//   amount: {
//     ...SharedStyle.normalText,
//     ...Typography.FONT_BOLD,
//     marginLeft: Mixins.scaleSize(5),
//     textAlign: "right",
//   },
//   credit: {
//     color: Colors.SUCCESS,
//   },
//   debit: {
//     color: Colors.LOGOUT_RED,
//   },
//   description: {
//     ...SharedStyle.normalText,
//     marginTop: Mixins.scaleSize(5),
//     color: Colors.LIGHT_GREY,
//     flex: 1,
//   },
//   time: {
//     ...Typography.FONT_REGULAR,
//     color: Colors.LIGHT_GREY,
//     fontSize: Mixins.scaleFont(12),
//     lineHeight: Mixins.scaleSize(14),
//     marginTop: Mixins.scaleSize(10),
//   },
//   transactionLabel: {
//     ...SharedStyle.normalText,
//     color: Colors.VERY_LIGHT_GREY,
//   },
//   walletId: {
//     ...Typography.FONT_REGULAR,
//     color: Colors.DARK_GREY,
//   },
//   pill: {
//     width: "auto",
//     height: Mixins.scaleSize(22),
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     ...Mixins.padding(2, 8, 2, 6),
//     flexDirection: "row",
//   },
//   pillSmall: {
//     width: 8,
//     height: 8,
//     borderRadius: 200,
//     marginRight: Mixins.scaleSize(6),
//   },
// });

// const mapStateToProps = (state) => {
//   return {
//     user: state.user,
//     wallet: state.wallet,
//   };
// };

// const mapDispatchToProps = {
//   getReferralActivities,
//   getReferralActivitiesRunning,
//   getReferralActivitiesMatured,
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(withNavigationFocus(ReferralActivities));
