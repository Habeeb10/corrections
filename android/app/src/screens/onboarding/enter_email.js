import React, { Component } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { showToast } from '_actions/toast_actions';

import { Dictionary, Util ,ResponseCodes} from '_utils';
import { SharedStyle, Mixins, FormStyle } from '_styles';
import { SubHeader, ScrollView, FloatingLabelInput } from '_atoms';
import { MainHeader } from '_organisms';
import { PrimaryButton } from '_molecules';

import { Network } from '_services';

class EnterEmail extends Component {
    state = {
        email: this.props.user.user_data.email||"",
        email_error: '',
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

    handleSubmit = () => {
        if (!this.state.email || !Util.isValidEmail(this.state.email)) {
            this.setState({
                email_error: Dictionary.ENTER_VALID_EMAIL,
            });

            return;
        }

        this.setState({ processing: true }, () => {
            let { email } = this.state;
            Network.requestOtp(
                email,
                ResponseCodes.OTP_TYPE.REG,
                ResponseCodes.OTP_NOTIFICATION_TYPE.EMAIL
              ).then(() => {
                    this.setState({ processing: false }, () => {
                        this.props.navigation.navigate('ValidateEmail');
                        Util.logEventData('onboarding_email');
                    });
                }).catch((error) => {
                    this.setState({ processing: false }, () =>
                    this.props.showToast(error.message));
                });
        });
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.EMAIL_VERIFY} />
                <ScrollView {...this.props}>
                    <SubHeader text={Dictionary.VERIFICATION_EMAIL_HEADER} />
                    <View style={[FormStyle.formContainer, styles.formContainer]}>
                        <View style={FormStyle.formItem}>
                            <FloatingLabelInput
                            
                                label={Dictionary.EMAIL_ADDRESS_LABEL}
                                value={this.state.email}
                                keyboardType={'email-address'}
                                disable={false}
                                multiline={false}
                                autoCorrect={false}
                                onChangeText={text => this.setState({
                                    email: text,
                                    email_error: ''
                                })}
                                editable={false}
                            />
                            <Text style={FormStyle.formError}>{this.state.email_error}</Text>
                        </View>
                    </View>
                    <View style={SharedStyle.bottomPanel}>
                        <View style={FormStyle.formButton}>
                            <PrimaryButton
                                loading={this.state.processing}
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
    formContainer: {
        paddingBottom: Mixins.scaleSize(50)
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

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(EnterEmail));