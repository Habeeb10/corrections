import React, { Component } from 'react';
import { BackHandler, StyleSheet, ActivityIndicator, Text, View, ImageBackground } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import * as Icon from '@expo/vector-icons';

import { showToast } from '_actions/toast_actions';
import { getUserSavings, getSavingsProducts, resetSavingsApplicationData, updateSavingsApplicationData } from '_actions/savings_actions';

import { Dictionary, Util } from '_utils';
import { Colors, Mixins, SharedStyle, Typography } from '_styles';
import { SubHeader, ScrollView, TouchItem } from '_atoms';
import { MainHeader, NewSavings, SavingsCard } from '_organisms';

class Savings extends Component {
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        this.props.getSavingsProducts();
        if (this.props.savings.user_savings.length === 0) {
            this.props.getUserSavings(this.props.user.user_data.bvn);
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

    handleAddSavingsPlan = () => {
        this.props.navigation.navigate('SavingsAmount');
    }

    showSavingsDetail = (savings) => {
        this.props.navigation.navigate('SavingsDetail', { savings });
        Util.logEventData('investment_view_existing', { savings_id: savings.id });
    }

    render() {
        let { user_savings } = this.props.savings;
        const active_savings = user_savings.filter((savings) => {
            return !savings.archived;
        });

        let saved_total;
        let has_savings = user_savings.length > 0;
        if (has_savings) {
            saved_total = user_savings.reduce((sum, savings) => { return sum + Number(savings.balance) }, 0);
        }

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader
                    leftIcon="arrow-left"
                    onPressLeftIcon={this.handleBackButton}
                    title={this.props.loading_savings ? Dictionary.SAVINGS : has_savings ? Dictionary.SAVINGS : Dictionary.NEW_SAVINGS}
                    backgroundStyle={has_savings ? { backgroundColor: Colors.ORANGE_HEADER_BG } : {}} />
                {this.props.loading_savings && (
                    <View style={[SharedStyle.loaderContainer,{ backgroundColor:"rgba(0,0,0,0.3)"}]}>
                        <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                    </View>
                )}
                {!this.props.loading_savings && (
                    <ScrollView {...this.props}>
                        {!has_savings && (
                            <View>
                                <SubHeader text={Dictionary.CHOOSE_SAVINGS_PLAN} />
                                <NewSavings onSelectOffer={this.handleAddSavingsPlan} />
                            </View>
                        )}
                        {has_savings && (
                            <View>
                                <ImageBackground
                                    style={styles.savingsSummary}
                                    source={require('../../assets/images/savings/summary_bg.png')}
                                    resizeMode={'cover'}>
                                    <Text style={styles.totalSavingsLabel}>
                                        {Dictionary.SAVED_TOTAL}
                                    </Text>
                                    <Text style={styles.totalSavingsValue}>
                                        ₦{Util.formatAmount(saved_total)}
                                    </Text>
                                    <TouchItem
                                        style={styles.archivedSavings}
                                        onPress={() => this.props.navigation.navigate('ArchivedSavings')}>
                                        <Icon.MaterialIcons name={'history'} size={Mixins.scaleFont(22)} color={Colors.WHITE} />
                                        <Text style={styles.archivedSavingsText}>{Dictionary.ARCHIVED_SAVINGS_BTN}</Text>
                                    </TouchItem>
                                </ImageBackground>
                                <View style={styles.savingsCards}>
                                    {active_savings.length === 0 && (
                                        <View style={styles.noData}>
                                            <Text style={styles.noDataText}>{Dictionary.NO_ACTIVE_SAVINGS}</Text>
                                        </View>
                                    )}
                                    {active_savings.filter(s => s.status === 1).map((savings, index) => {
                                        return <SavingsCard key={index} savings={savings} onPress={() => this.showSavingsDetail(savings)} />
                                    })}
                                </View>
                            </View>
                        )}
                    </ScrollView>
                )}
                {!this.props.loading_savings && has_savings && (
                    <TouchItem style={styles.floatingButton} onPress={() => this.props.navigation.navigate('NewSavingsPlan')}>
                        <Icon.Entypo
                            size={Mixins.scaleSize(25)}
                            style={styles.floatingButtonIcon}
                            name="plus" />
                    </TouchItem>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    savingsSummary: {
        ...Mixins.padding(32, 16, 28, 16),
        height: Mixins.scaleSize(200)
    },
    totalSavingsLabel: {
        ...SharedStyle.normalText,
        color: Colors.WHITE,
        marginBottom: Mixins.scaleSize(12)
    },
    totalSavingsValue: {
        ...Typography.FONT_BOLD,
        fontSize: Mixins.scaleFont(28),
        lineHeight: Mixins.scaleSize(33),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.WHITE,
        marginBottom: Mixins.scaleSize(40)
    },
    archivedSavings: {
        ...Mixins.padding(12, 22, 12, 22),
        flexDirection: 'row',
        alignSelf: 'flex-start',
        alignItems: 'center',
        borderColor: Colors.WHITE,
        borderWidth: Mixins.scaleSize(1),
        borderRadius: Mixins.scaleSize(4)
    },
    archivedSavingsText: {
        ...SharedStyle.normalText,
        color: Colors.WHITE,
        marginLeft: Mixins.scaleSize(10)
    },
    savingsCards: {
        ...Mixins.padding(24, 8, 24, 8),
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    floatingButton: {
        width: Mixins.scaleSize(50),
        height: Mixins.scaleSize(50),
        marginBottom: Mixins.scaleSize(20),
        backgroundColor: Colors.CV_BLUE,
        borderRadius: Mixins.scaleSize(50),
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: Mixins.scaleSize(16),
        bottom: Mixins.scaleSize(0),
        elevation: 3
    },
    floatingButtonIcon: {
        color: Colors.WHITE
    },
    noData: {
        flex: 1,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    noDataText: {
        ...Typography.normalText,
        opacity: 0.8
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        savings: state.savings,
        loading_savings: (state.savings.savings_products.length < 1 && state.savings.loading_savings_products) || state.savings.loading_user_savings
    };
};

const mapDispatchToProps = {
    showToast,
    getUserSavings,
    getSavingsProducts,
    resetSavingsApplicationData,
    updateSavingsApplicationData
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Savings));