import React, { Component } from 'react';
import { connect } from "react-redux";
import NetInfo from "@react-native-community/netinfo";
import remoteConfig from '@react-native-firebase/remote-config';

import { ToastNotification } from '_atoms';
import { Dictionary } from '_utils';

import { getOrgPreferences } from '_actions/user_actions';

class OfflineNotice extends Component {
    state = {
        isOffline: false
    };

    componentDidMount() {
        this.unsubscribe = NetInfo.addEventListener(state => {
            this.setState({
                isOffline: !state.isInternetReachable
            }, () => {
                if (!this.state.isOffline && remoteConfig.LastFetchStatus !== 'success') {
                    remoteConfig()
                        .fetchAndActivate()
                        .then(() => {
                            const appConfig = remoteConfig().getAll();
                            // console.log('\n===== APP CONFIGURATIONS =====\n', JSON.stringify(appConfig, null, 4));
                        });
                    if (!this.props.user.preferences.organization) {
                      //  this.props.getOrgPreferences();
                    }
                }
            });
        });
    }
    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
    render() {
        return (
            <ToastNotification text={Dictionary.OFFLINE_NOTICE} isVisible={this.state.isOffline} />
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};

const mapDispatchToProps = {
    getOrgPreferences
};

export default connect(mapStateToProps, mapDispatchToProps)(OfflineNotice);