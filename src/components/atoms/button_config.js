import React from 'react';
import { StyleSheet, Text } from 'react-native'

import { Mixins, Typography } from '_styles';
import TouchItem from './touch_item';

export const ButtonWithBackgroundBottom = (props) => {
    return (
        <TouchItem {...props} style={[styles.background, props.style]}>
            {props.children}
        </TouchItem>)
};

export const ButtonWithBackgroundText = (props) => {
    return (
        <Text {...props} style={[styles.text, props.style]} numberOfLines={1}>
            {props.children}
        </Text>)
};

const styles = StyleSheet.create({
    background: {
        paddingHorizontal: Mixins.scaleSize(16),
        flexDirection: 'row',
        alignItems: 'center',
        height: Mixins.scaleSize(45),
        borderRadius: Mixins.scaleSize(8)
    },
    text: {
        ...Typography.FONT_BOLD,
        fontSize: Mixins.scaleFont(16)
    }
});