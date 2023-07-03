import React, { Component } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Colors, Mixins, Typography } from '_styles';

import TouchItem from './touch_item';

class Tab extends Component {
    render() {
        const { label, activeTab } = this.props;
        const tabStyle = this.props.tabStyle || {};
        const tabTextStyle = this.props.tabTextStyle || {};
        const activeTabStyle = this.props.activeTabStyle || {};
        const activeTabTextStyle = this.props.activeTabTextStyle || {};

        return (
            <TouchItem
                onPress={() => this.props.onPress(label)}
                style={[styles.container, tabStyle, label === activeTab ? { ...styles.activeContainer, ...activeTabStyle } : {}]}>
                <Text
                    numberOfLines={1}
                    style={[styles.text, tabTextStyle, label === activeTab ? { ...styles.activeText, ...activeTabTextStyle } : {}]}>
                    {label}
                </Text>
            </TouchItem>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        ...Mixins.padding(16, 8, 16, 8)
    },
    activeContainer: {
        borderBottomColor: Colors.CV_YELLOW,
        borderBottomWidth: Mixins.scaleSize(2)
    },
    text: {
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.DARK_GREY
    },
    activeText: {
        ...Typography.FONT_BOLD,
        color: Colors.CV_YELLOW
    }
});

export default Tab;
