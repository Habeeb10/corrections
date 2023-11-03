import React, { Component } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import * as Icon from '@expo/vector-icons';
import moment from 'moment';

import { updateLoanApplicationData } from '_actions/user_actions';

import { Dictionary, Util } from '_utils';
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from '_styles';
import { SubHeader, TouchItem, ProgressBar, ScrollView } from '_atoms';
import { MainHeader } from '_organisms';

class LoanEligibility extends Component {
    constructor(props) {
        super(props);

        const loan_options = this.props.navigation.getParam('loan_options', []);
        this.state = {
            loan_options
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
            this.props.navigation.goBack();

            return true;
        }
    }

    handleSubmit = (preferred_loan_product) => {
        this.props.updateLoanApplicationData({ preferred_loan_product });
        this.props.navigation.navigate('LoanBreakdown');
        Util.logEventData('loan_offer', {
            loan_id: preferred_loan_product.id,
            amount: preferred_loan_product.loan_amount
        });
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.LOAN_ELIGIBILITY_HEADER} />
                <ScrollView {...this.props}>
                    <SubHeader text={Dictionary.LOAN_ELIGIBILITY_SUB_HEADER} />
                    <ProgressBar progress={0.7} />
                    <View style={[FormStyle.formContainer, styles.formContainer]}>
                        {this.state.loan_options.map((option, index) => {
                            const due_date = moment(option.due_date, 'yyyy-MM-DD').format('D MMM YYYY');
                            return <View key={index} style={[SharedStyle.section, styles.section]}>
                                <Text style={styles.amount} numberOfLines={1}>
                                    {`N${Util.formatAmount(option.loan_amount)}`}
                                </Text>
                                <Text style={styles.tenor} numberOfLines={1}>
                                    {`${option.tenor} ${option.tenor_period} ${Dictionary.TENOR.toLowerCase()}`}
                                </Text>
                                <Text style={styles.toRepay} numberOfLines={2}>
                                    {`${Dictionary.TO_REPAY} N${Util.formatAmount(option.amount_due)} ${Dictionary.BY} ${due_date}`}
                                </Text>
                                <TouchItem style={styles.viewBreakdown} onPress={() => this.handleSubmit(option)}>
                                    <Text style={styles.viewBreakdownText}>
                                        {Dictionary.VIEW_BREAKDOWN}
                                    </Text>
                                    <Icon.AntDesign name={'arrowright'} color={Colors.CV_YELLOW} size={Mixins.scaleSize(28)} />
                                </TouchItem>
                            </View>
                        })}
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    formContainer: {
        ...Mixins.margin(20, 16, 0, 16)
    },
    section: {
        ...Mixins.padding(20, 0, 0, 0)
    },
    amount: {
        ...SharedStyle.normalText,
        ...Typography.FONT_MEDIUM,
        marginHorizontal: Mixins.scaleSize(16),
        fontSize: Mixins.scaleFont(20),
        lineHeight: Mixins.scaleSize(23),
        color: Colors.CV_YELLOW,
        marginBottom: Mixins.scaleSize(10)
    },
    tenor: {
        ...Mixins.padding(8, 10, 8, 10),
        marginHorizontal: Mixins.scaleSize(16),
        alignSelf: 'flex-start',
        backgroundColor: Colors.TENOR_BG,
        borderRadius: Mixins.scaleSize(5),
        ...SharedStyle.normalText,
        color: Colors.LIGHT_PURPLE,
        marginBottom: Mixins.scaleSize(20)
    },
    toRepay: {
        ...Mixins.margin(0, 16, 20, 16),
        ...SharedStyle.normalText,
        color: Colors.LIGHT_GREY
    },
    viewBreakdown: {
        ...Mixins.padding(16),
        flexDirection: 'row',
        alignItems: 'center',
        borderTopColor: Colors.FAINT_BORDER,
        borderTopWidth: Mixins.scaleSize(1)
    },
    viewBreakdownText: {
        ...SharedStyle.normalText,
        ...Typography.FONT_MEDIUM,
        color: Colors.CV_YELLOW,
        marginRight: Mixins.scaleSize(10)
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};

const mapDispatchToProps = {
    updateLoanApplicationData
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(LoanEligibility));