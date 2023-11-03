import React, { Component } from "react";
import { BackHandler, StyleSheet, Text, View, Image } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { connect } from "react-redux";

import { Colors, Mixins, Typography, FormStyle, SharedStyle } from "_styles";

class AccountTypeButton extends Component {
  render() {
    return (
      <TouchableOpacity
        onPress={() => this.props.onPress()}
        style={[styles.containerStyle,this.props.isActive?styles.isActive:{}]}
      >
        <Image
          style={styles.imageSize}
          source={require("../../assets/images/transfers/home-bank.png")}
        />
       

        <Text style={styles.titleStyle}>{this.props.title}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: Colors.CV_YELLOW_LIGHT,
    borderRadius: Mixins.scaleSize(10),
    paddingHorizontal: Mixins.scaleSize(20),
     justifyContent: "space-between",
     flexDirection: "row",
    alignItems: "center",
    height: Mixins.scaleSize(40)
  },
  imageSize: {
    height: Mixins.scaleSize(10),
    width: Mixins.scaleSize(10)
  },
  titleStyle: {
    color: Colors.CV_BLUE
  },
  isActive:{
borderWidth:1,
borderColor:Colors.CV_BLUE
  }
});

export default AccountTypeButton;
