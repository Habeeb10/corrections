import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator, View, Text } from 'react-native';
import * as Progress from 'react-native-progress';
import SwitchToggle from '@dooboo-ui/native-switch-toggle';

import { Dictionary, Util } from '_utils';
import { Colors, Mixins, SharedStyle, FormStyle, Typography } from '_styles';

class SavingsSummary extends Component {

    render() {
        const { savings, archiving } = this.props;
        const progress = ((Number(savings.balance) / savings.target) * 100);
        const graphical_progress = (progress / 100);
        const disableArchiving = Number(savings.balance) !== 0;

        return (
            <View style={[styles.container, this.props.containerStyle]}>
                <View style={styles.balanceData}>
                    <View style={styles.balance}>
                        <Text style={[SharedStyle.normalText, styles.balanceLabel]} numberOfLines={1}>
                            {Dictionary.BALANCE}
                        </Text>
                        <Text style={styles.balanceValue} numberOfLines={1}>
                            ₦{Util.formatAmount(Number(savings.balance))}
                        </Text>
                    </View>
                    <View style={styles.progress}>
                        {Number(savings.target) > 0 && (
                            <Progress.Circle
                                animated={false}
                                progress={graphical_progress}
                                thickness={Mixins.scaleSize(10)}
                                showsText={true}
                                textStyle={[SharedStyle.normalText, styles.progressText]}
                                strokeCap={'round'}
                                unfilledColor={Colors.PROGRESS_BG_2}
                                borderWidth={0}
                                color={Colors.YELLOW_PROGRESS}
                                size={Mixins.scaleSize(72)} />
                        )}
                    </View>
                </View>
                <View style={styles.actionPane}>
                    <View style={styles.target}>
                        {Number(savings.target) > 0 && (
                            <Text style={[SharedStyle.normalText, styles.targetValue]} numberOfLines={1}>
                                {Dictionary.TARGET_LABEL} ₦{Util.formatAmount(Number(savings.target))}
                            </Text>
                        )}
                    </View>
                    <View style={[styles.archive, disableArchiving ? { opacity: .2 } : {}]}>
                        {archiving && (
                            <ActivityIndicator size="small" color={Colors.CV_YELLOW} />
                        )}
                        {!archiving && (
                            <View style={styles.archiveSwitch}>
                                <Text style={styles.archiveLabel}>{Dictionary.ARCHIVE}</Text>
                                <SwitchToggle
                                    containerStyle={FormStyle.switchContainer}
                                    circleStyle={FormStyle.switchCircle}
                                    switchOn={savings.archived}
                                    onPress={this.props.onArchive}
                                    backgroundColorOn={Colors.GREEN}
                                    backgroundColorOff={Colors.LIGHT_GREY}
                                    circleColorOff={Colors.WHITE}
                                    circleColorOn={Colors.WHITE}
                                    duration={50} />
                            </View>
                        )}
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        ...Mixins.margin(32, 16, 16, 16),
        backgroundColor: Colors.LIGHT_BG,
        borderRadius: Mixins.scaleSize(10)
    },
    balanceData: {
        ...Mixins.padding(16),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    balance: {
        width: '75%',
        paddingRight: Mixins.scaleSize(5)
    },
    balanceLabel: {
        color: Colors.LIGHT_GREY,
        marginBottom: Mixins.scaleSize(10)
    },
    balanceValue: {
        ...Typography.FONT_BOLD,
        fontSize: Mixins.scaleFont(28),
        lineHeight: Mixins.scaleSize(33),
        color: Colors.CV_BLUE
    },
    progress: {
        width: '25%',
        alignItems: 'center',
        paddingVertical: Mixins.scaleSize(10)
    },
    progressText: {
        color: Colors.CV_BLUE
    },
    actionPane: {
        ...Mixins.padding(16),
        borderTopWidth: Mixins.scaleSize(1),
        borderColor: Colors.LIGHTER_BORDER,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    target: {
        width: '50%'
    },
    targetValue: {
        ...SharedStyle.normalText,
        color: Colors.CV_BLUE
    },
    archive: {
        width: '50%',
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    archiveSwitch: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    archiveLabel: {
        ...SharedStyle.normalText,
        color: Colors.CV_BLUE,
        marginRight: Mixins.scaleSize(10)
    }
});

export default SavingsSummary;