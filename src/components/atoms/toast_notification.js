import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import Modal from "react-native-modal";
import * as Icon from '@expo/vector-icons';

import { Colors, Mixins, Typography } from '_styles';
import TouchItem from './touch_item';
import { Dictionary } from '_utils';

import { hideToast } from '_actions/toast_actions';

class ToastNotification extends Component {
    render() {
        let isError = typeof this.props.isError === 'undefined' || this.props.isError;
        let message = this.props.text;
        if (!message) {
            message = isError ? Dictionary.GENERAL_ERROR : Dictionary.GENERAL_SUCCESS;
        }
        if (this.props.isVisible) {
            return (
                <Modal
                    isVisible={this.props.isVisible}
                    onSwipeComplete={this.props.onSwipeComplete}
                    animationInTiming={500}
                    animationOutTiming={500}
                    backdropTransitionInTiming={500}
                    backdropTransitionOutTiming={500}
                    useNativeDriver={true}
                    style={styles.toast}>
                    <View style={[styles.container, isError ? styles.error : styles.success]}>
                        <View style={styles.notification}>
                            <Text numberOfLines={3} style={styles.text}>{message}</Text>
                            {this.props.onClose && (
                                <View style={{ textAlign: 'flex-end' }}>
                                    <TouchItem
                                        style={styles.close}
                                        disabled={this.props.processing}
                                        onPress={this.props.onClose}>
                                        <Icon.Ionicons
                                            style={styles.icon}
                                            size={Mixins.scaleSize(20)}
                                            name="md-close" />
                                    </TouchItem>
                                </View>
                            )}
                        </View>
                        {this.props.action && (
                            <TouchItem
                                style={styles.action}
                                onPress={() => { this.props.hideToast(); this.props.action(); }}>
                                <Text numberOfLines={1} style={styles.actionText}>
                                    {this.props.actionText}
                                </Text>
                            </TouchItem>
                        )}
                    </View>
                </Modal>
            );
        } else {
            return null;
        }
    }
}

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = {
    hideToast
};

const styles = StyleSheet.create({
    toast: {
        justifyContent: 'flex-end',
        margin: 0
    },
    container: {
        ...Mixins.margin(15),
        ...Mixins.boxShadow('rgba(238, 51, 91, 0.2)', { width: Mixins.scaleSize(10), height: Mixins.scaleSize(10) }),
        flexDirection: 'column',
        borderRadius: Mixins.scaleSize(10),
    },
    notification: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    action: {
        backgroundColor: 'rgba(0, 0, 0, 0.15)'
    },
    actionText: {
        ...Mixins.padding(20, 20, 20, 20),
        ...Typography.FONT_MEDIUM,
        textAlign: 'center',
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.WHITE
    },
    error: {
        backgroundColor: Colors.ERROR
    },
    success: {
        backgroundColor: Colors.SUCCESS,
    },
    text: {
        ...Mixins.padding(20, 20, 20, 20),
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.WHITE,
        maxWidth: '85%'
    },
    close: {
        ...Mixins.padding(20, 20, 20, 20)
    },
    icon: {
        color: Colors.WHITE
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(ToastNotification);