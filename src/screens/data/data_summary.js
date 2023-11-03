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
import { showToast } from "_actions/toast_actions";
import { randomId } from '../../utils/util';

class DataSummary extends Component {
    constructor(props) {
        super(props);

        const {
            phone_number,
            network,
            data_package
        } = this.props.data.data_purchase;

        this.state = {
            phone_number,
            network,
            data_package,
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
        if (!this.props.user.user_data.emailVerificationStatus) {
            this.cancelTransactionAuthorization()
            this.props.showToast(Dictionary.EMAIL_NOT_VERIFIED)
            this.props.navigation.navigate('EnterEmail');

            return
        }
        if (!this.props.user.user_data.photoUrl) {
            this.cancelTransactionAuthorization()
            this.props.showToast(Dictionary.NO_PHOTO_URL)
            this.props.navigation.navigate('OnboardSelfie');
            return
        }
        this.setState({
            processing: true
        }, () => {
            Network.validatePIN(pin)
            .then(() => {
            let { phone_number, network, data_package } = this.state;
            let payload = {
                // paymentCode: data_package.biller_name,
               phoneNumber: phone_number,
                customerID:phone_number,
                accountID: this.props.user.user_data.nuban,
                amount: data_package.amount,
                networkType: network.value,
               
                pin,
                billType:"data",
                
            };

            payload.paymentCode=data_package.billerName

            // let payload = {
            //     phone_number:"08120696883",
            //     customer_id:"08120696883",
            //     account_id: "1500098924",
            //     transaction_amount: data_package.amount,
            //     network_type:"9MOBILE",
            //     payment_code:"9MOBILE 1GB data bundle",
            //     pin,
            //     bill_type:"data"
            // };

            this.props.addNotification({
                id: randomId(),
                is_read: false,
                title: "Data subcription",
                description: `You have successfully subscribed ${data_package.billerName} on ${phone_number} for NGN${data_package.amount}.`,
                timestamp: moment().toString(),
            });
            Network.buyData(payload).then((result) => {
                this.setState({
                    processing: false,
                    auth_screen_visible: false
                }, () => {
                    let success_message = Dictionary.BILL_PURCHASED;
                    success_message = success_message.replace("%s", data_package.name).replace("%s", phone_number);
                    this.props.navigation.navigate('Success', {
                        event_name: 'transactions_successful_data',
                        event_data: { transaction_id: result.data?.reference },
                        success_message,
                        transaction_data: {
                            ...payload,
                            ...result.data,
                            transaction_date: result.data?.transaction_date || moment().format('yyyy-MM-dd HH:mm:ss')
                        }
                    });
                });
            }).catch((error) => {
                if (error.message &&error.message.toLowerCase().includes('pin')) {
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
                            event_name: 'transactions_failed_data',
                            error_message: error.message||"Cannot perform transaction now"
                        });
                    });
                }
            });
        }) .catch((error) => {
            this.setState({
                processing: false,
                pin_error: error.message
            });
        });

    })
   
    }

    render() {
        let { phone_number, network, data_package } = this.state;
        let amount_due = Number(data_package.amount) + Number(data_package.fee||0);

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.DATA} />
                <ScrollView {...this.props} hasButtomButtons={true}>
                    <SubHeader text={Dictionary.PAYMENT_SUMMARY} />
                    <ProgressBar progress={1.0} />
                    <View style={FormStyle.formContainer}>
                        <View style={SharedStyle.section}>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.MOBILE_NUMBER_LABEL}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{phone_number}</Text>
                                </View>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.PROVIDER}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right, { textTransform: 'uppercase' }]}>{network.title}</Text>
                                </View>
                            </View>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.fullColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.DATA_PACKAGE}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, styles.value]}>{data_package.name}</Text>
                                </View>
                            </View>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.AMOUNT}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>₦{Util.formatAmount(data_package.amount)}</Text>
                                </View>
                                {/* <View style={SharedStyle.halfColumn}>
                                <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.TOTAL_AMOUNT_DUE}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>₦{Util.formatAmount(amount_due)}</Text>
                                </View> */}
                            </View>
                            
                            <TouchItem
                                style={SharedStyle.sectionButton}
                                onPress={() => this.props.navigation.navigate('Data')}>
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
                        title={Dictionary.BUY_DATA}
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
        data: state.data
    };
};

const mapDispatchToProps = {
    showToast,
    addNotification
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(DataSummary));