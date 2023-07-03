import React, { Component } from 'react';
import { BackHandler, StyleSheet, ActivityIndicator, Text, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import remoteConfig from '@react-native-firebase/remote-config';

import { updateLoanApplicationData } from '_actions/user_actions';
import { getLoanProducts } from '_actions/loan_actions';

import { env, Dictionary, Util } from '_utils';
import { Colors, Mixins, Typography, FormStyle, SharedStyle } from '_styles';
import { SubHeader, FloatingLabelInput, TouchItem, ProgressBar, ScrollView as _ScrollView } from '_atoms';
import { PrimaryButton } from '_molecules';
import { MainHeader } from '_organisms';

class LoanAmount extends Component {
    constructor(props) {
        super(props);

        const no_loan = remoteConfig().getValue(`no_loan_msg_${env().target}`).asString();

        this.state = {
            no_loan,
            amount: '',
            amount_error: '',
            tenor: {},
            tenor_error: '',
            breakdown: null
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

        if (this.props.loans.loan_products.length < 1) {
            this.props.getLoanProducts();
        }
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

    updateBreakdown = () => {
        if (!Util.isValidAmount(this.state.amount) || !this.state.tenor.value) {
            this.setState({ breakdown: null });
        } else {
            const loan_amount = +this.state.amount;
            let { loan_products } = this.props.loans;
            let loan_product = loan_products.find(product => product.id === this.state.tenor.product_id);

            const non_penal_fees = loan_product.fees.filter(function (fee) {
                return fee.category?.toLowerCase() !== 'penal';
            });
            const origination_fee = non_penal_fees.reduce((sum, fee) => {
                let amount = fee.amount || 0;
                const fee_type = fee.type?.trim()?.toLowerCase() || 'flat';
                switch (fee_type) {
                    case 'percentage':
                        amount = ((fee.percentage || 0) / 100.00) * loan_amount;
                        break;
                    case 'hybrid':
                        amount = amount + (((fee.percentage || 0) / 100.00) * loan_amount);
                        break;
                    default:
                        //
                        break;
                }

                return sum + amount;
            }, 0);

            let interest_amount = (this.state.tenor.interest_rate / 100) * loan_amount;

            let breakdown = {
                principal: Util.formatAmount(loan_amount - origination_fee),
                interest_rate: this.state.tenor.interest_rate,
                interest_amount: Util.formatAmount(interest_amount),
                repayment_amount: Util.formatAmount(loan_amount + interest_amount),
                repayment_duration: this.state.tenor.label
            };

            this.setState({ breakdown });
        }
    }

    handleSubmit = () => {
        let { amount, tenor } = this.state;
        let is_valid = true;
        if (!Util.isValidAmount(amount)) {
            this.setState({ amount_error: Dictionary.ENTER_VALID_AMOUNT });
            is_valid = false;
        }

        if (!tenor.value) {
            this.setState({ tenor_error: Dictionary.SELECT_TENOR });
            is_valid = false;
        }

        if (!is_valid) {
            return;
        } else {
            this.props.updateLoanApplicationData({ amount, loan_duration: tenor.value });

            this.props.navigation.navigate('LoanReason');
            Util.logEventData('loan_apply_new', { amount });
        }
    }

    render() {
        let initializing = this.props.initializing;
        let { breakdown } = this.state;

        let tenor_presets = [];
        this.props.loans.loan_products.forEach(product => {
            product.tenors.forEach(tenor => {
                tenor_presets.push({
                    product_id: product.id,
                    interest_rate: product.interest_rate,
                    label: `${tenor.value} Days`,
                    value: tenor.value
                });
            });
        });

        // Remove duplicates
        tenor_presets = tenor_presets.filter((tenor, index, self) =>
            index === self.findIndex((t) => (
                t.value === tenor.value
            ))
        );
        //

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.LOAN_APPLICATION} />
                {initializing && (
                    <View style={SharedStyle.loaderContainer}>
                        <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                    </View>
                )}
                {!initializing && tenor_presets.length > 0 && (
                    <_ScrollView {...this.props}>
                        <SubHeader text={Dictionary.LOAN_AMOUNT_HEADER} />
                        <ProgressBar progress={0.2} />
                        <View style={[FormStyle.formContainer, styles.formContainer]}>
                            <View style={FormStyle.formItem}>
                                <FloatingLabelInput
                                    label={Dictionary.LOAN_AMOUNT_LABEL}
                                    value={this.state.amount}
                                    keyboardType={'decimal-pad'}
                                    multiline={false}
                                    autoCorrect={false}
                                    onChangeText={text => this.setState({
                                        amount: text.replace(/\D/g, ''),
                                        amount_error: ''
                                    }, () => this.updateBreakdown())}
                                />
                                <Text style={FormStyle.formError}>{this.state.amount_error}</Text>
                            </View>
                            {!!this.state.amount && (<View>
                                <View style={FormStyle.formItem}>
                                    <Text style={styles.presetLabel}>{Dictionary.LOAN_PRESET_TENOR}</Text>
                                </View>
                                <View style={FormStyle.formItem}>
                                    <View style={styles.presets}>
                                        {tenor_presets.map((tenor, index) => {
                                            return <TouchItem
                                                key={index}
                                                onPress={() => {
                                                    this.setState({
                                                        tenor,
                                                        tenor_error: ''
                                                    }, () => this.updateBreakdown())
                                                }}
                                                style={[
                                                    styles.preset,
                                                    this.state.tenor.value === tenor.value ? styles.activePreset : {}
                                                ]}>
                                                <Text
                                                    style={[
                                                        styles.presetText,
                                                        this.state.tenor === tenor.value ? styles.activePresetText : {}
                                                    ]}>
                                                    {tenor.label}
                                                </Text>
                                            </TouchItem>
                                        })}
                                    </View>
                                    <Text style={FormStyle.formError}>{this.state.tenor_error}</Text>
                                </View>
                            </View>)}
                            {breakdown && (
                                <View>
                                    <View style={FormStyle.formItem}>
                                        <Text style={styles.repayment}>{Dictionary.REPAYMENT_DETAILS}</Text>
                                        <Text style={styles.repaymentSummary}>
                                            {Dictionary.TO_REPAY} <Text style={{ color: Colors.CV_YELLOW }}>₦{breakdown.repayment_amount}</Text> {Dictionary.IN} <Text>{breakdown.repayment_duration}</Text>
                                        </Text>
                                    </View>
                                    <View style={styles.breakdown}>
                                        <View style={styles.breakdownHeader}>
                                            <Text numberOfLines={1} style={[SharedStyle.normalText, styles.label]}>{Dictionary.REPAYMENT_BREAKDOWN}</Text>
                                        </View>
                                        <View style={SharedStyle.row}>
                                            <View style={styles.column}>
                                                <Text numberOfLines={1} style={[SharedStyle.normalText, styles.label]}>{`Interest (${breakdown.interest_rate}%)`}</Text>
                                            </View>
                                            <View style={styles.column}>
                                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>₦{breakdown.interest_amount}</Text>
                                            </View>
                                        </View>
                                        <View style={SharedStyle.row}>
                                            <View style={styles.column}>
                                                <Text numberOfLines={1} style={[SharedStyle.normalText, styles.label]}>{Dictionary.PRINCIPAL}</Text>
                                            </View>
                                            <View style={styles.column}>
                                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>₦{breakdown.principal}</Text>
                                            </View>
                                        </View>
                                        <View style={SharedStyle.row}>
                                            <View style={styles.column}>
                                                <Text numberOfLines={1} style={[SharedStyle.normalText, styles.label]}>{Dictionary.REPAYMENT}</Text>
                                            </View>
                                            <View style={styles.column}>
                                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>₦{breakdown.repayment_amount}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                        <View style={SharedStyle.bottomPanel}>
                            <View style={FormStyle.formButton}>
                                <PrimaryButton
                                    title={Dictionary.CONTINUE_BTN}
                                    icon="arrow-right"
                                    onPress={this.handleSubmit} />
                            </View>
                        </View>
                    </_ScrollView>
                )}
                {!initializing && tenor_presets.length === 0 && (
                    <View style={SharedStyle.loaderContainer}>
                        <Text style={styles.noLoans}>{this.state.no_loan || Dictionary.NO_LOAN_PRODUCTS}</Text>
                    </View>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    formContainer: {
        paddingBottom: Mixins.scaleSize(50)
    },
    presets: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Mixins.scaleSize(8),
        borderWidth: Mixins.scaleSize(1),
        borderRadius: Mixins.scaleSize(4),
        borderColor: Colors.INPUT_BORDER
    },
    preset: {
        ...Mixins.padding(16, 8, 16, 8),
        marginRight: Mixins.scaleSize(16),
        borderBottomWidth: Mixins.scaleSize(2),
        borderBottomColor: 'transparent'
    },
    activePreset: {
        borderBottomColor: Colors.CV_YELLOW
    },
    presetText: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.CV_BLUE
    },
    activePresetText: {
        ...Typography.FONT_MEDIUM,
        color: Colors.CV_YELLOW
    },
    presetLabel: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.LIGHT_GREY
    },
    repayment: {
        ...Typography.FONT_BOLD,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.DARK_GREY,
        marginBottom: Mixins.scaleSize(20),
        textTransform: 'uppercase'
    },
    repaymentSummary: {
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(18),
        lineHeight: Mixins.scaleSize(20),
        color: Colors.DARK_GREY
    },
    durationSlider: {
        marginHorizontal: Mixins.scaleSize(-16)
    },
    durationOptions: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: Mixins.scaleSize(160),
        marginLeft: Mixins.scaleSize(16),
        marginBottom: Mixins.scaleSize(8),
        padding: Mixins.scaleSize(16),
        backgroundColor: Colors.LIGHT_BG,
        borderColor: Colors.FAINT_BORDER,
        borderWidth: Mixins.scaleSize(1),
        borderRadius: Mixins.scaleSize(10)
    },
    selectedDuration: {
        backgroundColor: Colors.LIGHTER_ORANGE_BG,
        borderColor: Colors.ORANGE_BORDER,
        elevation: 2
    },
    icon: {
        marginRight: Mixins.scaleSize(12)
    },
    blank: {
        width: Mixins.scaleSize(20),
        height: Mixins.scaleSize(20),
        backgroundColor: Colors.LIGHT_UNCHECKED_BG,
        borderRadius: Mixins.scaleSize(50)
    },
    durationHeader: {
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(20),
        lineHeight: Mixins.scaleSize(23),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.DARK_GREY
    },
    durationDescription: {
        ...Typography.DARK_GREY,
        fontSize: Mixins.scaleFont(12),
        lineHeight: Mixins.scaleSize(14),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.LIGHT_GREY
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
    label: {
        color: Colors.LIGHT_GREY
    },
    noLoans: {
        ...SharedStyle.normalText,
        ...Mixins.padding(0, 16),
        textAlign: 'center'
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        loans: state.loans,
        initializing: state.loans.loading_loan_products
    };
};

const mapDispatchToProps = {
    getLoanProducts,
    updateLoanApplicationData
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(LoanAmount));