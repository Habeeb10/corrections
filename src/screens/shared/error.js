import React, { Component } from 'react';
import { BackHandler, ImageBackground, StyleSheet, View, Text, Image } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { showToast } from '_actions/toast_actions';
import { getDocuments } from '_actions/document_actions';

import { Dictionary, Util } from '_utils';
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from '_styles';
import { ScrollView } from '_atoms';
import { PrimaryButton, SecondaryButton } from '_molecules';

class Error extends Component {
    constructor(props) {
        super(props);

        const navigation = this.props.navigation;
        const error_message = navigation.getParam('error_message', Dictionary.GENERAL_ERROR);
        const event_name = navigation.getParam('event_name');
        const event_data = navigation.getParam('event_data');

        this.state = {
            error_message,
            event_name,
            event_data
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        const { event_name, event_data } = this.state;
        if (event_name) {
            Util.logEventData(event_name, event_data);
        }
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

    render() {
        const { error_message } = this.state;

        return (
            <View style={SharedStyle.mainContainer}>
                <ScrollView {...this.props} hasNavBar={false}>
                    <ImageBackground
                        style={styles.container}
                        source={require('../../assets/images/shared/error_bg.png')}
                        resizeMode={'cover'}>
                        <View style={styles.content}>
                            <Image
                                style={styles.icon}
                                source={require('../../assets/images/shared/error_icon.png')}
                            />
                            <View style={styles.message}>
                                <Text style={styles.messageHeader}>{Dictionary.ERROR_HEADER}</Text>
                                <Text style={styles.messageDescription}>{error_message}</Text>
                            </View>
                        </View>
                        <View style={styles.buttonPanel}>
                            <View style={styles.pane}>
                                <View style={styles.buttons}>
                                    <View style={FormStyle.formButton}>
                                        <SecondaryButton
                                            title={Dictionary.TO_DASHBOARD_BTN}
                                            onPress={() => this.props.navigation.navigate('Dashboard')} />
                                    </View>
                                    <View style={FormStyle.formButton}>
                                        <PrimaryButton
                                            title={Dictionary.TRY_AGAIN_BTN}
                                            onPress={() => this.handleBackButton()} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ImageBackground>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        ...Mixins.margin(100, 20, 0, 20),
        flexDirection: 'row',
        paddingBottom: Mixins.scaleSize(70)
    },
    icon: {
        width: Mixins.scaleSize(60),
        height: Mixins.scaleSize(60),
        marginRight: Mixins.scaleSize(20)
    },
    message: {
        width: '80%'
    },
    messageHeader: {
        ...Typography.FONT_BOLD,
        fontSize: Mixins.scaleFont(30),
        lineHeight: Mixins.scaleSize(35),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.WHITE,
        marginBottom: Mixins.scaleSize(12)
    },
    messageDescription: {
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.WHITE
    },
    buttonPanel: {
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        width: '100%'
    },
    pane: {
        flex: 1,
        width: '100%',
        alignItems: 'center'
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 0,
        height: Mixins.scaleSize(70),
        backgroundColor: Colors.WHITE
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        documents: state.documents
    };
};

const mapDispatchToProps = {
    showToast,
    getDocuments
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Error));