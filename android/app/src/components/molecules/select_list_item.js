import React, { Component } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import * as Icon from '@expo/vector-icons';

import { TouchItem } from '_atoms';
import { Colors, Mixins, Typography } from '_styles';

class SelectListItem extends Component {
    render() {
        let hasImage = typeof this.props.image !== 'undefined';
        let hasDescription = typeof this.props.description !== 'undefined';
        let isSelectable = typeof this.props.selected !== 'undefined';
        let textWidth = 62;
        if (!hasImage) {
            textWidth += 20;
        }
        if (!isSelectable) {
            textWidth += 10;
        }

        if (this.props.onPress) {
            return (
                <TouchItem
                    onPress={() => this.props.onPress()}
                    disabled={this.props.disabled}>
                    <View style={[
                        styles.listContent,
                        !isSelectable ? { paddingRight: Mixins.scaleSize(16) } : {},
                        !hasDescription ? { paddingTop: Mixins.scaleSize(16), paddingBottom: Mixins.scaleSize(16) } : {},
                        !hasImage && !hasDescription ? { paddingTop: Mixins.scaleSize(20), paddingBottom: Mixins.scaleSize(20) } : {}
                    ]}>
                        {hasImage && (
                            <View style={[
                                styles.imageContainer,
                                this.props.imageCarpet ? styles.carpetContainer : {},
                                this.props.imageCarpetColor ? { backgroundColor: this.props.imageCarpetColor } : {}
                            ]}>
                                <Image style={[styles.image, this.props.imageCarpet ? styles.carpetImage : {}]} source={this.props.image} />
                            </View>
                        )}
                        <View style={[styles.listText, { width: `${textWidth}%` }]}>
                            <Text
                                numberOfLines={2}
                                style={[
                                    styles.text,
                                    styles.title,
                                    hasImage ? styles.imageTitle : {},
                                    !hasDescription ? { marginBottom: Mixins.scaleSize(0) } : {},
                                    this.props.selected ? styles.selectedText : {}
                                ]}>
                                {this.props.title}
                            </Text>
                            {hasDescription && (
                                <Text
                                    numberOfLines={4}
                                    style={[
                                        styles.text,
                                        styles.description,
                                        hasImage ? styles.imageDescription : {},
                                        this.props.selected ? styles.selectedText : {}
                                    ]}>
                                    {this.props.description}
                                </Text>
                            )}
                        </View>
                        {isSelectable && (
                            <View style={styles.checkbox}>
                                {!this.props.selected && (
                                    <View style={styles.blank}></View>
                                )}
                                {this.props.selected && (
                                    <Icon.Ionicons name={'ios-checkmark-circle'} size={Mixins.scaleFont(22)} color={Colors.SUCCESS} />
                                )}
                            </View>
                        )}
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
                            !hasDescription ? { paddingTop: Mixins.scaleSize(16), paddingBottom: Mixins.scaleSize(16) } : {}
                        ]}>
                        {hasImage && (
                            <View style={styles.imageContainer}>
                                <Image style={styles.image} source={this.props.image} />
                            </View>
                        )}
                        <View style={[styles.listText, { width: `${textWidth}%` }]}>
                            <Text
                                numberOfLines={2}
                                style={[
                                    styles.text,
                                    styles.title,
                                    hasImage ? styles.imageTitle : {},
                                    !hasDescription ? { marginBottom: Mixins.scaleSize(0) } : {},
                                    styles.selectedText]}>
                                {this.props.title}
                            </Text>
                            {hasDescription && (
                                <Text
                                    numberOfLines={4}
                                    style={[
                                        styles.text,
                                        styles.description,
                                        hasImage ? styles.imageDescription : {},
                                        styles.selectedText]}>
                                    {this.props.description}
                                </Text>
                            )}
                        </View>
                        {isSelectable && (
                            <View style={styles.checkbox}>
                                <View style={styles.blank}></View>
                            </View>
                        )}
                    </View>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    listContent: {
        ...Mixins.padding(30, 16, 30, 0),
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: Mixins.scaleSize(16),
        borderTopWidth: Mixins.scaleSize(1),
        borderColor: Colors.LIGHT_BG
    },
    imageContainer: {

    },
    carpetContainer: {
        backgroundColor: Colors.LIGHT_UNCHECKED_BG,
        width: Mixins.scaleSize(60),
        height: Mixins.scaleSize(60),
        borderRadius: Mixins.scaleSize(10),
        alignItems: 'center',
        justifyContent: 'center'
    },
    image: {
        width: Mixins.scaleSize(60),
        height: Mixins.scaleSize(60)
    },
    carpetImage: {
        width: Mixins.scaleSize(60),
        height: Mixins.scaleSize(53),
        resizeMode: 'contain'
    },
    listText: {
        marginHorizontal: Mixins.scaleSize(16)
    },
    text: {
        color: Colors.LIGHT_GREY,
        letterSpacing: Mixins.scaleSize(0.01)
    },
    selectedText: {
        color: Colors.CV_BLUE
    },
    title: {
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(20),
        lineHeight: Mixins.scaleSize(23),
        marginBottom: Mixins.scaleSize(12)
    },
    imageTitle: {
        fontSize: Mixins.scaleFont(18),
        lineHeight: Mixins.scaleSize(21)
    },
    description: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
    },
    imageDescription: {
        fontSize: Mixins.scaleFont(12),
        lineHeight: Mixins.scaleSize(14)
    },
    checkbox: {
        width: '8%'
    },
    blank: {
        width: Mixins.scaleSize(20),
        height: Mixins.scaleSize(20),
        backgroundColor: Colors.LIGHT_UNCHECKED_BG,
        borderRadius: Mixins.scaleSize(50)
    }
});


export default SelectListItem;