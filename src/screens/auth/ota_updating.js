import React, { Component } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Platform,
  ImageBackground,
} from "react-native";
import { connect } from "react-redux";
import codePush from "react-native-code-push";
import {codePushDeploymentKeys} from "../../../index";
import { updatingApp } from "_actions/settings_actions";
import {  Version } from '_atoms';
class Updating extends Component {
  state = {
    statusText: "Checking for updates...",
    progress: 0,
  };

  componentDidMount() {
     this.installUpdate()
  }

  installUpdate = async () => {
    await codePush.sync(
      {
        deploymentKey: codePushDeploymentKeys,
        installMode: codePush.InstallMode.IMMEDIATE,
      },
      (status) => {
        let nextText = "Checking for Updates...";
        let updateComplete = false;
        switch (status) {
          case codePush.SyncStatus.CHECKING_FOR_UPDATE:
          case codePush.SyncStatus.AWAITING_USER_ACTION:
            nextText = "Checking for Updates...";
            break;
          case codePush.SyncStatus.DOWNLOADING_PACKAGE:
            nextText = "Downloading Update...";
            break;
          case codePush.SyncStatus.INSTALLING_UPDATE:
            nextText = "Installing Update...";
            break;
          default:
            updateComplete = true;
            break;
        }

        if (updateComplete) {
          // make redux call
          this.props.updatingApp(false);
        } else {
          this.setState({ statusText: nextText });
        }
      },
      (downloadProgress) => {
        const { receivedBytes, totalBytes } = downloadProgress;
        const progress = (receivedBytes / totalBytes) * 100;
        this.setState({ progress: Math.ceil(progress) });
      }
    );
  }

  render() {

    return (
      <ImageBackground
        source={require("../../assets/images/splashscreen.png")}
        style={{
          width: "100%",
          height: "100%",
          flex:1,
          borderRadius: 10,
          backgroundColor: "#FFF",
        }}
        resizeMode="cover"
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
            {this.state.statusText}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
            {`${this.state.progress}%`}
          </Text>
          <ActivityIndicator size="large" />
          {/* <Version style={{
              fontSize: 16,
              textAlign: "center",
              marginVertical: 10,
              position: "absolute",
              bottom: 5,
            }} /> */}
        </View>
      </ImageBackground>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    settings: state.settings,
  };
};

const mapDispatchToProps = {
  updatingApp,
};

export default connect(mapStateToProps, mapDispatchToProps)(Updating);
