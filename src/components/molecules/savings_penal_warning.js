import React, { Component } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import Modal from "react-native-modal";
import * as Icon from '@expo/vector-icons';

import ActionButton from './action_button';
import PrimaryButton from './primary_button';

import { Dictionary } from '_utils';
import { Colors, Mixins, SharedStyle, Typography, FormStyle } from '_styles';

class SavingsPenalWarning extends Component {
    render() {
        const { message, onAgree, onDisagree } = this.props;
        return (
            <Modal
                isVisible={this.props.isVisible}
                swipeDirection="down"
                onSwipeComplete={onDisagree}
                onBackButtonPress={onDisagree}
                animationInTiming={500}
                animationOutTiming={800}
                backdropTransitionInTiming={500}
                backdropTransitionOutTiming={800}
                useNativeDriver={true}
                style={styles.modal}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? "position" : ""}>
                    <View style={styles.modalMiddle}>
                        <View style={styles.logoContainer}>
                            <Icon.AntDesign name="exclamationcircleo" size={Mixins.scaleFont(50)} color={Colors.CV_RED} />
                        </View>
                        <Text style={styles.title}>{Dictionary.PENALTY_WARNING}</Text>
                        <Text style={styles.description}>{message}</Text>
                    </View>
                    <View style={styles.buttons}>
                        <View style={FormStyle.formButton}>
                            <ActionButton
                                title={Dictionary.CANCEL_BTN}
                                color={Colors.CV_RED}
                                onPress={onDisagree}
                                backgroundStyle={styles.buttonBackground}
                                contentStyle={styles.buttonContent} />
                        </View>
                        <View style={FormStyle.formButton}>
                            <PrimaryButton
                                title={Dictionary.CONTINUE_BTN}
                                icon="arrow-right"
                                onPress={onAgree} />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    modal: {
        margin: 0,
        backgroundColor: Colors.WHITE
    },
    modalMiddle: {
        ...Mixins.padding(32, 16, 32, 16),
        paddingBottom: Mixins.scaleSize(10),
        alignItems: 'center'
    },
    logoContainer: {
        width: Mixins.scaleSize(75),
        height: Mixins.scaleSize(75),
        backgroundColor: Colors.LIGHT_RED_BG,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Mixins.scaleSize(80),
        marginBottom: Mixins.scaleSize(20)
    },
    title: {
        ...Typography.FONT_BOLD,
        color: Colors.DARK_GREY,
        textAlign: 'center',
        fontSize: Mixins.scaleFont(18),
        lineHeight: Mixins.scaleSize(21),
        letterSpacing: Mixins.scaleSize(0.01),
        marginBottom: Mixins.scaleSize(10)
    },
    description: {
        ...SharedStyle.normalText,
        color: Colors.LIGHT_GREY,
        textAlign: 'center'
    },
    buttons: {
        ...FormStyle.formButtons,
        marginTop: Mixins.scaleSize(20)
    },
    buttonBackground: {
        borderColor: Colors.CV_RED,
        borderWidth: Mixins.scaleSize(1),
        borderRadius: Mixins.scaleSize(8)
    },
    buttonContent: {
        justifyContent: 'center'
    },
    buttonText: {
        ...SharedStyle.normalText,
        ...Typography.FONT_MEDIUM,
        textAlign: 'center',
        color: Colors.CV_YELLOW
    }
});

export default SavingsPenalWarning;