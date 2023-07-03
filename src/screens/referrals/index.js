import React, { Component } from 'react';
import { BackHandler, ActivityIndicator, StyleSheet, View, Text, Image, Share } from 'react-native';
import { connect } from 'react-redux';
import { withNavigationFocus } from "react-navigation";
import remoteConfig from '@react-native-firebase/remote-config';
import Clipboard from '@react-native-community/clipboard';
import * as Icon from '@expo/vector-icons';
import moment from 'moment';

import { showToast } from '_actions/toast_actions';
import { getReferralActivities,getReferalCode } from '_actions/user_actions';

import { env, Dictionary, Util } from '_utils';
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from '_styles';
import { ScrollView, TouchItem } from '_atoms';
import { PrimaryButton } from '_molecules';
import { MainHeader } from '_organisms';

class Referrals extends Component {
    constructor(props) {
        super(props);

        const linkPrefix = remoteConfig().getValue(`referral_link_prefix_${env().target}`).asString();
        const default_ref = remoteConfig().getValue(`default_referral_code_${env().target}`).asString();
        const referral_message = remoteConfig().getValue(`referral_message_${env().target}`).asString();
        const referral_code = this.props.user.referal_code || default_ref;

        this.state = {
            referral_message,
            referral_link: `${linkPrefix}${referral_code}`,
            referral_code
        };
    }

    componentDidMount = () => {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        // this.props.getReferralActivities();
        this.props.getReferalCode();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            this.props.navigation.navigate('Dashboard');
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
        let { referral_message,  referral_link } = this.state;

        let { referral_activities,referal_code } = this.props.user;


        if(this.props.user.loading_referral_code){
            return(<View style={[SharedStyle.mainContainer,{alignItems:"center",justifyContent:"center"}]}>
            <ActivityIndicator  color={Colors.CV_YELLOW} />
            <Text style={{fontWeight:"bold",fontSize:11}}>Loading Referral Page...</Text>
           </View>
       ) 
        }
        referral_activities = referral_activities || [];

        const sign_ups = referral_activities.filter(referral => referral.activity?.toLowerCase() === 'sign_up').length;
        const earnings = referral_activities.reduce((sum, activity) => { return sum + (activity.earning || 0) }, 0);
        const recent_activities = referral_activities.filter((referral, index) => index < 6);

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.REFERRALS_HEADER} />
                {this.props.loading_referral_activities && (
                    <View style={SharedStyle.loaderContainer}>
                        <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                    </View>
                )}
                {!this.props.loading_referral_activities && (
                    <ScrollView {...this.props} hasButtomButtons={true}>
                        <View style={styles.container}>
                            <View style={styles.header}>
                                <Text style={styles.title}>{Dictionary.REFERRALS_TITLE}</Text>
                                <Text style={styles.description}>{referral_message}</Text>
                            </View>
                            <View style={[SharedStyle.row, styles.card]}>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={styles.label}>{Dictionary.TOTAL_SIGN_UPS}</Text>
                                    <Text numberOfLines={1} style={styles.value}>{sign_ups}</Text>
                                </View>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[styles.label, SharedStyle.right]}>{Dictionary.TOTAL_EARNINGS}</Text>
                                    <Text numberOfLines={1} style={[styles.value, SharedStyle.right]}>₦{Util.formatAmount(earnings)}</Text>
                                </View>
                            </View>
                            <View style={styles.card}>
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={styles.cardTitle}>{Dictionary.ACTIVITIES}</Text>
                                    </View>
                                    {referral_activities.length > 0 && (
                                        <View style={SharedStyle.halfColumn}>
                                            <TouchItem style={{ paddingVertical: Mixins.scaleSize(5) }}
                                                onPress={() => this.props.navigation.navigate('ReferralActivities', { referal_code, referral_link })}>
                                                <Text numberOfLines={1} style={[styles.label, styles.link, SharedStyle.right]}>{Dictionary.VIEW_MORE}</Text>
                                            </TouchItem>
                                        </View>
                                    )}
                                </View>
                                {recent_activities.length === 0 && (
                                    <View style={styles.empty}>
                                        <Image
                                            style={styles.emptyImage}
                                            source={require('../../assets/images/referrals/referrals.png')}
                                        />
                                        <Text style={styles.emptyText}>{Dictionary.NO_REFERRAL}</Text>
                                    </View>
                                )}
                                {recent_activities.length > 0 && (
                                    <View>
                                        {recent_activities.map((activity, index) => {
                                            let timeline = moment(activity.created_on);
                                            let activity_date = timeline.format('DD/MM/YYYY');

                                            if (timeline.isSame(moment(), "day")) {
                                                activity_date = timeline.format('h:mm A');
                                            }

                                            return (
                                                <View key={index} style={styles.activity}>
                                                    <Text numberOfLines={2} style={styles.activityDescription}>
                                                        {activity.description || '- - -'}
                                                    </Text>
                                                    <Text numberOfLines={1} style={styles.activityTime}>
                                                        {activity_date}
                                                    </Text>
                                                </View>
                                            )
                                        })}
                                    </View>
                                )}
                            </View>
                        </View>
                        <View style={SharedStyle.bottomPanel}>
                            <View style={[FormStyle.formButton, styles.invite]}>
                                <View style={styles.inviteTextView}>
                                    <Text style={styles.inviteCode}>{referal_code}</Text>
                                </View>
                                <TouchItem
                                    style={styles.inviteButton}
                                    onPress={() => {
                                        Clipboard.setString(referal_code);
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
                )}
            </View >
        );
    }
}

const styles = StyleSheet.create({
    container: {
        ...Mixins.padding(24, 16, 50, 16),
        flex: 1
    },
    header: {
        marginBottom: Mixins.scaleSize(30)
    },
    title: {
        ...Typography.FONT_BOLD,
        fontSize: Mixins.scaleFont(24),
        lineHeight: Mixins.scaleSize(28),
        color: Colors.CV_BLUE,
        marginBottom: Mixins.scaleSize(8)
    },
    description: {
        ...SharedStyle.normalText,
        color: Colors.CV_BLUE
    },
    card: {
        ...Mixins.padding(15),
        borderRadius: Mixins.scaleSize(8),
        backgroundColor: Colors.REFERRAL_CARD_BG,
        marginBottom: Mixins.scaleSize(24)
    },
    label: {
        ...SharedStyle.normalText,
        color: Colors.CV_BLUE
    },
    value: {
        ...Typography.FONT_BOLD,
        color: Colors.CV_BLUE,
        fontSize: Mixins.scaleFont(16),
        lineHeight: Mixins.scaleSize(19),
        letterSpacing: Mixins.scaleSize(0.01),
        marginTop: Mixins.scaleSize(10)
    },
    cardTitle: {
        ...Typography.FONT_BOLD,
        color: Colors.CV_BLUE,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.03)
    },
    link: {
        ...Typography.FONT_MEDIUM,
        textDecorationLine: 'underline'
    },
    empty: {
        alignItems: 'center'
    },
    emptyImage: {
        width: Mixins.scaleSize(240),
        height: Mixins.scaleSize(135),
        resizeMode: 'contain',
        marginBottom: Mixins.scaleSize(16)
    },
    emptyText: {
        ...SharedStyle.normalText,
        fontSize: Mixins.scaleFont(13),
        lineHeight: Mixins.scaleSize(18),
        color: Colors.CV_BLUE,
        width: Mixins.scaleSize(220),
        textAlign: 'center'
    },
    activity: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Mixins.scaleSize(16)
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
    showToast,
    getReferralActivities,
    getReferalCode
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Referrals));