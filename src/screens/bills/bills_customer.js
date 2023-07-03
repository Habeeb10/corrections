import React, { Component } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { updateBillPayment } from '_actions/bills_actions';

import { Dictionary, Util } from '_utils';
import { SharedStyle, Mixins, FormStyle } from '_styles';
import { SubHeader, FloatingLabelInput, ProgressBar } from '_atoms';
import { default as ScrollView } from '_atoms/scroll_view';
import { PrimaryButton } from '_molecules';
import { MainHeader, Dropdown } from '_organisms';

class BillsCustomer extends Component {
    state = {
        packages: [],
        customer_id: '',
        customer_id_error: '',
        current_package: '',
        current_package_error: '',
        new_package: '',
        new_package_error: '',
        transaction_amount: '',
        transaction_amount_error: '',
        initial_amount: "",
        commaValues: ""
    };

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

        const packages = this.props.navigation.getParam('packages');
        const { bill_payment } = this.props.bills;
        this.setState({
            packages
        }, () => {
            this.setState({
                new_package: this.getDropDownOption(bill_payment.bill_package.billerName),
                transaction_amount: bill_payment.bill_package.amount || '',
                initial_amount: bill_payment.bill_package.amount || ''
            });
        });
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

    getDataFromBillerPackages = () => {
        let options = this.state.packages;

        options = options.map(bill_package => {
            return {
                ...bill_package,
                label: bill_package.billerName,
                value: bill_package.billerName
            }
        });
// console.log("dsduipe",options)
        return options;
    }

    getDropDownOption = (value) => {
        let options = this.getDataFromBillerPackages();
        let preferred = options.filter((option) => {
            return option.value === value;
        });

        return preferred.length > 0 ? preferred[0] : '';
    }

    validate = () => {
        let is_valid = true;

        if (!this.state.new_package) {
            this.setState({
                new_package_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.customer_id) {
            this.setState({
                customer_id_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!Util.isValidAmount(this.state.transaction_amount)) {
            this.setState({
                transaction_amount_error: Dictionary.ENTER_VALID_AMOUNT
            });

            is_valid = false;
        }

        if (Number(this.state.transaction_amount) < 500) {
            this.setState({
                transaction_amount_error: Dictionary.MINIMUM_AMOUNT_BILLS
            });

            is_valid = false;
        }

        return is_valid;
    }

    handleSubmit = () => {
        if (!this.validate()) {
            return;
        }

        let { customer_id, current_package, new_package, transaction_amount } = this.state;
        let customer = { customer_id, current_package };
        this.props.updateBillPayment({ customer, bill_package: new_package, transaction_amount });
        this.props.navigation.navigate('BillsSummary');
    }

    handleOnchangeText = (text) => {
        // remove any commas from the current value
        const currentValue = text.replace(/,/g, '');
        
        const removeDecimals = currentValue.replace(/\D/g, '');

        // add commas every three digits
        const formattedValue = removeDecimals.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
        // const formatDecimal = _d.length < 2 ? formattedValue : `${text}`

        this.setState({
            transaction_amount: text.replace(/\D/g, ''),
            transaction_amount_error: '',
            commaValues: formattedValue
        })
    }

    render() {
        let { initial_amount } = this.state;
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.BILL_PAYMENT} />
                <ScrollView {...this.props} hasButtomButtons={true}>
                    <SubHeader text={Dictionary.PAYER_SUB_HEADER} />
                    <ProgressBar progress={0.8} />
                    <View style={FormStyle.formContainer}>
                        <View style={FormStyle.formItem}>
                            <Dropdown
                                options={this.getDataFromBillerPackages()}
                                value={''}
                                title={Dictionary.NEW_PACKAGE_LABEL}
                                onChange={(obj) => {
                                    this.setState({
                                        new_package: obj,
                                        new_package_error: '',
                                        transaction_amount: obj?.amount
                                    })
                                }}>
                                <FloatingLabelInput
                                    pointerEvents="none"
                                    label={Dictionary.NEW_PACKAGE_LABEL}
                                    value={this.state.new_package.label || ''}
                                    multiline={false}
                                    autoCorrect={false}
                                    editable={false}
                                />
                            </Dropdown>
                            <Text style={FormStyle.formError}>{this.state.new_package_error}</Text>
                        </View>
                        <View style={FormStyle.formItem}>
                            <FloatingLabelInput
                                //label={this.state.new_package.label_name}
                                label={"Unique Number"}
                                value={this.state.customer_id}
                                multiline={false}
                                autoCorrect={false}
                                onChangeText={text => this.setState({
                                    customer_id: text,
                                    customer_id_error: ''
                                })}
                            />
                            <Text style={FormStyle.formError}>{this.state.customer_id_error}</Text>
                        </View>
                        <View style={FormStyle.formItem}>
                            <FloatingLabelInput
                                label={Dictionary.AMOUNT_LABEL}
                                value={initial_amount === "0" ? this.state.commaValues : this.state.transaction_amount }
                                keyboardType={'number-pad'}
                                multiline={false}
                                autoCorrect={false}
                                onChangeText={this.handleOnchangeText}
                                // onChangeText={text => this.setState({
                                //     transaction_amount: text.replace(/\D/g, ''),
                                //     transaction_amount_error: ''
                                // })}
                                disabled={this.state.new_package.amount}
                                editable={initial_amount === "0" ? true : false}
                                selectTextOnFocus={initial_amount === "0" ? true : false}
                            />
                            <Text style={FormStyle.formError}>{this.state.transaction_amount_error}</Text>
                        </View>

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
            </View>
        );
    }
}

const styles = StyleSheet.create({
    formButton: {
        marginHorizontal: Mixins.scaleSize(0)
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        bills: state.bills
    };
};

const mapDispatchToProps = {
    updateBillPayment
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(BillsCustomer));