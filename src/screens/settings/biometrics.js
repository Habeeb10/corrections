import React, { Component } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import SwitchToggle from '@dooboo-ui/native-switch-toggle';

import { showToast } from '_actions/toast_actions';
import { setBiometricLogin, setBiometricTransaction } from '_actions/settings_actions';
import { storeUserPin } from '_actions/user_actions';

import { Dictionary } from '_utils';
import { Colors, Mixins, SharedStyle, FormStyle } from '_styles';
import { ScrollView } from '_atoms';
import { MainHeader, AuthorizeTransaction } from '_organisms';

import { Network } from '_services';

class Biometrics extends Component {
    state = {
        processing: false,
        auth_screen_visible: false
    };

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

        const user_pin = this.props.user.user_pin;
        if (!user_pin && this.props.settings.biometric_transaction) {
            // Force to disabled if no user pin is present in store
            this.props.setBiometricTransaction(false);
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

    handleToggleBiometricTransaction = () => {
        if (this.props.settings.biometric_transaction) {
            this.props.setBiometricTransaction(false);
        } else {
            this.setState({
                auth_screen_visible: true,
                pin_error: ''
            });
        }
    }

    validateBiometricPin = (pin) => {
        this.setState({ processing: true }, () => {
            Network.validatePIN(pin)
                .then(() => {
                    this.props.storeUserPin(pin);
                    this.props.setBiometricTransaction(true);
                    this.setState({
                        processing: false,
                        auth_screen_visible: false
                    });
                }).catch((error) => {
                    this.setState({
                        processing: false,
                        pin_error: error.message
                    });
                });
        });
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.BIOMETRICS_HEADER} />
                <ScrollView {...this.props}>
                    <View style={FormStyle.formContainer}>
                        <View style={[SharedStyle.section, styles.section]}>
                            <View style={styles.sectionHead}>
                                <Text style={[SharedStyle.normalText, styles.sectionTitle]}>{Dictionary.BIOMETRIC_LOGIN_TITLE}</Text>
                                <SwitchToggle
                                    containerStyle={FormStyle.switchContainer}
                                    circleStyle={FormStyle.switchCircle}
                                    switchOn={this.props.settings.biometric_login}
                                    onPress={() => this.props.setBiometricLogin(!this.props.settings.biometric_login)}
                                    backgroundColorOn={Colors.GREEN}
                                    backgroundColorOff={Colors.LIGHT_GREY}
                                    circleColorOff={Colors.WHITE}
                                    circleColorOn={Colors.WHITE}
                                    duration={100} />
                            </View>
                            <View>
                                <Text style={[SharedStyle.normalText, styles.sectionBody]}>{Dictionary.BIOMETRIC_LOGIN_DESCRIPTION}</Text>
                            </View>
                        </View>
                        <View style={[SharedStyle.section, styles.section]}>
                            <View style={styles.sectionHead}>
                                <Text style={[SharedStyle.normalText, styles.sectionTitle]}>{Dictionary.BIOMETRIC_TRANSACTION_TITLE}</Text>
                                <SwitchToggle
                                    containerStyle={FormStyle.switchContainer}
                                    circleStyle={FormStyle.switchCircle}
                                    switchOn={this.props.settings.biometric_transaction}
                                    onPress={this.handleToggleBiometricTransaction}
                                    backgroundColorOn={Colors.GREEN}
                                    backgroundColorOff={Colors.LIGHT_GREY}
                                    circleColorOff={Colors.WHITE}
                                    circleColorOn={Colors.WHITE}
                                    duration={100} />
                            </View>
                            <View>
                                <Text style={[SharedStyle.normalText, styles.sectionBody]}>{Dictionary.BIOMETRIC_TRANSACTION_DESCRIPTION}</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                {this.state.auth_screen_visible && (
                    <AuthorizeTransaction
                        user={this.props.user}
                        settings={this.props.settings}
                        title={Dictionary.ENABLE_BIOMETRIC_TRANSACTIONS}
                        isVisible={this.state.auth_screen_visible}
                        isProcessing={this.state.processing}
                        pinError={this.state.pin_error}
                        resetError={() => this.setState({ pin_error: '' })}
                        onSubmit={this.validateBiometricPin}
                        onCancel={() => this.setState({ auth_screen_visible: false })}
                    />
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    section: {
        paddingBottom: Mixins.scaleSize(16),
        backgroundColor: Colors.WHITE,
        /// elevation: 2
        borderWidth: Mixins.scaleSize(2),
    },
    sectionHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Mixins.scaleSize(20)
    },
    sectionTitle: {
        color: Colors.DARK_GREY
    },
    sectionBody: {
        color: Colors.LIGHT_GREY
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        settings: state.settings
    };
};

const mapDispatchToProps = {
    showToast,
    setBiometricLogin,
    setBiometricTransaction,
    storeUserPin
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Biometrics));