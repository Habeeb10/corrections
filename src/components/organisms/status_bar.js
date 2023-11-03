import React, { Component } from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import Constants from 'expo-constants';
import * as ExpoStatusBar from 'expo-status-bar';

import { Colors } from '_styles';
import { AppConstants } from '_utils';

class StatusBarBackground extends Component {
    render() {
        let style = this.props.statusBarStyle;
        return (
            <View>
                {style === AppConstants.BLUE_STATUS_BAR && (
                    <View style={[styles.statusBarBackground, { backgroundColor: Colors.CV_BLUE }]}>
                        <StatusBar backgroundColor={Colors.CV_BLUE} barStyle="light-content" />
                    </View>
                )}
                {style === AppConstants.WHITE_STATUS_BAR && (
                    <View style={[styles.statusBarBackground, { backgroundColor: Colors.WHITE }]}>
                        <StatusBar backgroundColor={Colors.WHITE} barStyle="dark-content" />
                    </View>
                )}
                {style === AppConstants.ASH_STATUS_BAR && (
                    <View style={[styles.statusBarBackground, { backgroundColor: Colors.ASH_HEADER_BG }]}>
                        <StatusBar backgroundColor={Colors.ASH_HEADER_BG} barStyle="dark-content" />
                    </View>
                )}
                {style === AppConstants.ORANGE_STATUS_BAR && (
                    <View style={[styles.statusBarBackground, { backgroundColor: Colors.ORANGE_HEADER_BG }]}>
                        <StatusBar backgroundColor={Colors.ORANGE_HEADER_BG} barStyle="light-content" />
                    </View>
                )}
                {style === AppConstants.TRANSLUCENT_STATUS_BAR && (<ExpoStatusBar.StatusBar />)}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    statusBarBackground: {
        height: Platform.OS === 'ios' ? Constants.statusBarHeight : 0
    }
});

export default StatusBarBackground;
