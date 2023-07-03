import React, { Component } from 'react';
import { BackHandler, StyleSheet, View, Text, Image, Linking } from 'react-native';
import { connect } from 'react-redux';
import { withNavigationFocus } from "react-navigation";
import analytics from '@react-native-firebase/analytics';
import * as Icon from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

import { showToast, showToastNav } from "_actions/toast_actions";

import { clearUserData } from '_actions/user_actions';

import { Dictionary } from '_utils';
import { Colors, Mixins, Typography, SharedStyle } from '_styles';
import { ScrollView, TouchItem, Version } from '_atoms';
import { Tabs } from '_molecules';
import { MainHeader } from '_organisms';
import { Network } from '_services';

class Settings extends Component {
    constructor(props) {
        super(props);

        const accountOptions = [{
            icon: require('../../assets/images/settings/profile.png'),
            label: Dictionary.PROFILE,
            onPress: () => this.navigateToPage('Profile')
          //  onPress: () => {}
        },
        {
            icon: require('../../assets/images/settings/next_of_kin.png'),
            label: Dictionary.NEXT_OF_KIN,
            // onPress: () => {}
           onPress: () => this.navigateToPage('NextOfKIN')
           
        },
        /* {
            icon: require('../../assets/images/settings/accounts.png'),
            label: Dictionary.CV_ACCOUNTS,
            onPress: () => this.navigateToPage('CreditVilleAccounts')
        }, */
        {
            icon: require('../../assets/images/settings/documents.png'),
            label: Dictionary.KYC_DOCS,
            //onPress: () =>   {}
            onPress: () => this.navigateToPage('Documents')
          
        },
        {
            icon: require('../../assets/images/settings/banks.png'),
            label: Dictionary.BANK_AND_ACCOUNTS,
             onPress: () => this.navigateToPage('AccountsAndCards')
            // onPress: () =>  {}
           
        }];

        const securityOptions = [{
            icon: require('../../assets/images/settings/change_password.png'),
            label: Dictionary.CHANGE_PASSWORD,
            onPress: () => this.navigateToPage('ChangePassword')
            
        },
        {
            icon: require('../../assets/images/settings/change_pin.png'),
            label: Dictionary.CHANGE_PIN,
            onPress: () => this.navigateToPage('ChangePIN')
        },
        {
            icon: require('../../assets/images/settings/biometrics.png'),
            label: Dictionary.BIOMETRICS,
            onPress: () => this.navigateToPage('Biometrics')
        },
        {
            icon: require('../../assets/images/settings/recover_pin.png'),
            label: Dictionary.RECOVER_PIN,
            onPress: () => this.navigateToPage('ForgotPINOTP')
        },
        {
            icon: require('../../assets/images/settings/notifications.png'),
            label: Dictionary.IN_APP_NOTIFICATIONS,
            onPress: () => this.navigateToPage('AppNotifications')
        }];

        const contactSettings = [{
            icon: require('../../assets/images/settings/contact_support.png'),
            label: Dictionary.CONTACT_SUPPORT,
            onPress: () => this.navigateToPage('ContactSupport')
        },
        {
            icon: require('../../assets/images/settings/privacy_policy.png'),
            label: Dictionary.PRIVACY_POLICY,
            // onPress: () => this.navigateToLink('https://creditville.ng/privacy/')
            onPress: () => this.visitWebsite('https://creditvillebank.com/privacy/')
        },
        {
            icon: require('../../assets/images/settings/terms_and_conditions.png'),
            label: Dictionary.TERMS_AND_CONDITIONS,
            // onPress: () => this.navigateToLink('https://creditville.ng/terms/')
            onPress: () => this.visitWebsite('https://creditvillebank.com/terms/')
        }];

        this.state = {
            accountOptions,
            securityOptions,
            contactSettings
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
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

    navigateToPage = (destination) => {
        this.props.navigation.navigate(destination);
    }

    navigateToLink = async (destination) => {
        analytics().logEvent('open_link', { "url": destination });
        await WebBrowser.openBrowserAsync(destination);
    };

    visitWebsite = async (destination) => {
        // if (!destination.startsWith('http')) {
        //     destination = 'http://' + destination;
        // }
        // analytics().logEvent('open_link', { "url": destination });
        // await WebBrowser.openBrowserAsync(destination);
            // Checking if the link is supported for links with custom URL scheme.
        Linking.canOpenURL(destination).then(supported => {
            if (supported) {
                return Linking.openURL(destination);
              } else {
                return Linking.openURL(destination);
              }
        })
    }

    handleLogOut = () => {
        this.props.navigation.navigate('Login');
        
        Network.logoutUser().then((result) => {
            if (result.status === 200) {
                console.log("Logout successful")
                this.props.clearUserData();      
            }
        }).catch((e) => console.log(e))
    }

    render() {
        let { user_data } = this.props.user;
        user_data.full_name = user_data.firstName + ' ' + user_data.lastName;
        user_data.creditville_id = String(user_data.id).padStart(11, '0');

        return (
            <View style={[SharedStyle.mainContainer, styles.container]}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.SETTINGS_HEADER} />
                <ScrollView {...this.props}>
                    <View style={styles.userInfo}>
                        <View style={styles.biodata}>
                            <View style={styles.personalData}>
                                <Text numberOfLines={1} style={styles.name}>{user_data.full_name}</Text>
                                {!!user_data.email && (
                                    <Text numberOfLines={1} style={styles.email}>{user_data.email}</Text>
                                )}
                            </View>
                            <TouchItem
                                style={styles.pictureData}
                                onPress={() => user_data.photoUrl=="" || user_data.photoUrl==null ? this.navigateToPage('OnboardSelfie'):null}>
                                {/* onPress={() => this.navigateToPage('UploadSelfie')}> */}
                                {/* {(!user_data.photoUrl || user_data.photoUrl=="")&& ( */}
                                {(!user_data.photoLocation || user_data.photoLocation=="")&& (
                                    <Image
                                        style={styles.photo}
                                        source={require('../../assets/images/shared/profile.png')}
                                    />
                                )}
                                {/* {user_data.photoUrl!="" && ( */}
                                {user_data.photoLocation!="" && (
                                    <Image
                                        style={styles.photo}
                                        source={{ uri: user_data.photoLocation }}
                                    />
                                )}
                            </TouchItem>
                        </View>
                        <View style={[styles.bankingData, SharedStyle.shadow]}>
                            <View style={styles.data}>
                                <Text style={[styles.dataText, styles.key]}>{Dictionary.MOBILE_NUMBER_LABEL}</Text>
                                <Text style={[styles.dataText, styles.value]}>{user_data.phoneNumber}</Text>
                            </View>
                            <View style={styles.data}>
                                <Text style={[styles.dataText, styles.key]}>{Dictionary.BVN_LABEL}</Text>
                                <Text style={[styles.dataText, styles.value]}>{user_data.bvn}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.settings}>
                        <Tabs>
                            <View title={Dictionary.ACCOUNT_SETTINGS}>
                                {this.state.accountOptions.map(option => {
                                    return <TouchItem
                                        key={option.label}
                                        style={[styles.settingsItem, SharedStyle.shadow]}
                                        // onPress={() => {}}>
                                        onPress={() => option.onPress()}> 
                                        <Image style={styles.settingsIcon} source={option.icon} />
                                        <Text style={styles.settingsText}>{option.label}</Text>
                                    </TouchItem>
                                })}
                            </View>
                            <View title={Dictionary.SECURITY_SETTINGS}>
                                {this.state.securityOptions.map(option => {
                                    return <TouchItem
                                        key={option.label}
                                        style={[styles.settingsItem, SharedStyle.shadow]}
                                        onPress={() => option.onPress()}>
                                        {/* onPress={() => {}}> */}
                                        <Image style={styles.settingsIcon} source={option.icon} />
                                        <Text style={styles.settingsText}>{option.label}</Text>
                                    </TouchItem>
                                })}
                            </View>
                            <View title={Dictionary.CONTACT_SETTINGS}>
                                {this.state.contactSettings.map(option => {
                                    return <TouchItem
                                        key={option.label}
                                        style={[styles.settingsItem, SharedStyle.shadow]}
                                        onPress={() => option.onPress()}>
                                        {/* onPress={() =>{}}> */}
                                        <Image style={styles.settingsIcon} source={option.icon} />
                                        <Text style={styles.settingsText}>{option.label}</Text>
                                    </TouchItem>
                                })}
                            </View>
                        </Tabs>
                    </View>
                    <TouchItem style={styles.logout} onPress={this.handleLogOut}>
                        <Icon.SimpleLineIcons size={Mixins.scaleSize(15)} style={styles.logoutIcon} name="logout" />
                        <Text style={styles.logoutText}>{Dictionary.LOGOUT_BTN}</Text>
                    </TouchItem>
                    <Version />
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.LIGHT_BG
    },
    userInfo: {
        ...Mixins.padding(32, 8, 32, 8),
    },
    biodata: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    personalData: {
        flex: 1,
        paddingHorizontal: Mixins.scaleSize(8),
        justifyContent: 'center'
    },
    pictureData: {
        paddingHorizontal: Mixins.scaleSize(8)
    },
    name: {
        ...Typography.FONT_MEDIUM,
        color: Colors.DARK_GREY,
        fontSize: Mixins.scaleFont(20),
        lineHeight: Mixins.scaleSize(23),
        letterSpacing: Mixins.scaleSize(0.01)
    },
    email: {
        ...Typography.FONT_REGULAR,
        color: Colors.LIGHT_GREY,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        marginTop: Mixins.scaleSize(13)
    },
    photo: {
        width: Mixins.scaleSize(60),
        height: Mixins.scaleSize(60),
        borderRadius: Mixins.scaleSize(60),
        resizeMode: 'cover',
        backgroundColor: Colors.TAB_BG
    },
    bankingData: {
        ...Mixins.margin(32, 8, 0, 8),
        ...Mixins.padding(20, 16, 10, 16),
        backgroundColor: Colors.WHITE,
        borderRadius: Mixins.scaleSize(10)
    },
    data: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Mixins.scaleSize(10)
    },
    dataText: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleFont(16),
        letterSpacing: Mixins.scaleSize(0.01)
    },
    key: {
        color: Colors.LIGHT_GREY
    },
    value: {
        color: Colors.DARK_GREY
    },
    settings: {
        backgroundColor: Colors.WHITE,
        flex: 1
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: Mixins.scaleSize(1),
        borderRadius: Mixins.scaleSize(10),
        borderColor: Colors.FAINT_BORDER,
        marginBottom: Mixins.scaleSize(16)
    },
    settingsIcon: {
        ...Mixins.margin(12, 8, 12, 16),
        width: Mixins.scaleSize(32),
        height: Mixins.scaleSize(32)
    },
    settingsText: {
        ...Mixins.margin(12, 16, 12, 8),
        ...Typography.FONT_REGULAR,
        color: Colors.DARK_GREY,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleFont(16),
        letterSpacing: Mixins.scaleSize(0.01)
    },
    logout: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Mixins.scaleSize(16),
        paddingBottom: Platform.OS === 'ios' ? Mixins.scaleSize(20) : Mixins.scaleSize(16),
        backgroundColor: Colors.LIGHT_BG,
        position: 'absolute',
        width: '100%',
        bottom: 40

    },
    logoutIcon: {
        marginRight: Mixins.scaleSize(10),
        color: Colors.LOGOUT_RED
    },
    logoutText: {
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleFont(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.LOGOUT_RED
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        settings: state.settings
    };
};

const mapDispatchToProps = {
    clearUserData,
    showToast
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Settings));