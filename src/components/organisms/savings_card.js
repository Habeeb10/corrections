import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import * as Icon from '@expo/vector-icons';

import { Dictionary } from '_utils';
import { Colors, Mixins, SharedStyle, Typography } from '_styles';
import { TouchItem } from '_atoms';
import { Util } from '_utils';

class SavingsCard extends Component {

    render() {
        const { savings, addDebit, selected } = this.props;
        const status_code = savings.is_matured === 1 ? 'matured' : savings.status === 0 ? 'onHold' : savings.status === 1 ? 'active' : 'onHold';
        const status_name = savings.is_matured === 1 ? 'Matured' : savings.status === 0 ? 'On Hold' : savings.status === 1 ? 'Active' : '';

        return (
            <View style={styles.container}>
                <TouchItem style={[styles.card, styles[`${status_code}Background`]]} onPress={this.props.onPress}>
                    <View style={styles.nameContainer}>
                        <Text style={[styles.name, styles[`${status_code}Text`]]} numberOfLines={1}>
                            {Util.toTitleLeadChar(savings.name)}
                        </Text>
                        {!!savings.locked && (
                            <Icon.Fontisto name={'locked'} size={Mixins.scaleFont(20)} style={styles[`${status_code}Text`]} />
                        )}
                        {!!savings.locked === false && addDebit && (
                           <View>
                           {!selected && (
                             <View style={[styles.blank, styles.icon]}></View>
                           )}
                           {selected && (
                             <Icon.Ionicons
                               style={styles.icon}
                               name={"ios-checkmark-circle"}
                               size={Mixins.scaleFont(22)}
                               color={Colors.SUCCESS}
                             />
                           )}
                         </View>
                        )}
                    </View>
                    <Text style={[SharedStyle.normalText, styles.cardLabel, styles[`${status_code}Text`]]}
                        numberOfLines={1}>
                        {Dictionary.BALANCE}
                    </Text>
                    <Text style={[
                        SharedStyle.normalText,
                        styles.cardMiddleValue,
                        styles[`${status_code}Text`],
                        styles[`${status_code}Value`]
                    ]} numberOfLines={1}>
                        ₦{Util.formatAmount(Number(savings.balance))}
                    </Text>
                    <View style={[SharedStyle.row, styles.row]}>
                        <View style={SharedStyle.halfColumn}>
                            <Text style={[SharedStyle.normalText, styles.cardLabel, styles[`${status_code}Text`]]}
                                numberOfLines={1}>
                                {Dictionary.STATUS_LABEL}
                            </Text>
                            <Text style={[
                                SharedStyle.normalText,
                                styles.cardBottomValue,
                                styles[`${status_code}Text`],
                                styles[`${status_code}Value`]
                            ]} numberOfLines={1}>
                                {status_name}
                            </Text>
                        </View>
                        <View style={[SharedStyle.halfColumn, styles.rightColumn]}>
                            <Text style={[SharedStyle.normalText, styles.cardLabel, styles[`${status_code}Text`]]}
                                numberOfLines={1}>
                                {Dictionary.INTEREST}
                            </Text>
                            <Text style={[
                                SharedStyle.normalText,
                                styles.cardBottomValue,
                                styles[`${status_code}Text`],
                                styles[`${status_code}Value`],
                                { textTransform: 'none' }
                            ]} numberOfLines={1}>
                                {savings.interest_rate}% {Dictionary.PER_ANNUM}
                            </Text>
                        </View>
                    </View>
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
    nameContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Mixins.scaleSize(40)
    },
    name: {
        ...Typography.FONT_BOLD,
        flex: 1,
        fontSize: Mixins.scaleFont(16),
        lineHeight: Mixins.scaleSize(19),
        letterSpacing: Mixins.scaleSize(0.01),
        marginRight: Mixins.scaleSize(10)
    },
    locked: {
        flex: 1
    },
    cardLabel: {
        marginBottom: Mixins.scaleSize(5),
        textTransform: 'capitalize'
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
    row: {
        marginBottom: Mixins.scaleSize(0)
    },
    rightColumn: {
        alignItems: 'flex-end'
    },
    activeBackground: {
        backgroundColor: Colors.LIGHTER_BLUE_BG
    },
    activeText: {
        color: Colors.LIGHT_BLUE
    },
    activeValue: {
        borderBottomColor: Colors.LIGHTER_BLUE_BORDER
    },
    onHoldBackground: {
        backgroundColor: Colors.LIGHTER_ORANGE_BG
    },
    onHoldText: {
        color: Colors.CV_YELLOW
    },
    onHoldValue: {
        borderBottomColor: Colors.LIGHT_YELLOW_BORDER
    },
    maturedBackground: {
        backgroundColor: Colors.LIGHT_PURPLE_BG
    },
    maturedText: {
        color: Colors.LIGHT_PURPLE
    },
    maturedValue: {
        borderBottomColor: Colors.LIGHT_PURPLE_BORDER
    },
    icon: {
        marginRight: Mixins.scaleSize(12),
      },
      blank: {
        width: Mixins.scaleSize(20),
        height: Mixins.scaleSize(20),
        backgroundColor: Colors.LIGHT_UNCHECKED_BG,
        borderRadius: Mixins.scaleSize(50),
      },
});

export default SavingsCard;