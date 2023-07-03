import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors, Mixins, Typography } from '_styles';

class InfoPanel extends Component {

    render() {
        return (
            <View style={[styles.background, this.props.style]}>
                <Text style={[styles.text, this.props.textStyle]}>{this.props.text}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    background: {
        ...Mixins.margin(8, 8, 32, 8),
        ...Mixins.padding(16),
        backgroundColor: Colors.ASH_BG,
        borderRadius: Mixins.scaleSize(10)
    },
    text: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(12),
        lineHeight: Mixins.scaleSize(14),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.LIGHT_GREY
    }
});

export default InfoPanel;
