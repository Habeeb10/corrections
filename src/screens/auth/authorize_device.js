import React, { Component } from 'react';
import { BackHandler, ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import SmoothPinCodeInput from 'react-native-smooth-pincode-input';
import CountDown from 'react-native-countdown-component';
// import SMSUserConsent from 'react-native-sms-user-consent';

import { showToast } from '_actions/toast_actions';
import { registerSessionListener, storeUserData, storeUserPwd, clearUserPin, resetLoanApplicationData } from '_actions/user_actions';

import { Dictionary,Util ,ResponseCodes} from '_utils';
import { Colors, Mixins, SharedStyle, FormStyle } from '_styles';
import { SubHeader, ScrollView, FloatingLabelInput } from '_atoms';
import { MainHeader } from '_organisms';
import { PrimaryButton, ActionButton } from '_molecules';

import { Network } from '_services';

class AuthorizeDevice extends Component {
    constructor(props) {
        super(props);

        const { navigation } = this.props;
        const phone_number = navigation.getParam('phone_number');
        const password = navigation.getParam('password');

        this.state = {
            phone_number,
            password,
            otp: '',
            otpError: '',
            countingDown: true,
            countdownId: 0,
            until: 60,
            loading: false,
            resending: false,
            validating: false
        }
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        this.loadActivationToken();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
        this.removeSmsListener();
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            let working = this.state.loading || this.state.resending || this.state.validating;
            !working && this.props.navigation.goBack();

            return true;
        }
    }

    loadActivationToken = () => {
        this.setState({ loading: true }, () => this.getActivationToken());
    }

    getActivationToken = () => {
        
        const phoneVal = Util.stripFirstZeroInPhone(this.state.phone_number);
        Network.requestOtp(phoneVal,ResponseCodes.OTP_TYPE.REG,
            ResponseCodes.OTP_NOTIFICATION_TYPE.SMS)
            .then(() => {
                this.setState({
                    loading: false,
                    resending: false,
                    countdownId: ++this.state.countdownId,
                    countingDown: true
                }, () => {
                    this.getSMSMessage();
                    this.props.showToast(Dictionary.OTP_SENT, false);
                });
            })
            .catch((error) => {
                this.setState({
                    loading: false,
                    resending: false
                }, () => {
                    this.handleBackButton();
                    this.props.showToast(error.message);
                });
            });
    }

    handleResendOTP = () => {
        this.setState({ resending: true }, () => this.getActivationToken());
    }

    getSMSMessage = async () => {
        /* this.removeSmsListener();
        try {
            const { receivedOtpMessage } = await SMSUserConsent.listenOTP();
            this.onChangeOTP(receivedOtpMessage.match(/\d{6}/g)[0]);
        } catch (e) {
            console.log(e);
        } */
    }

    removeSmsListener = () => {
        /* try {
            SMSUserConsent.removeOTPListener();
        } catch (e) {
            console.log(e);
        } */
    }

    onChangeOTP = (otp) => {
        this.setState({
            otp,
            otpError: ''
        }, () => {
            if (this.state.otp.length === 6) {
                this.handleSubmit();
            }
        })
    }

    handleSubmit = () => {
        if (!this.state.otp || this.state.otp.length != 6) {
            this.setState({
                otpError: Dictionary.ENTER_VALID_OTP,
            });

            return;
        }

        this.removeSmsListener();

        this.setState({ validating: true }, () => {

            const phoneVal = Util.stripFirstZeroInPhone(this.state.phone_number);
      Network.validateOTP(
        phoneVal,
        this.state.otp,
        ResponseCodes.OTP_TYPE.REG,
        ResponseCodes.OTP_NOTIFICATION_TYPE.SMS
      )

      .then((validationData) => {
            Network.activateDevice(this.state.phone_number)
                .then((result) => {
                    this.props.showToast(Dictionary.AUTHORIZE_DEVICE_SUCCESS, false);
                    this.props.navigation.navigate("Password")
                    // let user_data = { ...result.data };
                    // user_data.phone_number = this.state.phone_number;
                    // user_data.session_id = result.session_id;

                    // this.props.registerSessionListener(user_data);
                    // this.props.storeUserData(user_data);
                    // this.props.storeUserPwd(this.state.password);
                    // this.props.clearUserPin();
                    // this.props.resetLoanApplicationData();
                    // this.routeToPage(result.data);
                })
                .catch((error) => {
                    this.setState({
                        validating: false
                    }, () => {
                        this.props.showToast(error.message);
                    });
                });

            })
            .catch((error) => {
              this.setState({ validating: false }, () =>
                this.props.showToast(error.message)
              );
            });
        });
    }

    routeToPage = (user_data) => {
        let { stage_id, activated } = user_data;
        let target;
        if (activated === 1) {
            target = 'Dashboard';
        } else if (stage_id === 1) {
            target = 'EnterBVN';
        } else if (stage_id === 5) {
            target = 'CreatePIN';
        } else {
            target = 'Dashboard';
        }

        this.setState({ validating: false }, () => { this.props.navigation.navigate(target) });
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.ACTIVATE_DEVICE_HEADER} />
                <ScrollView {...this.props}>
                    {this.state.loading && (
                        <View style={SharedStyle.loaderContainer}>
                            <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                        </View>
                    )}
                    {!this.state.loading && (
                        <View style={{ flex: 1 }}>
                            <SubHeader text={Dictionary.VALIDATE_MOBILE_HEADER} />
                            <View style={FormStyle.formContainer}>
                                <View style={FormStyle.formItem}>
                                    <FloatingLabelInput
                                        label={Dictionary.MOBILE_NUMBER_LABEL}
                                        value={this.state.phone_number}
                                        keyboardType={'number-pad'}
                                        multiline={false}
                                        autoCorrect={false}
                                        maxLength={11}
                                        editable={false}
                                    />
                                </View>
                            </View>
                            <View style={FormStyle.formItem}>
                                <Text style={FormStyle.inputLabel}>{Dictionary.ENTER_OTP}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <SmoothPinCodeInput
                                    animated={false}
                                    maskDelay={0}
                                    password
                                    mask={<View style={FormStyle.pinMask} />}
                                    codeLength={6}
                                    containerStyle={FormStyle.pinContainer}
                                    cellStyle={FormStyle.pinBox}
                                    cellStyleFocused={FormStyle.activePinBox}
                                    cellSize={Mixins.scaleSize(54)}
                                    value={this.state.otp}
                                    autoFocus={false}
                                    onTextChange={otp => this.onChangeOTP(otp)}
                                />
                                <Text style={[FormStyle.formError, styles.otpError]}>{this.state.otpError}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <View style={FormStyle.formButtons}>
                                    <View style={[FormStyle.formButton, { flex: 5 }]}>
                                        <ActionButton
                                            loading={this.state.resending}
                                            disabled={this.state.validating || this.state.resending || this.state.countingDown}
                                            title={Dictionary.RESEND_SMS}
                                            color={this.state.countingDown ? Colors.LIGHT_GREY : Colors.CV_YELLOW}
                                            icon="speech"
                                            onPress={this.handleResendOTP} />
                                    </View>
                                    {this.state.countingDown && (<View style={FormStyle.formButton}>
                                        <CountDown
                                            until={this.state.until}
                                            id={'' + this.state.countdownId}
                                            onFinish={() => {
                                                this.setState({
                                                    countingDown: false
                                                });
                                            }}
                                            size={10}
                                            digitStyle={styles.countdownBackground}
                                            digitTxtStyle={styles.countdown}
                                            timeToShow={['M', 'S']}
                                            timeLabels={{ m: null, s: null }}
                                            showSeparator
                                            separatorStyle={styles.countdown}
                                        />
                                    </View>
                                    )}
                                </View>
                            </View>
                            <View style={SharedStyle.bottomPanel}>
                                <View style={FormStyle.formButton}>
                                    <PrimaryButton
                                        loading={this.state.validating}
                                        disabled={this.state.resending}
                                        title={Dictionary.CONTINUE_BTN}
                                        icon="arrow-right"
                                        onPress={this.handleSubmit} />
                                </View>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    otpError: {
        marginHorizontal: Mixins.scaleSize(16)
    },
    countdownBackground: {
        backgroundColor: 'transparent'
    },
    countdown: {
        textAlign: 'right',
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.LIGHT_GREY
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};

const mapDispatchToProps = {
    showToast,
    registerSessionListener,
    storeUserData,
    storeUserPwd,
    clearUserPin,
    resetLoanApplicationData
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(AuthorizeDevice));