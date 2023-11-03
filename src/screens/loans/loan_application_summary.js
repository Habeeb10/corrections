import React, { Component } from 'react';
import { BackHandler, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { withNavigationFocus } from "react-navigation";

import { getUserLoans } from '_actions/loan_actions';

import { Dictionary, Util } from '_utils';
import { Typography, SharedStyle, FormStyle } from '_styles';
import { SubHeader, ScrollView, ProgressBar } from '_atoms';
import { PrimaryButton } from '_molecules';
import { MainHeader, AuthorizeTransaction } from '_organisms';

import { Network } from '_services';

class LoanApplicationSummary extends Component {
    constructor(props) {
        super(props);

        const payment_method = this.props.navigation.getParam('payment_method', {});
        const { preferred_loan_product, guarantor } = this.props.user.loan_application;

        this.state = {
            loan_product: preferred_loan_product,
            guarantor,
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
            let { loan_product, guarantor, payment_method } = this.state;
            let payload = {
                pin,
                token: loan_product.loan_token,
                card_id: payment_method.id
            };

            if (loan_product.require_guarantor && !!guarantor) {
                payload.guarantor_id = guarantor.id
            }
            Network.completeLoanApplication(payload).then(() => {
                this.setState({
                    processing: false,
                    auth_screen_visible: false
                }, () => {
                    this.props.getUserLoans();
                    this.props.navigation.navigate('Success', {
                        event_name: 'loan_successful',
                        event_data: {
                            amount: loan_product.loan_amount,
                            loan_id: loan_product.id
                        },
                        success_message: Dictionary.LOAN_APPLICATION_SUCCESS
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
                        this.props.navigation.navigate('Error', {
                            event_name: 'loan_declined',
                            event_data: {
                                loan_id: loan_product.id
                            },
                            error_message: error.message
                        });
                    });
                }
            });
        });
    }

    render() {
        let { loan_product, guarantor, payment_method } = this.state;

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.LOAN_APPLICATION} />
                <ScrollView {...this.props} hasButtomButtons={true}>
                    <SubHeader text={Dictionary.LOAN_SUMMARY} />
                    <ProgressBar progress={1.0} />
                    <View style={FormStyle.formContainer}>
                        <View style={SharedStyle.section}>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.LOAN_AMOUNT_LABEL}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{Util.formatAmount(loan_product.loan_amount)}</Text>
                                </View>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.DURATION}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>{loan_product.tenor} Days</Text>
                                </View>
                            </View>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.INTEREST_RATE}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{loan_product.interest_rate}%</Text>
                                </View>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.TO_REPAY}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>₦{Util.formatAmount(loan_product.amount_due)}</Text>
                                </View>
                            </View>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.fullColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.REPAYMENT_METHOD}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, { ...Typography.FONT_MEDIUM }]}>
                                        {`${payment_method.card_type.trim()} card * * * * ${payment_method.card_last4}`}
                                    </Text>
                                </View>
                            </View>
                            {loan_product.require_guarantor && !!guarantor && (
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.fullColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.GUARANTOR}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{guarantor.first_name} {guarantor.last_name}</Text>
                                    </View>
                                </View>
                            )}
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
                        title={Dictionary.LOAN_APPLICATION}
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
        loans: state.loans
    };
};

const mapDispatchToProps = {
    getUserLoans
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(LoanApplicationSummary));