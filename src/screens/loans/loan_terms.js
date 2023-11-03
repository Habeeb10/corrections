import React, { Component } from 'react';
import { BackHandler, StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { withNavigationFocus } from "react-navigation";

import { updateLoanApplicationData } from '_actions/user_actions';

import { Dictionary } from '_utils';
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from '_styles';
import { ScrollView, ProgressBar } from '_atoms';
import { PrimaryButton } from '_molecules';
import { MainHeader } from '_organisms';

class LoanTerms extends Component {
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

    handleSubmit = () => {
        const { preferred_loan_product } = this.props.user.loan_application;

        let redirect = 'LoanGuarantor';

        if (!preferred_loan_product.require_guarantor) {
            redirect = 'LoanApplicationSummary';
            this.props.updateLoanApplicationData({ guarantor: null });
        }

        this.props.navigation.navigate('PaymentMethods', { redirect, progress: 0.95, enable_wallet: false, enable_accounts: false });
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.TERMS_OF_USE_HEADER} />
                <ProgressBar progress={0.9} />
                <ScrollView {...this.props}>
                    <View style={FormStyle.formContainer}>
                        <Text style={[styles.sectionHeader, SharedStyle.normalText, styles.label]}>
                            {Dictionary.ON_EARLY_REPAYMENT}
                        </Text>
                        <View style={SharedStyle.section}>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.fullColumn}>
                                    <Text
                                        numberOfLines={1}
                                        style={[styles.sectionHeader, SharedStyle.normalText, styles.label]}>
                                        {Dictionary.EARLY_PAYMENTS}
                                    </Text>
                                    <Text style={[SharedStyle.normalText, styles.value]}>{Dictionary.GET_HIGHER_LOANS}</Text>
                                </View>
                            </View>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.fullColumn}>
                                    <Text
                                        numberOfLines={1}
                                        style={[styles.sectionHeader, SharedStyle.normalText, styles.label]}>
                                        {Dictionary.DISCOUNTS}
                                    </Text>
                                    <Text style={[SharedStyle.normalText, styles.value]}>{Dictionary.GET_DISCOUNTS}</Text>
                                </View>
                            </View>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.fullColumn}>
                                    <Text
                                        numberOfLines={1}
                                        style={[styles.sectionHeader, SharedStyle.normalText, styles.label]}>
                                        {Dictionary.INSTALLMENTS}
                                    </Text>
                                    <Text style={[SharedStyle.normalText, styles.value]}>{Dictionary.SPREAD_INSTALLMENTS}</Text>
                                </View>
                            </View>
                        </View>
                        <Text style={[styles.sectionHeader, SharedStyle.normalText, styles.label, { marginTop: Mixins.scaleSize(30) }]}>
                            {Dictionary.ON_LATE_REPAYMENT}
                        </Text>
                        <View style={SharedStyle.section}>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.fullColumn}>
                                    <Text>
                                        <Text style={[SharedStyle.normalText, styles.label]}>{Dictionary.AUTOMATIC_DEBITS}</Text>&nbsp;
                                    <Text style={[SharedStyle.normalText, styles.value]}>{Dictionary.ON_YOUR_ACCOUNT}</Text>
                                    </Text>
                                </View>
                            </View>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.fullColumn}>
                                    <Text>
                                        <Text style={[SharedStyle.normalText, styles.label]}>{Dictionary.LATE_FEES}</Text>&nbsp;
                                    <Text style={[SharedStyle.normalText, styles.value]}>{Dictionary.LATE_FEES_DESCRIPTION}</Text>
                                    </Text>
                                </View>
                            </View>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.fullColumn}>
                                    <Text
                                        numberOfLines={1}
                                        style={[styles.sectionHeader, SharedStyle.normalText, styles.label]}>
                                        {Dictionary.CREDIT_BUREAUS}
                                    </Text>
                                    <Text style={[SharedStyle.normalText, styles.value]}>{Dictionary.REPORTED_TO_CREDIT_BUREAUS}</Text>
                                </View>
                            </View>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.fullColumn}>
                                    <Text
                                        numberOfLines={1}
                                        style={[styles.sectionHeader, SharedStyle.normalText, styles.label]}>
                                        {Dictionary.EMPLOYMENT_HISTORY_SERVICE}
                                    </Text>
                                    <Text>
                                        <Text style={[SharedStyle.normalText, styles.label]}>{Dictionary._VERIFY_ME}</Text>&nbsp;
                                    <Text style={[SharedStyle.normalText, styles.value]}>{Dictionary.REPORTED_TO_VERIFY_ME}</Text>
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={[FormStyle.formButton, styles.formButton]}>
                        <View style={styles.terms}>
                            <Text style={styles.termsText} numberOfLines={2}>
                                {Dictionary.CREDITVILLE_TERMS}
                            </Text>
                        </View>
                        <PrimaryButton
                            title={Dictionary.ACCEPT_BTN}
                            icon="arrow-right"
                            onPress={this.handleSubmit} />
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    sectionHeader: {
        marginBottom: Mixins.scaleSize(10)
    },
    label: {
        ...Typography.FONT_BOLD,
        color: Colors.DARK_GREY
    },
    value: {
        color: Colors.LIGHT_GREY
    },
    formButton: {
        ...Mixins.padding(30, 8, 12, 8)
    },
    terms: {
        marginBottom: Mixins.scaleSize(20)
    },
    termsText: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(12),
        lineHeight: Mixins.scaleSize(14),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.LIGHT_GREY
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        loans: state.loans
    };
};

const mapDispatchToProps = {
    updateLoanApplicationData
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(LoanTerms));