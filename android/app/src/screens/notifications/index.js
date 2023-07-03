import React, { Component } from 'react';
import { StyleSheet, BackHandler, View, Text } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import Modal from "react-native-modal";
import * as Icon from '@expo/vector-icons';

import { syncNotifications, markNotificationAsRead, removeNotification } from '_actions/notification_actions';

import { Dictionary } from '_utils';
import { SharedStyle, FormStyle, Mixins, Colors, Typography } from '_styles';
import { ScrollView, TouchItem } from '_atoms';
import { ActionButton } from '_molecules';
import { MainHeader } from '_organisms';

class Notifications extends Component {
    state = {
        selected_notification: {},
        modal_visible: false,
        delete_modal_visible: false
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        //this.props.syncNotifications();
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

    showNotification = (selected_notification) => {
        this.setState({
            selected_notification,
            modal_visible: true
        }, () => this.props.markNotificationAsRead(selected_notification.id));
    }

    showDeleteModal = (selected_notification) => {
        this.setState({
            selected_notification,
            delete_modal_visible: true
            //}, () => this.props.markNotificationAsRead(selected_notification.id));
        })
    }

    onCloseModal = () => {
        this.setState({
            selected_notification: {},
            modal_visible: false
        });
    }

    onCloseDeleteModal = () => {
        this.setState({
            selected_notification: {},
            delete_modal_visible: false
        });
    }

    render() {
        let user_notifications = this.props.notifications?.user_notifications ?? [];
        
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.NOTIFICATIONS_HEADER} />
                {user_notifications.length < 1 && (
                    <View style={SharedStyle.loaderContainer}>
                        <Text style={SharedStyle.normalText}>{Dictionary.NO_NOTIFICATIONS}</Text>
                    </View>
                )}
                {user_notifications.length > 0 && (
                    <ScrollView {...this.props}>
                        <View style={FormStyle.formContainer}>
                            {user_notifications.slice(0).reverse().map((notification, index) => {
                                return <TouchItem
                                    key={index}
                                    style={[styles.section]}
                                    onPress={() => this.showNotification(notification)}>
                                    <View style={SharedStyle.row}>
                                        {!notification.is_read && (<View style={styles.badge}></View>)}
                                        <View style={[SharedStyle.fullColumn]}>
                                            <Text numberOfLines={2} style={[SharedStyle.normalText, SharedStyle.value, { textTransform: 'none', fontWeight: !notification.is_read ? "bold" : "normal"}]}>{notification.description}</Text>
                                        </View>                          
                                    </View>
                                    <View style={styles.row}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{notification.timestamp}</Text>
                                            <TouchItem
                                            onPress={() => this.showDeleteModal(notification)}>
                                            <Icon.Ionicons
                                                name={'ios-trash'}
                                                color={Colors.LOGOUT_RED}
                                                size={Mixins.scaleSize(17)} />
                                        </TouchItem>                          
                                    </View>
                                </TouchItem>
                            })}
                        </View>
                    </ScrollView>
                )}
                <Modal
                    isVisible={this.state.modal_visible}
                    swipeDirection="down"
                    onSwipeComplete={this.onCloseModal}
                    onBackButtonPress={this.onCloseModal}
                    animationInTiming={500}
                    animationOutTiming={800}
                    backdropTransitionInTiming={500}
                    backdropTransitionOutTiming={800}
                    useNativeDriver={true}
                    style={SharedStyle.modal}>
                    <View style={[SharedStyle.modalContent, SharedStyle.authModalContent, { height: Mixins.scaleSize(250) }]}>
                        <View style={SharedStyle.modalSlider} />
                        <View style={SharedStyle.modalPanel}>
                            <Text style={SharedStyle.modalTop} numberOfLines={1}>{this.state.selected_notification.title}</Text>
                            <View>
                                <View style={[SharedStyle.modalMiddle, { ...Mixins.padding(16) }]}>
                                    <View style={{ flex: 1, alignItems: 'center' }}>
                                        <Text style={[SharedStyle.value, { textTransform: 'none' }]} numberOfLines={10}>{this.state.selected_notification.description}</Text>
                                    </View>
                                </View>
                                <View style={SharedStyle.modalBottom}>
                                    <ActionButton
                                        contentStyle={styles.button}
                                        title={Dictionary.CLOSE_BTN}
                                        color={Colors.CV_YELLOW}
                                        icon="close"
                                        onPress={this.onCloseModal} />
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* delete notification modal */}
                <Modal
                    isVisible={this.state.delete_modal_visible}
                    animationInTiming={500}
                    animationOutTiming={800}
                    backdropTransitionInTiming={500}
                    backdropTransitionOutTiming={800}
                    useNativeDriver={true}
                    style={styles.exitDialog}
                >
                    <View style={styles.dialog}>
                        <View style={styles.slider} />
                        <View style={[SharedStyle.mainContainer, styles.container]}>
                            <Text style={styles.header}>{Dictionary.CONFIRM}</Text>
                            <Text style={styles.message}>{Dictionary.DELETE_NOTIFICATION}</Text>
                            <View style={styles.buttons}>
                                <TouchItem
                                    style={styles.button1}
                                    onPress={this.onCloseDeleteModal}
                                >
                                    <Text style={styles.buttonText}>{Dictionary.NO_BTN}</Text>
                                </TouchItem>
                                <TouchItem
                                    style={styles.button1}
                                    onPress={() => {
                                        this.props.removeNotification(this.state.selected_notification)
                                        this.setState({delete_modal_visible: false});
                                    }}
                                >
                                    <Text style={styles.buttonText}>{Dictionary.YES_BTN}</Text>
                                </TouchItem>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    section: {
        ...Mixins.padding(10, 16, 0, 16),
        marginBottom: Mixins.scaleSize(32),
        borderColor: Colors.INPUT_BORDER,
        borderWidth: Mixins.scaleSize(1),
        borderRadius: Mixins.scaleSize(10),
        shadowOffset: { width: 0, height: 0 },
        shadowColor: Colors.SHADOW,
        shadowOpacity: 0.02,
        marginBottom: Mixins.scaleSize(10),
    },
    badge: {
        position: 'absolute',
        top: Mixins.scaleSize(-9),
        left: Mixins.scaleSize(-17),
        backgroundColor: Colors.LOGOUT_RED,
        borderRadius: Mixins.scaleSize(20),
        //paddingHorizontal: Mixins.scaleSize(2),
        //paddingVertical: Mixins.scaleSize(3),
        width: Mixins.scaleSize(6),
        height: Mixins.scaleSize(85)
    },
    button: {
        justifyContent: 'center'
    },
    button1: {
        flex: 1,
        justifyContent: 'center'
    },
    exitDialog: {
        justifyContent: "flex-end",
        margin: 0,
    },
    slider: {
        width: Mixins.scaleSize(50),
        height: Mixins.scaleSize(5),
        marginBottom: Mixins.scaleSize(12),
        backgroundColor: Colors.WHITE,
        borderRadius: Mixins.scaleSize(80),
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        width: "100%",
        borderRadius: Mixins.scaleSize(8),
    },
    dialog: {
        ...Mixins.padding(0, 16, 16, 16),
        height: Mixins.scaleSize(235),
        alignItems: "center",
    },
    header: {
        ...Mixins.padding(24, 16, 24, 16),
        ...Typography.FONT_BOLD,
        fontSize: Mixins.scaleFont(16),
        lineHeight: Mixins.scaleSize(19),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.DARK_GREY,
        borderBottomColor: Colors.FAINT_BORDER,
        borderBottomWidth: Mixins.scaleSize(1),
    },
    message: {
        ...Mixins.padding(32, 16, 32, 16),
        flexDirection: "row",
        justifyContent: "space-between",
        ...Typography.FONT_MEDIUM,
        color: Colors.DARK_GREY,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
    },
    buttons: {
        flex: 1,
        flexDirection: "row",
        borderTopColor: Colors.FAINT_BORDER,
        borderTopWidth: Mixins.scaleSize(1),
    },
    buttonText: {
        textAlign: "center",
        ...Typography.FONT_MEDIUM,
        color: Colors.CV_YELLOW,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
    },
    timeoutText: {
        ...SharedStyle.biometricText,
        width: "70%",
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Mixins.scaleSize(5)
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        notifications: state.notifications
    };
};

const mapDispatchToProps = {
    syncNotifications,
    markNotificationAsRead,
    removeNotification
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Notifications));