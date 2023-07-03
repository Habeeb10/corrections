import React, { Component } from 'react';
import { BackHandler, ImageBackground, StyleSheet, View, Text, Image } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { getUserWallet } from '_actions/wallet_actions';

import { Dictionary, Util } from '_utils';
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from '_styles';
import { ScrollView } from '_atoms';
import { PrimaryButton, SecondaryButton } from '_molecules';

class Success extends Component {
    constructor(props) {
        super(props);

        const navigation = this.props.navigation;
        const success_message = navigation.getParam('success_message', Dictionary.GENERAL_SUCCESS);
        const transaction_data = navigation.getParam('transaction_data');
        const transaction_payload = navigation.getParam('transaction_payload');
        const event_name = navigation.getParam('event_name');
        const event_data = navigation.getParam('event_data');

        this.state = {
            success_message,
            transaction_data,
            transaction_payload,
            event_name,
            event_data
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        this.props.getUserWallet();
        const { event_name, event_data } = this.state;
        if (event_name) {
            Util.logEventData(event_name, event_data);
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            this.props.navigation.navigate('Dashboard');

            return true;
        }
    }

    handleShowReceipt = () => {
        this.props.navigation.navigate('Receipt', {transaction_payload: this.state.transaction_payload ,  transaction_data: this.state.transaction_data });
    }

    render() {
        const { success_message, transaction_data } = this.state;

        return (
            <View style={SharedStyle.mainContainer}>
                <ScrollView {...this.props} hasNavBar={false}>
                    <ImageBackground
                        style={styles.container}
                        source={require('../../assets/images/shared/success_bg.png')}
                        resizeMode={'cover'}>
                        <View style={styles.content}>
                            <Image
                                style={styles.icon}
                                source={require('../../assets/images/shared/success_icon.png')}
                            />
                            <View style={styles.message}>
                                <Text style={styles.messageHeader}>{Dictionary.SUCCESS_HEADER}</Text>
                                <Text style={styles.messageDescription}>{success_message}</Text>
                            </View>
                        </View>
                        <View style={styles.buttonPanel}>
                            <View style={styles.pane}>
                                {!transaction_data && (
                                    <View style={styles.buttons}>
                                        <View style={FormStyle.formButton}>
                                            <PrimaryButton
                                                title={Dictionary.TO_DASHBOARD_BTN}
                                                onPress={() => this.handleBackButton()}
                                                icon="arrow-right" />
                                        </View>
                                    </View>
                                )}
                                {!!transaction_data && (
                                    <View style={styles.buttons}>
                                        <View style={FormStyle.formButton}>
                                            <SecondaryButton
                                                title={Dictionary.SHARE_RECEIPT_BTN}
                                                onPress={() => this.handleShowReceipt()} />
                                        </View>
                                        <View style={FormStyle.formButton}>
                                            <PrimaryButton
                                                title={Dictionary.TO_DASHBOARD_BTN}
                                                onPress={() => this.handleBackButton()} />
                                        </View>
                                    </View>
                                )}
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
    content: {
        ...Mixins.margin(100, 20, 0, 20),
        flexDirection: 'row',
        paddingBottom: Mixins.scaleSize(70)
    },
    icon: {
        width: Mixins.scaleSize(60),
        height: Mixins.scaleSize(60),
        marginRight: Mixins.scaleSize(20)
    },
    message: {
        width: '80%'
    },
    messageHeader: {
        ...Typography.FONT_BOLD,
        fontSize: Mixins.scaleFont(30),
        lineHeight: Mixins.scaleSize(35),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.WHITE,
        marginBottom: Mixins.scaleSize(12)
    },
    messageDescription: {
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.WHITE
    },
    buttonPanel: {
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        width: '100%'
    },
    pane: {
        flex: 1,
        width: '100%',
        alignItems: 'center'
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 0,
        height: Mixins.scaleSize(70),
        backgroundColor: Colors.WHITE
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        documents: state.documents
    };
};

const mapDispatchToProps = {
    getUserWallet
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Success));