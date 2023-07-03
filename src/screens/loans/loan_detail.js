import React, { Component } from 'react';
import { BackHandler, StyleSheet, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import Modal from "react-native-modal";
import * as Icon from '@expo/vector-icons';

import { showToast } from '_actions/toast_actions';
import { getUserLoans } from '_actions/loan_actions';

import { Dictionary } from '_utils';
import { Colors, Mixins, FormStyle, SharedStyle } from '_styles';
import { ScrollView, FloatingLabelInput, TouchItem } from '_atoms';
import { PrimaryButton } from '_molecules';
import { MainHeader, LoanData } from '_organisms';

import { Network } from '_services';

class LoanDetail extends Component {
    constructor(props) {
        super(props);

        const loan = this.props.navigation.getParam('loan', {});

        this.state = {
            loan,
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
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            if (!this.state.cancelling) {
                if (this.state.cancel_modal_visible) {
                    this.abandonCancelLoan();
                } else {
                    this.props.navigation.goBack();
                }
            }

            return true;
        }
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
            Network.cancelLoanApplication({ reason }).then(() => {
                this.setState({
                    cancelling: false,
                    cancel_modal_visible: false
                }, () => {
                    this.props.getUserLoans();
                    this.handleBackButton();
                    this.props.showToast(Dictionary.LOAN_CANCELLED, false);
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

    toLoanAction = (loan_action, loan) => {
        this.props.navigation.navigate(loan_action, { loan })
    }

    render() {
        const { loan } = this.state;

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.LOANS} />
                <ScrollView {...this.props}>
                    <LoanData
                        loan={loan}
                        onCancel={this.handleCancelLoan}
                        onLoanAction={this.toLoanAction} />
                </ScrollView>
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
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? "position" : ""}>
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
                                                        <Icon.Ionicons name={'ios-checkmark-circle'} size={Mixins.scaleFont(24)} color={Colors.SUCCESS} />
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
                    </KeyboardAvoidingView>
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    modalMiddle: {
        ...Mixins.padding(16),
    },
    cancelOption: {
        paddingVertical: Mixins.scaleSize(10),
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
    getUserLoans
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(LoanDetail));