import React, { Component } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Platform,
  ImageBackground,
  Keyboard,
} from "react-native";
import { connect } from "react-redux";
import codePush from "react-native-code-push";
import Modal from "react-native-modal";
import { codePushDeploymentKeys } from "../../../index";
import { updatingApp } from "_actions/settings_actions";
import { Version } from "_atoms";
import { Colors } from "_styles";

class Updating extends Component {
  state = {
    statusText: "Checking for updates...",
    progress: 0,
  };

  componentDidMount() {
    Keyboard.dismiss();
    this.installUpdate();
  }

  installUpdate = async () => {
    await codePush.sync(
      {
        deploymentKey: codePushDeploymentKeys,
        installMode: codePush.InstallMode.IMMEDIATE,
      },
      (status) => {
        console.log("QLK3", {
          status: codePush.SyncStatus.CHECKING_FOR_UPDATE,
        });
        let nextText = "";
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
            nextText=""
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
  };

  render() {
    return (
        <ImageBackground
          source={require("../../assets/images/splashscreen.png")}
          style={{
            width: "100%",
            height: "100%",
            flex: 1,
            zIndex:10000,
            position:'absolute',
            backgroundColor: "#FFFFFF",
          }}
          resizeMode="cover"
        >
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text
              style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20, color: Colors.CV_BLUE }}
            >
              {this.state.statusText}
            </Text>
            <Text
              style={{ fontSize: 17, fontWeight: "bold", marginBottom: 20, color: Colors.CV_BLUE }}
            >
              {`${this.state.progress}%`}
            </Text>
            <ActivityIndicator size="large" color={Colors.CV_YELLOW}/>
            <Version style={{
              fontSize: 16,
              textAlign: "center",
              marginVertical: 10,
              position: "absolute",
              bottom: 5,
            }} />
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
