import React, { Component } from 'react';
import { BackHandler, StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { withNavigationFocus } from "react-navigation";
import * as Icon from '@expo/vector-icons';

import { showToast } from '_actions/toast_actions';
import { clearUserPwd, storeUserData, storeUserPwd } from '_actions/user_actions';

import { Dictionary, Util } from '_utils';
import { Colors, Mixins, SharedStyle, FormStyle, Typography } from '_styles';
import { SubHeader, ScrollView, FloatingLabelInput, TouchItem } from '_atoms';
import { MainHeader } from '_organisms';
import { PrimaryButton, PasswordCriteria } from '_molecules';

import { Network } from '_services';

class ResetPassword extends Component {
    constructor(props) {
        super(props);

        const { navigation } = this.props;
        const phone_number = navigation.getParam('phone_number');
        const otp = navigation.getParam('otp');
        const is_system_upgrade = navigation.getParam("is_system_upgrade") || false;
        const bvn_data = navigation.getParam("bvn_data") ?? {};


        this.state = {
            is_system_upgrade,
            phone_number,
            otp,
            password: '',
            current_password: '',
            secureText: false,
            secureCurrentText: false,
            validPassword: false,
            isLengthError: true,
            isUppercaseError: true,
            isLowercaseError: true,
            isSymbolError: true,
            processing: false,
            bvn_data,
        }
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            !this.state.processing && this.props.navigation.navigate('Login');

            return true;
        }
    }

    toggleSecureText = () => {
        this.setState({
            secureText: !this.state.secureText
        });
    }

    toggleCurrentSecureText = () => {
        this.setState({
            secureCurrentText: !this.state.secureCurrentText
        });
    }

    onChangePassword = (password) => {
        this.setState({
            password,
        }, () => this.validate());
    }

    onChangeCurrentPassword = (current_password) => {
        this.setState({
            current_password,
        }, () => this.validate());
    }

    validate = () => {
        let isLengthError = false, isUppercaseError = false, isLowercaseError = false, isSymbolError = false;
        let validPassword = true;
        if (this.state.password.length < 8) {
            isLengthError = true;
            validPassword = false;
        }

        let capitalReg = /[A-Z]/;
        if (!capitalReg.test(this.state.password)) {
            isUppercaseError = true;
            validPassword = false;
        }

        let lowerReg = /[a-z]/;
        if (!lowerReg.test(this.state.password)) {
            isLowercaseError = true;
            validPassword = false;
        }

        let specialReg = /[!@#$%^&*(),.?":{}|<>=&]/;
        if (!specialReg.test(this.state.password)) {
            isSymbolError = true;
            validPassword = false;
        }

        this.setState({
            isLengthError,
            isUppercaseError,
            isLowercaseError,
            isSymbolError,
            validPassword
        });
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            !this.state.processing && this.props.navigation.goBack();

            return true;
        }
    }

    handleSubmit = () => {
        if (!this.state.validPassword) {
            return;
        }
        let { phone_number, password, otp,is_system_upgrade, bvn_data } = this.state;
        const phoneVal = Util.stripFirstZeroInPhone(phone_number);
        this.setState({ processing: true }, () => { 
            if (is_system_upgrade) {
                Network.setFirstTimePassword(phone_number, password, bvn_data?.bvn, otp)
                  .then(() => {
                    Network.authenticateUser(
                      phone_number,
                      password,
                      "6.465422",
                      "3.406448"
                    ).then((result) => {
                      let user_data = { ...result, activated: "", stage_id: "" };
                      user_data.phoneNumber = phone_number;
        
                      this.props.storeUserData(user_data);
                      this.props.storeUserPwd(password);
        
                      // if (phone_number !== previous_user) {
                      //     this.props.clearUserPin();
                      //     this.props.resetLoanApplicationData();
                      // }
        
                      this.setState({ processing: false }, () => {
                        this.props.showToast(Dictionary.RESET_COMPLETE, false);
                        this.props.navigation.navigate("CreatePIN", {
                          is_system_upgrade: true,
                          bvn_data,
                          phone_number,
                        });                      
                      });
                    }).catch((e) => {
                        this.setState({ processing: false }, () => {
                            this.props.showToast(Dictionary.GENERAL_ERROR)
                        })
                    })
                  })
                  .catch((error) => {
                    this.setState({ processing: false }, () => {
                      this.props.showToast(error.message);
                    });
                });
            } else {
                Network.resetPassword(phone_number, password, otp)
                .then(() => {
                    this.setState({
                        processing: false
                    }, () => {
                        this.props.clearUserPwd();
                        this.props.storeUserData({ phone_number });
                       
                        Util.logEventData('onboarding_reset');
                        this.props.showToast(Dictionary.RESET_COMPLETE, false);
                        this.props.navigation.navigate('Password', {
                            phone_number
                        });
                        // this.props.navigation.navigate('Login');
                    });
                }).catch((error) => {
                    this.setState({ processing: false }, () => {
                        this.props.showToast(error.message);
                        // if (error.message.includes('OTP')) { // ???
                        //     this.props.navigation.goBack();
                        // }
                    });
                });
            }
        });
    }

    render() {
        let { is_system_upgrade } = this.state;
        return (
            <View style={SharedStyle.mainContainer}>
                {is_system_upgrade ? (
                    <MainHeader
                        backgroundStyle={{
                            backgroundColor: Colors.WHITE,
                            ...Mixins.boxShadow(Colors.WHITE),
                        }}
                        textColor="#090A0A"
                        title={""}
                        // leftIcon="arrow-left"
                        // onPressLeftIcon={this.handleBackButton}
                        // title={""}
                        // textColor="#090A0A"
                        // backgroundStyle={{
                        // backgroundColor: Colors.WHITE,
                        // ...Mixins.boxShadow(Colors.WHITE),
                        // }}
                    />
                ) : (
                    <MainHeader
                        leftIcon="arrow-left"
                        onPressLeftIcon={this.handleBackButton}
                        title={Dictionary.GET_STARTED_HEADER}
                    />
                )}
                <ScrollView {...this.props}>
                    {!is_system_upgrade && (
                        <SubHeader text={Dictionary.SIGN_UP_CREATE_PASSWORD_HEADER} />
                    )}
                    {is_system_upgrade && (
                        <View style={FormStyle.formContainer}>
                            <Text style={styles.password}>Create new password</Text>
                            <Text style={styles.enter}>
                                Set new password
                            </Text>
                        </View>
                    )}
                    <View style={FormStyle.formContainer}>
                       {/* {is_system_upgrade && (
                        <View style={FormStyle.formItem}>
                            <FloatingLabelInput
                                style={{ paddingRight: Mixins.scaleSize(45) }}
                                label={Dictionary.OLD_PASSWORD_LABEL}
                                value={this.state.current_password}
                                secureTextEntry={!this.state.secureCurrentText}
                                multiline={false}
                                autoCorrect={false}
                                onChangeText={current_password => this.onChangeCurrentPassword(current_password)}
                                editable={!this.state.processing}
                            />
                            {!!this.state.current_password && (
                                <TouchItem
                                    style={styles.secureToggle}
                                    onPress={this.toggleCurrentSecureText}>
                                    <Icon.Ionicons
                                        style={styles.secureToggleIcon}
                                        size={Mixins.scaleSize(25)}
                                        name={this.state.secureCurrentText ? 'ios-eye-off' : 'ios-eye'} />
                                </TouchItem>
                            )}
                        </View>
                        )} */}
                        <View style={FormStyle.formItem}>
                            <FloatingLabelInput
                                style={{ paddingRight: Mixins.scaleSize(45) }}
                                label={is_system_upgrade ? Dictionary.NEW_PASSWORD_LABEL : Dictionary.PASSWORD_LABEL}
                                value={this.state.password}
                                secureTextEntry={!this.state.secureText}
                                multiline={false}
                                autoCorrect={false}
                                onChangeText={password => this.onChangePassword(password)}
                                editable={!this.state.processing}
                            />
                            {!!this.state.password && (
                                <TouchItem
                                    style={styles.secureToggle}
                                    onPress={this.toggleSecureText}>
                                    <Icon.Ionicons
                                        style={styles.secureToggleIcon}
                                        size={Mixins.scaleSize(25)}
                                        name={this.state.secureText ? 'ios-eye-off' : 'ios-eye'} />
                                </TouchItem>
                            )}
                        </View>
                    </View>
                    <View style={FormStyle.formItem}>
                        <View style={styles.criteria}>
                            <PasswordCriteria
                                lengthError={this.state.isLengthError}
                                uppercaseError={this.state.isUppercaseError}
                                lowercaseError={this.state.isLowercaseError}
                                symbolError={this.state.isSymbolError}
                            />
                        </View>
                    </View>
                    <View style={SharedStyle.bottomPanel}>
                        <View style={FormStyle.formButton}>
                            <PrimaryButton
                                loading={this.state.processing}
                                disabled={this.state.processing}
                                title={is_system_upgrade ? Dictionary.RESET : Dictionary.CONTINUE_BTN}
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
    secureToggle: {
        ...Mixins.padding(15),
        position: 'absolute',
        right: 0
    },
    secureToggleIcon: {
        color: Colors.CV_YELLOW
    },
    criteria: {
        ...Mixins.margin(30, 16, 30, 16),
        paddingBottom: Mixins.scaleSize(20)
    },
    password: {
        fontWeight: "700",
        fontSize: 32,
        color: Colors.CV_BLUE,
        paddingBottom: 8,
        ...Typography.FONT_REGULAR,
      },
      enter: {
        color: Colors.BLACK,
        fontSize: 16,
        ...Typography.FONT_REGULAR,
    },
});

const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};

const mapDispatchToProps = {
    showToast,
    clearUserPwd,
    storeUserData,
    storeUserPwd
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(ResetPassword));