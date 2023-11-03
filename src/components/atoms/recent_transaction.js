import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors, Mixins, Typography } from '_styles';
import { default as TouchItem } from './touch_item';

class RecentTransaction extends Component {

    render() {
        let initials = this.props.customerName.match(/\b\w/g) || [];
        initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase();
        return (
            <TouchItem
                style={styles.background}
                onPress={this.props.onPress}>
                <View style={[styles.initials, this.props.initialsBackgroundColor ? { backgroundColor: this.props.initialsBackgroundColor } : {}]}>
                    <Text style={[styles.text, styles.initialsText, this.props.initialsTextColor ? { color: this.props.initialsTextColor } : {}]}>
                        {initials}
                    </Text>
                </View>
                <View>
                    <Text style={[styles.text, styles.customerName]}>{this.props.customerName}</Text>
                    <Text style={[styles.text, styles.customerId]}>{this.props.customerId}</Text>
                </View>
            </TouchItem>
        );
    }
}

const styles = StyleSheet.create({
    background: {
        ...Mixins.padding(16),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.TRANSACTION_BG,
        borderRadius: Mixins.scaleSize(10),
        marginBottom: Mixins.scaleSize(10)
    },
    initials: {
        marginRight: Mixins.scaleSize(10),
        width: Mixins.scaleSize(40),
        height: Mixins.scaleSize(40),
        borderRadius: Mixins.scaleSize(40),
        backgroundColor: Colors.TAB_BG,
        alignItems: 'center',
        justifyContent: 'center'
    },
    initialsText: {
        ...Typography.FONT_MEDIUM
    },
    customerName: {
        ...Typography.FONT_MEDIUM,
        color: Colors.LIGHT_GREY,
        marginBottom: Mixins.scaleSize(5)
    },
    customerId: {
        color: Colors.DARK_GREY
    },
    text: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),

    }
});

export default RecentTransaction;
