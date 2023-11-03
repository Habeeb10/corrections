import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import Modal from "react-native-modal";
import SmoothPinCodeInput from 'react-native-smooth-pincode-input';
import * as ExpoAuthentication from 'expo-local-authentication';
import { connect } from 'react-redux';

import { Dictionary } from '_utils';
import { Colors, Mixins, SharedStyle, FormStyle } from '_styles';
import { TouchItem } from '_atoms';
import { ActionButton } from '_molecules';

const PIN_AUTH_MODE = 'pin';
const BIOMETRIC_AUTH_MODE = 'biometrics';

class AuthorizeTransaction extends Component {
    state = {
        pin: '',
        biometrics_supported: false,
        biometrics_enabled: false,
        authorization_mode: PIN_AUTH_MODE
    };

    async componentDidMount() {
        this.initializeBiometrics();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.pinError && this.props.pinError) {
            this.setState({
                pin: ''
            })
        }
    }

    initializeBiometrics = async () => {
        let compatible = await ExpoAuthentication.hasHardwareAsync();
        if (!compatible) {
            return;
        }

        let isEnrolled = await ExpoAuthentication.isEnrolledAsync();
        if (!isEnrolled) {
            console.log('Biometrics not set up on device... Please check OS settings.');
        } else {
            this.setState({
                biometrics_supported: true,
                biometrics_enabled: this.props.settings.biometric_transaction && this.props.user.user_pin
            }, () => {
                if (this.state.biometrics_supported && this.state.biometrics_enabled) {
                    this.setState({ authorization_mode: BIOMETRIC_AUTH_MODE });
                }
            });
        }
    }

    scanBiometrics = async () => {
        let result = await ExpoAuthentication.authenticateAsync({
            promptMessage: Dictionary.CONFIRM_IDENTITY,
            cancelLabel: Dictionary.CANCEL_BTN,
            fallbackLabel: '',
            disableDeviceFallback: true
        });

        if (result.success) {
            this.props.onSubmit(this.props.user.user_pin);
        }
    }

    onChangePIN = (pin) => {
        this.setState({
            pin
        }, () => {
            this.props.resetError();
            if (pin.length === 4) {
                this.props.onSubmit(pin);
            }
        });
    }

    onCancel = () => {
        ExpoAuthentication.cancelAuthenticate();
        this.props.onCancel();
    }

    render() {
        let AUTH_MODE = this.state.authorization_mode;
        return (
            <Modal
                isVisible={this.props.isVisible}
                swipeDirection="down"
                onSwipeComplete={this.onCancel}
                onBackButtonPress={this.onCancel}
                animationInTiming={500}
                animationOutTiming={800}
                backdropTransitionInTiming={500}
                backdropTransitionOutTiming={800}
                useNativeDriver={true}
                style={SharedStyle.modal}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? "position" : ""}>
                    <View style={[SharedStyle.modalContent, SharedStyle.authModalContent, AUTH_MODE === PIN_AUTH_MODE ? { height: Mixins.scaleSize(320) } : {}]}>
                        <View style={SharedStyle.modalSlider} />
                        <View style={SharedStyle.modalPanel}>
                            <Text numberOfLines={1} style={SharedStyle.modalTop}>{this.props.title}</Text>
                            {AUTH_MODE === PIN_AUTH_MODE && (
                                <View>
                                    <View style={SharedStyle.modalMiddle}>
                                        {!!this.props.pinError && (
                                            <Text style={SharedStyle.pinError} numberOfLines={2}>{this.props.pinError}</Text>
                                        )}
                                        <View style={{ flex: 1, alignItems: 'center' }}>
                                            <Text style={SharedStyle.pinLabel}>{Dictionary.AUTH_WITH_PIN}</Text>
                                            <SmoothPinCodeInput
                                                animated={false}
                                                maskDelay={0}
                                                password
                                                mask={<View style={FormStyle.pinMask} />}
                                                codeLength={4}
                                                containerStyle={[FormStyle.pinContainer, styles.pinContainer]}
                                                cellStyle={[FormStyle.pinBox, styles.pinBox]}
                                                cellStyleFocused={FormStyle.activePinBox}
                                                cellSize={Mixins.scaleSize(54)}
                                                value={this.state.pin}
                                                autoFocus={false}
                                                onTextChange={pin => this.onChangePIN(pin)}
                                                editable={!this.props.isProcessing}
                                            />
                                        </View>
                                    </View>
                                    <View style={SharedStyle.modalBottom}>
                                        {this.props.isProcessing && (
                                            <ActivityIndicator style={styles.loader} size="large" color={Colors.CV_YELLOW} />
                                        )}
                                        {!this.props.isProcessing && (
                                            <ActionButton
                                                contentStyle={styles.button}
                                                disabled={this.props.isProcessing}
                                                title={Dictionary.CANCEL_BTN}
                                                color={Colors.CV_YELLOW}
                                                icon="close"
                                                onPress={this.onCancel} />
                                        )}
                                    </View>
                                </View>
                            )}
                            {AUTH_MODE === BIOMETRIC_AUTH_MODE && (
                                <View>
                                    <View style={SharedStyle.modalMiddle}>
                                        {!!this.props.pinError && (
                                            <Text style={SharedStyle.pinError} numberOfLines={2}>{this.props.pinError}</Text>
                                        )}
                                        <View style={SharedStyle.biometricText}>
                                            <Text style={SharedStyle.biometricMainText}>{Dictionary.CONFIRM_IDENTITY}</Text>
                                            <Text style={SharedStyle.biometricSubText}>{Dictionary.ACTIVATE_SENSOR}</Text>
                                        </View>
                                        <TouchItem
                                            style={SharedStyle.biometricIcon}
                                            onPress={this.scanBiometrics}
                                            disabled={this.props.isProcessing}>
                                            <Image
                                                style={SharedStyle.biometricIconImage}
                                                source={require('../../assets/images/shared/fingerprint.png')} />
                                        </TouchItem>
                                    </View>
                                    <View style={SharedStyle.modalBottom}>
                                        {this.props.isProcessing && (
                                            <ActivityIndicator style={styles.loader} size="large" color={Colors.CV_YELLOW} />
                                        )}
                                        {!this.props.isProcessing && (
                                            <ActionButton
                                                contentStyle={styles.button}
                                                disabled={this.props.isProcessing}
                                                title={Dictionary.USE_TXN_PIN_BTN}
                                                color={Colors.CV_YELLOW}
                                                icon="lock"
                                                onPress={() => {
                                                    this.setState({
                                                        authorization_mode: PIN_AUTH_MODE
                                                    });
                                                }} />
                                        )}
                                    </View>

                                </View>
                            )}
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    pinContainer: {
        ...Mixins.margin(0),
        width: '100%'
    },
    pinBox: {
        marginRight: Mixins.scaleSize(10)
    },
    button: {
        justifyContent: 'center'
    },
    loader: {
        marginTop: Mixins.scaleSize(10)
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        settings: state.settings
    };
};

export default connect(mapStateToProps)(AuthorizeTransaction);