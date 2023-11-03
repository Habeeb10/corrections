import React, { Component } from 'react';
import { BackHandler, StyleSheet, ImageBackground, Text, View, Image, Linking } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import analytics from '@react-native-firebase/analytics';
import remoteConfig from '@react-native-firebase/remote-config';
// import { Freshchat, FreshchatConfig, FreshchatUser } from 'react-native-freshchat-sdk';
import * as WebBrowser from 'expo-web-browser';

import { showToast } from '_actions/toast_actions';

import { env, Dictionary } from '_utils';
import { Colors, Mixins, Typography, SharedStyle } from '_styles';
import { ScrollView, TouchItem } from '_atoms';
import { MainHeader } from '_organisms';

class ContactSupport extends Component {
    state = {
        support_phone: '07055554900',
        call_phone: '07000330330',
        support_mail: 'customer@creditville.ng',
        support_website: 'https://creditvillebank.com/'
    }
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

        const support_phone = remoteConfig().getValue(`support_phone_${env().target}`).asString();
        const support_mail = remoteConfig().getValue(`support_mail_${env().target}`).asString();
        const support_website = remoteConfig().getValue(`support_website_${env().target}`).asString();

        // this.setState({
        //     support_phone,
        //     support_mail,
        //     support_website
        // });
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

    callSupport = () => {
        let support;
        if (Platform.OS === 'android') {
            support = `tel:${encodeURIComponent(this.state.call_phone)}`;
        } else {
            support = `telprompt:${this.state.call_phone}`;
        }

        analytics().logEvent('call_support');
        Linking.openURL(support);
    }

    chatSupport = () => {
        // const APP_ID = remoteConfig().getValue(`freshchat_app_id_${env().target}`).asString();
        // const APP_KEY = remoteConfig().getValue(`freshchat_app_key_${env().target}`).asString();
        // const freshchatConfig = new FreshchatConfig(APP_ID, APP_KEY);
        // const { first_name, last_name, email, phone_number } = this.props.user.user_data

        // let freshchatUser = new FreshchatUser();
        // freshchatUser.firstName = first_name;
        // freshchatUser.lastName = last_name;
        // freshchatUser.email = email;
        // freshchatUser.phone = phone_number;

        // Freshchat.init(freshchatConfig);
        // Freshchat.setUser(freshchatUser, (error) => {
        //     console.log(error);
        // });
        // Freshchat.showConversations();
            let mobile = this.state.support_phone;

            if (mobile) {
                let url =
                  "whatsapp://send?text=" +
                  "Hello, Creditville Support." +
                  "&phone=234" +
                  this.state.support_phone;

                Linking.openURL(url)
                  .then(data => {
                    console.log("WhatsApp Opened successfully " + data);
                  })
                  .catch(() => {
                    this.props.showToast("Make sure WhatsApp is installed on your device");
                  });
                } else {
            this.props.showToast("Please enter a mobile number");
        }
    }

    mailSupport = () => {
        analytics().logEvent('mail_support');
        Linking.openURL(`mailto:${this.state.support_mail}`);
    }

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

    launchFacebook = () => {
        Linking.canOpenURL("fb://profile/creditvilleltd").then(supported => {
            if (supported) {
                return Linking.openURL("fb://page/1872694549678459");
            } else {
                return Linking.openURL("https://www.facebook.com/Creditvilleng/");
            }
        });
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.CONTACT_US_HEADER} />
                <ScrollView {...this.props}>
                    <ImageBackground
                        style={styles.banner}
                        source={require('../../assets/images/settings/banner.png')}
                        resizeMode={'cover'}>
                    </ImageBackground>
                    <View style={styles.content}>
                        <View style={styles.address}>
                            <Image
                                style={styles.logo}
                                source={require('../../assets/images/shared/creditville.png')} />
                            <View style={styles.addressText}>
                                <Text style={styles.addressTextHeader}>{Dictionary.CV_LIMITED}</Text>
                                <Text style={styles.addressTextBody}>{Dictionary.CV_ADDRESS}</Text>
                            </View>
                        </View>
                        <View style={styles.actions}>
                            <TouchItem
                                style={[styles.actionItem, styles.actionTopItem]}
                                onPress={this.callSupport}>
                                <Image style={styles.logo}
                                    source={require('../../assets/images/settings/call.png')} />
                                <Text style={styles.actionText}>{this.state.call_phone}</Text>
                            </TouchItem>
                            <TouchItem
                                style={[styles.actionItem, styles.actionTopItem]}
                                onPress={this.chatSupport}>
                                <Image style={styles.logo}
                                    source={require('../../assets/images/settings/whatsapp.png')} />
                                <Text style={styles.actionText}>{Dictionary.SUPPORT_CHAT}</Text>
                            </TouchItem>
                            <TouchItem
                                style={styles.actionItem}
                                onPress={this.mailSupport}>
                                <Image style={styles.logo}
                                    source={require('../../assets/images/settings/email.png')} />
                                <Text style={styles.actionText}>{this.state.support_mail}</Text>
                            </TouchItem>
                            <TouchItem
                                style={[styles.actionItem, styles.actionBottomItem]}
                                onPress={() => this.visitWebsite(this.state.support_website)}>
                                <Image style={styles.logo}
                                    source={require('../../assets/images/settings/website.png')} />
                                <Text style={[styles.actionText, styles.actionLink]}>{this.state.support_website}</Text>
                            </TouchItem>
                        </View>
                        <View style={[styles.actions, styles.social]}>
                            <Text style={[styles.actionText, { marginLeft: Mixins.scaleSize(16) }]}>{Dictionary.CONNECT_WITH_US}</Text>
                            <View style={styles.socialButtons}>
                                <TouchItem
                                    style={styles.socialActions}
                                    onPress={this.launchFacebook}>
                                    <Image style={styles.logo}
                                        source={require('../../assets/images/settings/facebook.png')} />
                                </TouchItem>
                                <TouchItem
                                    style={styles.socialActions}
                                    onPress={() => this.visitWebsite('https://www.instagram.com/creditville/')}>
                                    <Image style={styles.logo}
                                        source={require('../../assets/images/settings/instagram.png')} />
                                </TouchItem>
                                <TouchItem
                                    style={styles.socialActions}
                                    onPress={() => this.visitWebsite('https://www.twitter.com/creditville?lang=en')}>
                                    <Image style={styles.logo}
                                        source={require('../../assets/images/settings/twitter.png')} />
                                </TouchItem>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    banner: {
        width: '100%',
        height: Mixins.scaleSize(197)
    },
    content: {
        ...Mixins.padding(30, 16, 30, 16)
    },
    address: {
        paddingVertical: Mixins.scaleSize(20),
        flexDirection: 'row',
        /// elevation: 0.5,
        borderWidth: Mixins.scaleSize(2),
        borderRadius: Mixins.scaleSize(10),
        borderColor: Colors.FAINT_BORDER
    },
    logo: {
        marginHorizontal: Mixins.scaleSize(16),
        width: Mixins.scaleSize(32),
        height: Mixins.scaleSize(32)
    },
    addressTextHeader: {
        ...Typography.FONT_BOLD,
        color: Colors.CV_BLUE,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleFont(18),
        letterSpacing: Mixins.scaleSize(0.01)
    },
    addressTextBody: {
        ...Typography.FONT_REGULAR,
        color: Colors.CV_BLUE,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleFont(18),
        letterSpacing: Mixins.scaleSize(0.01)
    },
    actions: {
        /// elevation: 0.5,
        borderWidth: Mixins.scaleSize(2),
        borderRadius: Mixins.scaleSize(10),
        borderColor: Colors.FAINT_BORDER,
        marginVertical: Mixins.scaleSize(16)
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Mixins.scaleSize(10)
    },
    actionTopItem: {
        borderTopLeftRadius: Mixins.scaleSize(10),
        borderTopStartRadius: Mixins.scaleSize(10),
        borderTopRightRadius: Mixins.scaleSize(10),
        borderTopEndRadius: Mixins.scaleSize(10)
    },
    actionBottomItem: {
        borderBottomLeftRadius: Mixins.scaleSize(10),
        borderBottomStartRadius: Mixins.scaleSize(10),
        borderBottomRightRadius: Mixins.scaleSize(10),
        borderBottomEndRadius: Mixins.scaleSize(10)
    },
    actionText: {
        ...Mixins.margin(12, 16, 12, 8),
        ...Typography.FONT_REGULAR,
        color: Colors.CV_BLUE,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleFont(19),
        letterSpacing: Mixins.scaleSize(0.01)
    },
    actionLink: {
        color: Colors.CV_YELLOW
    },
    social: {
        marginTop: Mixins.scaleSize(0),
        flexDirection: 'row',
        alignItems: 'center'
    },
    socialButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    socialActions: {
        paddingVertical: Mixins.scaleSize(20),
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};

const mapDispatchToProps = {
    showToast
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(ContactSupport));