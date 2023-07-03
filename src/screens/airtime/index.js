import React, { Component } from 'react';
import { BackHandler, Text, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { showToast } from '_actions/toast_actions';
import { updateAirtimePurchase } from '_actions/airtime_actions';

import { Dictionary, Util } from '_utils';
import { SharedStyle, FormStyle } from '_styles';
import { SubHeader, FloatingLabelInput, ProgressBar } from '_atoms';
import { default as ScrollView } from '_atoms/scroll_view';
import { PrimaryButton } from '_molecules';
import { MainHeader } from '_organisms';

class Airtime extends Component {
    state = {
        amount: '',
        amount_error: '',
        commaValues: ""
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
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

        if (this.props.wallet.wallet_data_error) {
            this.props.showToast(this.props.wallet.wallet_data_error);
            return;
        }

        let { amount } = this.state;

        this.props.updateAirtimePurchase({ amount });

        this.props.navigation.navigate('AirtimeBeneficiary');
        Util.logEventData('transactions_start_airtime', { amount });
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
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.AIRTIME_HEADER} />
                <ScrollView {...this.props} hasButtomButtons={true}>
                    <SubHeader text={Dictionary.AIRTIME_AMOUNT_SUB_HEADER} />
                    <ProgressBar progress={0.4} />
                    <View style={FormStyle.formContainer}>
                        <View style={FormStyle.formItem}>
                            <FloatingLabelInput
                                label={Dictionary.AMOUNT_LABEL}
                                value={this.state.commaValues}
                                keyboardType={'number-pad'}
                                multiline={false}
                                autoCorrect={false}
                                onChangeText={this.handleOnchangeText}
                                // onChangeText={text => this.setState({
                                //     amount: text.replace(/\D/g, ''),
                                //     amount_error: ''
                                // })}
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

const mapStateToProps = (state) => {
    return {
        wallet: state.wallet,
        user: state.user,
    };
};

const mapDispatchToProps = {
    showToast,
    updateAirtimePurchase
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Airtime));