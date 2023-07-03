import React, { Component } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { Dictionary, Util } from '_utils';
import { Mixins, SharedStyle, Typography } from '_styles';
import { ScrollView } from '_atoms';
import { MainHeader, SavingsCard } from '_organisms';

class ArchivedSavings extends Component {
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

    showSavingsDetail = (savings) => {
        this.props.navigation.navigate('SavingsDetail', { savings });
        Util.logEventData('investment_view_existing', { savings_id: savings.id });
    }

    render() {
        let { user_savings } = this.props.savings;
        const archived_savings = user_savings.filter((savings) => {
            return savings.archived;
        });

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader
                    leftIcon="arrow-left"
                    onPressLeftIcon={this.handleBackButton}
                    title={Dictionary.ARCHIVED_SAVINGS} />
                <ScrollView {...this.props}>
                    <View style={styles.savingsCards}>
                        {archived_savings.length === 0 && (
                            <View style={styles.noData}>
                                <Text style={styles.noDataText}>{Dictionary.NO_ARCHIVED_SAVINGS}</Text>
                            </View>
                        )}
                        {archived_savings.map((savings, index) => {
                            return <SavingsCard key={index} savings={savings} onPress={() => this.showSavingsDetail(savings)} />
                        })}
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    savingsCards: {
        ...Mixins.padding(24, 8, 24, 8),
        flexDirection: 'row',
        flexWrap: 'wrap'
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
        savings: state.savings
    };
};

export default connect(mapStateToProps)(withNavigationFocus(ArchivedSavings));