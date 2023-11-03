import React, { Component } from 'react';
import { BackHandler, StyleSheet, Text, View, ImageBackground, Linking } from 'react-native';
import { withNavigationFocus } from "react-navigation";

import { Colors, Mixins, Typography, SharedStyle, FormStyle } from '_styles';
import { default as ScrollView } from '_atoms/scroll_view';

import { PrimaryButton, SecondaryButton } from '_molecules';
import { MainHeader } from '_organisms';

import { Network } from '_services';
import { Dictionary } from '_utils';

class USSDProcessor extends Component {
    constructor(props) {
        super(props);

        const navigation = this.props.navigation;
        const transaction_id = navigation.getParam('transaction_id');
        const dial_code = navigation.getParam('dial_code');
        const success_message = navigation.getParam('success_message');
        const amount = navigation.getParam('amount');
        const event_name = navigation.getParam('event_name');


        this.state = {
            transaction_id,
            dial_code,
            success_message,
            amount,
            event_name,
            processing: false
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

        Linking.openURL(this.state.dial_code);
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

    verifyTransaction = () => {
        this.setState({
            processing: true
        }, () => {
            const { transaction_id, success_message, amount, event_name } = this.state;
            Network.getTransactionDetails(transaction_id).then((result) => {
                this.setState({
                    processing: false
                }, () => {
                    this.props.navigation.navigate('Success', {
                        event_name,
                        event_data: { amount },
                        success_message,
                        transaction_data: result.data
                    });
                });
            }).catch((error) => {
                this.setState({
                    processing: false
                }, () => {
                    this.props.navigation.navigate('Error', { error_message: error.message });
                });
            });
        });
    }

    render() {
        const { processing } = this.state;
        return (
            <View style={{ flex: 1 }}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.USSD_PAYMENT_SUB_HEADER} />
                <ScrollView {...this.props}>
                    <ImageBackground
                        style={styles.container}
                        imageStyle={{
                            bottom: Mixins.scaleSize(60)
                        }}
                        source={require('../../assets/images/shared/happy_phone_presser.png')}
                        resizeMode={'cover'}>
                        <Text style={styles.header}>
                            {Dictionary.USSD_PROCESSOR_HEADER}
                        </Text>
                        <View style={[SharedStyle.bottomPanel, styles.bottomPanel]}>
                            <View style={styles.buttons}>
                                <View style={FormStyle.formButton}>
                                    <SecondaryButton
                                        title={Dictionary.CANCEL_BTN}
                                        disabled={processing}
                                        onPress={() => this.handleBackButton()} />
                                </View>
                                <View style={FormStyle.formButton}>
                                    <PrimaryButton
                                        title={Dictionary.COMPLETED_BTN}
                                        loading={processing}
                                        onPress={() => this.verifyTransaction()} />
                                </View>
                            </View>
                        </View>
                    </ImageBackground>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        ...Mixins.margin(50, 20, 20, 20),
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(32),
        lineHeight: Mixins.scaleSize(40),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.WHITE
    },
    subheader: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(16),
        lineHeight: Mixins.scaleSize(17),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.WHITE,
        marginHorizontal: Mixins.scaleSize(20)
    },
    content: {
        flex: 1,
        paddingBottom: Mixins.scaleSize(65)
    },
    bottomPanel: {
        backgroundColor: Colors.WHITE
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.WHITE
    }
});

export default withNavigationFocus(USSDProcessor);