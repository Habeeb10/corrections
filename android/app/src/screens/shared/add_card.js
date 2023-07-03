import React, { Component } from 'react';
import { BackHandler, StyleSheet, Text, View, Image } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import RNPaystack from 'react-native-paystack';
import crashlytics from '@react-native-firebase/crashlytics';

import { showToast } from '_actions/toast_actions';
import { getUserCards } from '_actions/payment_actions';

import { Dictionary, Util,ResponseCodes } from '_utils';
import { SharedStyle, Mixins, FormStyle } from '_styles';
import { SubHeader, ScrollView, FloatingLabelInput } from '_atoms';
import { MainHeader } from '_organisms';
import { PrimaryButton } from '_molecules';

import { Network } from '_services';


class AddCard extends Component {
    state = {
        card_number: '',
        card_number_error: '',
        card_date: '',
        card_date_error: '',
        card_cvv: '',
        card_cvv_error: '',
        processing: false
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

    validate = () => {
        let is_valid = true;

        if (!this.state.card_number || !this.state.card_number.length >= 16) {
            this.setState({
                card_number_error: Dictionary.ENTER_VALID_CARD_NUMBER,
            });

            is_valid = false;
        }

        if (!this.state.card_date || this.state.card_date.length != 5) {
            this.setState({
                card_date_error: Dictionary.ENTER_VALID_CARD_DATE,
            });

            is_valid = false;
        }

        if (!this.state.card_cvv || this.state.card_cvv.length != 3) {
            this.setState({
                card_cvv_error: Dictionary.ENTER_VALID_CARD_CVV,
            });

            is_valid = false;
        }

        return is_valid;
    }

    chargeCard = (access_code) => {

        let date_data = this.state.card_date.split('/');
        let paystack_load = {
            cardNumber: this.state.card_number.replace(/\s+/g, '').trim(),
            expiryMonth: date_data[0],
            expiryYear: date_data[1],
            cvc: this.state.card_cvv,
            accessCode: access_code,
    //         email: 'chargeIOS@master.dev',
    //   amountInKobo: 500,
      //subAccount: 'ACCT_pz61jjjsslnx1d9',
            
        };

        RNPaystack.chargeCardWithAccessCode(paystack_load).then(result => {
            this.verifyCard(result);
        }).catch(error => {
            this.setState({ processing: false });

            let error_message = error.message;
            error_message = error_message.includes(':') ? error_message.substring(error_message.indexOf(':') + 1).trim() : error_message;

            this.props.showToast(error_message);
            crashlytics().recordError(error, 'Paystack Error');
        });
    }

    verifyCard = (result) => {
        Network.verifyAddCard(result.reference)
            .then((restData) => {
                // if(restData.responseCode==ResponseCodes.SUCCESS_CODE){
                // console.log("verifyAddCard",restData)

                    this.setState({ processing: false }, () => {
                        this.props.showToast("Card Added Successfully",false);
                        this.props.navigation.goBack();
                        this.props.getUserCards(this.props.user.user_data.id);
                    });
                   // return
                // }else{

                // this.setState({ processing: false }, () => {
                //     this.props.showToast(restData.responseMessage);
                // });

           // }
                
            })
            .catch((error) => {
                console.log("error",error)
                this.setState({ processing: false }, () => {
                    this.props.showToast(error.message||"Error adding card");
                });
            });
    }

    handleSubmit = () => {
        if (!this.validate()) {
            return;
        }

        this.setState({ processing: true }, () => {

            let payload={
                customerId:this.props.user.user_data.id,
                accountId:this.props.user.wallet_id,
                //accountId:"12330015129",
                
                amount:"50"
            }
            Network.initAddCard(payload)
                .then((result) => {
                    this.chargeCard(result.transactionResponse.data.access_code);
                })
                .catch((error) => {
                    this.setState({ processing: false }, () => {
                        this.props.showToast(error.message);
                    });
                });
        });
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.ADD_CARD_HEADER} />
                <ScrollView {...this.props}>
                    <SubHeader text={Dictionary.ADD_CARD_SUB_HEADER} />
                    <View style={FormStyle.formContainer}>
                        <View style={FormStyle.formItem}>
                            <FloatingLabelInput
                                label={Dictionary.CARD_NUMBER_LABEL}
                                value={this.state.card_number}
                                keyboardType={'number-pad'}
                                multiline={false}
                                autoCorrect={false}
                                maxLength={23}
                                onChangeText={text => this.setState({
                                    card_number: Util.spacifyToken(text, 4),
                                    card_number_error: ''
                                })}
                                editable={!this.state.processing}
                            />
                            <Text style={FormStyle.formError}>{this.state.card_number_error}</Text>
                        </View>
                        <View style={styles.parallelFields}>
                            <View style={[FormStyle.formItem, { flex: 1, marginRight: Mixins.scaleSize(7), marginBottom: 0 }]}>
                                <FloatingLabelInput
                                    label={Dictionary.CARD_EXPIRY_LABEL}
                                    value={this.state.card_date}
                                    keyboardType={'number-pad'}
                                    multiline={false}
                                    autoCorrect={false}
                                    maxLength={5}
                                    onChangeText={text => this.setState({
                                        card_date: Util.toCardDateInput(text),
                                        card_date_error: ''
                                    })}
                                    editable={!this.state.processing}
                                />
                                <Text style={FormStyle.formError}>{this.state.card_date_error}</Text>
                            </View>
                            <View style={[FormStyle.formItem, { flex: 1, marginLeft: Mixins.scaleSize(7), marginBottom: 0 }]}>
                                <FloatingLabelInput
                                    label={Dictionary.CARD_CVV_LABEL}
                                    value={this.state.card_cvv}
                                    secureTextEntry={true}
                                    keyboardType={'number-pad'}
                                    multiline={false}
                                    autoCorrect={false}
                                    maxLength={3}
                                    onChangeText={text => this.setState({
                                        card_cvv: text.replace(/\D/g, ''),
                                        card_cvv_error: ''
                                    })}
                                    editable={!this.state.processing}
                                />
                                <Text style={FormStyle.formError}>{this.state.card_cvv_error}</Text>
                            </View>
                        </View>
                        <View style={[styles.secureBadge]}>
                            <Image
                                style={styles.secureImage}
                                source={require('../../assets/images/shared/paystack_badge.png')}
                            />
                        </View>
                    </View>
                    <View style={SharedStyle.bottomPanel}>
                        <View style={FormStyle.formButton}>
                            <PrimaryButton
                                loading={this.state.processing}
                                title={Dictionary.ADD_CARD_BTN}
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

    parallelFields: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    secureBadge: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    secureImage: {
        width: '50%',
        height: Mixins.scaleSize(50),
        resizeMode: 'contain'
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};

const mapDispatchToProps = {
    showToast,
    getUserCards
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(AddCard));