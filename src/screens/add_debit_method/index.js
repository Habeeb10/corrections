import React, { Component } from "react";
import { Text, StyleSheet, View, Image } from "react-native";
import * as Icon from "@expo/vector-icons";
import { withNavigationFocus } from "react-navigation";

import { SharedStyle, Colors, Mixins, Typography, FormStyle } from "_styles";
import { MainHeader } from "_organisms";
import { PrimaryButton } from "_molecules";
import { Dictionary } from "_utils";
import { TouchItem, ScrollView } from "_atoms";

const OPTIONS = [
  {
    id: 0,
    name: "Add card",
    imageUrl: require("../../assets/images/addDebitMethod/card.png"),
  },
  {
    id: 1,
    name: "Add Wallet",
    imageUrl: require("../../assets/images/addDebitMethod/wallet.png"),
  },
];

class AddDebitMethod extends Component {
  constructor(props) {
    super(props);

    this.state = {
      checked: {},
    };
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      this.props.navigation.navigate("Dashboard");

      return true;
    }
    //this.props.navigation.goBack();
  };

  handleCheck = (checked) => {
    this.setState({ checked });
  };

  handleSubmit = () => {
    // if (this.checked?.id === 0) {
    if (this.props.isFocused) {
      if (this.state.checked?.id === 0) {
        this.props.navigation.navigate("PaymentMethods", {
          add_card: true,
        });
      }

      return true;
    }
    // }

    // if (this.checked?.id === 1) {
    //   this.props.navigation.navigate("AddCard", {
    //     addWallet: true,
    //   });
    // }
  };

  render() {
    return (
      <View style={[SharedStyle.mainContainer]}>
        <TouchItem style={styles.leftIcon} onPress={this.handleBackButton}>
          <Icon.SimpleLineIcons
            size={Mixins.scaleSize(15)}
            style={{ color: "#090A0A",  }}
            name={"arrow-left"}
          />
        </TouchItem>
        {/* <MainHeader
          leftIcon="arrow-left"
          backgroundStyle={{
            backgroundColor: Colors.WHITE,
            ...Mixins.boxShadow(Colors.WHITE),
          }}
          textColor="#090A0A"
          onPressLeftIcon={this.handleBackButton}
          title={""}
        /> */}
        <ScrollView {...this.props}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Select Debit Method</Text>
            </View>

            <View style={styles.method}>
              {OPTIONS.map((options) => (
                <TouchItem
                  style={styles.input}
                  onPress={() => this.handleCheck(options)}
                  key={options.id}
                >
                  {/* <View styles={styles.flex}> */}
                  <View>
                    <Image source={options.imageUrl} />
                  </View>
                  <View style={{ marginLeft: 25 }}>
                    <Text style={styles.text}>{options.name}</Text>
                  </View>
                  {/* </View> */}
                  <View style={styles.left}>
                    {this.state.checked?.id != options.id && (
                      <View style={[styles.blank, styles.icon]}></View>
                    )}
                    {this.state.checked?.id === options.id && (
                      <Icon.Ionicons
                        style={styles.icon}
                        name={"ios-checkmark-circle"}
                        size={Mixins.scaleFont(22)}
                        color={Colors.SUCCESS}
                      />
                    )}
                  </View>
                </TouchItem>
              ))}
            </View>
          </View>
          <View style={SharedStyle.bottomPanel}>
            <View style={FormStyle.formButton}>
              <PrimaryButton
                title={Dictionary.VERIFY}
                icon="arrow-right"
                onPress={this.handleSubmit}
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
    paddingLeft: 20,
    paddingRight: 20,
  },
  leftIcon: {
    ...Mixins.padding(16),
    marginRight: Mixins.scaleSize(32),
  },
  header: {
    paddingTop: 90,
  },
  headerText: {
    fontSize: 20,
    color: Colors.CV_BLUE,
    paddingBottom: 8,
    ...Typography.FONT_BOLD,
  },
  text: {
    fontSize: 15,
    color: "#304858",
    ...Typography.FONT_REGULAR,
  },
  method: {
    paddingTop: 30,
  },
  flex: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    //justifyContent: "space-between",
    width: "100%",
    paddingLeft: Mixins.scaleSize(20),
    paddingRight: Mixins.scaleSize(20),
    marginBottom: Mixins.scaleSize(24),
    backgroundColor: Colors.WHITE,
    borderColor: "#C4C4C4",
    borderWidth: Mixins.scaleSize(2),
    borderRadius: Mixins.scaleSize(10),
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
  left: {
    alignItems: "flex-end",
  },
});

export default withNavigationFocus(AddDebitMethod);
