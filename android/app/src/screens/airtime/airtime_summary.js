import React, { Component } from 'react';
import { BackHandler, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { withNavigationFocus } from "react-navigation";
import * as Icon from '@expo/vector-icons';

import { Dictionary, Util } from '_utils';
import { Mixins, SharedStyle, FormStyle } from '_styles';
import { SubHeader, ScrollView, TouchItem, ProgressBar } from '_atoms';
import { PrimaryButton } from '_molecules';
import { MainHeader, AuthorizeTransaction } from '_organisms';
import moment from 'moment';

import { Network } from '_services';
import { addNotification } from '_actions/notification_actions';
import { showToast } from "_actions/toast_actions";
import { randomId } from '../../utils/util';

class AirtimeSummary extends Component {
    constructor(props) {
        super(props);

        const { amount, phone_number } = this.props.airtime.airtime_purchase;

        this.state = {
            amount,
            phone_number,
            processing: false,
            auth_screen_visible: false,
            pin_error: ''
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            if (!this.state.processing) {
                if (this.state.auth_screen_visible) {
                    this.cancelTransactionAuthorization();
                } else {
                    this.props.navigation.goBack();
                }
            }

            return true;
        }
    }

    handleTransactionAuthorization = () => {
        this.setState({
            auth_screen_visible: true,
            pin_error: ''
        });
    }

    cancelTransactionAuthorization = () => {
        this.setState({
            auth_screen_visible: false
        });
    }

    handleSubmit = (pin) => {
        if (!this.props.user.user_data.emailVerificationStatus) {
            this.props.showToast(Dictionary.EMAIL_NOT_VERIFIED)
            this.props.navigation.navigate('EnterEmail');

            return
        }
        if (!this.props.user.user_data.photoUrl) {
            this.props.showToast(Dictionary.NO_PHOTO_URL)
            this.props.navigation.navigate('OnboardSelfie');
            return
        }
        this.setState({
            processing: true
        }, () => {
            let { amount, phone_number } = this.state;
            let payload = {
               phoneNumber: phone_number,
                customerID:phone_number,
                amount: amount,
                accountID: this.props.user.user_data.nuban,
                billType: "airtime",
                pin
            };
            Network.validatePIN(pin)
            .then(() => {

            // let payload = {
            //     phone_number:"08118752191",
            //     customer_id:"08118752191",
            //     transaction_amount: amount,
            //     account_id: "0000000222",
            //     bill_type: "airtime",
            //     pin
            // };
            Network.buyAirtime(payload).then((result) => {
                this.setState({
                    processing: false,
                    auth_screen_visible: false
                }, () => {
                    let success_message = Dictionary.AIRTIME_PURCHASED;
                    success_message = success_message.replace("%s", phone_number).replace("%s", Util.formatAmount(amount));

                    this.props.navigation.navigate('Success', {
                        event_name: 'transactions_successful_airtime',
                        event_data: { transaction_id: result.data?.reference ||""},
                        success_message,
                        transaction_data: {
                            ...payload,
                            ...result.data,
                            transaction_date: result.data?.transaction_date || moment().format('yyyy-MM-dd HH:mm:ss')
                        }
                    });
                   
                    this.props.addNotification({
                        id: randomId(),
                        is_read: false,
                        title: "Airtime recharge",
                        description: `You have successfully recharged ${phone_number} with NGN${amount}.`,
                        timestamp: moment().toString(),
                    });
                });
            }).catch((error) => {
                if (error.message &&error.message.toLowerCase().includes('pin')) {
                    this.setState({
                        processing: false,
                        pin_error: error.message||"Pin is invalid"
                    });
                } else {
                    this.setState({
                        processing: false,
                        auth_screen_visible: false
                    }, () => {
                        this.props.navigation.navigate('Error', {
                            event_name: 'transactions_failed_airtime',
                            error_message: error.message||"Could not perform transaction at this time."
                        });
                    });
                }
            });
        })
        .catch((error) => {
            this.setState({
                processing: false,
                pin_error: error.message
            });
        });
        });
    }

    render() {
        const { amount, phone_number } = this.state;

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.AIRTIME_HEADER} />
                <ScrollView {...this.props} hasButtomButtons={true}>
                    <SubHeader text={Dictionary.PAYMENT_SUMMARY} />
                    <ProgressBar progress={1.0} />
                    <View style={[FormStyle.formContainer, SharedStyle.section]}>
                        <View style={SharedStyle.row}>
                            <View style={SharedStyle.halfColumn}>
                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.MOBILE_NUMBER_LABEL}</Text>
                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{phone_number}</Text>
                            </View>
                            <View style={SharedStyle.halfColumn}>
                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.AMOUNT}</Text>
                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>₦{Util.formatAmount(amount)}</Text>
                            </View>
                        </View>
                        {/* <View style={SharedStyle.row}>
                            <View style={SharedStyle.halfColumn}>
                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.TRANSACTION_FEE}</Text>
                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>₦{Util.formatAmount(0)}</Text>
                            </View>
                            <View style={SharedStyle.halfColumn}>
                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.TOTAL_AMOUNT_DUE}</Text>
                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>₦{Util.formatAmount(amount)}</Text>
                            </View>
                        </View> */}
                        <TouchItem
                            style={SharedStyle.sectionButton}
                            onPress={() => this.props.navigation.navigate('Airtime')}>
                            <Icon.Feather
                                size={Mixins.scaleSize(18)}
                                style={SharedStyle.sectionButtonIcon}
                                name="edit" />
                            <Text style={SharedStyle.sectionButtonText}>{Dictionary.EDIT_BTN}</Text>
                        </TouchItem>
                    </View>
                    <View style={SharedStyle.bottomPanel}>
                        <View style={FormStyle.formButton}>
                            <PrimaryButton
                                title={Dictionary.CONTINUE_BTN}
                                icon="arrow-right"
                                onPress={this.handleTransactionAuthorization} />
                        </View>
                    </View>
                    {this.state.auth_screen_visible && (
                        <AuthorizeTransaction
                            title={Dictionary.BUY_AIRTIME}
                            isVisible={this.state.auth_screen_visible}
                            isProcessing={this.state.processing}
                            pinError={this.state.pin_error}
                            resetError={() => this.setState({ pin_error: '' })}
                            onSubmit={this.handleSubmit}
                            onCancel={this.cancelTransactionAuthorization}
                        />
                    )}
                </ScrollView>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user,
        wallet: state.wallet,
        airtime: state.airtime
    };
};

const mapDispatchToProps = {
    addNotification,
    showToast
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(AirtimeSummary));