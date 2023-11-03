import React, { Component } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import SmoothPinCodeInput from 'react-native-smooth-pincode-input';

import { showToast } from '_actions/toast_actions';
import { storeUserPin } from '_actions/user_actions';

import { Dictionary } from '_utils';
import { SharedStyle, Mixins, FormStyle } from '_styles';
import { SubHeader, ScrollView } from '_atoms';
import { MainHeader } from '_organisms';
import { PrimaryButton } from '_molecules';

import { Network } from '_services';

class ResetPIN extends Component {
    constructor(props) {
        super(props);

        const { navigation } = this.props;
        const otp = navigation.getParam('otp');

        this.state = {
            otp,
            pin: '',
            pin_error: '',
            processing: false
        }
    }

    onChangePIN = (pin) => {
        this.setState({
            pin,
            pin_error: ''
        });
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            !this.state.processing && this.props.navigation.navigate('Settings');

            return true;
        }
    }

    handleSubmit = () => {
        if (!this.state.pin || this.state.pin.length != 4) {
            this.setState({
                pin_error: Dictionary.ENTER_VALID_PIN,
            });

            return;
        }

        this.setState({ processing: true }, () => {
            Network.resetPIN(this.state.otp, this.state.pin)
                .then((result) => {
                    this.setState({
                        processing: false
                    }, () => {
                        this.props.storeUserPin(this.state.pin);
                        this.handleBackButton();
                        this.props.showToast(result.message, false);
                    });
                }).catch((error) => {
                    this.setState({
                        processing: false
                    }, () =>
                        this.props.showToast(error.message));
                });
        });
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.FORGOT_PIN_HEADER} />
                <ScrollView {...this.props}>
                    <SubHeader text={Dictionary.CHANGE_PIN_SUB_HEADER} />
                    <View style={FormStyle.formContainer}>
                        <View style={FormStyle.formItem}>
                            <Text style={[FormStyle.inputLabel, { ...Mixins.margin(0) }]}>{Dictionary.ENTER_PIN}</Text>
                        </View>
                        <View style={FormStyle.formItem}>
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
                            />
                            <Text style={[FormStyle.formError, styles.pin_error]}>{this.state.pin_error}</Text>
                        </View>
                    </View>
                    <View style={SharedStyle.bottomPanel}>
                        <View style={FormStyle.formButton}>
                            <PrimaryButton
                                loading={this.state.processing}
                                title={Dictionary.SAVE_PIN_BTN}
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
    pinContainer: {
        ...Mixins.margin(0),
        width: '100%',
        justifyContent: 'center'
    },
    pinBox: {
        marginRight: Mixins.scaleSize(17)
    },
    pin_error: {
        textAlign: 'center',
        marginVertical: Mixins.scaleSize(10)
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};

const mapDispatchToProps = {
    showToast,
    storeUserPin
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(ResetPIN));