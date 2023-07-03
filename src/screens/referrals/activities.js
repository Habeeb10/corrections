import React, { Component } from 'react';
import { BackHandler, StyleSheet, View, Text, Share } from 'react-native';
import { connect } from 'react-redux';
import { withNavigationFocus } from "react-navigation";
import Clipboard from '@react-native-community/clipboard';
import * as Icon from '@expo/vector-icons';
import moment from 'moment';

import { showToast } from '_actions/toast_actions';

import { Dictionary } from '_utils';
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from '_styles';
import { ScrollView, TouchItem } from '_atoms';
import { Tabs, PrimaryButton } from '_molecules';
import { MainHeader } from '_organisms';

class ReferralActivities extends Component {
    constructor(props) {
        super(props);

        const navigation = this.props.navigation;
        const referral_code = navigation.getParam('referral_code');
        const referral_link = navigation.getParam('referral_link');

        const { referral_activities } = this.props.user;
        const sign_ups = referral_activities.filter(referral => referral.activity?.toLowerCase() === 'sign_up');
        const other_activities = referral_activities.filter(referral => referral.activity?.toLowerCase() !== 'sign_up');

        this.state = {
            referral_link,
            referral_code,
            sign_ups,
            other_activities
        };
    }

    componentDidMount = () => {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            this.props.navigation.goBack();
            return true;
        }
    }

    handleShareLink = async () => {
        try {
            await Share.share({ message: this.state.referral_link });
        } catch (error) {
            this.props.showToast(Dictionary.SHARE_LINK_ERROR);
        }
    }

    render() {
        let { referral_code, sign_ups, other_activities } = this.state;
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.REFERRALS_HEADER} />
                <ScrollView {...this.props}>
                    <View style={styles.container}>
                        <Tabs
                            tabberStyle={styles.tabber}
                            tabStyle={styles.tab}
                            activeTabStyle={styles.activeTab}
                            tabTextStyle={styles.tabText}
                            activeTabTextStyle={styles.activeTabTextStyle}>
                            <View title={Dictionary.SIGN_UPS}>
                                {sign_ups.length === 0 && (
                                    <View style={SharedStyle.loaderContainer}>
                                        <Text>{Dictionary.NO_DATA}</Text>
                                    </View>
                                )}
                                {sign_ups.length > 0 && (
                                    <View>
                                        {sign_ups.map((activity, index) => {
                                            let timeline = moment(activity.created_on);
                                            let activity_date = timeline.format('DD/MM/YYYY');

                                            if (timeline.isSame(moment(), "day")) {
                                                activity_date = timeline.format('h:mm A');
                                            }

                                            return (
                                                <View style={styles.card}>
                                                    <View key={index} style={styles.activity}>
                                                        <Text numberOfLines={2} style={styles.activityDescription}>
                                                            {activity.description || '- - -'}
                                                        </Text>
                                                        <Text numberOfLines={1} style={styles.activityTime}>
                                                            {activity_date}
                                                        </Text>
                                                    </View>
                                                </View>
                                            )
                                        })}
                                    </View>
                                )}
                            </View>
                            <View title={Dictionary.REFERRAL_ACTIVITIES}>
                                {other_activities.length === 0 && (
                                    <View style={SharedStyle.loaderContainer}>
                                        <Text>{Dictionary.NO_DATA}</Text>
                                    </View>
                                )}
                                {other_activities.length > 0 && (
                                    <View>
                                        {other_activities.map((activity, index) => {
                                            let timeline = moment(activity.created_on);
                                            let activity_date = timeline.format('DD/MM/YYYY');

                                            if (timeline.isSame(moment(), "day")) {
                                                activity_date = timeline.format('h:mm A');
                                            }

                                            return (
                                                <View key={index} style={styles.card}>
                                                    <View style={styles.activity}>
                                                        <Text numberOfLines={2} style={styles.activityDescription}>
                                                            {activity.description || '- - -'}
                                                        </Text>
                                                        <Text numberOfLines={1} style={styles.activityTime}>
                                                            {activity_date}
                                                        </Text>
                                                    </View>
                                                </View>
                                            )
                                        })}
                                    </View>
                                )}
                            </View>
                        </Tabs>
                    </View>
                    <View style={SharedStyle.bottomPanel}>
                        <View style={[FormStyle.formButton, styles.invite]}>
                            <View style={styles.inviteTextView}>
                                <Text style={styles.inviteCode}>{referral_code}</Text>
                            </View>
                            <TouchItem
                                style={styles.inviteButton}
                                onPress={() => {
                                    Clipboard.setString(referral_code);
                                    this.props.showToast(Dictionary.REFERRAL_CODE_COPIED, false);
                                }}>
                                <Icon.Ionicons
                                    name={'copy-outline'}
                                    color={Colors.WHITE}
                                    size={Mixins.scaleSize(14)} />
                                <Text style={styles.inviteButtonText}>{Dictionary.COPY_LINK}</Text>
                            </TouchItem>
                        </View>
                        <View style={FormStyle.formButton}>
                            <PrimaryButton
                                title={Dictionary.SHARE_LINK_BTN}
                                icon="arrow-right"
                                onPress={this.handleShareLink} />
                        </View>
                    </View>
                </ScrollView>
            </View >
        );
    }
}

const styles = StyleSheet.create({
    container: {
        ...Mixins.padding(24, 16, 70, 16),
        flex: 1
    },
    tabber: {
        backgroundColor: Colors.WHITE,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: Mixins.scaleSize(8),
        borderBottomWidth: Mixins.scaleSize(1),
        borderColor: Colors.TAB_BORDER
    },
    tab: {
        ...Mixins.padding(8, 16, 8, 16),
        borderBottomWidth: Mixins.scaleSize(3),
        borderBottomColor: Colors.WHITE
    },
    tabText: {
        ...Typography.FONT_BOLD,
        fontSize: Mixins.scaleFont(16),
        lineHeight: Mixins.scaleSize(19),
        letterSpacing: Mixins.scaleSize(0.03),
        color: Colors.CV_BLUE,
        opacity: 0.6
    },
    activeTab: {
        borderBottomWidth: Mixins.scaleSize(3),
        borderBottomColor: Colors.CV_BLUE
    },
    activeTabTextStyle: {
        ...Typography.FONT_BOLD,
        color: Colors.CV_BLUE,
        opacity: 1
    },
    card: {
        ...Mixins.padding(15),
        borderRadius: Mixins.scaleSize(8),
        backgroundColor: Colors.REFERRAL_CARD_BG,
        marginBottom: Mixins.scaleSize(24)
    },
    activity: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    activityDescription: {
        ...SharedStyle.normalText,
        color: Colors.CV_BLUE,
        flex: 1
    },
    activityTime: {
        ...SharedStyle.normalText,
        ...Typography.FONT_MEDIUM,
        color: Colors.CV_BLUE,
        marginLeft: Mixins.scaleSize(20)
    },
    invite: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignContent: 'center',
        alignItems: 'center',
        marginBottom: Mixins.scaleSize(20)
    },
    inviteTextView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: Mixins.scaleSize(50),
        borderWidth: Mixins.scaleSize(1),
        borderRightWidth: Mixins.scaleSize(0),
        borderColor: Colors.CV_YELLOW,
        borderTopLeftRadius: Mixins.scaleSize(8),
        borderBottomLeftRadius: Mixins.scaleSize(8)
    },
    inviteCode: {
        ...SharedStyle.normalText,
        ...Typography.FONT_MEDIUM,
        ...Mixins.padding(10),
        color: Colors.CV_BLUE
    },
    inviteButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: Mixins.scaleSize(50),
        paddingHorizontal: Mixins.scaleSize(10),
        backgroundColor: Colors.CV_YELLOW,
        borderTopRightRadius: Mixins.scaleSize(8),
        borderBottomRightRadius: Mixins.scaleSize(8)
    },
    inviteButtonText: {
        ...SharedStyle.normalText,
        color: Colors.WHITE,
        marginLeft: Mixins.scaleSize(8)
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};

const mapDispatchToProps = {
    showToast
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(ReferralActivities));