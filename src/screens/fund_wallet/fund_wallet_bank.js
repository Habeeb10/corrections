import React, { Component } from 'react';
import { BackHandler, StyleSheet, Text, View, Image } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { showToast } from '_actions/toast_actions';

import { Dictionary } from '_utils';
import { Colors, Mixins, Typography, FormStyle, SharedStyle } from '_styles';
import { SubHeader } from '_atoms';
import { default as ScrollView } from '_atoms/scroll_view';

import { MainHeader } from '_organisms';

class FundWalletBank extends Component {
    state = {
        bank_options: [
            {
                bank_name: 'Guaranty Trust Bank',
                account_name: 'CreditVille Limited',
                account_number: '1010118512',
                image: require('../../assets/images/shared/gtb.png')
            },
            {
                bank_name: 'First Bank of Nigeria',
                account_name: 'CreditVille Limited',
                account_number: '2121229623',
                image: require('../../assets/images/shared/first_bank.png')
            }
        ]
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
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

    render() {
        let { bank_options } = this.state;

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.FUND_WALLET_HEADER} />
                <ScrollView {...this.props}>
                    <SubHeader text={Dictionary.FUND_WITH_OUR_BANK_SUB_HEADER} />
                    <View style={FormStyle.formContainer}>
                        {bank_options.map((bank, index) => {
                            return <View key={index} style={SharedStyle.section}>
                                <View style={SharedStyle.row}>
                                    <View>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.BANK_LABEL}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{bank.bank_name}</Text>
                                    </View>
                                    <View>
                                        <Image style={styles.bankIcon} source={bank.image} />
                                    </View>
                                </View>
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.fullColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.ACCOUNT_NAME_LABEL}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{bank.account_name}</Text>
                                    </View>
                                </View>
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.fullColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.ACCOUNT_NUMBER_LABEL}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{bank.account_number}</Text>
                                    </View>
                                </View>
                            </View>
                        })}
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    bankIcon: {
        width: Mixins.scaleSize(45),
        height: Mixins.scaleSize(45)
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        wallet: state.wallet
    };
};

const mapDispatchToProps = {
    showToast
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(FundWalletBank));