import React, { Component } from 'react';
import { StyleSheet, BackHandler, View, Text, Image, FlatList } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import moment from 'moment';

import { getWalletTransactions } from '_actions/wallet_actions';

import { Dictionary, Util } from '_utils';
import { SharedStyle, Mixins, Colors, Typography } from '_styles';
import { ScrollView, TouchItem } from '_atoms';
import { MainHeader } from '_organisms';

class Transactions extends Component {
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        if (this.props.wallet.transaction_groups.length == 0) {
            this.props.getWalletTransactions(this.props.wallet.wallet_data.account_no);
        }
        Util.logEventData('transactions_view_all');
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

    renderTransactionGroup = ({ item }) => (
        <View>
            <Text style={styles.calendar}>{item.calendar_day}</Text>
            <FlatList
                data={item.transaction_data}
                renderItem={this.renderTransaction}
                keyExtractor={transaction => transaction.id}
            />
        </View>
    );

    renderTransaction = ({ item }) => {
        const transaction_type = item.transaction_type.toLowerCase();
        return <TouchItem
            style={[SharedStyle.section, styles.section]}
            onPress={() => {
                this.props.navigation.navigate('Receipt', { transaction_data: item, allow_back: true });
                Util.logEventData('transactions_view', { transaction_id: item.reference });
            }}>
            <View style={styles.row}>
                <View>
                    <Image
                        style={styles.icon}
                        source={transaction_type === 'debit' ?
                            require(`../../assets/images/transactions/debit.png`) :
                            transaction_type === 'credit' ?
                                require('../../assets/images/transactions/credit.png') : null}
                    />
                </View>
                <View style={styles.textContainer}>
                    <View style={styles.row}>
                        <Text numberOfLines={1} style={styles.reference}>
                            {item.reference || '- - -'}
                        </Text>
                        <Text numberOfLines={1} style={[styles.amount, styles[transaction_type]]}>
                            {`${transaction_type === 'debit' ? '-' : transaction_type === 'credit' ? '+' : ''}₦${Util.formatAmount(Math.abs(item.amount))}`}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text numberOfLines={2} style={styles.description}>
                            {item.purpose || item.description || '- - -'}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text numberOfLines={1} style={styles.time}>
                            {moment(item.transaction_date, 'YYYY-MM-DD HH:mm:ss').format('hh:mm a')}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchItem>
    }

    render() {
        const { transaction_groups } = this.props.wallet;

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.TRANSACTIONS} />
                {transaction_groups.length < 1 && (
                    <View style={SharedStyle.loaderContainer}>
                        <Text style={SharedStyle.normalText}>{Dictionary.NO_TRANSACTIONS}</Text>
                    </View>
                )}
                {transaction_groups.length > 0 && (
                    <ScrollView {...this.props}>
                        <View style={styles.formContainer}>
                            <FlatList
                                data={transaction_groups}
                                renderItem={this.renderTransactionGroup}
                                keyExtractor={group => group.calendar_day}
                            />
                        </View>
                    </ScrollView>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    formContainer: {
        ...Mixins.margin(20, 16, 0, 16)
    },
    calendar: {
        ...SharedStyle.normalText,
        color: Colors.LIGHT_GREY,
        marginTop: Mixins.scaleSize(20),
        marginBottom: Mixins.scaleSize(10)
    },
    section: {
        ...Mixins.padding(10),
        marginBottom: Mixins.scaleSize(10),
        borderColor: Colors.INPUT_BORDER,
        /// elevation: 0
    },
    row: {
        flexDirection: 'row'
    },
    icon: {
        width: Mixins.scaleSize(15),
        height: Mixins.scaleSize(15),
        marginRight: Mixins.scaleSize(10)
    },
    textContainer: {
        flex: 1
    },
    reference: {
        ...SharedStyle.normalText,
        ...Typography.FONT_MEDIUM,
        color: Colors.CV_BLUE,
        flex: 1
    },
    amount: {
        ...SharedStyle.normalText,
        ...Typography.FONT_BOLD,
        marginLeft: Mixins.scaleSize(5),
        textAlign: 'right'
    },
    credit: {
        color: Colors.SUCCESS
    },
    debit: {
        color: Colors.LOGOUT_RED
    },
    description: {
        ...SharedStyle.normalText,
        marginTop: Mixins.scaleSize(5),
        color: Colors.LIGHT_GREY,
        flex: 1
    },
    time: {
        ...Typography.FONT_REGULAR,
        color: Colors.LIGHT_GREY,
        fontSize: Mixins.scaleFont(12),
        lineHeight: Mixins.scaleSize(14),
        marginTop: Mixins.scaleSize(10)
    }
});

const mapStateToProps = (state) => {
    return {
        wallet: state.wallet,
    };
};

const mapDispatchToProps = {
    getWalletTransactions
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Transactions));