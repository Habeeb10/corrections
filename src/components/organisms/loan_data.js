import React, { Component } from 'react';
import { ActivityIndicator, StyleSheet, View, Text, Image, Share } from 'react-native';
import moment from 'moment';
import * as Icon from '@expo/vector-icons';

import { Dictionary, Util } from '_utils';
import { Colors, Mixins, FormStyle, SharedStyle, Typography } from '_styles';
import { TouchItem } from '_atoms';

import { Network } from '_services';

class LoanDetail extends Component {
    state = {
        sharing: false,
        loading: false,
        repayments: []
    };

    componentDidMount() {
        if (this.props.showRepayments) {
            this.loadRepayments();
        }
    }

    loadRepayments = () => {
        let { loan } = this.props;
        this.setState({ loading: true }, () => {
            Network.getLoanDetails(loan.id).then((result) => {
                let repayments = result.data.loan_transactions.filter(transaction => transaction.status === 'success');
                repayments = repayments.sort((a, b) => moment(a.created_on) - moment(b.created_on));

                this.setState({
                    repayments,
                    loading: false,
                });
            }).catch((error) => {
                this.setState({
                    loading: false
                }, () => {
                    this.props.showToast(error.message);
                });
            });
        })
    }

    shareGuarantorLink = async (guarantor_link) => {
        this.setState({ sharing: true }, async () => {
            try {
                await Share.share({ message: guarantor_link });
            } catch (error) {
                console.log('Could not initiate guarantor link sharing.');
                console.log(JSON.stringify(error, null, 4));
            } finally {
                this.setState({ sharing: false })
            }
        });
    }

    render() {
        let { loan } = this.props;
        let loan_status = loan.status_slug;

        return (
            <View style={{ flex: 1 }}>
                {this.state.loading && (
                    <View style={SharedStyle.loaderContainer}>
                        <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                    </View>
                )}
                {!this.state.loading && (
                    <View>
                        {!this.props.hideSummary && (
                            <View>
                                {(loan_status === 'pending' || loan_status === 'guarantorvalidated') && (
                                    <View>
                                        <View style={styles.loanSummary}>
                                            <Text style={[SharedStyle.normalText, styles.summaryTitle]}>
                                                {Dictionary.PENDING_LOAN}
                                            </Text>
                                            <Text style={styles.loanAmount}>
                                                ₦{Util.formatAmount(loan.loan_amount)}
                                            </Text>
                                            <Text style={[SharedStyle.normalText, styles.loanDueDate]}>
                                                {Dictionary.TO_PAY_BY} {moment(loan.loan_profile.proposed_payday, 'YYYY/MM/DD').format('D MMM YYYY')}
                                            </Text>
                                        </View>
                                        <TouchItem
                                            style={styles.loanAction}
                                            onPress={this.props.onCancel}>
                                            <Image
                                                style={styles.loanActionIcon}
                                                source={require('../../assets/images/loans/cancel_loan.png')} />
                                            <Text style={[SharedStyle.normalText, styles.loanActionText]}>
                                                {Dictionary.CANCEL_LOAN}
                                            </Text>
                                        </TouchItem>
                                    </View>
                                )}
                                {(loan_status === 'cancelled' || loan_status === 'declined' || loan_status === 'terminated') && (
                                    <View style={styles.loanSummary}>
                                        <Text style={[SharedStyle.normalText, styles.summaryTitle]}>
                                            {loan_status} {Dictionary.LOAN_REQUEST}
                                        </Text>
                                        <Text style={styles.loanAmount}>
                                            ₦{Util.formatAmount(loan.loan_amount)}
                                        </Text>
                                        <Text style={[SharedStyle.normalText, styles.loanDueDate]}>
                                            {loan_status} {Dictionary.ON} {moment(loan.modified_on).format('D MMM YYYY')}
                                        </Text>
                                    </View>
                                )}
                                {(loan_status === 'running' || loan_status === 'pastdue') && (
                                    <View>
                                        <View style={[styles.loanSummary, { flex: 1 }]}>
                                            <Text style={[SharedStyle.normalText, styles.summaryTitle]}>
                                                {Dictionary.BALANCE}
                                            </Text>
                                            <Text style={styles.loanAmount}>
                                                ₦{Util.formatAmount(loan.schedule.amount_due)}
                                            </Text>
                                            <Text style={[SharedStyle.normalText, styles.loanDueDate]}>
                                                {Dictionary.TO_PAY_BY} {moment(loan.schedule.due_date).format('D MMM YYYY')}
                                            </Text>
                                        </View>
                                        <View style={styles.loanActions}>
                                            <TouchItem
                                                style={[styles.loanAction, styles.dualLoanAction, { borderRightWidth: Mixins.scaleSize(0.5) }]}
                                                onPress={() => this.props.onLoanAction('RepayLoan', loan)}>
                                                <Image
                                                    style={styles.loanActionIcon}
                                                    source={require('../../assets/images/loans/repay_loan.png')} />
                                                <Text style={[SharedStyle.normalText, styles.loanActionText]}>
                                                    {Dictionary.REPAY_LOAN}
                                                </Text>
                                            </TouchItem>
                                            <TouchItem
                                                style={[styles.loanAction, styles.dualLoanAction, { borderLeftWidth: Mixins.scaleSize(0.5) }]}
                                                onPress={() => this.props.onLoanAction('LoanHistory', loan)}>
                                                <Image
                                                    style={styles.loanActionIcon}
                                                    source={require('../../assets/images/loans/loan_history.png')} />
                                                <Text style={[SharedStyle.normalText, styles.loanActionText]}>
                                                    {Dictionary.LOAN_HISTORY}
                                                </Text>
                                            </TouchItem>
                                        </View>
                                    </View>
                                )}
                                {loan_status === 'settled' && (
                                    <View>
                                        <View style={styles.loanSummary}>
                                            <Text style={[SharedStyle.normalText, styles.summaryTitle]}>
                                                {Dictionary.LOAN} {loan_status}
                                            </Text>
                                            <Text style={styles.loanAmount}>
                                                ₦{Util.formatAmount(loan.loan_amount)}
                                            </Text>
                                            <Text style={[SharedStyle.normalText, styles.loanDueDate]}>
                                                {loan_status} {Dictionary.ON} {moment(loan.modified_on).format('D MMM YYYY')}
                                            </Text>
                                        </View>
                                        <TouchItem
                                            style={styles.loanAction}
                                            onPress={() => this.props.onLoanAction('LoanHistory', loan)}>
                                            <Image
                                                style={styles.loanActionIcon}
                                                source={require('../../assets/images/loans/loan_history.png')} />
                                            <Text style={[SharedStyle.normalText, styles.loanActionText]}>
                                                {Dictionary.LOAN_HISTORY}
                                            </Text>
                                        </TouchItem>
                                    </View>
                                )}
                            </View>
                        )}
                        <View style={styles.loanProfile}>
                            <View style={FormStyle.formItem}>
                                <Text style={FormStyle.sectionLabel}>{Dictionary.LOAN_DETAILS}</Text>
                            </View>
                            <View style={SharedStyle.section}>
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.PRINCIPAL}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>₦{Util.formatAmount(loan.loan_amount)}</Text>
                                    </View>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.INTEREST_LABEL}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>₦{Util.formatAmount(loan.interest_due)}</Text>
                                    </View>
                                </View>
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.LOAN_PURPOSE}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{loan.loan_profile.purpose}</Text>
                                    </View>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.APPLICATION_DATE}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>
                                            {moment(loan.created_on).format('MMM D, YYYY')}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            {this.state.repayments.length > 0 && (
                                <View>
                                    <View style={FormStyle.formItem}>
                                        <Text style={FormStyle.sectionLabel}>{Dictionary.LOAN_REPAYMENT}</Text>
                                    </View>
                                    <View style={SharedStyle.section}>
                                        <View style={SharedStyle.row}>
                                            <View style={SharedStyle.triColumn}>
                                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.DATE_LABEL}</Text>
                                            </View>
                                            <View style={SharedStyle.triColumn}>
                                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.AMOUNT_LABEL}</Text>
                                            </View>
                                            <View style={SharedStyle.triColumn}>
                                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.BALANCE_LABEL}</Text>
                                            </View>
                                        </View>
                                        {this.state.repayments.map((transaction, index) => {
                                            return <View key={index} style={SharedStyle.row}>
                                                <View style={SharedStyle.triColumn}>
                                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{moment(transaction.created_on).format('MMM D, YYYY')}</Text>
                                                </View>
                                                <View style={SharedStyle.triColumn}>
                                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>{Util.formatAmount(transaction.amount)}</Text>
                                                </View>
                                                <View style={SharedStyle.triColumn}>
                                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>{Util.formatAmount(transaction.balance)}</Text>
                                                </View>
                                            </View>
                                        })}
                                    </View>
                                </View>
                            )}
                            {!!loan.guarantor && (
                                <View>
                                    <View style={FormStyle.formItem}>
                                        <Text style={FormStyle.sectionLabel}>{Dictionary.GUARANTOR}</Text>
                                    </View>
                                    <View style={SharedStyle.section}>
                                        <View style={SharedStyle.row}>
                                            <View style={SharedStyle.halfColumn}>
                                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.FULL_NAME_LABEL}</Text>
                                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{loan.guarantor.first_name} {loan.guarantor.last_name}</Text>
                                            </View>
                                            <View style={SharedStyle.halfColumn}>
                                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.RELATIONSHIP_LABEL}</Text>
                                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>{loan.guarantor.relationship}</Text>
                                            </View>
                                        </View>
                                        <View style={SharedStyle.row}>
                                            <View style={SharedStyle.fullColumn}>
                                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.EMAIL_ADDRESS_LABEL}</Text>
                                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{loan.guarantor.email}</Text>
                                            </View>
                                        </View>
                                        {loan_status === 'pending' && (
                                            <View style={styles.sectionButtons}>
                                                <TouchItem
                                                    style={[styles.sectionButton, { borderRightWidth: Mixins.scaleSize(0.5) }]}
                                                    onPress={() => { }}>
                                                    <Icon.Feather
                                                        size={Mixins.scaleSize(18)}
                                                        style={styles.buttonIcon}
                                                        name="edit" />
                                                    <Text style={[SharedStyle.normalText, styles.buttonText]}>{Dictionary.EDIT_BTN}</Text>
                                                </TouchItem>
                                                <TouchItem
                                                    style={[styles.sectionButton, { borderLeftWidth: Mixins.scaleSize(0.5) }]}
                                                    disabled={this.state.sharing}
                                                    onPress={() => this.shareGuarantorLink(loan.guarantor.loan_approval_link)}>
                                                    <Icon.SimpleLineIcons
                                                        size={Mixins.scaleSize(18)}
                                                        style={styles.buttonIcon}
                                                        name="share-alt" />
                                                    <Text style={[SharedStyle.normalText, styles.buttonText]}>{Dictionary.SHARE_LINK_BTN}</Text>
                                                </TouchItem>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )}
                            <View style={FormStyle.formItem}>
                                <Text style={FormStyle.sectionLabel}>{Dictionary.PERSONAL_INFO_TITLE}</Text>
                            </View>
                            <View style={SharedStyle.section}>
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.GENDER_LABEL}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{loan.loan_profile.personal_details.gender}</Text>
                                    </View>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.MARITAL_STATUS_LABEL}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>{loan.loan_profile.personal_details.marital_status}</Text>
                                    </View>
                                </View>
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.CHILDREN}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{loan.loan_profile.personal_details.no_of_dependent}</Text>
                                    </View>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>
                                            {Dictionary.EMPLOYMENT_STATUS}
                                        </Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>
                                            {loan.loan_profile.employment_details.employment_status}
                                        </Text>
                                    </View>
                                </View>
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.EMPLOYMENT_SECTOR}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>
                                            {loan.loan_profile.employment_details.sector_of_employment}
                                        </Text>
                                    </View>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.EMPLOYMENT_DATE}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>
                                            {moment(loan.loan_profile.employment_details.work_start_date).format('MMM D, YYYY')}
                                        </Text>
                                    </View>
                                </View>
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.fullColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.MONTHLY_INCOME}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>
                                            {loan.loan_profile.employment_details.monthly_net_income}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={FormStyle.formItem}>
                                <Text style={FormStyle.sectionLabel}>{Dictionary.EDUCATION__EMPLOYMENT}</Text>
                            </View>
                            <View style={SharedStyle.section}>
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.LEVEL_OF_EDUCATION}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{loan.loan_profile.employment_details.educational_attainment}</Text>
                                    </View>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.EMPLOYMENT_STATUS}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>{loan.loan_profile.employment_details.employment_status}</Text>
                                    </View>
                                </View>
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.EMPLOYMENT_SECTOR}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{loan.loan_profile.employment_details.sector_of_employment}</Text>
                                    </View>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>
                                            {Dictionary.EMPLOYMENT_START}
                                        </Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>
                                            {moment(loan.loan_profile.employment_details.work_start_date).format('MMM D, YYYY')}
                                        </Text>
                                    </View>
                                </View>
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.fullColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.MONTHLY_INCOME}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>
                                            {loan.loan_profile.employment_details.monthly_net_income}
                                        </Text>
                                    </View>
                                </View>
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.fullColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.OFFICIAL_EMAIL}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>
                                            {loan.loan_profile.employment_details.work_email}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                        </View>
                    </View>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    loanSummary: {
        ...Mixins.padding(32, 16, 22, 16),
        backgroundColor: Colors.CV_BLUE,
        alignItems: 'center'
    },
    summaryTitle: {
        color: Colors.WHITE,
        marginBottom: Mixins.scaleSize(12),
        textTransform: 'capitalize'
    },
    loanAmount: {
        ...Typography.FONT_BOLD,
        fontSize: Mixins.scaleFont(28),
        lineHeight: Mixins.scaleSize(33),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.WHITE,
        marginBottom: Mixins.scaleSize(20)
    },
    loanDueDate: {
        color: Colors.LIGHT_BLUE_TEXT
    },
    loanActions: {
        flexDirection: 'row'
    },
    loanAction: {
        ...Mixins.padding(12),
        backgroundColor: Colors.CV_BLUE,
        borderTopWidth: Mixins.scaleSize(1),
        borderColor: Colors.LIGHT_BLUE_BORDER,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    dualLoanAction: {
        width: '50%'
    },
    loanActionIcon: {
        width: Mixins.scaleSize(30),
        height: Mixins.scaleSize(30),
        marginRight: Mixins.scaleSize(10)
    },
    loanActionText: {
        color: Colors.WHITE
    },
    loanProfile: {
        ...Mixins.padding(32, 16, 32, 16),
        backgroundColor: Colors.WHITE
    },
    sectionButtons: {
        flexDirection: 'row',
        marginHorizontal: Mixins.scaleSize(-16)
    },
    sectionButton: {
        paddingVertical: Mixins.scaleSize(16),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%',
        borderColor: Colors.FAINT_BORDER,
        borderTopWidth: Mixins.scaleSize(1)
    },
    buttonIcon: {
        color: Colors.CV_YELLOW,
        marginRight: Mixins.scaleSize(10)
    },
    buttonText: {
        ...Typography.FONT_MEDIUM,
        color: Colors.CV_YELLOW
    },
});

export default LoanDetail;