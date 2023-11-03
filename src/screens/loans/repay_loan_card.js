import React, { Component } from 'react';
import { BackHandler, View, Text } from 'react-native';
import { withNavigationFocus } from "react-navigation";

import { Dictionary, Util } from '_utils';
import { Typography, SharedStyle, FormStyle } from '_styles';
import { SubHeader, ScrollView } from '_atoms';
import { PrimaryButton } from '_molecules';
import { MainHeader, AuthorizeTransaction } from '_organisms';

import { Network } from '_services';

class RepayLoanCard extends Component {
    constructor(props) {
        super(props);

        const navigation = this.props.navigation;
        const payment_method = navigation.getParam('payment_method');
        const payment_data = navigation.getParam('payment_data');

        this.state = {
            payment_data,
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
            let { payment_data, payment_method } = this.state;
            let payload = {
                amount: payment_data.amount,
                pin
            };

            if (payment_method.payment_method_type === 'card') {
                payload.card_id = payment_method.id;
            } else {
                payload.account_id = payment_method.account_number;
            }

            Network.repayUserLoan(payload).then(() => {
                this.setState({
                    processing: false,
                    auth_screen_visible: false
                }, () => {
                    this.props.navigation.navigate('Success', {
                        event_name: 'loan_pay_off',
                        event_data: {
                            amount: payment_data.amount,
                            loan_id: payment_data.loan_id
                        },
                        success_message: Dictionary.PAYMENT_SUCCESSFUL
                    });
                });
            }).catch((error) => {
                if (error.message.toLowerCase().includes('pin')) {
                    this.setState({
                        processing: false,
                        pin_error: error.message
                    });
                } else {
                    this.setState({
                        processing: false,
                        auth_screen_visible: false
                    }, () => {
                        this.props.navigation.navigate('Error', { error_message: error.message });
                    });
                }
            });
        });
    }

    render() {
        let { payment_data, payment_method } = this.state;
        let fee_amount = payment_method.payment_method_type === 'card' ? Number(payment_data.fees.amount) : 0;
        let amount_due = Number(payment_data.amount) + fee_amount;

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.LOANS} />
                <ScrollView {...this.props} hasButtomButtons={true}>
                    <SubHeader text={Dictionary.PAYMENT_SUMMARY} />
                    <View style={FormStyle.formContainer}>
                        <View style={SharedStyle.section}>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.AMOUNT}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>₦{Util.formatAmount(payment_data.amount)}</Text>
                                </View>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.TRANSACTION_FEE}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>₦{Util.formatAmount(fee_amount)}</Text>
                                </View>
                            </View>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.TOTAL_AMOUNT_DUE}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>₦{Util.formatAmount(amount_due)}</Text>
                                </View>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.PAYMENT_METHOD}</Text>
                                    {payment_method.payment_method_type === 'card' && (
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right, { ...Typography.FONT_MEDIUM }]}>
                                            {`${payment_method.card_type} * * * * ${payment_method.card_last4}`}
                                        </Text>
                                    )}
                                    {(payment_method.payment_method_type === 'account' || payment_method.payment_method_type === 'wallet') && (
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right, { ...Typography.FONT_MEDIUM }]}>
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
                        title={Dictionary.REPAY_LOAN}
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

export default withNavigationFocus(RepayLoanCard);