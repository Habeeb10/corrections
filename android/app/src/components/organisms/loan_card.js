import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { Dictionary } from '_utils';
import { Colors, Mixins, SharedStyle, Typography } from '_styles';
import { TouchItem } from '_atoms';
import { Util } from '_utils';

class LoanCard extends Component {

    render() {
        let { loan } = this.props;
        const status_slug = loan.status_slug;

        return (
            <View style={styles.container}>
                <TouchItem style={[styles.card, styles[`${status_slug}Background`]]} onPress={this.props.onPress}>
                    <Text style={[styles.purpose, styles[`${status_slug}Text`]]}
                        numberOfLines={1}>
                        {loan.loan_profile.purpose}
                    </Text>
                    <Text style={[SharedStyle.normalText, styles.cardLabel, styles[`${status_slug}Text`]]}
                        numberOfLines={1}>
                        {Dictionary.LOAN_AMOUNT}
                    </Text>
                    <Text style={[
                        SharedStyle.normalText,
                        styles.cardMiddleValue,
                        styles[`${status_slug}Text`],
                        styles[`${status_slug}Value`]
                    ]} numberOfLines={1}>
                        ₦{Util.formatAmount(loan.loan_amount)}
                    </Text>
                    <Text style={[SharedStyle.normalText, styles.cardLabel, styles[`${status_slug}Text`]]}
                        numberOfLines={1}>
                        {Dictionary.STATUS_LABEL}
                    </Text>
                    <Text style={[
                        SharedStyle.normalText,
                        styles.cardBottomValue,
                        styles[`${status_slug}Text`],
                        styles[`${status_slug}Value`]
                    ]} numberOfLines={1}>
                        {loan.status}
                    </Text>
                </TouchItem>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        ...Mixins.padding(8),
        width: '50%',
    },
    card: {
        ...Mixins.padding(16),
        borderRadius: Mixins.scaleSize(10),
    },
    purpose: {
        ...Typography.FONT_BOLD,
        fontSize: Mixins.scaleFont(16),
        lineHeight: Mixins.scaleSize(19),
        letterSpacing: Mixins.scaleSize(0.01),
        marginBottom: Mixins.scaleSize(40),
        textTransform: 'capitalize'
    },
    cardLabel: {
        marginBottom: Mixins.scaleSize(5)
    },
    cardMiddleValue: {
        ...Typography.FONT_BOLD,
        paddingBottom: Mixins.scaleSize(16),
        marginBottom: Mixins.scaleSize(16),
        borderBottomWidth: Mixins.scaleSize(1),
        textTransform: 'capitalize'
    },
    cardBottomValue: {
        ...Typography.FONT_BOLD,
        paddingBottom: Mixins.scaleSize(5),
        textTransform: 'capitalize'
    },
    pendingBackground: {
        backgroundColor: Colors.LIGHTER_ORANGE_BG
    },
    pendingText: {
        color: Colors.CV_YELLOW
    },
    pendingValue: {
        borderBottomColor: Colors.LIGHT_YELLOW_BORDER
    },
    cancelledBackground: {
        backgroundColor: Colors.LIGHTER_RED_BG
    },
    cancelledText: {
        color: Colors.CV_RED
    },
    cancelledValue: {
        borderBottomColor: Colors.LIGHT_RED_BORDER
    },
    declinedBackground: {
        backgroundColor: Colors.LIGHTER_RED_BG
    },
    declinedText: {
        color: Colors.CV_RED
    },
    declinedValue: {
        borderBottomColor: Colors.LIGHT_RED_BORDER
    },
    runningBackground: {
        backgroundColor: Colors.LIGHT_GREEN_BG
    },
    runningText: {
        color: Colors.CV_GREEN
    },
    runningValue: {
        borderBottomColor: Colors.LIGHT_GREEN_BORDER
    },
    settledBackground: {
        backgroundColor: Colors.LIGHTER_BLUE_BG
    },
    settledText: {
        color: Colors.LIGHT_BLUE
    },
    settledValue: {
        borderBottomColor: Colors.LIGHTER_BLUE_BORDER
    },
    pastdueBackground: {
        backgroundColor: Colors.LIGHT_GREEN_BG
    },
    pastdueText: {
        color: Colors.CV_GREEN
    },
    pastdueValue: {
        borderBottomColor: Colors.LIGHT_GREEN_BORDER
    },
    terminatedBackground: {
        backgroundColor: Colors.LIGHTER_RED_BG
    },
    terminatedText: {
        color: Colors.CV_RED
    },
    terminatedValue: {
        borderBottomColor: Colors.LIGHT_RED_BORDER
    },
});

export default LoanCard;