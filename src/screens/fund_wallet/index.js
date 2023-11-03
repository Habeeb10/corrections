import React, { Component } from 'react';
import { BackHandler, StyleSheet, Text, View, Image } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import * as Icon from '@expo/vector-icons';
import Clipboard from '@react-native-community/clipboard';

import { showToast } from '_actions/toast_actions';
import { getTransactionFeeTypes } from '_actions/transaction_actions';

import { Dictionary, Util } from '_utils';
import { Colors, Mixins, Typography, SharedStyle } from '_styles';
import { SubHeader, TouchItem } from '_atoms';
import { default as ScrollView } from '_atoms/scroll_view';
import { AmountModal } from '_molecules';
import { MainHeader } from '_organisms';

import { Network } from '_services';

class FundWallet extends Component {
    state = {
        fund_method: null,
        fund_options: [
            {
                title: Dictionary.FUND_WITH_CARD,
                value: 'card',
                image: require('../../assets/images/shared/pay_with_card.png'),
                is_available: true
            },
            // {
            //     title: Dictionary.FUND_WITH_USSD,
            //     value: 'ussd',
            //     image: require('../../assets/images/shared/pay_with_ussd.png'),
            //     is_available: false
            // },
            /* {
                title: Dictionary.FUND_WITH_CREDITVILLE_BANK,
                value: 'bank',
                image: require('../../assets/images/shared/creditville.png'),
                is_available: true
            }, */
            // {
            //     title: Dictionary.FUND_WITH_AGENT,
            //     value: 'agent',
            //     image: require('../../assets/images/shared/pay_with_agent.png'),
            //     is_available: false
            // }
        ],
        amount: '',
        amount_error: '',
        is_amount_modal_visible: false,
        processing: false,
        processing_error: '',
        commaValues: ""
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

        // if (this.props.transactions.fee_types.length === 0) {
        //     this.props.getTransactionFeeTypes();
        // }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            if (!this.state.processing && this.state.is_amount_modal_visible) {
                this.hideAmountModal();
            } else {
                !this.state.processing && this.props.navigation.navigate('Dashboard');
            }

            return true;
        }
    }

    onSelectFundOption = (fund_method) => {
        this.setState({ fund_method }, () => {
            switch (fund_method.value) {
                case 'card':
                case 'ussd':
                    this.setState({
                        amount: '',
                        amount_error: '',
                        processing_error: '',
                        is_amount_modal_visible: true
                    });
                    break;
                case 'bank':
                    this.props.navigation.navigate('FundWalletBank');
                    break;
                default:
                    break;
            }
        });
    }

    hideAmountModal = () => {
        this.setState({ is_amount_modal_visible: false });
    }

    toActualFunding = () => {
        let { amount } = this.state;
        if (!Util.isValidAmount(amount)) {
            this.setState({
                amount_error: Dictionary.ENTER_VALID_AMOUNT
            });

            return;
        }

        if (this.state.fund_method.value === 'ussd') {
            if (+amount < 100) {
                this.setState({
                    amount_error: Dictionary.USSD_MINIMUM_VIOLATION
                });

                return;
            }

            this.hideAmountModal();

            this.props.navigation.navigate('USSDPayment', {
                page_header: Dictionary.FUND_WALLET_HEADER,
                amount,
                transaction_type: 'wallet',
                success_message: `Your wallet has been credited with ₦${Util.formatAmount(amount)}`
            });
        } else if (this.state.fund_method.value === 'card') {

            // let fee_types = this.props.transactions.fee_types.filter(f => f.slug === 'card_payment');
            // if (fee_types.length === 0) {
            //     this.props.showToast(Dictionary.GENERAL_ERROR);
            // // } else {
            //     let type_id = fee_types[0].id;
                // this.setState({ processing: true }, () => {
                //     Network.getTransactionFee({ amount, type_id })
                //         .then((result) => {
                //             this.setState({ processing: false }, () => {
                                let payment_data = {
                                    amount,
                                    fees:0
                                };

                                this.hideAmountModal();
                                this.props.navigation.navigate('PaymentMethods', {
                                    redirect: 'FundWalletCard',
                                    payment_data,
                                    enable_wallet: false,
                                    enable_accounts: false
                                });
                        //     });
                        // }).catch((error) => {
                        //     this.setState({ processing: false }, () => {
                        //         this.hideAmountModal();
                        //         this.props.showToast(error.message)
                        //     });
                        // });
               // });
           // }
        }

        Util.logEventData('wallet_top_up', { amount });
    }

    handleOnchangeText = (text) => {
        // remove any commas from the current value
        const currentValue = text.replace(/,/g, '');
        
        const removeDecimals = currentValue.replace(/\D/g, '');

        // add commas every three digits
        const formattedValue = removeDecimals.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
        // const formatDecimal = _d.length < 2 ? formattedValue : `${text}`

        this.setState({
            amount: text.replace(/\D/g, ''),
            amount_error: '',
            commaValues: formattedValue
        })
    }

    render() {
       // let virtual_account = this.props.wallet.wallet_data.virtual_accounts[0]||{};
        let { fund_options } = this.state;

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.FUND_WALLET_HEADER} />
                <ScrollView {...this.props}>
                    <SubHeader text={Dictionary.FUND_WALLET_SUB_HEADER} />
                    {/* {virtual_account && ( */}
                        <View style={styles.virtualAccount}>
                            <Text style={[SharedStyle.normalText, styles.virtualAccountHeader]}>
                                {Dictionary.TRANSFER_TO_VIRTUAL_ACCOUNT}
                            </Text>
                            <Text style={[SharedStyle.normalText, styles.virtualAccountText]}>
                                {Dictionary.TOUCHGOLD_BANK}
                            </Text>
                            <View style={{ flexDirection: 'row' }}>
                                <TouchItem
                                    style={styles.copyButton}
                                    onPress={() => {
                                        Clipboard.setString(this.props.user.user_data?.nuban);
                                        this.props.showToast(Dictionary.ACCOUNT_COPIED, false);
                                    }}>
                                    <Text style={[SharedStyle.normalText, styles.virtualAccountText]}>
                                        {this.props.user.user_data?.nuban}
                                    </Text>
                                    <Icon.MaterialCommunityIcons
                                        size={Mixins.scaleSize(15)}
                                        style={styles.copyIcon}
                                        name="content-copy" />
                                </TouchItem>
                            </View>
                            <Text style={[SharedStyle.normalText, styles.virtualAccountText]}>
                                {this.props.user.user_data.firstName+" "+this.props.user.user_data.lastName}
                            </Text>
                        </View>
                    {/* )} */}
                    <View style={styles.fundOptions}>
                        {fund_options.map((option, index) => {
                            return <TouchItem
                                key={index}
                                onPress={() => this.onSelectFundOption(option)}
                                disabled={!option.is_available}
                                style={[styles.fundOption, index === fund_options.length - 1 ? { borderBottomWidth: Mixins.scaleSize(0) } : {}]}>
                                <Image
                                    style={styles.optionIcon}
                                    source={option.image} />
                                <Text
                                    numberOfLines={1}
                                    style={[SharedStyle.normalText, styles.optionText]}>
                                    {option.title} {!option.is_available && (
                                        <Text
                                            style={[SharedStyle.normalText, styles.unavailable]}>
                                            {Dictionary.COMING_SOON}
                                        </Text>
                                    )}
                                </Text>
                            </TouchItem>
                        })}
                    </View>
                </ScrollView>
                {this.state.is_amount_modal_visible && (
                    <AmountModal
                        title={Dictionary.FUND_AMOUNT_HEADER}
                        isVisible={this.state.is_amount_modal_visible}
                        onSwipeComplete={this.handleBackButton}
                        onBackButtonPress={this.handleBackButton}
                        amount={this.state.commaValues}
                        // onChangeAmount={(amount) => this.setState({ amount, amount_error: '' })}
                        onChangeAmount={this.handleOnchangeText}
                        processing={this.state.processing}
                        onContinue={this.toActualFunding}
                        amountError={this.state.amount_error}
                        processingError={this.state.processing_error}
                    />
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    virtualAccount: {
        ...Mixins.padding(32, 16, 32, 16),
        elevation: 1.5,
        borderColor: Colors.FAINT_BORDER,
        backgroundColor: Colors.WHITE,
    },
    virtualAccountHeader: {
        ...Typography.FONT_BOLD,
        color: Colors.DARK_GREY,
        marginBottom: Mixins.scaleSize(20)
    },
    virtualAccountText: {
        color: Colors.LIGHT_GREY,
        marginBottom: Mixins.scaleSize(10)
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    copyIcon: {
        ...Mixins.margin(0, 0, 10, 5),
        color: Colors.CV_YELLOW,
    },
    fundOptions: {
        marginTop: Mixins.scaleSize(32),
        paddingHorizontal: Mixins.scaleSize(16)
    },
    fundOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Mixins.scaleSize(12),
        borderBottomColor: Colors.FAINT_BORDER,
        borderBottomWidth: Mixins.scaleSize(1)
    },
    optionIcon: {
        width: Mixins.scaleSize(32),
        height: Mixins.scaleSize(32),
        marginRight: Mixins.scaleSize(16)
    },
    optionText: {
        color: Colors.DARK_GREY
    },
    unavailable: {
        fontSize: Mixins.scaleFont(12),
        color: Colors.LIGHT_GREY
    },
    modalBottom: {
        borderTopWidth: Mixins.scaleSize(0),
        marginBottom: Mixins.scaleSize(16)
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        wallet: state.wallet,
        transactions: state.transactions
    };
};

const mapDispatchToProps = {
    showToast,
    getTransactionFeeTypes
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(FundWallet));