import React, { Component } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { connect } from "react-redux";
import * as Icon from "@expo/vector-icons";

import { showToast } from "_actions/toast_actions";
import {
  resetSavingsApplicationData,
  updateSavingsApplicationData,
} from "_actions/savings_actions";

import { Dictionary, Util } from "_utils";
import { Colors, Mixins, SharedStyle, Typography } from "_styles";
import { TouchItem } from "_atoms";
import { PrimaryButton, LockSavingsWarning } from "_molecules";

class NewSavings extends Component {
  state = {
    savings_product: null,
    preferred_offer: null,
    expanded_product_id: null,
    lock_warning_visible: false,
    product_images: {
      regular: require("../../assets/images/savings/regular.png"),
      fixed: require("../../assets/images/savings/fixed.png"),
    },
  };

  componentDidMount = () => {
    this.props.resetSavingsApplicationData();
  };

  showLockWarning = () => {
    this.setState({
      lock_warning_visible: true,
    });
  };

  hideLockWarning = () => {
    this.setState({
      lock_warning_visible: false,
    });
  };

  handleAddSavingsPlan = (savings_product, preferred_offer) => {
    this.setState(
      {
        savings_product,
        preferred_offer,
      },
      () => {
        if (savings_product.lock_on_create) {
          this.showLockWarning();
        } else {
          this.confirmSelectedSavingsPlan();
        }
      }
    );
  };

  confirmSelectedSavingsPlan = () => {
    const { savings_product, preferred_offer } = this.state;
    this.props.updateSavingsApplicationData({
      savings_product,
      preferred_offer,
    });

    this.hideLockWarning();
    this.props.onSelectOffer();
  };

  expandProduct = (product_id) => {
    this.setState({
      expanded_product_id: product_id,
    });
  };

  render() {
    const { expanded_product_id } = this.state;
    let { savings_products } = this.props.savings;

    savings_products.forEach((product) => {
      product.product_type = product.is_fixed ? "fixed" : "regular";
      product.product_offers = product.offers || [];
    });

    return (
      <>
        <Text style={styles.savingsPlan}>Savings Product</Text>
        <View style={styles.products}>
          {savings_products.map((product, index) => {
            const optionIndex = (index % 3) + 1; // Calculate index modulo 3 to get 1, 2, or 3

            return (
              <View
                key={index}
                style={[
                  styles.product,
                  styles[`${product.product_type}Option`],
                  optionIndex === 1
                    ? styles.orangeOption
                    : optionIndex === 2
                    ? styles.pinkOption
                    : optionIndex === 3
                    ? styles.greenOption
                    : {},
                ]}
              >
                <TouchItem
                  style={styles.productDetails}
                  onPress={() =>
                    this.handleAddSavingsPlan(
                      product,
                      product.product_offers[0]
                    )
                  }
                >
                  <View style={styles.productText}>
                    <View style={{ paddingHorizontal: 10 }}>
                      {!!product.lock_on_create && (
                        <Icon.Fontisto
                          name={"locked"}
                          size={Mixins.scaleFont(20)}
                          style={[
                            { marginRight: Mixins.scaleSize(10) },
                            styles[product.product_type],
                          ]}
                        />
                      )}
                      <Image
                        style={[
                          styles.productIcon,
                          optionIndex === 1
                            ? styles.redImage
                            : optionIndex === 2
                            ? styles.greenImage
                            : optionIndex === 3
                            ? styles.yellowImage
                            : {},
                        ]}
                        source={this.state.product_images[product.product_type]}
                      />
                      <Text
                        style={[
                          styles.productTextHeader,
                          // styles[`${product.product_type}`],
                        ]}
                      >
                        {product.name.trim()}
                      </Text>
                      <Text
                        style={[
                          styles.productTextDescription,
                          styles[`${product.product_type}`],
                        ]}
                      >
                        {product.description.trim()}
                      </Text>
                      <TouchItem
                        onPress={() =>
                          this.handleAddSavingsPlan(
                            product,
                            product.product_offers[0]
                          )
                        }
                        style={[
                          styles.floatingButtonIcon,
                          optionIndex === 1
                            ? styles.orangeBackground
                            : optionIndex === 2
                            ? styles.pinkBackground
                            : optionIndex === 3
                            ? styles.greenBackground
                            : {},
                        ]}
                      >
                        <Icon.Entypo
                          size={Mixins.scaleSize(20)}
                          style={[
                            optionIndex === 1
                              ? styles.orangePlus
                              : optionIndex === 2
                              ? styles.pinkPlus
                              : optionIndex === 3
                              ? styles.greenPlus
                              : {},
                          ]}
                          name="plus"
                        />
                      </TouchItem>
                    </View>
                  </View>
                </TouchItem>

                {/* {expanded_product_id === product.id &&
                product.product_offers.map((offer, index) => {
                  // ... (existing code for product_offers)
                })} */}
              </View>
            );
          })}
          {this.state.lock_warning_visible && (
            <LockSavingsWarning
              isVisible={this.state.lock_warning_visible}
              onAgree={this.confirmSelectedSavingsPlan}
              onDisagree={this.hideLockWarning}
            />
          )}
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  savingsPlan: {
    ...Typography.FONT_BOLD,
    fontSize: Mixins.scaleFont(14),
    // lineHeight: Mixins.scaleSize(33),
    // letterSpacing: Mixins.scaleSize(0.01),
    // color: Colors.WHITE,
    color: Colors.CV_BLUE,
    marginLeft: Mixins.scaleSize(20),
    ...Mixins.margin(25, 0, 0, 20),
  },
  products: {
    ...Mixins.margin(13, 16, 10, 16),
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    // width: 162,
  },
  moreButton: {
    marginBottom: Mixins.scaleSize(30),
  },
  regularMoreButton: {
    color: Colors.CV_YELLOW,
  },
  fixedMoreButton: {
    backgroundColor: Colors.CV_GREEN,
  },
  halalMoreButton: {
    backgroundColor: Colors.LIGHT_PURPLE,
  },
  product: {
    borderRadius: Mixins.scaleSize(10),
    marginBottom: Mixins.scaleSize(15),
    // flexDirection: "row",
    // justifyContent: "space-between",
    // flexWrap: "wrap",
    paddingBottom: 10,
    paddingTop: 10,
    // paddingLeft: 20,
    // paddingRight: 20,
  },
  productDetails: {
    // flexDirection: "row",
    // justifyContent: "space-between",
    // flexWrap: "wrap",
  },
  productText: {
    // width: "85%",
    // flexDirection: "row",
    // justifyContent: "space-between",
    // flexWrap: "wrap",
    marginLeft: 10,
    // flexDirection: "column", // Adjusted to column layout
    // flex: 1,
  },
  productTextHeader: {
    ...Typography.FONT_BOLD,
    fontSize: Mixins.scaleFont(20),
    // lineHeight: Mixins.scaleSize(23),
    // letterSpacing: Mixins.scaleSize(0.01),
    marginBottom: Mixins.scaleSize(10),
    marginTop: Mixins.scaleSize(10),

    // paddingBottom: Mixins.scaleSize(16),
    // marginBottom: Mixins.scaleSize(16),
    // borderBottomWidth: Mixins.scaleSize(1),
    color: "#262626",
  },
  productTextDescription: {
    ...Typography.FONT_MEDIUM,
    fontSize: Mixins.scaleFont(14),
    // lineHeight: Mixins.scaleSize(16),
    // letterSpacing: Mixins.scaleSize(0.01),
    color: "#262626",
    maxWidth: Mixins.scaleSize(140), // Adjust the max width as needed
  },
  productIcon: {
    width: Mixins.scaleSize(30),
    height: Mixins.scaleSize(30),
    resizeMode: "contain",
  },
  // regularOption: {
  //   backgroundColor: Colors.LIGHTER_ORANGE_BG,
  // },

  floatingButtonIcon: {
    width: Mixins.scaleSize(30),
    height: Mixins.scaleSize(30),
    marginTop: Mixins.scaleSize(20),
    borderRadius: Mixins.scaleSize(50),
    justifyContent: "center",
    alignItems: "center",
    // position: "absolute",
    // bottom: Mixins.scaleSize(0),
    // elevation: 3,
    alignSelf: "flex-end",
  },

  orangePlus: {
    color: "#D98518",
  },
  pinkPlus: {
    color: "#F56630",
  },
  greenPlus: {
    backgroundColor: "#0F973D1A",
  },

  orangeBackground: {
    backgroundColor: "#D37F1B1A",
  },
  pinkBackground: {
    backgroundColor: "#F566301A",
  },
  greenBackground: {
    backgroundColor: "#0F973D1A",
  },

  redImage: {
    tintColor: "#F5B546",
  },
  greenImage: {
    tintColor: "#F56630",
  },
  yellowImage: {
    tintColor: "#0F973D",
  },

  orangeOption: {
    backgroundColor: Colors.LIGHTER_ORANGE_BG,
  },
  pinkOption: {
    backgroundColor: "#FFECE5",
  },
  greenOption: {
    backgroundColor: "#E7F6EC",
  },
  regular: {
    // color: Colors.CV_YELLOW,
  },
  halalOption: {
    backgroundColor: Colors.LIGHTER_PURPLE_BG,
  },
  halal: {
    color: Colors.LIGHT_PURPLE,
  },
  fixedOption: {
    backgroundColor: Colors.LIGHTER_GREEN_BG,
  },
  fixed: {
    color: Colors.CV_GREEN,
  },
  offers: {
    ...SharedStyle.section,
    backgroundColor: Colors.WHITE,
  },
  label: {
    ...SharedStyle.normalText,
    ...SharedStyle.label,
  },
  value: {
    ...SharedStyle.normalText,
    ...SharedStyle.value,
    textTransform: "lowercase",
  },
  action: {
    ...Mixins.padding(4, 14, 4, 14),
    alignSelf: "flex-end",
    backgroundColor: Colors.LIGHTER_GREEN_BG,
    borderRadius: Mixins.scaleSize(100),
  },
  actionText: {
    ...SharedStyle.normalText,
    color: Colors.CV_GREEN,
  },
});

const mapStateToProps = (state) => {
  return {
    savings: state.savings,
  };
};

const mapDispatchToProps = {
  showToast,
  resetSavingsApplicationData,
  updateSavingsApplicationData,
};

export default connect(mapStateToProps, mapDispatchToProps)(NewSavings);

// {
//   expanded_product_id === product.id &&
//     product.product_offers.map((offer, index) => {
//       return (
//         <TouchItem
//           key={index}
//           onPress={() => this.handleAddSavingsPlan(product, offer)}
//           style={[
//             styles.offers,
//             index === product.product_offers.length - 1
//               ? { marginBottom: Mixins.scaleSize(0) }
//               : {},
//           ]}
//         >
//           <View style={SharedStyle.row}>
//             <View style={SharedStyle.halfColumn}>
//               <Text numberOfLines={1} style={styles.label}>
//                 {Dictionary.MINIMUM_AMOUNT}
//               </Text>
//               <Text numberOfLines={1} style={styles.value}>
//                 ₦{Util.formatAmount(offer.minimumAmount)}
//               </Text>
//             </View>
//             <View style={SharedStyle.halfColumn}>
//               <Text numberOfLines={1} style={[styles.label, SharedStyle.right]}>
//                 {Dictionary.TENOR}
//               </Text>
//               <Text numberOfLines={1} style={[styles.value, SharedStyle.right]}>
//                 {`${offer.tenorStart} ${Dictionary.TO} ${offer.tenorEnd} ${offer.tenorPeriod}`}
//               </Text>
//             </View>
//           </View>
//           <View style={SharedStyle.row}>
//             <View style={SharedStyle.halfColumn}>
//               <Text numberOfLines={1} style={styles.label}>
//                 {Dictionary.INTEREST_RATE}
//               </Text>
//               <Text numberOfLines={1} style={styles.value}>
//                 {`${offer.interestRate} ${Dictionary.PER} ${
//                   offer.interest_period
//                     ? offer.interest_period.endsWith("s")
//                       ? offer.interest_period.slice(0, -1)
//                       : offer.interest_period
//                     : "year"
//                 }`}
//               </Text>
//             </View>
//             <View style={SharedStyle.halfColumn}>
//               <View style={styles.action}>
//                 <Text style={styles.actionText} numberOfLines={1}>
//                   Take this offer
//                 </Text>
//               </View>
//             </View>
//           </View>
//         </TouchItem>
//       );
//     });
// }

// {
//   product.product_offers?.length === 1 &&
//     product.product_offers.map((offer, index) => {
//       return (
//         <TouchItem
//           key={index}
//           onPress={() => this.handleAddSavingsPlan(product, offer)}
//           style={[
//             styles.offers,
//             index === product.product_offers.length - 1
//               ? { marginBottom: Mixins.scaleSize(0) }
//               : {},
//           ]}
//         >
//           <View style={SharedStyle.row}>
//             <View style={SharedStyle.halfColumn}>
//               <Text numberOfLines={1} style={styles.label}>
//                 {Dictionary.MINIMUM_AMOUNT}
//               </Text>
//               <Text numberOfLines={1} style={styles.value}>
//                 ₦{Util.formatAmount(offer.minimumAmount)}
//               </Text>
//             </View>
//             <View style={SharedStyle.halfColumn}>
//               <Text numberOfLines={1} style={[styles.label, SharedStyle.right]}>
//                 {Dictionary.TENOR}
//               </Text>
//               <Text numberOfLines={1} style={[styles.value, SharedStyle.right]}>
//                 {offer.tenordescription}
//                 {/* {`${offer.min_tenor} ${Dictionary.TO} ${offer.max_tenor} ${offer.tenor_period}`} */}
//               </Text>
//             </View>
//           </View>
//           <View style={SharedStyle.row}>
//             <View style={SharedStyle.halfColumn}>
//               <Text numberOfLines={1} style={styles.label}>
//                 {Dictionary.INTEREST_RATE}
//               </Text>
//               <Text numberOfLines={1} style={styles.value}>
//                 {`${offer.interestRate} ${Dictionary.PER} ${
//                   offer.interest_period
//                     ? offer.interest_period.endsWith("s")
//                       ? offer.interest_period.slice(0, -1)
//                       : offer.interest_period
//                     : "year"
//                 }`}
//               </Text>
//             </View>
//             <View style={SharedStyle.halfColumn}>
//               <View style={styles.action}>
//                 <Text style={styles.actionText} numberOfLines={1}>
//                   Take this offer
//                 </Text>
//               </View>
//             </View>
//           </View>
//         </TouchItem>
//       );
//     });

// {
//   product.product_offers?.length > 1 && expanded_product_id !== product.id && (
//     <View style={styles.moreButton}>
//       <PrimaryButton
//         title={Dictionary.SEE_MORE_BTN}
//         icon="arrow-right"
//         onPress={() => this.expandProduct(product.id)}
//         backgroundStyle={styles[`${product.product_type}MoreButton`]}
//       />
//     </View>
//   );
// }
