import React, { Component } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, Text, View, Image } from 'react-native';
import { withNavigationFocus } from "react-navigation";

import { Dictionary } from '_utils';
import { Colors, Mixins, SharedStyle } from '_styles';
import { SubHeader, TouchItem } from '_atoms';
import { default as ScrollView } from '_atoms/scroll_view';
import { MainHeader } from '_organisms';

import { Network } from '_services';

class USSDPayment extends Component {
    constructor(props) {
        super(props);

        const navigation = this.props.navigation;
        const page_header = navigation.getParam('page_header');
        const amount = navigation.getParam('amount');
        const transaction_type = navigation.getParam('transaction_type');
        const success_message = navigation.getParam('success_message');

        this.state = {
            amount: Math.ceil(Number(amount)),
            page_header,
            transaction_type,
            success_message,
            ussd_options: [],
            transaction_id: null,
            processing: false
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

        this.getUSSDCodes();
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

    getUSSDCodes = () => {
        this.setState({
            processing: true
        }, () => {
            Network.getTransactionUSSDCodes(this.state.amount, this.state.transaction_type)
                .then((result) => {
                    this.setState({
                        processing: false,
                        transaction_id: result.data.id,
                        ussd_options: result.data.ussds
                    });
                }).catch((error) => {
                    this.setState({ processing: false }, () => {
                        this.props.navigation.navigate('Error', { error_message: error.message })
                    });
                });
        });
    }

    payWithUSSD = (ussd_option) => {
        let dial_code = ussd_option.ussd;
        if (Platform.OS === 'android') {
            dial_code = `tel:${encodeURIComponent(dial_code)}`;
        } else {
            dial_code = `telprompt:${dial_code}`;
        }

        const { transaction_id, success_message, amount } = this.state;
        this.props.navigation.navigate('USSDProcessor', {
            transaction_id,
            dial_code,
            success_message,
            amount,
            event_name: this.getEventName()
        });
    };

    getEventName = () => {
        const { transaction_type } = this.state;
        switch (transaction_type) {
            case 'wallet':
                return 'wallet_top_up_with_ussd';
            default:
                return null;
        }
    }

    render() {
        let { page_header, ussd_options } = this.state;

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={page_header} />
                <ScrollView {...this.props} hasButtomButtons={true}>
                    <SubHeader text={Dictionary.USSD_PAYMENT_SUB_HEADER} />
                    {this.state.processing && (
                        <View style={SharedStyle.loaderContainer}>
                            <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                        </View>
                    )}
                    {!this.state.processing && (
                        <View style={styles.ussdOptions}>
                            {ussd_options.map((option, index) => {
                                return <TouchItem
                                    key={index}
                                    onPress={() => this.payWithUSSD(option)}
                                    style={[styles.ussdOption, index === ussd_options.length - 1 ? { borderBottomWidth: Mixins.scaleSize(0) } : {}]}>
                                    <View style={styles.bankIconContainer}>
                                        <Image
                                            style={styles.bankIcon}
                                            source={{ uri: option.url }} />
                                    </View>
                                    <View style={styles.ussdTextContainer}>
                                        <Text
                                            numberOfLines={1}
                                            style={[SharedStyle.normalText, styles.ussdText]}>
                                            {option.code_description}
                                        </Text>
                                    </View>
                                    <View style={styles.ussdIconContainer}>
                                        <Image
                                            style={styles.ussdIcon}
                                            source={require('../../assets/images/shared/call.png')} />
                                    </View>
                                </TouchItem>
                            })}
                        </View>
                    )}
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    ussdOptions: {
        marginTop: Mixins.scaleSize(32),
        paddingHorizontal: Mixins.scaleSize(16)
    },
    ussdOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Mixins.scaleSize(12),
        borderBottomColor: Colors.FAINT_BORDER,
        borderBottomWidth: Mixins.scaleSize(1)
    },
    bankIconContainer: {
        width: '15%'
    },
    bankIcon: {
        width: Mixins.scaleSize(45),
        height: Mixins.scaleSize(45)
    },
    ussdIconContainer: {
        width: '10%'
    },
    ussdIcon: {
        width: Mixins.scaleSize(32),
        height: Mixins.scaleSize(32),
    },
    ussdTextContainer: {
        width: '75%',
        paddingHorizontal: Mixins.scaleSize(8)
    },
    ussdText: {
        color: Colors.DARK_GREY
    }
});

export default withNavigationFocus(USSDPayment);