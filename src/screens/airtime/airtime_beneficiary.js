import React, { Component } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import * as Icon from '@expo/vector-icons';
import * as Permissions from 'expo-permissions';
import { selectContactPhone } from 'react-native-select-contact';

import { showToast } from '_actions/toast_actions';
import { updateAirtimePurchase } from '_actions/airtime_actions';

import { Dictionary, Util } from '_utils';
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from '_styles';
import { SubHeader, FloatingLabelInput, TouchItem, RecentTransaction, ProgressBar } from '_atoms';
import { default as ScrollView } from '_atoms/scroll_view';
import { PrimaryButton } from '_molecules';
import { MainHeader, ActionSheet } from '_organisms';

class AirtimeBeneficiary extends Component {
    constructor(props) {
        super(props);

        const { amount } = this.props.airtime.airtime_purchase;

        this.state = {
            amount,
            phone_number: '',
            phone_number_error: '',
            contact_phones: [],
            show_phone_list: false,
            recent_transactions: [
                /* {
                    customerId: '07035495531',
                    customerName: 'Grace Effiom'
                },
                {
                    customerId: '08124998488',
                    customerName: 'Sarah Unyime'
                } */
            ]
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

    handleBuyForMe = async () => {
        this.setState({
            phone_number: this.props.user.user_data.phoneNumber
        })
    }

    handleSelectContact = async () => {
        const { status } = await Permissions.askAsync(Permissions.CONTACTS);
        if (status === 'granted') {
            this.setState({ phoneNumber: '', contact_phones: [] });
            const {contact} = await selectContactPhone();
            if (contact) {
                let phones = Util.normalizeContactPhones(contact.phones);
                if (phones.length === 1) {
                    this.assertContactPhone(phones[0]);
                } else if (phones.length > 1) {
                    this.setState({
                        contact_phones: phones,
                        show_phone_list: true
                    });
                }
            }
        } else {
            this.props.showToast('Contacts permission is needed');
        }
    }

    getContactPhoneOptions = () => {
        let options = this.state.contact_phones.map(phone => {
            return {
                label: phone.number,
                number: phone.number,
                subtitle: phone.type
            }
        });

        return options;
    }

    assertContactPhone = (selectedPhone) => {
        let phone_number = selectedPhone.number;
        phone_number = phone_number ? phone_number.replace(/\s+/g, '').replace(/\D/g,'') : '';
        if (phone_number.length > 11) {
            phone_number = `0${phone_number.slice(-10)}`
        }

        this.setState({
            phone_number,
            phone_number_error: ''
        });
    }

    validate = () => {
        let is_valid = true;

        if (!Util.isValidPhone(this.state.phone_number)) {
            this.setState({
                phone_number_error: Dictionary.ENTER_VALID_PHONE,
            });

            is_valid = false;
        }

        return is_valid;
    }

    handleSubmit = () => {
        if (!this.validate()) {
            return;
        }

        this.props.updateAirtimePurchase({ phone_number: this.state.phone_number });
        this.props.navigation.navigate('AirtimeSummary');
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.AIRTIME_HEADER} />
                <ScrollView {...this.props} hasButtomButtons={true}>
                    <SubHeader text={Dictionary.NUMBER_TO_BUY_FOR_SUB_HEADER} />
                    <ProgressBar progress={0.8} />
                    <View style={FormStyle.formContainer}>
                        <View style={FormStyle.formItem}>
                            <FloatingLabelInput
                                label={Dictionary.PHONE_NUMBER_LABEL}
                                value={this.state.phone_number}
                                keyboardType={'number-pad'}
                                multiline={false}
                                maxLength={11}
                                autoCorrect={false}
                                onChangeText={text => this.setState({
                                    phone_number: text.replace(/\D/g,''),
                                    phone_number_error: ''
                                })}
                            />
                            <Text style={FormStyle.formError}>{this.state.phone_number_error}</Text>
                        </View>
                        <View style={FormStyle.formItem}>
                            <View style={[FormStyle.formButton, styles.formButton]}>
                                <TouchItem
                                    style={styles.contactButton}
                                    onPress={this.handleBuyForMe}>
                                    <Icon.AntDesign
                                        size={Mixins.scaleSize(20)}
                                        style={styles.buttonIcon}
                                        name="contacts" />
                                    <Text style={styles.buttonText}>{Dictionary.MY_NUMBER_BTN}</Text>
                                </TouchItem>
                                <TouchItem
                                    style={styles.contactButton}
                                    onPress={this.handleSelectContact}>
                                    <Icon.AntDesign
                                        size={Mixins.scaleSize(20)}
                                        style={styles.buttonIcon}
                                        name="contacts" />
                                    <Text style={styles.buttonText}>{Dictionary.FROM_DEVICE_BTN}</Text>
                                </TouchItem>
                            </View>
                        </View>
                        {this.state.recent_transactions.length > 0 && (
                            <View>
                                <View style={FormStyle.formItem}>
                                    <Text style={FormStyle.sectionLabel}>{Dictionary.RECENT_TRANSACTIONS}</Text>
                                </View>
                                <View style={FormStyle.formItem}>
                                    {this.state.recent_transactions.map((transaction, index) => {
                                        let isEven = index % 2 === 0;
                                        return <RecentTransaction
                                            key={index}
                                            initialsBackgroundColor={isEven ? Colors.LIGHT_GREEN_BG : Colors.LIGHT_ORANGE_BG}
                                            initialsTextColor={isEven ? Colors.CV_GREEN : Colors.CV_YELLOW}
                                            customerName={transaction.customerName}
                                            customerId={transaction.customerId}
                                            transactionAmount={transaction.amount}
                                            onPress={() => {
                                                this.setState({
                                                    phone_number: transaction.customerId,
                                                    phone_number_error: ''
                                                }, () => this.handleSubmit());
                                            }}
                                        />
                                    })}
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
                </ScrollView>
                <ActionSheet
                    options={this.getContactPhoneOptions()}
                    title={Dictionary.SELECT_PHONE}
                    show={this.state.show_phone_list}
                    onChange={(phone) => this.assertContactPhone(phone)}
                    close={() => this.setState({
                        show_phone_list: false
                    })} />
            </View>
        );
    }
}

const styles = StyleSheet.create({

    formButton: {
        marginHorizontal: Mixins.scaleSize(0),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    contactButton: {
        paddingVertical: Mixins.scaleSize(10),
        flexDirection: 'row',
        alignItems: 'center'
    },
    buttonIcon: {
        marginRight: Mixins.scaleSize(12),
        color: Colors.CV_YELLOW
    },
    buttonText: {
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.CV_YELLOW
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        airtime: state.airtime
    };
};

const mapDispatchToProps = {
    showToast,
    updateAirtimePurchase
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(AirtimeBeneficiary));