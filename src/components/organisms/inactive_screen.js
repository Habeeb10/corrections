import React, { Component, useEffect, useState } from "react";
import { BackHandler, StyleSheet, View, Text } from "react-native";
import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { connect } from "react-redux";
import Modal from "react-native-modal";
import analytics from "@react-native-firebase/analytics";
import * as Icon from "@expo/vector-icons";

import { hideToast } from "_actions/toast_actions";
import { hideExitDialog } from "_actions/util_actions";
import {
  hideSessionDialog,
  refreshUserToken,
  clearUserData,
} from "_actions/user_actions";

import { Dictionary } from "_utils";
import { Colors, Mixins, Typography, SharedStyle } from "_styles";

import { ToastNotification, TouchItem } from "_atoms";
import { StatusBar, OfflineNotice } from "_organisms";
import { NavigatorService } from "_services";

inactive_screen.defaultProps = {
  onTimeOut: () => {},
  onContinue: () => {},
  isVisible: false,
};

export default function inactive_screen({ onContinue, onTimeOut, isVisible }) {

  return (
    <Modal
      // isVisible={this.props.user.show_session_dialog}
      isVisible={isVisible}
      animationInTiming={500}
      animationOutTiming={800}
      backdropTransitionInTiming={500}
      backdropTransitionOutTiming={800}
      useNativeDriver={true}
      style={{backgroundColor: "rgba(255,255,255,0.8)", flexDirection: "column", justifyContent: "Top", alignItems: "Top"}}
    >
      <Text>Please unlock the app to continue</Text>
    </Modal>
  );
}

const styles = StyleSheet.create({
  exitDialog: {
    justifyContent: "flex-end",
    margin: 0,
  },
  dialog: {
    ...Mixins.padding(0, 16, 16, 16),
    height: Mixins.scaleSize(235),
    alignItems: "center",
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
  button: {
    flex: 1,
    justifyContent: "center",
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

  modal: {
    justifyContent: 'flex-end',
    margin: 0
},
modalContent: {
    ...Mixins.padding(0, 16, 16, 16),
    alignItems: 'center'
},
modalSlider: {
    width: Mixins.scaleSize(50),
    height: Mixins.scaleSize(5),
    marginBottom: Mixins.scaleSize(12),
    backgroundColor: Colors.WHITE,
    borderRadius: Mixins.scaleSize(80),
    justifyContent: 'center',
    alignItems: 'center'
},
modalPanel: {
    backgroundColor: Colors.WHITE,
    flex: 1,
    width: '100%',
    borderRadius: Mixins.scaleSize(8)
},
modalTop: {
    ...Mixins.padding(24, 16, 24, 16),
    ...Typography.FONT_BOLD,
    fontSize: Mixins.scaleFont(16),
    lineHeight: Mixins.scaleSize(19),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.DARK_GREY,
    borderBottomColor: Colors.FAINT_BORDER,
    borderBottomWidth: Mixins.scaleSize(1)
},
modalMiddle: {
    ...Mixins.padding(32, 16, 32, 16),
    flexDirection: 'row',
    justifyContent: 'space-between'
},
modalBottom: {
    marginHorizontal: Mixins.scaleSize(16),
    borderTopColor: Colors.FAINT_BORDER,
    borderTopWidth: Mixins.scaleSize(1)
},
});
