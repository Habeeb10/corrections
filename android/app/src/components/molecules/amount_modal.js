import React, { Component } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import Modal from "react-native-modal";

import { Mixins, FormStyle, SharedStyle } from '_styles';

import { Dictionary } from '_utils';
import { FloatingLabelInput } from '_atoms';
import PrimaryButton from './primary_button';

class AmountModal extends Component {
    render() {
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
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? "position" : ""}>
                    <View style={[SharedStyle.modalContent, { height: Mixins.scaleSize(240) }]}>
                        <View style={SharedStyle.modalSlider} />
                        <View style={SharedStyle.modalPanel}>
                            <Text style={SharedStyle.modalTop}>{this.props.title}</Text>
                            <View style={SharedStyle.modalMiddle}>
                                {!!this.props.errorMessage && (
                                    <Text style={SharedStyle.pinError} numberOfLines={2}>{this.props.errorMessage}</Text>
                                )}
                                <View style={{ flex: 1 }}>
                                    <FloatingLabelInput
                                        label={Dictionary.AMOUNT_LABEL}
                                        value={this.props.amount}
                                        keyboardType={'number-pad'}
                                        multiline={false}
                                        autoCorrect={false}
                                        onChangeText={text => this.props.onChangeAmount(text.replace(/\D/g, ''))}
                                    />
                                    <Text style={FormStyle.formError}>{this.props.amountError}</Text>
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
                </KeyboardAvoidingView>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    modalBottom: {
        borderTopWidth: Mixins.scaleSize(0),
        marginBottom: Mixins.scaleSize(16)
    }
});

export default AmountModal;