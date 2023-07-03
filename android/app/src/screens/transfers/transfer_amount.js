import React, { Component } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { updateFundsTransfer,updateAccountType, getCustomerBeneficiaries } from '_actions/transfer_actions';

import { Dictionary, Util } from '_utils';
import { Mixins, SharedStyle, FormStyle } from '_styles';
import { SubHeader, FloatingLabelInput, ProgressBar } from '_atoms';
import { default as ScrollView } from '_atoms/scroll_view';
import { PrimaryButton } from '_molecules';
import { MainHeader } from '_organisms';
 import AccountTypeButton from '_screens/transfers/account_type_button';
import { account_type_data } from '../../../src/data';

class TransferAmount extends Component {
    state = {
        amount: '',
        amount_error: '',
        isIntra: true
    }

    componentDidMount() {
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

    validate = () => {
        let is_valid = true;
        let amount = this.state.amount;

        if (!Util.isValidAmount(amount)) {
            this.setState({
                amount_error: Dictionary.ENTER_VALID_AMOUNT
            });

            is_valid = false;
        }

        if (+amount > Number(this.props.wallet.wallet_data.account_balance)) {
            this.setState({
                amount_error: Dictionary.CANNOT_EXECEED_BALANCE
            });

            is_valid = false;
        }

        return is_valid;
    }

    handleSubmit = () => {
        if (!this.validate()) {
            return;
        }

        let { amount } = this.state;

        this.props.getCustomerBeneficiaries(this.props.user.user_data.bvn, this.state.isIntra)
        this.props.updateFundsTransfer({ amount });

        this.props.navigation.navigate('TransferBeneficiary');
        Util.logEventData('transactions_start_transfer', { amount });
    }

    onChangeAccountType(account_type){
        let isIntra = account_type === 'TOUCH_GOLD' ? true : false
        this.props.updateAccountType({ account_type });
        this.setState({ isIntra })
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.TRANSFERS} />
                <ScrollView {...this.props} hasButtomButtons={true}>
                    <SubHeader text={Dictionary.TRANSFER_AMOUNT_SUB_HEADER} />
                    <ProgressBar progress={0.2} />
                    <View style={styles.accountypeContainerStyle}>
                        <AccountTypeButton isActive={this.props.transfers.account_type===account_type_data.ACCOUNT_TYPE.TOUCH_GOLD} onPress={()=>{this.onChangeAccountType(account_type_data.ACCOUNT_TYPE.TOUCH_GOLD)}} title={Dictionary.TOUCHGOLD_BANK} />
                        <AccountTypeButton isActive={this.props.transfers.account_type===account_type_data.ACCOUNT_TYPE.OTHERS} onPress={()=>{this.onChangeAccountType(account_type_data.ACCOUNT_TYPE.OTHERS)}} title={Dictionary.OTHER_BANK}/>
                    </View>
                    <View style={FormStyle.formContainer}>
                        <View style={FormStyle.formItem}>
                            <FloatingLabelInput
                                label={Dictionary.AMOUNT_LABEL}
                                value={this.state.amount}
                                keyboardType={'number-pad'}
                                multiline={false}
                                autoCorrect={false}
                                onChangeText={text => this.setState({
                                    amount: text.replace(/\D/g, ''),
                                    amount_error: ''
                                })}
                            />
                            <Text style={FormStyle.formError}>{this.state.amount_error}</Text>
                            <Text style={SharedStyle.balanceLabel}>
                                {Dictionary.BALANCE} <Text style={SharedStyle.balanceValue}>
                                    ₦{Util.formatAmount(Number(this.props.wallet.wallet_balance))}
                                </Text>
                            </Text>
                        </View>
                    </View>
                    <View style={SharedStyle.bottomPanel}>
                        <View style={FormStyle.formButton}>
                            <PrimaryButton
                                title={Dictionary.CONTINUE_BTN}
                                icon="arrow-right"
                                onPress={this.handleSubmit} />
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    formButton: {
        marginHorizontal: Mixins.scaleSize(0),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    accountypeContainerStyle:{
        flexDirection:"row",
        justifyContent:"space-between",
        padding:20
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        wallet: state.wallet,
        transfers:state.transfers
    };
};

const mapDispatchToProps = {
    updateFundsTransfer,
    updateAccountType,
    getCustomerBeneficiaries
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(TransferAmount));