import React, { Component } from 'react';
import { BackHandler, View, Text } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { Dictionary, Util } from '_utils';
import { Typography, SharedStyle, FormStyle } from '_styles';
import { SubHeader, ScrollView } from '_atoms';
import { PrimaryButton } from '_molecules';
import { MainHeader, AuthorizeTransaction } from '_organisms';

import { Network } from '_services';

class FundWalletCard extends Component {
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

    verifyPayment = (reference)=>{
        Network.verifyPAymentByReference(reference).then((result) => {

            this.setState({
                processing: false,
                auth_screen_visible: false
            }, () => {
                this.props.navigation.navigate('Success', {
                    event_name: 'wallet_top_up_with_card',
                    event_data: { transaction_id: result.data?.reference, amount: result.data?.amount },
                    success_message: result.message,
                    transaction_data: result.data
                });
            });
        })
        .catch((error)=>{
            this.setState({
                processing: false,
                auth_screen_visible: false
            }, () => {
                this.props.navigation.navigate('Error', { error_message: error.message });
            });
        })
        
    }

    handleSubmit = (pin) => {
        this.setState({
            processing: true
        }, () => {
            Network.validatePIN(pin)
            .then(() => {
            let { payment_data, payment_method } = this.state;
            let payload = {
                amount: payment_data.amount,
                cardId: payment_method.id,
                pin,
                accountId:this.props.user.wallet_id
            };


            Network.fundUserWallet(payload).then((result) => {

                //use reference to call verify payment
                Network.verifyPAymentByReference(result.transactionResponse.data.reference).then((result) => {

                    this.setState({
                        processing: false,
                        auth_screen_visible: false
                    }, () => {
                        this.props.navigation.navigate('Success', {
                            event_name: 'wallet_top_up_with_card',
                            event_data: { transaction_id: result.data?.reference, amount: result.data?.amount },
                            success_message: result.resp.message,
                            transaction_data: result.data
                        });
                    });
                })
                .catch((error)=>{
                    this.setState({
                        processing: false,
                        auth_screen_visible: false
                    }, () => {
                        this.props.navigation.navigate('Error', { error_message: error.message });
                    });
                })
               
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
        })
        .catch((error) => {
            this.setState({
                processing: false,
                pin_error: error.message||"Pin Invalid"
            });
        });
        });
    }

    render() {
        let { payment_data, payment_method } = this.state;
        let amount_due = Number(payment_data.fees) + Number(payment_data.amount);
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.FUND_WALLET_HEADER} />
                <ScrollView {...this.props} hasButtomButtons={true}>
                    <SubHeader text={Dictionary.PAYMENT_SUMMARY} />
                    <View style={FormStyle.formContainer}>
                        <View style={SharedStyle.section}>
                            <View style={SharedStyle.row}>
                                {/* <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.AMOUNT}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>₦{Util.formatAmount(payment_data.amount)}</Text>
                                </View> */}
                                {/* <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.TRANSACTION_FEE}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>₦{Util.formatAmount(payment_data.fees.amount)}</Text>
                                </View> */}
                            </View>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.TOTAL_AMOUNT_DUE}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>₦{Util.formatAmount(amount_due)}</Text>
                                </View>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.PAYMENT_METHOD}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right, { ...Typography.FONT_MEDIUM }]}>
                                        {`${payment_method.cardType} * * * * ${payment_method.lastFourDigit}`}
                                    </Text>
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
                        title={Dictionary.FUND_WALLET_HEADER}
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

export default connect(mapStateToProps)(withNavigationFocus(FundWalletCard));