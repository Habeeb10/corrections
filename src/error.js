import React, { Component } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Mixins, Colors, Typography } from "_styles";

export default class ErrorBoundries extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: "",
      errorInfo: "",
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log("Error: " + error);

    console.log("Error Info: " + JSON.stringify(errorInfo));

    this.setState({ error: error, errorInfo: errorInfo.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.mainContainer}>
          <View style={styles.content}>
            <Image
              style={styles.icon}
              source={require("./assets/images/shared/error_icon.png")}
            />

            <View style={styles.message}>
              <Text style={styles.messageHeader}>
                Oops!!! Something went wrong...
              </Text>

              <View style={styles.messageDescriptionContainer}>
                <Text style={styles.messageDescription}>
                  {this.state.error.toString()}
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.CV_BLUE,
    justifyContent: "center",
  },
  content: {
    ...Mixins.margin(100, 20, 0, 20),
    flexDirection: "row",
    paddingBottom: Mixins.scaleSize(70),
  },
  icon: {
    width: Mixins.scaleSize(60),
    height: Mixins.scaleSize(60),
    marginRight: Mixins.scaleSize(20),
  },
  message: {
    width: "80%",
  },
  messageHeader: {
    ...Typography.FONT_BOLD,
    fontSize: Mixins.scaleFont(30),
    lineHeight: Mixins.scaleSize(35),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.WHITE,
    marginBottom: Mixins.scaleSize(12),
  },
  messageDescription: {
    ...Typography.FONT_MEDIUM,
    fontSize: Mixins.scaleFont(16),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.WHITE,
  },
  messageDescriptionContainer: {
    ...Mixins.margin(10, 30, 0, 0),
  },
});
