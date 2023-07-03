import React, { Component } from 'react';
import { StyleSheet, BackHandler, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { withNavigationFocus } from "react-navigation";
import * as Icon from '@expo/vector-icons';
import moment from 'moment';

import { Dictionary, Util } from '_utils';
import { Mixins, Colors, Typography, SharedStyle, FormStyle } from '_styles';
import { SubHeader, ScrollView, TouchItem, ProgressBar } from '_atoms';
import { PrimaryButton } from '_molecules';
import { MainHeader, AuthorizeTransaction } from '_organisms';

import { Network } from '_services';
import { addNotification } from '_actions/notification_actions';
import { randomId } from '../../utils/util';

class BillsSummary extends Component {
    constructor(props) {
        super(props);

        const {
            category,
            biller,
            bill_package,
            transaction_amount,
            customer
        } = this.props.bills.bill_payment;

        this.state = {
            category,
            biller,
            bill_package,
            transaction_amount,
            customer,
            auth_screen_visible: false,
            pin_error: ''
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
            if (!this.state.processing) {
                if (this.state.auth_screen_visible) {
                    this.cancelTransactionAuthorization();
                } else {
                    this.props.navigation.goBack();
                }
            }

            return true;
        }
    }

    handleTransactionAuthorization = () => {
        this.setState({
            auth_screen_visible: true,
            pin_error: ''
        });
    }

    cancelTransactionAuthorization = () => {
        this.setState({
            auth_screen_visible: false
        });
    }

    handleSubmit = (pin) => {
        
        this.setState({
            processing: true
        }, () => {

            Network.validatePIN(pin)
            .then(() => {
                let { bill_package, customer, transaction_amount,category } = this.state;
                let payload ;
                if (category.slug=="cable") {
                    payload = {
                            amount: transaction_amount,
                            paymentCode: bill_package.billerName,
                            customerID: customer.customer_id,
                            pin,
                            billType:category.slug,
                            accountID: this.props.user.user_data.nuban,
                        };
                } else {
                    payload = {
                        amount: transaction_amount,
                        paymentCode: bill_package.billerName,
                        customerID: customer.customer_id,
                        pin,
                        billType:category.slug,
                        accountID: this.props.user.wallet_id,
                        };
                }
            // let payload = {
            //     amount: transaction_amount,
            //     paymentCode: bill_package.biller_name,
            //     customerID: customer.customer_id,
            //     pin,
            //     billType:category.slug,
            //     accountID: this.props.user.wallet_id,
            // };

            // let payload = {
            //     transaction_amount: transaction_amount,
            //     payment_code: category.slug=="cable"?"DSTV Payment":"IKEDC TOP UP (PREPAID)",
            //     customer_id:category.slug=="cable"? "0025401100":"45053878653",
            //     pin,
            //     bill_type:category.slug,
            //     account_id: "01500112732",
            // };

            let apiCall=category.slug=="cable"?Network.payCableBill :Network.payBill;

            apiCall(payload).then((result) => {
                this.setState({
                    processing: false,
                    auth_screen_visible: false
                }, () => {
                    let success_message = Dictionary.BILL_PURCHASED;
                    success_message = success_message.replace("%s", bill_package.name).replace("%s", transaction_amount);
                    this.props.navigation.navigate('Success', {
                        event_name: 'Transactions_successful_bills',
                        event_data: { transaction_id: result.data?.reference },
                        success_message,
                        transaction_data: {
                            ...result.data,
                            transaction_date: result.data?.transaction_date || moment().format('yyyy-MM-dd HH:mm:ss')
                        }
                    });
                    this.props.addNotification({
                        id: randomId(),
                        is_read: false,
                        title: "Bills payment",
                        description: `You have successfully paid for ${
                          bill_package.billerName
                        } on ${
                          customer.customer_id
                        } for NGN${transaction_amount}.`,
                        timestamp: moment().toString(),
                      });
                });
            }).catch((error) => {
                if (error.message && error.message.toLowerCase().includes('pin')) {
                    this.setState({
                        processing: false,
                        pin_error: error.message
                    });
                } else {
                    this.setState({
                        processing: false,
                        auth_screen_visible: false
                    }, () => {
                        this.props.navigation.navigate('Error', {
                            event_name: 'transactions_failed_bills',
                            error_message:error.message||"Could not perform transaction at this time."
                        });
                    });
                }
            });

            })
           .catch((error) => {
                this.setState({
                    processing: false,
                    pin_error: error.message
                });
            });
            
        });
    }

    render() {
        let { biller, bill_package, transaction_amount, customer } = this.state;
        let amount_due = Number(transaction_amount) + Number(bill_package.fee||0);


        

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.BILL_PAYMENT} />
                <ScrollView {...this.props} hasButtomButtons={true}>
                    <SubHeader text={Dictionary.PAYMENT_SUMMARY} />
                    <ProgressBar progress={1.0} />
                    <View style={FormStyle.formContainer}>
                        <View style={SharedStyle.section}>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.BILLER}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{biller.name}</Text>
                                </View>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{bill_package.labelName}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>{customer.customer_id}</Text>
                                </View>
                            </View>
                            {!!customer.account_name && (
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.fullColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.ACCOUNT_NAME}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{customer.account_name}</Text>
                                    </View>
                                </View>
                            )}
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.NEW_PACKAGE}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, styles.value]}>{bill_package.name}</Text>
                                </View>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.AMOUNT}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>
                                        ₦{Util.formatAmount(transaction_amount)}
                                    </Text>
                                </View>
                            </View>
                            {/* <View style={SharedStyle.row}>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.TRANSACTION_FEE}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>₦{Util.formatAmount(bill_package.fee)}</Text>
                                </View>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.TOTAL_AMOUNT_DUE}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>₦{Util.formatAmount(amount_due)}</Text>
                                </View>
                            </View> */}
                            <TouchItem
                                style={SharedStyle.sectionButton}
                                onPress={() => this.props.navigation.navigate('BillsCustomer')}>
                                <Icon.Feather
                                    size={Mixins.scaleSize(18)}
                                    style={SharedStyle.sectionButtonIcon}
                                    name="edit" />
                                <Text style={SharedStyle.sectionButtonText}>{Dictionary.EDIT_BTN}</Text>
                            </TouchItem>
                        </View>
                    </View>
                    <View style={SharedStyle.bottomPanel}>
                        <View style={FormStyle.formButton}>
                            <PrimaryButton
                                title={Dictionary.CONTINUE_BTN}
                                icon="arrow-right"
                                onPress={this.handleTransactionAuthorization} />
                        </View>
                    </View>
                </ScrollView>
                {this.state.auth_screen_visible && (
                    <AuthorizeTransaction
                        title={bill_package.name}
                        isVisible={this.state.auth_screen_visible}
                        isProcessing={this.state.processing}
                        pinError={this.state.pin_error}
                        resetError={() => this.setState({ pin_error: '' })}
                        onSubmit={this.handleSubmit}
                        onCancel={this.cancelTransactionAuthorization}
                    />
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    value: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.DARK_GREY,
        textTransform: 'none'
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        wallet: state.wallet,
        bills: state.bills
    };
};

const mapDispatchToProps = {
    addNotification
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(BillsSummary));