import React, { Component } from 'react';
import { BackHandler, StyleSheet, ImageBackground, View, Text, ActivityIndicator } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import Modal from "react-native-modal";
import * as Icon from '@expo/vector-icons';

import { showToast } from '_actions/toast_actions';
import { getUserLoans, getLoanProducts, getScoringOptions, getLoanReasons } from '_actions/loan_actions';

import { Dictionary, Util } from '_utils';
import { Colors, Mixins, FormStyle, SharedStyle, Typography } from '_styles';
import { ScrollView, FloatingLabelInput, TouchItem } from '_atoms';
import { PrimaryButton } from '_molecules';
import { MainHeader, LoanCard, LoanData } from '_organisms';

import { Network } from '_services';

class Loans extends Component {
    state = {
        cancellation_reason: '',
        cancellation_reason_text: '',
        cancellation_reason_error: '',
        cancellation_options: [{
            key: 'mind',
            value: 'I changed my mind'
        }, {
            key: 'terms',
            value: 'The terms are not friendly'
        }, {
            key: 'unknown',
            value: 'I would rather not say'
        }, {
            key: 'others',
            value: 'Other reasons'
        }],
        cancel_modal_visible: false,
        cancelling: false
    };

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

        if (this.props.loans.loan_products.length < 1) {
            this.props.getLoanProducts();
        }

        if (this.props.loans.user_loans.length == 0) {
            this.props.getUserLoans();
        }

        this.props.getScoringOptions();
        this.props.getLoanReasons();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.isFocused && this.props.isFocused) {
            this.props.getUserLoans();
        }
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            if (!this.state.cancelling) {
                if (this.state.cancel_modal_visible) {
                    this.abandonCancelLoan();
                } else {
                    !this.props.loading_loan && this.props.navigation.navigate('Dashboard');
                }
            }

            return true;
        }
    }

    startLoanApplication = () => {
        this.props.navigation.navigate('LoanRequirements');
    }

    handleCancelLoan = () => {
        this.setState({
            cancellation_reason: '',
            cancellation_reason_text: '',
            cancellation_reason_error: '',
            cancel_modal_visible: true
        });
    }

    abandonCancelLoan = () => {
        this.setState({
            cancel_modal_visible: false
        });
    }

    onReasonSelected = (option) => {
        this.setState({
            cancellation_reason: option,
            cancellation_reason_error: ''
        });
    }

    cancelLoan = () => {
        let cancellation_reason = this.state.cancellation_reason;
        if (!cancellation_reason) {
            this.setState({
                cancellation_reason_error: Dictionary.OPTION_REQUIRED
            });
            return;
        }

        let reason = cancellation_reason.key === 'others' ? this.state.cancellation_reason_text : cancellation_reason.value;
        if (!reason) {
            this.setState({
                cancellation_reason_error: Dictionary.REASON_REQUIRED
            });
            return;
        }

        this.setState({
            cancelling: true
        }, () => {
            const top_cancel = this.props.loans.user_loans[0];
            Network.cancelLoanApplication({ reason }).then(() => {
                this.setState({
                    cancelling: false,
                    cancel_modal_visible: false
                }, () => {
                    this.props.getUserLoans();
                    this.props.showToast(Dictionary.LOAN_CANCELLED, false);
                    Util.logEventData('loan_cancel', { loan_id: top_cancel?.id });
                });
            }).catch((error) => {
                this.setState({
                    cancelling: false,
                    cancel_modal_visible: false
                }, () => {
                    this.props.showToast(error.message);
                });
            });
        });
    }

    showLoanDetail = (loan) => {
        this.props.navigation.navigate('LoanDetail', { loan });
        Util.logEventData('loan_view_existing', { loan_id: loan.id });
    }

    render() {
        let { user_loans } = this.props.loans;
        let top_loan = user_loans[0];
        let active_count;
        let active_sum;

        let multiple_loans = user_loans.length > 1 || (!!top_loan && top_loan.status.toLowerCase() !== 'pending');
        if (multiple_loans) {
            let active_loans = user_loans.filter(loan => loan.status.toLowerCase() === 'running');
            active_count = active_loans.length;
            active_sum = active_loans.reduce((sum, loan) => { return sum + loan.schedule.amount_due }, 0);
        }

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader
                    leftIcon="arrow-left"
                    onPressLeftIcon={this.handleBackButton}
                    title={Dictionary.LOANS}
                    textColor={multiple_loans ? Colors.CV_BLUE : Colors.WHITE}
                    backgroundStyle={multiple_loans ? { backgroundColor: Colors.ASH_HEADER_BG } : {}} />
                {this.props.loading_loans && (
                    <View style={SharedStyle.loaderContainer}>
                        <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                    </View>
                )}
                {!this.props.loading_loans && (
                    <ScrollView {...this.props}>
                        {user_loans.length === 0 && (
                            <ImageBackground
                                style={styles.container}
                                imageStyle={{
                                    height: Mixins.scaleSize(456),
                                    top: undefined,
                                    bottom: Mixins.scaleSize(50)
                                }}
                                source={require('../../assets/images/loans/apply_bg.png')}
                                resizeMode={'cover'}>
                                <Text style={styles.header}>
                                    {Dictionary.APPLY_FOR_LOAN_HEADER}
                                </Text>
                                <Text style={styles.subheader}>
                                    {Dictionary.APPLY_FOR_LOAN_SUB_HEADER}
                                </Text>
                                <View style={[SharedStyle.bottomPanel, styles.bottomPanel]}>
                                    <View style={FormStyle.formButton}>
                                        <PrimaryButton
                                            title={Dictionary.APPLY_FOR_LOAN_BTN}
                                            icon="arrow-right"
                                            onPress={this.startLoanApplication} />
                                    </View>
                                </View>
                            </ImageBackground>
                        )}
                        {user_loans.length === 1 && top_loan.status.toLowerCase() === 'pending' && (
                            <LoanData loan={top_loan} onCancel={this.handleCancelLoan} />
                        )}
                        {multiple_loans && (
                            <View>
                                <ImageBackground
                                    style={styles.loanSummary}
                                    source={require('../../assets/images/loans/summary_bg.png')}
                                    resizeMode={'cover'}>
                                    <Text style={[SharedStyle.normalText, styles.loanCount]}>
                                        {active_count} {Dictionary.ACTIVE_LOANS}
                                    </Text>
                                    <Text style={styles.loanAmount}>
                                        ₦{Util.formatAmount(active_sum)}
                                    </Text>
                                    {/* <TouchItem
                                        style={styles.loanHistory}
                                        onPress={() => { }}>
                                        <Icon.MaterialIcons name={'history'} size={Mixins.scaleFont(22)} color={Colors.CV_BLUE} />
                                        <Text style={[SharedStyle.normalText, styles.loanHistoryText]}>{Dictionary.HISTORY_BTN}</Text>
                                    </TouchItem> */}
                                </ImageBackground>
                                <View style={styles.loanCards}>
                                    {user_loans.map((loan, index) => {
                                        return <LoanCard key={index} loan={loan} onPress={() => this.showLoanDetail(loan)} />
                                    })}
                                </View>
                            </View>
                        )}
                    </ScrollView>
                )}
                {!this.props.loading_loans && multiple_loans && active_count === 0 && (
                    <TouchItem style={styles.floatingButton} onPress={this.startLoanApplication}>
                        <Icon.Entypo
                            size={Mixins.scaleSize(25)}
                            style={styles.floatingButtonIcon}
                            name="plus" />
                    </TouchItem>
                )}
                <Modal
                    isVisible={this.state.cancel_modal_visible}
                    swipeDirection="down"
                    onSwipeComplete={this.handleBackButton}
                    onBackButtonPress={this.handleBackButton}
                    animationInTiming={500}
                    animationOutTiming={500}
                    backdropTransitionInTiming={500}
                    backdropTransitionOutTiming={500}
                    useNativeDriver={true}
                    style={SharedStyle.modal}>
                    <View style={[SharedStyle.modalContent, { height: Mixins.scaleSize(380) }]}>
                        <View style={SharedStyle.modalSlider} />
                        <View style={SharedStyle.modalPanel}>
                            <Text style={SharedStyle.modalTop}>{Dictionary.WHY_CANCEL_LOAN}</Text>
                            <View style={[SharedStyle.modalMiddle, styles.modalMiddle]}>
                                <View style={{ flex: 1 }}>
                                    {this.state.cancellation_options.map((option, index) => {
                                        return <TouchItem
                                            key={index}
                                            style={[styles.cancelOption,
                                            index === this.state.cancellation_options.length - 1 ? {
                                                borderBottomWidth: Mixins.scaleSize(0),
                                                marginBottom: Mixins.scaleSize(10)
                                            } : {}]}
                                            disabled={this.state.cancelling}
                                            onPress={() => this.onReasonSelected(option)}>
                                            <View style={styles.checkbox}>
                                                {this.state.cancellation_reason.key !== option.key && (
                                                    <View style={styles.blank}></View>
                                                )}
                                                {this.state.cancellation_reason.key === option.key && (
                                                    <Icon.Ionicons name={'ios-checkmark-circle'} size={Mixins.scaleFont(22)} color={Colors.SUCCESS} />
                                                )}
                                            </View>
                                            <Text style={[SharedStyle.normalText, styles.optionText]}>{option.value}</Text>
                                        </TouchItem>
                                    })}
                                    <FloatingLabelInput
                                        label={Dictionary.OTHERS_LABEL}
                                        value={this.state.cancellation_reason_text}
                                        multiline={true}
                                        autoCorrect={false}
                                        editable={!this.state.cancelling}
                                        onTouchStart={() => this.onReasonSelected(this.state.cancellation_options[3])}
                                        onChangeText={text => this.setState({
                                            cancellation_reason_text: text,
                                            cancellation_reason_error: ''
                                        })}
                                    />
                                    <Text style={FormStyle.formError}>{this.state.cancellation_reason_error}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={[SharedStyle.modalBottom, styles.modalBottom]}>
                        <PrimaryButton
                            title={Dictionary.CONTINUE_BTN}
                            icon="arrow-right"
                            onPress={this.cancelLoan}
                            loading={this.state.cancelling} />
                    </View>
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.YELLOW_BG
    },
    header: {
        ...Mixins.margin(60, 20, 20, 20),
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(36),
        lineHeight: Mixins.scaleSize(42),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.CV_BLUE
    },
    subheader: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(16),
        lineHeight: Mixins.scaleSize(19),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.CV_BLUE,
        marginHorizontal: Mixins.scaleSize(20)
    },
    bottomPanel: {
        backgroundColor: Colors.WHITE
    },
    loanSummary: {
        ...Mixins.padding(32, 16, 28, 16),
        height: Mixins.scaleSize(200)
    },
    loanCount: {
        color: Colors.CV_BLUE,
        marginBottom: Mixins.scaleSize(12)
    },
    loanAmount: {
        ...Typography.FONT_BOLD,
        fontSize: Mixins.scaleFont(28),
        lineHeight: Mixins.scaleSize(33),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.CV_BLUE,
        marginBottom: Mixins.scaleSize(40)
    },
    loanHistory: {
        ...Mixins.padding(12, 22, 12, 22),
        flexDirection: 'row',
        alignSelf: 'flex-start',
        alignItems: 'center',
        borderColor: Colors.CV_BLUE,
        borderWidth: Mixins.scaleSize(1),
        borderRadius: Mixins.scaleSize(4)
    },
    loanHistoryText: {
        color: Colors.CV_BLUE,
        marginLeft: Mixins.scaleSize(10)
    },
    loanCards: {
        ...Mixins.padding(24, 8, 24, 8),
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    floatingButton: {
        width: Mixins.scaleSize(50),
        height: Mixins.scaleSize(50),
        marginBottom: Mixins.scaleSize(20),
        backgroundColor: Colors.CV_BLUE,
        borderRadius: Mixins.scaleSize(50),
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: Mixins.scaleSize(16),
        bottom: Mixins.scaleSize(0),
        elevation: 3
    },
    floatingButtonIcon: {
        color: Colors.WHITE
    },
    modalMiddle: {
        ...Mixins.padding(16),
    },
    cancelOption: {
        paddingVertical: Mixins.scaleSize(20),
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: Mixins.scaleSize(1),
        borderColor: Colors.LIGHT_BG
    },
    checkbox: {
        width: '10%'
    },
    blank: {
        width: Mixins.scaleSize(20),
        height: Mixins.scaleSize(20),
        backgroundColor: Colors.LIGHT_UNCHECKED_BG,
        borderRadius: Mixins.scaleSize(50)
    },
    optionText: {
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
        loans: state.loans,
        loading_loans: state.loans.loading_user_loans
    };
};

const mapDispatchToProps = {
    showToast,
    getUserLoans,
    getLoanProducts,
    getScoringOptions,
    getLoanReasons
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Loans));