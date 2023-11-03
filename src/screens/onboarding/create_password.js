import React, { Component } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import * as Icon from '@expo/vector-icons';

import { showToast } from '_actions/toast_actions';
import { storeUserData, storeUserPwd } from '_actions/user_actions';
import { getDocuments } from '_actions/document_actions';

import { Dictionary } from '_utils';
import { Colors, Mixins, SharedStyle, FormStyle } from '_styles';
import { SubHeader, ScrollView, FloatingLabelInput, TouchItem } from '_atoms';
import { MainHeader } from '_organisms';
import { PrimaryButton, PasswordCriteria } from '_molecules';

import { Network } from '_services';

class CreatePassword extends Component {
    constructor(props) {
        super(props);

        const { navigation } = this.props;
        const phone_number = navigation.getParam('phone_number');
        const confirmation_id = navigation.getParam('confirmation_id');

        this.state = {
            phone_number,
            confirmation_id,
            password: '',
            secure_text: false,
            valid_password: false,
            is_length_error: true,
            is_uppercase_error: true,
            is_lowercase_error: true,
            is_symbol_error: true,
            processing: false
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
            secure_text: !this.state.secure_text
        });
    }

    onChangePassword = (password) => {
        this.setState({
            password,
        }, () => this.validate());
    }

    validate = () => {
        let is_length_error = false, is_uppercase_error = false, is_lowercase_error = false, is_symbol_error = false;
        let valid_password = true;
        if (this.state.password.length < 8) {
            is_length_error = true;
            valid_password = false;
        }

        let capital_reg = /[A-Z]/;
        if (!capital_reg.test(this.state.password)) {
            is_uppercase_error = true;
            valid_password = false;
        }

        let lower_reg = /[a-z]/;
        if (!lower_reg.test(this.state.password)) {
            is_lowercase_error = true;
            valid_password = false;
        }

        let special_reg = /[!@#$%^&*(),.?":{}|<>=&]/;
        if (!special_reg.test(this.state.password)) {
            is_symbol_error = true;
            valid_password = false;
        }

        this.setState({
            is_length_error,
            is_uppercase_error,
            is_lowercase_error,
            is_symbol_error,
            valid_password
        });
    }

    handleSubmit = () => {
        if (!this.state.valid_password) {
            return;
        }
        let { phone_number, password } = this.state;
        let user_data = {  };
        user_data.phone_number = phone_number;
        // user_data.session_id = result.session_id;
        this.props.storeUserData(user_data);
        this.props.storeUserPwd(password);
        // this.props.getDocuments();
        this.props.navigation.navigate('CreateUser');
      //  this.props.navigation.navigate('EnterBVN');
        // this.setState({ processing: true }, () => {
        //     Network.createPassword(phone_number, password, String(confirmation_id))
        //         .then((result) => {
        //             this.setState({
        //                 processing: false
        //             }, () => {
        //                 let user_data = { ...result.data };
        //                 user_data.phone_number = phone_number;
        //                 user_data.session_id = result.session_id;
        //                 this.props.storeUserData(user_data);
        //                 this.props.storeUserPwd(password);
        //                 this.props.getDocuments();
        //                 this.props.navigation.navigate('EnterBVN');
        //             });
        //         }).catch((error) => {
        //             this.setState({ processing: false }, () =>
        //                 this.props.showToast(error.message)
        //             );
        //         });
        // });
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.GET_STARTED_HEADER} />
                <ScrollView {...this.props}>
                    <SubHeader text={Dictionary.SIGN_UP_CREATE_PASSWORD_HEADER} />
                    <View style={FormStyle.formContainer}>
                        <View style={FormStyle.formItem}>
                            <FloatingLabelInput
                                style={{ paddingRight: Mixins.scaleSize(45) }}
                                label={Dictionary.PASSWORD_LABEL}
                                value={this.state.password}
                                secureTextEntry={!this.state.secure_text}
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
                                        name={this.state.secure_text ? 'ios-eye-off' : 'ios-eye'} />
                                </TouchItem>
                            )}
                        </View>
                    </View>
                    <View style={FormStyle.formItem}>
                        <View style={styles.criteria}>
                            <PasswordCriteria
                                lengthError={this.state.is_length_error}
                                uppercaseError={this.state.is_uppercase_error}
                                lowercaseError={this.state.is_lowercase_error}
                                symbolError={this.state.is_symbol_error}
                            />
                        </View>
                    </View>
                    <View style={SharedStyle.bottomPanel}>
                        <View style={FormStyle.formButton}>
                            <PrimaryButton
                                loading={this.state.processing}
                                disabled={this.state.processing}
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
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};

const mapDispatchToProps = {
    showToast,
    storeUserData,
    storeUserPwd,
    getDocuments
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(CreatePassword));