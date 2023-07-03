import React, { Component } from 'react';
import { BackHandler, ActivityIndicator, Text, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { showToast } from '_actions/toast_actions';
import { getBankOptions } from '_actions/config_actions';
import { getUserAccounts } from '_actions/payment_actions';

import { Dictionary } from '_utils';
import { Colors, SharedStyle, FormStyle } from '_styles';
import { SubHeader, ScrollView, FloatingLabelInput } from '_atoms';
import { MainHeader, Dropdown } from '_organisms';
import { PrimaryButton } from '_molecules';

import { Network } from '_services';

class AddAccount extends Component {
    state = {
        account_number: '',
        account_number_error: '',
        bank: '',
        bank_error: '',
        processing: false
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        if (this.props.config.banks.length === 0) {
            this.props.getBankOptions();
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            let working = this.props.config.loading_banks || this.state.processing;
            !working && this.props.navigation.goBack();

            return true;
        }
    }

    getDataFromBankConfig = () => {
        let options = this.props.config.banks.map(bank => {
            return {
                label: bank.name,
                value: bank.additional_code
            }
        })

        return options;
    }

    validate = () => {
        let is_valid = true;

        if (!this.state.account_number || this.state.account_number.length != 10) {
            this.setState({
                account_number_error: Dictionary.ENTER_VALID_NUBAN,
            });

            is_valid = false;
        }

        if (!this.state.bank) {
            this.setState({
                bank_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        return is_valid;
    }

    handleSubmit = () => {
        if (!this.validate()) {
            return;
        }
        this.props.showToast("No Api available yet");
        return;

        this.setState({ processing: true }, () => {
            let { account_number, bank } = this.state;
            Network.addUserBank(account_number, bank.value)
                .then(() => {
                    this.setState({ processing: false }, () => {
                        this.props.navigation.goBack();
                        this.props.getUserAccounts();
                    });
                })
                .catch((error) => {
                    this.setState({ processing: false }, () => {
                        this.props.showToast(error.message);
                    });
                });
        });
    }

    render() {
        let loading = this.props.config.banks.length === 0 && this.props.config.loading_banks;
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.ADD_ACCOUNT_HEADER} />
                <ScrollView {...this.props}>
                    {loading && (
                        <View style={SharedStyle.loaderContainer}>
                            <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                        </View>
                    )}
                    {!loading && (
                        <View style={{ flex: 1 }}>
                            <SubHeader text={Dictionary.ADD_ACCOUNT_SUB_HEADER} />
                            <View style={FormStyle.formContainer}>
                                <View style={FormStyle.formItem}>
                                    <FloatingLabelInput
                                        label={Dictionary.ACCOUNT_NUMBER_LABEL}
                                        value={this.state.account_number}
                                        keyboardType={'number-pad'}
                                        multiline={false}
                                        autoCorrect={false}
                                        maxLength={10}
                                        onChangeText={text => this.setState({
                                            account_number: text.replace(/\D/g, ''),
                                            account_number_error: ''
                                        })}
                                        editable={!this.state.processing}
                                    />
                                    <Text style={FormStyle.formError}>{this.state.account_number_error}</Text>
                                </View>
                                <View style={FormStyle.formItem}>
                                    <Dropdown
                                        options={this.getDataFromBankConfig()}
                                        value={''}
                                        title={Dictionary.BANK_LABEL}
                                        onChange={(obj) => {
                                            this.setState({
                                                bank: obj,
                                                bank_error: ''
                                            })
                                        }}>
                                        <FloatingLabelInput
                                            pointerEvents="none"
                                            label={Dictionary.BANK_LABEL}
                                            value={this.state.bank.label || ''}
                                            multiline={false}
                                            autoCorrect={false}
                                            editable={false}
                                        />
                                    </Dropdown>
                                    <Text style={FormStyle.formError}>{this.state.bank_error}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                    {!loading && (
                        <View style={SharedStyle.bottomPanel}>
                            <View style={FormStyle.formButton}>
                                <PrimaryButton
                                    loading={this.state.processing}
                                    title={Dictionary.ADD_ACCOUNT_BTN}
                                    icon="arrow-right"
                                    onPress={this.handleSubmit} />
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user,
        config: state.config
    };
};

const mapDispatchToProps = {
    showToast,
    getBankOptions,
    getUserAccounts
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(AddAccount));