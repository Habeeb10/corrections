import React, { Component } from 'react';
import { BackHandler, View, Text } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import moment from 'moment';

import { getUserSavings } from '_actions/savings_actions';

import { Dictionary, Util } from '_utils';
import { Typography, SharedStyle, FormStyle } from '_styles';
import { SubHeader, ScrollView } from '_atoms';
import { PrimaryButton } from '_molecules';
import { MainHeader, AuthorizeTransaction } from '_organisms';

import { Network } from '_services';
import { addNotification } from '_actions/notification_actions';
import { randomId } from '../../utils/util';

class SavingsTopUpSummary extends Component {
    constructor(props) {
        super(props);

        const navigation = this.props.navigation;
        const payment_method = navigation.getParam('payment_method');
        const payment_data = navigation.getParam('payment_data');

        this.state = {
            savings: payment_data.savings,
            amount: payment_data.amount,
            fees: payment_data.fees,
            payment_method,
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
        this.setState({
            processing: true
        }, () => {
            Network.validatePIN(pin)
                .then(() => {
                    let { savings, amount, payment_method } = this.state;
                    let payload = {
                        amount,
                        toAccountId:savings.id,
                        notes:`Savings topup on ${savings.name}`
                    };

                    if (payment_method.payment_method_type === 'card') {
                        payload.cardId = payment_method.id;
                        payload.accountId=this.props.user.wallet_id;
                        payload.savingsId=savings.id;

                    } else if (payment_method.payment_method_type === 'wallet') {
                        payload.fromAccountId = payment_method.account_number;
                    } else {
                        payload.account_id = payment_method.id;
                    }


                    let callApi= payment_method.payment_method_type === 'card' ?Network.fundSavingsWithCard:Network.topUpSavingsPlan;


                    callApi( payload).then((res) => {
                        this.setState({
                            processing: false,
                            auth_screen_visible: false
                        }, () => {
                            this.props.getUserSavings();
                            this.props.navigation.navigate('Success', {
                                event_name: 'investment_successful_top_up',
                                event_data: {
                                    savings_id: savings.id,
                                    amount
                                },
                                success_message: Dictionary.SAVINGS_TOPPED_UP + Util.formatAmount(amount)
                            });

                            this.props.addNotification({
                                id: randomId(),
                                is_read: false,
                                title: "Savings top up",
                                description: `Good Job! you have successfully saved ${amount} in your ${savings.name}`,
                                timestamp: moment().toString(),
                            });
                        });
                    }).catch((error) => {
                        this.setState({
                            processing: false,
                            auth_screen_visible: false
                        }, () => {
                            this.props.navigation.navigate('Error', {
                                event_name: 'investment_failed_top_up',
                                event_data: {
                                    savings_id: savings.id,
                                    amount
                                },
                                error_message: error.message||"Something went wrong! "
                            });
                        });
                    });
                }).catch((error) => {
                    this.setState({
                        processing: false,
                        pin_error: error.message||"Invalid Pin"
                    });
                });
        });
    }

    render() {
        let { savings, amount, fees, payment_method } = this.state;
        let fee_amount = payment_method.payment_method_type === 'card' ? Number(fees.amount) : 0;
        let amount_due = Number(amount) + fee_amount;

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.PAYMENT_SUMMARY} />
                <ScrollView {...this.props} hasButtomButtons={true}>
                    <SubHeader text={Dictionary.SAVINGS_TOP_UP_SUMMARY} />
                    <View style={FormStyle.formContainer}>
                        <View style={SharedStyle.section}>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.PLAN_NAME}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{savings.name}</Text>
                                </View>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.AMOUNT}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>₦{Util.formatAmount(amount)}</Text>
                                </View>
                            </View>
                            {/* <View style={SharedStyle.row}>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.TRANSACTION_FEE}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>₦{Util.formatAmount(fee_amount)}</Text>
                                </View>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.TOTAL_AMOUNT_DUE}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>₦{Util.formatAmount(amount_due)}</Text>
                                </View>
                            </View> */}
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.fullColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.PAYMENT_METHOD}</Text>
                                    {payment_method.payment_method_type === 'card' && (
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, { ...Typography.FONT_MEDIUM }]}>
                                            {`${payment_method.cardType} * * * * ${payment_method.lastFourDigit}`}
                                        </Text>
                                    )}
                                    {(payment_method.payment_method_type === 'account' || payment_method.payment_method_type === 'wallet') && (
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, { ...Typography.FONT_MEDIUM }]}>
                                            {`${payment_method.code_description} * * * * ${payment_method.account_number.slice(-4)}`}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={SharedStyle.bottomPanel}>
                        <View style={FormStyle.formButton}>
                            <PrimaryButton
                                title={Dictionary.CONTINUE_BTN}
                                icon="arrow-right"
                                onPress={() => this.handleTransactionAuthorization()} />
                        </View>
                    </View>
                </ScrollView>
                {this.state.auth_screen_visible && (
                    <AuthorizeTransaction
                        title={Dictionary.SAVINGS_TOP_UP}
                        isVisible={this.state.auth_screen_visible}
                        isProcessing={this.state.processing}
                        pinError={this.state.pin_error}
                        resetError={() => this.setState({ pin_error: '' })}
                        onSubmit={this.handleSubmit}
                        onCancel={this.cancelTransactionAuthorization}
                    />
                )}
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user,
        wallet: state.wallet,
        savings: state.savings,
        loans: state.loans
    };
};

const mapDispatchToProps = {
    getUserSavings,
    addNotification
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(SavingsTopUpSummary));