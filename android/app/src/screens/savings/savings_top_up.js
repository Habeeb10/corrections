import React, { Component } from 'react';
import { BackHandler, Text, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { showToast } from '_actions/toast_actions';
import { getTransactionFeeTypes } from '_actions/transaction_actions';

import { Dictionary, Util } from '_utils';
import { SharedStyle, FormStyle } from '_styles';
import { SubHeader, FloatingLabelInput } from '_atoms';
import { default as ScrollView } from '_atoms/scroll_view';
import { PrimaryButton } from '_molecules';
import { MainHeader } from '_organisms';

import { Network } from '_services';

class SavingsTopUp extends Component {
    constructor(props) {
        super(props);

        const savings = this.props.navigation.getParam('savings');

        this.state = {
            savings,
            amount: '',
            amount_error: '',
            processing: false
        };
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
            !this.state.processing && this.props.navigation.goBack();

            return true;
        }
    }

    validate = () => {
        let is_valid = true;

        if (!Util.isValidAmount(this.state.amount)) {
            this.setState({
                amount_error: Dictionary.ENTER_VALID_AMOUNT
            });

            is_valid = false;
        }

        return is_valid;
    }

    handleSubmit = () => {
        if (!this.validate()) {
            return;
        }

        let { savings, amount } = this.state;
        // let fee_types = this.props.transactions.fee_types.filter(f => f.slug === 'card_payment');
        // if (fee_types.length === 0) {
        //     this.props.showToast(Dictionary.GENERAL_ERROR);
        // } else {
            // let type_id = fee_types[0].id;
            // this.setState({ processing: true }, () => {
            //     Network.getTransactionFee({ amount, type_id })
            //         .then((result) => {
            //             this.setState({ processing: false }, () => {
                            let payment_data = {
                                savings,
                                amount,
                                fees: {amount:0}
                            };

                            this.props.navigation.navigate('PaymentMethods', { redirect: 'SavingsTopUpSummary', payment_data, enable_wallet:true, enable_accounts: false });
                       // });
                    // }).catch((error) => {
                    //     this.setState({ processing: false }, () => {
                    //         this.props.showToast(error.message)
                    //     });
                    // });
            //});
        
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.SAVINGS_TOP_UP} />
                <ScrollView {...this.props} hasButtomButtons={true}>
                    <SubHeader text={Dictionary.SAVINGS_TOP_UP_SUB_HEADER} />
                    <View style={FormStyle.formContainer}>
                        <View style={FormStyle.formItem}>
                            <FloatingLabelInput
                                label={Dictionary.AMOUNT_LABEL}
                                value={this.state.amount}
                                keyboardType={'number-pad'}
                                multiline={false}
                                autoCorrect={false}
                                onChangeText={text => this.setState({
                                    amount: text.replace(/\D/g,''),
                                    amount_error: ''
                                })}
                            />
                            <Text style={FormStyle.formError}>{this.state.amount_error}</Text>
                        </View>
                    </View>
                    <View style={SharedStyle.bottomPanel}>
                        <View style={FormStyle.formButton}>
                            <PrimaryButton
                                title={Dictionary.CONTINUE_BTN}
                                loading={this.state.processing}
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
        user: state.user,
        transactions: state.transactions
    };
};

const mapDispatchToProps = {
    showToast,
    getTransactionFeeTypes
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(SavingsTopUp));