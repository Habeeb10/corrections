import React, { Component } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import Modal from "react-native-modal";
import * as Icon from '@expo/vector-icons';

import { Colors, Mixins, SharedStyle } from '_styles';

import { Dictionary } from '_utils';
import { TouchItem } from '_atoms';
import PrimaryButton from './primary_button';

class PaymentOptions extends Component {
    state = {
        payment_method: {},
        payment_options: [
            {
                title: Dictionary.PAY_WITH_WALLET_OR_CARD,
                value: 'card',
                image: require('../../assets/images/shared/pay_with_card.png')
            },
            {
                title: Dictionary.PAY_WITH_USSD,
                value: 'ussd',
                image: require('../../assets/images/shared/pay_with_ussd.png')
            }
        ]
    }

    render() {
        let { payment_options } = this.state;
        return (
            <Modal
                isVisible={this.props.isVisible}
                swipeDirection="down"
                onSwipeComplete={this.props.onSwipeComplete}
                onBackButtonPress={this.props.onBackButtonPress}
                animationInTiming={500}
                animationOutTiming={500}
                backdropTransitionInTiming={500}
                backdropTransitionOutTiming={500}
                useNativeDriver={true}
                style={SharedStyle.modal}>
                <View style={[SharedStyle.modalContent, { height: Mixins.scaleSize(240) }]}>
                    <View style={SharedStyle.modalSlider} />
                    <View style={SharedStyle.modalPanel}>
                        <Text style={SharedStyle.modalTop}>{Dictionary.SELECT_PAYMENT_MODE}</Text>
                        <View style={SharedStyle.modalMiddle}>
                            {!!this.props.errorMessage && (
                                <Text style={SharedStyle.pinError} numberOfLines={2}>{this.props.errorMessage}</Text>
                            )}
                            <View style={{ flex: 1 }}>
                                {payment_options.map((option, index) => {
                                    return <TouchItem
                                        key={index}
                                        style={[styles.cancelOption,
                                        index === payment_options.length - 1 ? {
                                            borderBottomWidth: Mixins.scaleSize(0),
                                            marginBottom: Mixins.scaleSize(10)
                                        } : {}]}
                                        disabled={this.props.processing}
                                        onPress={() => this.setState({
                                            payment_method: option
                                        }, () => {
                                            this.props.onSelectPaymentMethod(option);
                                        })}>
                                        <View style={styles.optionContent}>
                                            <Image
                                                style={styles.optionIcon}
                                                source={option.image} />
                                            <Text style={[SharedStyle.normalText, styles.optionText]}>{option.title}</Text>
                                        </View>
                                        <View style={styles.checkbox}>
                                            {this.state.payment_method.value !== option.value && (
                                                <View style={styles.blank}></View>
                                            )}
                                            {this.state.payment_method.value === option.value && (
                                                <Icon.Ionicons name={'ios-checkmark-circle'} size={Mixins.scaleFont(22)} color={Colors.SUCCESS} />
                                            )}
                                        </View>
                                    </TouchItem>
                                })}
                            </View>
                        </View>
                    </View>
                </View>
                <View style={[SharedStyle.modalBottom, styles.modalBottom]}>
                    <PrimaryButton
                        title={Dictionary.CONTINUE_BTN}
                        icon="arrow-right"
                        onPress={this.props.onContinue}
                        loading={this.props.processing} />
                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    cancelOption: {
        paddingTop: Mixins.scaleSize(20),
        paddingBottom: Mixins.scaleSize(25),
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: Mixins.scaleSize(1),
        borderColor: Colors.LIGHT_BG
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%'
    },
    optionIcon: {
        width: Mixins.scaleSize(32),
        height: Mixins.scaleSize(32),
        marginRight: Mixins.scaleSize(16)
    },
    optionText: {
        color: Colors.DARK_GREY,
        height: Mixins.scaleSize(32),
        lineHeight: Mixins.scaleSize(32)
    },
    checkbox: {
        width: '10%'
    },
    blank: {
        width: Mixins.scaleSize(20),
        height: Mixins.scaleSize(20),
        backgroundColor: Colors.LIGHT_UNCHECKED_BG,
        borderRadius: Mixins.scaleSize(50)
    },
    modalBottom: {
        borderTopWidth: Mixins.scaleSize(0),
        marginBottom: Mixins.scaleSize(16)
    }
});

export default PaymentOptions;