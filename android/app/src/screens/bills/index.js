import React, { Component } from 'react';
import { BackHandler, StyleSheet, ActivityIndicator, ImageBackground, View, Text } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { showToast } from '_actions/toast_actions';
import { getBillerCategories, resetBillPayment } from '_actions/bills_actions';

import { Dictionary } from '_utils';
import { Colors, Mixins, SharedStyle, FormStyle, Typography } from '_styles';
import { ScrollView } from '_atoms';
import { PrimaryButton } from '_molecules';
import { MainHeader } from '_organisms';

class Bills extends Component {
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        if (this.props.bills.categories.length === 0) {
            this.props.getBillerCategories();
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

    initiateBillPayment = () => {
        if (this.props.wallet.wallet_data_error) {
            this.props.showToast(this.props.wallet.wallet_data_error);
        } else {
            this.props.resetBillPayment();
            this.props.navigation.navigate('BillsCategory');
        }
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.BILL_PAYMENT} />
                {this.props.bills.loading_categories && (
                    <View style={SharedStyle.loaderContainer}>
                        <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                    </View>
                )}
                {!this.props.bills.loading_categories && (
                    <ScrollView {...this.props}>
                        <ImageBackground
                            style={styles.container}
                            source={require('../../assets/images/bills/bills_bg.png')}
                            resizeMode={'cover'}>
                            <Text style={styles.header}>
                                {Dictionary.BILL_PAYMENT_HEADER}
                            </Text>
                            <Text style={styles.subheader}>
                                {Dictionary.BILL_PAYMENT_SUB_HEADER}
                            </Text>
                            <View style={[SharedStyle.bottomPanel, styles.bottomPanel]}>
                                <View style={FormStyle.formButton}>
                                    <PrimaryButton
                                        title={Dictionary.CONTINUE_BTN}
                                        icon="arrow-right"
                                        onPress={this.initiateBillPayment} />
                                </View>
                            </View>
                        </ImageBackground>
                    </ScrollView>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        ...Mixins.margin(60, 20, 20, 20),
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(36),
        lineHeight: Mixins.scaleSize(42),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.CV_BLUE
    },
    subheader: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(16),
        lineHeight: Mixins.scaleSize(19),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.CV_BLUE,
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
        bills: state.bills
    };
};

const mapDispatchToProps = {
    showToast,
    getBillerCategories,
    resetBillPayment
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Bills));