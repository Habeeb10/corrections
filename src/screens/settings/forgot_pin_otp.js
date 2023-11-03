import React, { Component } from 'react';
import { BackHandler, ActivityIndicator, Keyboard, StyleSheet, Text, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import SmoothPinCodeInput from 'react-native-smooth-pincode-input';
import CountDown from 'react-native-countdown-component';
// import SMSUserConsent from 'react-native-sms-user-consent';

import { showToast } from '_actions/toast_actions';

import { Dictionary, Util,ResponseCodes} from '_utils';
import { Colors, Mixins, SharedStyle, FormStyle } from '_styles';
import { SubHeader, ScrollView } from '_atoms';
import { MainHeader } from '_organisms';
import { PrimaryButton, ActionButton } from '_molecules';

import { Network } from '_services';

class ForgotPINOTP extends Component {
    state = {
        otp: '',
        otp_error: '',
        counting_down: true,
        countdown_id: 0,
        until: 60,
        loading: false,
        resending: false,
        validating:false,
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

        this.setState({ loading: true }, () => this.onSendOTP());
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
        this.removeSmsListener();
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

    onSendOTP = () => {
        let otpBvnPhone = Util.stripFirstZeroInPhone(this.props.user.user_data.phoneNumber);
        Network.requestOtp(
            otpBvnPhone,
            ResponseCodes.OTP_TYPE.REG,
            ResponseCodes.OTP_NOTIFICATION_TYPE.SMS,
            this.props.user.user_data.phoneNumber
          )
            .then(() => {
                this.setState({
                    loading: false,
                    resending: false,
                    countdown_id: ++this.state.countdown_id,
                    counting_down: true
                }, () => {
                    this.getSMSMessage();
                    this.props.showToast(Dictionary.OTP_SENT, false);
                });
            })
            .catch((error) => {
                this.setState({ resending: false }, () =>
                    this.props.showToast(error.message)
                );
            });
    }

    onChangeOTP = (otp) => {
        this.setState({
            otp,
            otp_error: ''
        }, () => {
            if (this.state.otp.length === 6) {
                this.handleSubmit();
            }
        })
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            let processing = this.state.loading || this.state.resending||this.state.validating;
            !processing && this.props.navigation.goBack();

            return true;
        }
    }

    handleResendOTP = () => {
        this.setState({ resending: true }, () => this.onSendOTP());
    }

    handleSubmit = () => {
        if (!this.state.otp || this.state.otp.length != 6) {
            this.setState({
                otp_error: Dictionary.ENTER_VALID_OTP,
            });

            return;
        }

        // Keyboard.dismiss();
        // this.removeSmsListener();

        
        this.setState({ validating: true }, () => {
            const phoneVal = Util.stripFirstZeroInPhone(this.props.user.user_data.phoneNumber);
        Network.validateOTP(
            phoneVal,
            this.state.otp,
            ResponseCodes.OTP_TYPE.REG,
            ResponseCodes.OTP_NOTIFICATION_TYPE.SMS,
            this.props.user.user_data.phoneNumber
          )
          .then((validationData)=>{
            this.setState(
                {
                  validating: false,
                },
                () => {
                    this.props.navigation.navigate('ResetPIN', { otp: this.state.otp });
                }
              );
          })
          .catch((error)=>{
            this.setState({ validating: false }, () =>
            this.props.showToast(error.message)
          );
          })


        
        })

       
    }

    render() {
        let processing = this.state.loading || this.state.resending||this.state.validating;
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.FORGOT_PIN_HEADER} />
                <ScrollView {...this.props}>
                    {this.state.loading && (
                        <View style={SharedStyle.loaderContainer}>
                            <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                        </View>
                    )}
                    {!this.state.loading && (
                        <View style={{ flex: 1 }}>
                            <SubHeader text={Dictionary.VALIDATE_MOBILE_HEADER} />
                            <View style={[FormStyle.formItem, { paddingTop: Mixins.scaleSize(16) }]}>
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
                                    editable={!processing}
                                    onTextChange={otp => this.onChangeOTP(otp)}
                                />
                                <Text style={[FormStyle.formError, styles.otpError]}>{this.state.otp_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <View style={FormStyle.formButtons}>
                                    <View style={[FormStyle.formButton, { flex: 5 }]}>
                                        <ActionButton
                                            loading={this.state.resending }
                                            disabled={processing}
                                            title={Dictionary.RESEND_SMS}
                                            color={this.state.counting_down ? Colors.LIGHT_GREY : Colors.CV_YELLOW}
                                            icon="speech"
                                            onPress={this.handleResendOTP} />
                                    </View>
                                    {this.state.counting_down && (<View style={FormStyle.formButton}>
                                        <CountDown
                                            until={this.state.until}
                                            id={'' + this.state.countdown_id}
                                            onFinish={() => {
                                                this.setState({
                                                    counting_down: false
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
                                        disabled={processing}
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
    showToast
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(ForgotPINOTP));