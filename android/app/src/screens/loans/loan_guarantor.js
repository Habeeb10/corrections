import React, { Component } from 'react';
import { BackHandler, ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import * as Icon from '@expo/vector-icons';
import * as Permissions from 'expo-permissions';
import { selectContact } from 'react-native-select-contact';

import { showToast } from '_actions/toast_actions';
import { updateLoanApplicationData } from '_actions/user_actions';
import { getDropdownOptions } from '_actions/config_actions';

import { Dictionary, Util } from '_utils';
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from '_styles';
import { SubHeader, FloatingLabelInput, TouchItem, ProgressBar } from '_atoms';
import { default as ScrollView } from '_atoms/scroll_view';
import { PrimaryButton } from '_molecules';
import { MainHeader, Dropdown, ActionSheet } from '_organisms';

import { Network } from '_services';

class LoanGuarantor extends Component {
    constructor(props) {
        super(props);

        const payment_method = this.props.navigation.getParam('payment_method', {});
        const { guarantor } = this.props.user.loan_application;

        let first_name, last_name, phone_number, email, relationship;
        if (guarantor) {
            first_name = guarantor.first_name;
            last_name = guarantor.last_name;
            phone_number = guarantor.phone_number;
            email = guarantor.email;
            relationship = guarantor.relationship;
        }
        else {
            first_name = '';
            last_name = '';
            phone_number = '';
            email = '';
            relationship = '';
        }

        this.state = {
            payment_method,
            first_name,
            first_name_error: '',
            last_name,
            last_name_error: '',
            phone_number,
            phone_number_error: '',
            email,
            email_error: '',
            relationship,
            relationship_error: '',
            processing: false,
            contact_phones: [],
            show_phone_list: false
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        if (this.props.config.options.length === 0) {
            this.props.getDropdownOptions();
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

    getDataFromDropdownConfig = (key) => {
        let data = this.props.config.options.find(item => {
            return item.key === key;
        });

        let options = data ? data.options : [];
        options = options.map(item => {
            return {
                label: item.code_description,
                value: item.id,
            }
        })

        return options;
    }

    getDropDownOption = (key, value) => {
        let options = this.getDataFromDropdownConfig(key);
        let preferred = options.filter((option) => {
            return option.label.toLowerCase() === value.toLowerCase();
        });

        return preferred.length > 0 ? preferred[0] : '';
    }

    handleSelectContact = async () => {
        const { status } = await Permissions.askAsync(Permissions.CONTACTS);
        if (status === 'granted') {
            this.setState({ phone_number: '', contact_phones: [] });
            const contact = await selectContact();
            if (contact) {
                let email = '';
                if (contact.emails && contact.emails.length > 0) {
                    email = contact.emails[0].address
                }
                this.setState({
                    first_name: contact.givenName,
                    last_name: contact.familyName,
                    email
                }, () => {
                    let phones = Util.normalizeContactPhones(contact.phones);
                    if (phones.length === 1) {
                        this.assertContactPhone(phones[0]);
                    } else if (phones.length > 1) {
                        this.setState({
                            contact_phones: phones,
                            show_phone_list: true
                        });
                    }
                });
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

        if (!this.state.first_name) {
            this.setState({
                first_name_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.last_name) {
            this.setState({
                last_name_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!Util.isValidPhone(this.state.phone_number)) {
            this.setState({
                phone_number_error: Dictionary.ENTER_VALID_PHONE,
            });

            is_valid = false;
        }

        if (!this.state.email || !Util.isValidEmail(this.state.email)) {
            this.setState({
                email_error: Dictionary.ENTER_VALID_EMAIL,
            });

            is_valid = false;
        }

        if (!this.state.relationship) {
            this.setState({
                relationship_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        return is_valid;
    }

    handleSubmit = () => {
        if (!this.validate()) {
            return;
        }

        this.setState({
            processing: true
        }, () => {
            let { payment_method, first_name, last_name, phone_number, email, relationship } = this.state;
            let guarantor = { first_name, last_name, phone_number, email, relationship: relationship.label };

            Network.addLoanGuarantor(guarantor).then((result) => {
                guarantor.id = result.data.id;
                this.props.updateLoanApplicationData({ guarantor });

                this.setState({
                    processing: false
                }, () => {
                    this.props.navigation.navigate('LoanApplicationSummary', { payment_method });
                });
            }).catch((error) => {
                this.setState({
                    processing: false
                }, () => {
                    this.props.showToast(error.message);
                });
            });
        });
    }

    render() {
        let initializing = this.props.initializing;
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.LOAN_APPLICATION} />
                {initializing && (
                    <View style={SharedStyle.loaderContainer}>
                        <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                    </View>
                )}
                {!initializing && (
                    <ScrollView {...this.props} hasButtomButtons={true}>
                        <SubHeader text={Dictionary.GUARANTOR_HEADER} />
                        <ProgressBar progress={0.97} />
                        <View style={FormStyle.formContainer}>
                            <View style={FormStyle.formItem}>
                                <FloatingLabelInput
                                    label={Dictionary.FIRST_NAME_LABEL}
                                    value={this.state.first_name}
                                    multiline={false}
                                    autoCorrect={false}
                                    onChangeText={text => this.setState({
                                        first_name: text,
                                        first_name_error: ''
                                    })}
                                    editable={!this.state.processing}
                                />
                                <Text style={FormStyle.formError}>{this.state.first_name_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <FloatingLabelInput
                                    label={Dictionary.LAST_NAME_LABEL}
                                    value={this.state.last_name}
                                    multiline={false}
                                    autoCorrect={false}
                                    onChangeText={text => this.setState({
                                        last_name: text,
                                        last_name_error: ''
                                    })}
                                    editable={!this.state.processing}
                                />
                                <Text style={FormStyle.formError}>{this.state.last_name_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <FloatingLabelInput
                                    label={Dictionary.MOBILE_NUMBER_LABEL}
                                    value={this.state.phone_number}
                                    keyboardType={'number-pad'}
                                    multiline={false}
                                    maxLength={11}
                                    autoCorrect={false}
                                    onChangeText={text => this.setState({
                                        phone_number: text.replace(/\D/g,''),
                                        phone_number_error: ''
                                    })}
                                    editable={!this.state.processing}
                                />
                                <Text style={FormStyle.formError}>{this.state.phone_number_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <FloatingLabelInput
                                    label={Dictionary.EMAIL_ADDRESS_LABEL}
                                    value={this.state.email}
                                    keyboardType={'email-address'}
                                    multiline={false}
                                    autoCorrect={false}
                                    onChangeText={text => this.setState({
                                        email: text,
                                        email_error: ''
                                    })}
                                    editable={!this.state.processing}
                                />
                                <Text style={FormStyle.formError}>{this.state.email_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <Dropdown
                                    options={this.getDataFromDropdownConfig('relationship')}
                                    value={''}
                                    title={Dictionary.RELATIONSHIP_LABEL}
                                    onChange={(obj) => {
                                        this.setState({
                                            relationship: obj,
                                            relationship_error: ''
                                        })
                                    }}
                                    disabled={this.state.processing}>
                                    <FloatingLabelInput
                                        pointerEvents="none"
                                        label={Dictionary.RELATIONSHIP_LABEL}
                                        value={this.state.relationship.label || ''}
                                        multiline={false}
                                        autoCorrect={false}
                                        editable={false}
                                    />
                                </Dropdown>
                                <Text style={FormStyle.formError}>{this.state.relationship_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <View style={[FormStyle.formButton, styles.formButton]}>
                                    <TouchItem
                                        style={styles.contactButton}
                                        onPress={this.handleSelectContact}
                                        disabled={this.state.processing}>
                                        <Icon.AntDesign
                                            size={Mixins.scaleSize(20)}
                                            style={styles.buttonIcon}
                                            name="contacts" />
                                        <Text style={styles.buttonText}>{Dictionary.GET_CONTACT_BTN}</Text>
                                    </TouchItem>
                                </View>
                            </View>
                        </View>
                        <View style={SharedStyle.bottomPanel}>
                            <View style={FormStyle.formButton}>
                                <PrimaryButton
                                    loading={this.state.processing}
                                    title={Dictionary.CONTINUE_BTN}
                                    icon="arrow-right"
                                    onPress={this.handleSubmit} />
                            </View>
                        </View>
                    </ScrollView>
                )}
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
        marginHorizontal: Mixins.scaleSize(0)
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
        config: state.config,
        loans: state.loans,
        initializing: state.config.loading_options
    };
};

const mapDispatchToProps = {
    showToast,
    getDropdownOptions,
    updateLoanApplicationData
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(LoanGuarantor));