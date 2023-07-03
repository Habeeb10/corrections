import React, { Component } from 'react';
import { BackHandler, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { showToast } from '_actions/toast_actions';
import { getUserLoans } from '_actions/loan_actions';

import { Dictionary } from '_utils';
import { SharedStyle } from '_styles';
import { ScrollView, } from '_atoms';
import { MainHeader, LoanData } from '_organisms';

class LoanHistory extends Component {
    constructor(props) {
        super(props);

        const loan = this.props.navigation.getParam('loan', {});

        this.state = {
            loan,
            processing: false
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
            !this.state.processing && this.props.navigation.goBack();

            return true;
        }
    }

    render() {
        const { loan } = this.state;

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.LOAN_HISTORY} />
                <ScrollView {...this.props}>
                    <LoanData
                        loan={loan}
                        hideSummary={true}
                        showRepayments={true}
                        onCancel={this.handleCancelLoan}
                        onLoanAction={this.toLoanAction} />
                </ScrollView>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user,
        loans: state.loans,
        loading_loans: state.loans.loading_user_loans
    };
};

const mapDispatchToProps = {
    showToast,
    getUserLoans
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(LoanHistory));