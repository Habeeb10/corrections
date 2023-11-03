import React, { Component } from 'react';
import { BackHandler, Text, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { showToast } from '_actions/toast_actions';
import { getTransactionFeeTypes } from '_actions/transaction_actions';

import { Dictionary, Util } from '_utils';
import { FormStyle, SharedStyle } from '_styles';
import { SubHeader, FloatingLabelInput } from '_atoms';
import { default as ScrollView } from '_atoms/scroll_view';
import { PrimaryButton, PaymentOptions } from '_molecules';
import { MainHeader } from '_organisms';

import { Network } from '_services';

class RepayLoan extends Component {
    constructor(props) {
        super(props);

        const loan = this.props.navigation.getParam('loan');
        this.state = {
            loan,
            payment_method: {},
            amount: '',
            amount_error: '',
            is_options_modal_visible: false,
            processing: false,
            processing_error: ''
        }
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

        if (this.props.transactions.fee_types.length === 0) {
            this.props.getTransactionFeeTypes();
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            if (!this.state.processing && this.state.is_options_modal_visible) {
                this.hideOptionsModal();
            } else {
                !this.state.processing && this.props.navigation.goBack();
            }

            return true;
        }
    }

    hideOptionsModal = () => {
        this.setState({ is_options_modal_visible: false });
    }

    showPaymentOptions = () => {
        let { amount } = this.state;
        if (!Util.isValidAmount(amount)) {
            this.setState({
                amount_error: Dictionary.ENTER_VALID_AMOUNT
            });

            is_valid = false;
        }

        if (+amount > this.state.loan.schedule.amount_due) {
            this.setState({
                amount_error: Dictionary.CANNOT_EXECEED_REPAYMENT
            });

            return;
        }

        this.setState({
            payment_method: {},
            processing_error: '',
            is_options_modal_visible: true
        });
    }

    toActualPayment = () => {
        let { amount } = this.state;

        if (this.state.payment_method.value === 'ussd') {
            if (+amount < 100) {
                this.setState({
                    processing_error: Dictionary.USSD_MINIMUM_VIOLATION
                });

                return;
            }

            this.hideOptionsModal();

            this.props.navigation.navigate('USSDPayment', {
                page_header: Dictionary.LOANS,
                amount,
                transaction_type: 'loan',
                success_message: Dictionary.PAYMENT_SUCCESSFUL
            });
        } else if (this.state.payment_method.value === 'card') {
            let fee_types = this.props.transactions.fee_types.filter(f => f.slug === 'card_payment');
            if (fee_types.length === 0) {
                this.props.showToast(Dictionary.GENERAL_ERROR);
            } else {
                let type_id = fee_types[0].id;
                this.setState({ processing: true }, () => {
                    Network.getTransactionFee({ amount, type_id })
                        .then((result) => {
                            this.setState({ processing: false }, () => {
                                let payment_data = {
                                    loan_id: this.state.loan.id,
                                    amount,
                                    fees: result.data
                                };

                                this.hideOptionsModal();
                                this.props.navigation.navigate('PaymentMethods', { redirect: 'RepayLoanCard', payment_data, enable_accounts: false });
                            });
                        }).catch((error) => {
                            this.setState({ processing: false }, () => {
                                this.hideOptionsModal();
                                this.props.showToast(error.message)
                            });
                        });
                });
            }
        }
    }

    render() {
        let { loan } = this.state;

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.LOANS} />
                <ScrollView {...this.props}>
                    <SubHeader text={Dictionary.REPAY_LOAN_SUB_HEADER} />
                    <View style={FormStyle.formContainer}>
                        <View style={FormStyle.formItem}>
                            <FloatingLabelInput
                                label={Dictionary.AMOUNT_LABEL}
                                value={this.state.amount}
                                keyboardType={'decimal-pad'}
                                multiline={false}
                                autoCorrect={false}
                                onChangeText={text => this.setState({
                                    amount: text.replace(/[^0-9.]/g, ''),
                                    amount_error: ''
                                })} />
                            <Text style={FormStyle.formError}>{this.state.amount_error}</Text>
                            <Text style={SharedStyle.balanceLabel}>
                                {Dictionary.OUT_OF} <Text style={SharedStyle.balanceValue}>₦{Util.formatAmount(loan.schedule.amount_due)}</Text>
                            </Text>
                        </View>
                    </View>
                    <View style={SharedStyle.bottomPanel}>
                        <View style={FormStyle.formButton}>
                            <PrimaryButton
                                title={Dictionary.REPAY_LOAN_NOW_BTN}
                                icon="arrow-right"
                                onPress={this.showPaymentOptions} />
                        </View>
                    </View>
                </ScrollView>
                {this.state.is_options_modal_visible && (
                    <PaymentOptions
                        isVisible={this.state.is_options_modal_visible}
                        onSwipeComplete={this.handleBackButton}
                        onBackButtonPress={this.handleBackButton}
                        processing={this.state.processing}
                        errorMessage={this.state.processing_error}
                        onSelectPaymentMethod={payment_method => this.setState({
                            payment_method
                        })}
                        onContinue={this.toActualPayment}
                    />
                )}
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user,
        transactions: state.transactions
    };
};

const mapDispatchToProps = {
    showToast,
    getTransactionFeeTypes
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(RepayLoan));