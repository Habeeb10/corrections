import React, { Component } from 'react';
import { BackHandler, StyleSheet, ImageBackground, View, Text } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { showToast } from '_actions/toast_actions';
import { getBankOptions } from '_actions/config_actions';
import { getTransferBeneficiaries, resetFundsTransfer } from '_actions/transfer_actions';

import { Dictionary } from '_utils';
import { Colors, Mixins, FormStyle, SharedStyle, Typography } from '_styles';
import { ScrollView } from '_atoms';
import { PrimaryButton } from '_molecules';
import { MainHeader } from '_organisms';

class Transfers extends Component {
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        //this.props.getTransferBeneficiaries(this.props.user.user_data.bvn);
        if (this.props.config.banks.length === 0) {
            this.props.getBankOptions();
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

    initiateTransfer = () => {
        // if (this.props.wallet.wallet_data_error) {
        //     this.props.showToast(this.props.wallet.wallet_data_error);
        // } else {
            // this.props.resetFundsTransfer();
            this.props.navigation.navigate('TransferAmount');
        //}
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.TRANSFERS} />
                <ScrollView {...this.props}>
                    <ImageBackground
                        style={styles.container}
                        imageStyle={{
                            bottom: Mixins.scaleSize(60)
                        }}
                        source={require('../../assets/images/shared/happy_phone_presser.png')}
                        resizeMode={'cover'}>
                        <Text style={styles.header}>
                            {Dictionary.FUNDS_TRANSFER_HEADER}
                        </Text>
                        <Text style={styles.subheader}>
                            {Dictionary.FUNDS_TRANSFER_SUB_HEADER}
                        </Text>
                        <View style={[SharedStyle.bottomPanel, styles.bottomPanel]}>
                            <View style={FormStyle.formButton}>
                                <PrimaryButton
                                    title={Dictionary.CONTINUE_BTN}
                                    icon="arrow-right"
                                    onPress={this.initiateTransfer} />
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
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        wallet: state.wallet,
        config: state.config
    };
};

const mapDispatchToProps = {
    showToast,
    getBankOptions,
    getTransferBeneficiaries,
    resetFundsTransfer
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Transfers));