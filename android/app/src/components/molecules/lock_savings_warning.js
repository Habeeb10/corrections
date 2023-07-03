import React, { Component } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import Modal from "react-native-modal";
import * as Icon from '@expo/vector-icons';

import { Dictionary } from '_utils';
import { Colors, Mixins, SharedStyle, Typography } from '_styles';
import { TouchItem } from '_atoms';

class LockSavingsWarning extends Component {
    render() {
        const { onAgree, onDisagree } = this.props;
        return (
            <Modal
                isVisible={this.props.isVisible}
                swipeDirection="down"
                onSwipeComplete={onDisagree}
                onBackButtonPress={() => { }}
                animationInTiming={500}
                animationOutTiming={800}
                backdropTransitionInTiming={500}
                backdropTransitionOutTiming={800}
                useNativeDriver={true}
                style={SharedStyle.modal}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? "position" : ""}>
                    <View style={[SharedStyle.modalContent, { height: Mixins.scaleSize(310) }]}>
                        <View style={SharedStyle.modalSlider} />
                        <View style={SharedStyle.modalPanel}>
                            <View style={styles.modalContent}>
                                <View style={styles.logoContainer}>
                                    <Icon.Fontisto name={'locked'} size={Mixins.scaleFont(32)} color={Colors.CV_YELLOW} />
                                </View>
                                <Text style={styles.title}>{Dictionary.LOCK_SAVINGS_TITLE}</Text>
                                <Text style={styles.description}>{Dictionary.LOCK_SAVINGS_DESSCRIPTION}</Text>
                            </View>
                            <View style={styles.buttons}>
                                <TouchItem
                                    style={styles.button}
                                    onPress={onDisagree}>
                                    <Text style={[styles.buttonText, { color: Colors.CV_RED }]}>{Dictionary.CANCEL_BTN}</Text>
                                </TouchItem>
                                <TouchItem
                                    style={styles.button}
                                    onPress={onAgree}>
                                    <Text style={styles.buttonText}>{Dictionary.CONTINUE_BTN}</Text>
                                </TouchItem>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    modalContent: {
        ...SharedStyle.modalMiddle,
        paddingBottom: Mixins.scaleSize(10),
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    logoContainer: {
        width: Mixins.scaleSize(80),
        height: Mixins.scaleSize(80),
        backgroundColor: Colors.CV_YELLOW_LIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Mixins.scaleSize(80),
        marginBottom: Mixins.scaleSize(20)
    },
    title: {
        ...Typography.FONT_BOLD,
        color: Colors.DARK_GREY,
        textAlign: 'center',
        fontSize: Mixins.scaleFont(16),
        lineHeight: Mixins.scaleSize(19),
        letterSpacing: Mixins.scaleSize(0.01),
        marginBottom: Mixins.scaleSize(10)
    },
    description: {
        ...SharedStyle.normalText,
        textAlign: 'center'
    },
    buttons: {
        flex: 1,
        flexDirection: 'row',
        borderTopColor: Colors.FAINT_BORDER,
        borderTopWidth: Mixins.scaleSize(1)
    },
    button: {
        flex: 1,
        justifyContent: 'center'
    },
    buttonText: {
        ...SharedStyle.normalText,
        ...Typography.FONT_MEDIUM,
        textAlign: 'center',
        color: Colors.CV_YELLOW
    },
});

export default LockSavingsWarning;