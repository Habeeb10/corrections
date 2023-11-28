import React, { Component } from "react";
import { StyleSheet, View, Image, Text } from "react-native";
import * as Icon from "@expo/vector-icons";

import { TouchItem } from "_atoms";
import { Colors, Mixins, Typography } from "_styles";

const PickItem = class extends Component {
  render() {
    let hasImage = typeof this.props.image !== "undefined";
    let hasDescription = typeof this.props.description !== "undefined";
    let isSelectable = typeof this.props.selected !== "undefined";
    let textWidth = 62;
    if (!hasImage) {
      textWidth += 20;
    }
    if (!isSelectable) {
      textWidth += 10;
    }

    const containerStyle = {
      borderWidth: 2,
      borderColor: this.props.selected ? Colors.CV_YELLOW : Colors.GREY,
      height: Mixins.scaleSize(46),
      borderRadius: Mixins.scaleSize(10),
      alignItems: "center",
      justifyContent: "center",
      marginRight: Mixins.scaleSize(4),
      marginBottom: 10,
    };

    if (this.props.onPress) {
      return (
        <TouchItem
          onPress={() => this.props.onPress()}
          disabled={this.props.disabled}
        >
          <View
            style={[
              styles.listContent,
              containerStyle,
              {
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: Mixins.scaleSize(20),
              },
            ]}
          >
            {isSelectable && this.props.selected && (
              <View style={styles.checkbox}>
                <Icon.Ionicons
                  name={"ios-checkmark-circle"}
                  size={Mixins.scaleFont(12)}
                  color={Colors.CV_YELLOW}
                />
              </View>
            )}

            {hasImage && (
              <View
                style={[
                  styles.imageContainer,
                  this.props.imageCarpet ? styles.carpetContainer : {},
                  this.props.imageCarpetColor
                    ? { backgroundColor: this.props.imageCarpetColor }
                    : {},
                ]}
              >
                <Image
                  style={[
                    styles.image,
                    this.props.imageCarpet ? styles.carpetImage : {},
                  ]}
                  source={this.props.image}
                />
              </View>
            )}

            <View
              style={[
                styles.listText,
                {
                  marginLeft: Mixins.scaleSize(5),
                  marginTop: hasImage ? 0 : Mixins.scaleSize(8),
                },
              ]}
            >
              <Text
                numberOfLines={2}
                style={[
                  styles.text,
                  styles.title,
                  hasImage ? styles.imageTitle : {},
                  !hasDescription ? { marginBottom: Mixins.scaleSize(0) } : {},
                  this.props.selected ? styles.selectedText : {},
                ]}
              >
                {this.props.title}
              </Text>
              {hasDescription && (
                <Text
                  numberOfLines={4}
                  style={[
                    styles.text,
                    styles.description,
                    hasImage ? styles.imageDescription : {},
                    this.props.selected ? styles.selectedText : {},
                  ]}
                >
                  {this.props.description}
                </Text>
              )}
            </View>
          </View>
        </TouchItem>
      );
    } else {
      return (
        <View>
          <View
            style={[
              styles.listContent,
              !isSelectable ? { paddingRight: Mixins.scaleSize(16) } : {},
              !hasDescription
                ? {
                    paddingTop: Mixins.scaleSize(16),
                    paddingBottom: Mixins.scaleSize(16),
                  }
                : {},
            ]}
          >
            {hasImage && (
              <View style={styles.imageContainer}>
                <Image style={styles.image} source={this.props.image} />
              </View>
            )}
            <View style={[styles.listText]}>
              <Text
                numberOfLines={2}
                style={[
                  styles.text,
                  styles.title,
                  hasImage ? styles.imageTitle : {},
                  !hasDescription ? { marginBottom: Mixins.scaleSize(0) } : {},
                  styles.selectedText,
                ]}
              >
                {this.props.title}
              </Text>
              {hasDescription && (
                <Text
                  numberOfLines={4}
                  style={[
                    styles.text,
                    styles.description,
                    hasImage ? styles.imageDescription : {},
                    styles.selectedText,
                  ]}
                >
                  {this.props.description}
                </Text>
              )}
            </View>
            {isSelectable && this.props.selected && (
              <View style={styles.checkbox}>
                <View style={styles.blank}></View>
              </View>
            )}
          </View>
        </View>
      );
    }
  }
};

const styles = StyleSheet.create({
  listContent: {},
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  imageContainer: {
    borderRadius: Mixins.scaleSize(10),
  },
  carpetContainer: {
    backgroundColor: Colors.LIGHT_UNCHECKED_BG,
  },
  image: {
    width: Mixins.scaleSize(25),
    height: Mixins.scaleSize(25),
    borderRadius: Mixins.scaleSize(15),
  },
  carpetImage: {
    width: Mixins.scaleSize(22),
    borderRadius: Mixins.scaleSize(10),
  },
  text: {
    color: Colors.LIGHT_GREY,
  },
  selectedText: {
    color: Colors.CV_YELLOW,
  },
  title: {
    fontSize: Mixins.scaleFont(12),
    ...Typography.FONT_BOLD,
    color: Colors.BLACK,
  },
  imageTitle: {
    fontSize: Mixins.scaleFont(15),
  },
  description: {
    fontSize: Mixins.scaleFont(14),
    ...Typography.FONT_BOLD,
    color: Colors.BLACK,
  },
  imageDescription: {
    fontSize: Mixins.scaleFont(12),
    lineHeight: Mixins.scaleSize(12),
  },
  checkbox: {
    position: "absolute",
    top: Mixins.scaleSize(3),
    right: Mixins.scaleSize(3),
  },
  blank: {
    width: Mixins.scaleSize(8),
    height: Mixins.scaleSize(8),
    backgroundColor: Colors.CV_YELLOW,
    borderRadius: Mixins.scaleSize(50),
    flex: 1,
  },
});

export default PickItem;
