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

class ChangePIN extends Component {
    state = {
        old_pin: '',
        old_pin_error: '',
        new_pin: '',
        new_pin_error: '',
        processing: false
    }

    onChangeOldPIN = (old_pin) => {
        this.setState({
            old_pin,
            old_pin_error: ''
        });
    }

    onChangeNewPIN = (new_pin) => {
        this.setState({
            new_pin,
            new_pin_error: ''
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
            !this.state.processing && this.props.navigation.goBack();

            return true;
        }
    }

    validatePINs = () => {
        let is_valid = true;
        if (!this.state.old_pin || this.state.old_pin.length != 4) {
            this.setState({
                old_pin_error: Dictionary.ENTER_VALID_PIN,
            });

            is_valid = false;
        }

        if (!this.state.new_pin || this.state.new_pin.length != 4) {
            this.setState({
                new_pin_error: Dictionary.ENTER_VALID_PIN,
            });

            is_valid = false;
        }

        if (this.state.old_pin && this.state.new_pin && (this.state.old_pin === this.state.new_pin)) {
            this.setState({
                new_pin_error: Dictionary.CYCLIC_PIN_CHANGE,
            });

            is_valid = false;
        }

        return is_valid;
    }

    handleSubmit = () => {
        if (!this.validatePINs()) {
            return;
        }

        this.setState({ processing: true }, () => {
            let { old_pin, new_pin } = this.state;
            Network.changePIN(old_pin, new_pin)
                .then((result) => {
                    this.setState({
                        processing: false
                    }, () => {
                        this.props.storeUserPin(new_pin);
                        this.handleBackButton();
                        this.props.showToast(result.message, false);
                    });
                })
                .catch((error) => {
                    this.setState({ processing: false }, () =>
                        this.props.showToast(error.message));
                });
        });
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.CHANGE_PIN_HEADER} />
                <ScrollView {...this.props} hasButtomButtons={true}>
                    <SubHeader text={Dictionary.CHANGE_PIN_SUB_HEADER} />
                    <View style={FormStyle.formContainer}>
                        <View style={FormStyle.formItem}>
                            <Text style={[FormStyle.inputLabel, { ...Mixins.margin(0) }]}>{Dictionary.OLD_PIN_LABEL}</Text>
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
                                value={this.state.old_pin}
                                autoFocus={false}
                                onTextChange={pin => this.onChangeOldPIN(pin)}
                            />
                            <Text style={[FormStyle.formError, styles.pin_error]}>{this.state.old_pin_error}</Text>
                        </View>
                        <View style={FormStyle.formItem}>
                            <Text style={[FormStyle.inputLabel, { ...Mixins.margin(0) }]}>{Dictionary.NEW_PIN_LABEL}</Text>
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
                                value={this.state.new_pin}
                                autoFocus={false}
                                onTextChange={pin => this.onChangeNewPIN(pin)}
                            />
                            <Text style={[FormStyle.formError, styles.pin_error]}>{this.state.new_pin_error}</Text>
                        </View>
                    </View>
                    <View style={SharedStyle.bottomPanel}>
                        <View style={FormStyle.formButton}>
                            <PrimaryButton
                                loading={this.state.processing}
                                disabled={this.props.processing}
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

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(ChangePIN));