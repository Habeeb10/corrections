import React, { Component } from 'react';
import { BackHandler, View, ActivityIndicator } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { updateLoanApplicationData } from '_actions/user_actions';
import { getLoanReasons } from '_actions/loan_actions';

import { Dictionary } from '_utils';
import { SharedStyle, FormStyle, Colors } from '_styles';
import { SubHeader, ScrollView, ProgressBar } from '_atoms';
import { PrimaryButton, SelectListItem } from '_molecules';
import { MainHeader } from '_organisms';

class LoanReason extends Component {
    constructor(props) {
        super(props);

        const { loan_reason } = this.props.user.loan_application;
        const { user_loan_profile } = this.props.loans;

        this.state = {
            loan_reason: loan_reason?.code_description || user_loan_profile?.purpose || ''
        };
    }


    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        if (this.props.loans.loan_reasons.length === 0) {
            this.props.getLoanReasons();
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

    setScrollRef = (scrollRef) => {
        this.scrollRef = scrollRef;
    }

    handleSelectedReason = (reason) => {
        this.setState({
            loan_reason: reason.code_description
        }, () => {
            setTimeout(() => {
                this.scrollRef.scrollToEnd({ animated: true })
            }, 50);
        });
    }

    handleSubmit = () => {
        let { loan_reason: reason } = this.state;
        const loan_reason = this.props.loans.loan_reasons.find(r => r.code_description === reason);

        this.props.updateLoanApplicationData({ loan_reason });
        this.props.navigation.navigate('LoanPersonalDetails');
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.LOAN_APPLICATION} />
                {this.props.loans.loading_loan_reasons && (
                    <View style={SharedStyle.loaderContainer}>
                        <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                    </View>
                )}
                {!this.props.loans.loading_loan_reasons && (
                    <ScrollView {...this.props} hasButtomButtons={true} setScrollRef={this.setScrollRef}>
                        <SubHeader text={Dictionary.LOAN_REASON_HEADER} />
                        <ProgressBar progress={0.3} />
                        {this.props.loans.loan_reasons.map((reason, index) => {
                            return <SelectListItem
                                key={index}
                                image={{ uri: reason.logo_url }}
                                title={reason.code_description}
                                onPress={() => this.handleSelectedReason(reason)}
                                selected={this.state.loan_reason === reason.code_description}
                            />
                        })}
                        {!!this.state.loan_reason && (
                            <View style={SharedStyle.bottomPanel}>
                                <View style={FormStyle.formButton}>
                                    <PrimaryButton
                                        title={Dictionary.PROCEED_BTN}
                                        icon="arrow-right"
                                        onPress={this.handleSubmit} />
                                </View>
                            </View>
                        )}
                    </ScrollView>
                )}
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user,
        loans: state.loans
    };
};

const mapDispatchToProps = {
    getLoanReasons,
    updateLoanApplicationData
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(LoanReason));