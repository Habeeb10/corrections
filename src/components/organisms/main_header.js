import React, { Component } from "react";
import { StyleSheet, View, Text } from "react-native";
import * as Icon from "@expo/vector-icons";

import { Colors, Mixins, Typography } from "_styles";
import { TouchItem } from "_atoms";

class MainHeader extends Component {
  render() {
    return (
      <View style={[styles.background, this.props.backgroundStyle]}>
        {this.props.leftIcon && (
          <TouchItem
            disabled={!this.props.onPressLeftIcon}
            style={styles.leftIcon}
            onPress={this.props.onPressLeftIcon}
          >
            <Icon.SimpleLineIcons
              size={Mixins.scaleSize(13)}
              style={[
                styles.icon,
                this.props.textColor ? { color: this.props.textColor } : {},
              ]}
              name={this.props.leftIcon}
            />
          </TouchItem>
        )}
        <Text
          style={[
            styles.text,
            this.props.textColor ? { color: this.props.textColor } : {},
          ]}
          numberOfLines={1}
        >
          {this.props.title}
        </Text>
        {this.props.rightIcon && (
          <TouchItem
            disabled={!this.props.onPressRightIcon}
            style={styles.rightIcon}
            onPress={this.props.onPressRightIcon}
          >
            <Icon.SimpleLineIcons
              size={Mixins.scaleSize(15)}
              style={[
                styles.icon,
                this.props.textColor ? { color: this.props.textColor } : {},
              ]}
              name={this.props.rightIcon}
            />
          </TouchItem>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  background: {
    ...Mixins.boxShadow(Colors.BLACK),
    height: Mixins.scaleSize(50),
    elevation: 15,
    backgroundColor: Colors.CV_BLUE,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
  },
  text: {
    ...Mixins.padding(16, 0, 16, 0),
    ...Typography.FONT_BOLD,
    fontSize: Mixins.scaleFont(18),
    lineHeight: Mixins.scaleSize(21),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.WHITE,
    flex: 1,
  },
  leftIcon: {
    ...Mixins.padding(16),
    // marginRight: Mixins.scaleSize(32),
  },
  rightIcon: {
    ...Mixins.padding(16),
    marginLeft: Mixins.scaleSize(32),
  },
  icon: {
    color: Colors.WHITE,
  },
});

export default MainHeader;
