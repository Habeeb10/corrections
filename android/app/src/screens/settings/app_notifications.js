import React, { Component } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import SwitchToggle from '@dooboo-ui/native-switch-toggle';

import { showToast } from '_actions/toast_actions';
import { setAppNotifications } from '_actions/settings_actions';

import { Dictionary } from '_utils';
import { Colors, Mixins, SharedStyle, FormStyle, Typography } from '_styles';
import { ScrollView } from '_atoms';
import { MainHeader } from '_organisms';

class AppNotifications extends Component {

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

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.APP_NOTIFICATIONS_HEADER} />
                <ScrollView {...this.props}>
                    <View style={FormStyle.formContainer}>
                        <View style={[SharedStyle.section, styles.section]}>
                            <View style={styles.sectionHead}>
                                <Text style={[SharedStyle.normalText, styles.sectionTitle]}>{Dictionary.APP_NOTIFICATIONS_TITLE}</Text>
                                <SwitchToggle
                                    containerStyle={FormStyle.switchContainer}
                                    circleStyle={FormStyle.switchCircle}
                                    switchOn={this.props.settings.app_notifications}
                                    onPress={() => this.props.setAppNotifications(!this.props.settings.app_notifications)}
                                    backgroundColorOn={Colors.GREEN}
                                    backgroundColorOff={Colors.LIGHT_GREY}
                                    circleColorOff={Colors.WHITE}
                                    circleColorOn={Colors.WHITE}
                                    duration={100} />
                            </View>
                            <View>
                                <Text style={[SharedStyle.normalText, styles.sectionBody]}>{Dictionary.APP_NOTIFICATIONS_DESCRIPTION}</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    section: {
        paddingBottom: Mixins.scaleSize(16),
        backgroundColor: Colors.WHITE,
        /// elevation: 2
        borderWidth: Mixins.scaleSize(2),
    },
    sectionHead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Mixins.scaleSize(20)
    },
    sectionTitle: {
        color: Colors.DARK_GREY
    },
    sectionBody: {
        color: Colors.LIGHT_GREY
    }
});

const mapStateToProps = (state) => {
    return {
        settings: state.settings
    };
};

const mapDispatchToProps = {
    showToast,
    setAppNotifications
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(AppNotifications));