import React, { Component } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { ImageBackground } from 'react-native';
import { connect } from "react-redux";
import { withNavigationFocus } from "react-navigation";

import { clearUserData, removeSessionListener, getOrgPreferences } from '_actions/user_actions';

class NavLoader extends Component {
    constructor(props) {
        super(props);

        this.props.clearUserData();
        this.props.removeSessionListener();
        // this.props.getOrgPreferences();
        this.determineRoute();
    }

    determineRoute = async () => {
        if (this.props.user.is_tour_done) {
            this.props.navigation.navigate('Login');
        } else {
            this.props.navigation.navigate('Tour');
        }

        try {
            await SplashScreen.hideAsync();
        } catch (e) {
            console.log(e);
        }
    };

    render() {
        return (
            <ImageBackground source={require('../assets/images/splashscreen.png')} style={{ width: '100%', flex: 1 }} />
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};

const mapDispatchToProps = {
    clearUserData,
    removeSessionListener,
    getOrgPreferences
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(NavLoader));
