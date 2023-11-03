import React, { Component } from 'react';
import { BackHandler, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import analytics from '@react-native-firebase/analytics';
import remoteConfig from '@react-native-firebase/remote-config';
import * as WebBrowser from 'expo-web-browser';
import moment from 'moment';

import { showToast } from '_actions/toast_actions';
import { updateLoanApplicationData } from '_actions/user_actions';

import { env, Dictionary, Util } from '_utils';
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from '_styles';
import { SubHeader, ProgressBar, ScrollView, TouchItem } from '_atoms';
import { PrimaryButton } from '_molecules';
import { MainHeader } from '_organisms';

import { Network } from '_services';

class LoanBreakdown extends Component {
    constructor(props) {
        super(props);

        const { preferred_loan_product } = this.props.user.loan_application;
        this.state = {
            preferred_loan_product,
            breakdown: null,
            loading: false
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        this.getLoanSchedules();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            !this.state.loading && this.props.navigation.goBack();

            return true;
        }
    }

    getLoanSchedules = () => {
        const { loan_token, fees } = this.state.preferred_loan_product;
        this.setState({ loading: true }, () => {
            Network.getLoanSchedules(loan_token).then((result) => {
                let breakdown = result.data;
                let regular_fees = breakdown.fees || fees || [];
                regular_fees = regular_fees.filter(function (fee) {
                    return fee.category.toLowerCase() === 'regular';
                });

                breakdown.origination_fee = regular_fees.reduce((sum, fee) => { return sum + fee.amount }, 0);

                this.setState({
                    breakdown,
                    loading: false
                });
            }).catch((error) => {
                this.setState({
                    loading: false
                }, () => {
                    this.handleBackButton();
                    this.props.showToast(error.message);
                });
            });
        });
    }

    openLoanTerms = async () => {
        let url = remoteConfig().getValue(`loan_terms_url_${env().target}`).asString();
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }
        Util.logEventData('open_link', { url });
        await WebBrowser.openBrowserAsync(url);
    }

    handleSubmit = () => {
        this.props.navigation.navigate('LoanTerms');
    }

    render() {
        const { preferred_loan_product: loan_product, breakdown } = this.state;

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.LOAN_ELIGIBILITY_HEADER} />
                <ScrollView {...this.props}>
                    <SubHeader text={Dictionary.LOAN_BREAKDOWN_SUB_HEADER} />
                    <ProgressBar progress={0.8} />
                    {this.state.loading && (
                        <View style={SharedStyle.loaderContainer}>
                            <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                        </View>
                    )}
                    <View style={[FormStyle.formContainer, styles.formContainer]}>
                        {breakdown && (
                            <View>
                                <View style={FormStyle.formItem}>
                                    <Text style={styles.repaymentSummary}>
                                        {Dictionary.TO_REPAY} <Text style={{ color: Colors.CV_YELLOW }}>₦{Util.formatAmount(loan_product.amount_due)}</Text> {Dictionary.IN} <Text>{loan_product.tenor} {loan_product.tenor_period}</Text>
                                    </Text>
                                </View>
                                <View style={styles.breakdown}>
                                    <View style={styles.breakdownHeader}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.REPAYMENT_BREAKDOWN}</Text>
                                    </View>
                                    <View style={SharedStyle.row}>
                                        <View style={SharedStyle.halfColumn}>
                                            <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.LOAN_AMOUNT}</Text>
                                            <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>₦{Util.formatAmount(loan_product.loan_amount)}</Text>
                                        </View>
                                        <View style={SharedStyle.halfColumn}>
                                            <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{`Interest (${breakdown.interest_rate}%)`}</Text>
                                            <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>₦{Util.formatAmount(loan_product.interest_due)}</Text>
                                        </View>
                                    </View>
                                    <View style={SharedStyle.row}>
                                        <View style={SharedStyle.halfColumn}>
                                            <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.ORIGINATION_FEE}</Text>
                                            <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>₦{Util.formatAmount(breakdown.origination_fee)}</Text>
                                        </View>
                                        <View style={SharedStyle.halfColumn}>
                                            <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.DISBURSED}</Text>
                                            <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>₦{Util.formatAmount(breakdown.total_principal)}</Text>
                                        </View>
                                    </View>
                                    <View style={SharedStyle.row}>
                                        <View style={SharedStyle.halfColumn}>
                                            <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.REPAYMENT}</Text>
                                            <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>₦{Util.formatAmount(loan_product.amount_due)}</Text>
                                        </View>
                                        <View style={SharedStyle.halfColumn}>
                                            <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.REPAYMENT_FREQUENCY}</Text>
                                            <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>{breakdown.frequency || '- - -'}</Text>
                                        </View>
                                    </View>
                                    <View style={SharedStyle.row}>
                                        <View style={SharedStyle.halfColumn}>
                                            <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.REPAYMENT_DATE}</Text>
                                            <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{moment(loan_product.due_date, 'yyyy-MM-DD').format('D MMM YYYY')}</Text>
                                        </View>
                                        <View style={SharedStyle.halfColumn}>
                                            <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.LOAN_DURATION}</Text>
                                            <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>{loan_product.tenor} {loan_product.tenor_period}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.breakdown}>
                                    <View style={styles.breakdownHeader}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.REPAYMENT_SCHEDULE}</Text>
                                    </View>
                                    <View style={SharedStyle.row}>
                                        <View style={SharedStyle.triColumn}>
                                            <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.DATE_LABEL}</Text>
                                        </View>
                                        <View style={SharedStyle.triColumn}>
                                            <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.AMOUNT_DUE}</Text>
                                        </View>
                                        <View style={SharedStyle.triColumn}>
                                            <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.BALANCE}</Text>
                                        </View>
                                    </View>
                                    {breakdown.schedules.map((schedule, index) => {
                                        return <View index={index} style={SharedStyle.row}>
                                            <View style={SharedStyle.triColumn}>
                                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{moment(schedule.due_date, 'yyyy-MM-DD').format('DD/MM/YYYY')}</Text>
                                            </View>
                                            <View style={SharedStyle.triColumn}>
                                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>₦{Util.formatAmount(schedule.amount_due)}</Text>
                                            </View>
                                            <View style={SharedStyle.triColumn}>
                                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>
                                                    {schedule.balance ? `₦${Util.formatAmount(schedule.balance)}` : '- - -'}
                                                </Text>
                                            </View>
                                        </View>
                                    })}
                                </View>
                            </View>
                        )}
                    </View>
                    <View style={SharedStyle.bottomPanel}>
                        <View style={FormStyle.formButton}>
                            <TouchItem style={styles.terms} onPress={this.openLoanTerms}>
                                <Text style={styles.termsText} numberOfLines={2}>
                                    {Dictionary.CREDITVILLE_TERMS} <Text style={{ textDecorationLine: 'underline' }}>{Dictionary.CREDITVILLE_TERMS_LINK}</Text>
                                </Text>
                            </TouchItem>
                            <PrimaryButton
                                title={Dictionary.ACCEPT_LOAN_TERMS_BTN}
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
    formContainer: {
        ...Mixins.margin(24, 16, 0, 16),
        paddingBottom: Mixins.scaleSize(100)
    },
    repaymentSummary: {
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(18),
        lineHeight: Mixins.scaleSize(20),
        color: Colors.DARK_GREY,
        marginBottom: Mixins.scaleSize(10)
    },
    breakdown: {
        ...Mixins.padding(16, 16, 0, 16),
        borderWidth: Mixins.scaleSize(1),
        borderColor: Colors.INPUT_BORDER,
        backgroundColor: Colors.WHITE,
        borderRadius: Mixins.scaleSize(10),
        marginBottom: Mixins.scaleSize(30)
    },
    breakdownHeader: {
        ...Mixins.padding(0, 16, 16, 16),
        marginHorizontal: Mixins.scaleSize(-16),
        marginBottom: Mixins.scaleSize(16),
        borderBottomColor: Colors.FAINT_BORDER,
        borderBottomWidth: Mixins.scaleSize(1)
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
        user: state.user
    };
};

const mapDispatchToProps = {
    showToast,
    updateLoanApplicationData
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(LoanBreakdown));