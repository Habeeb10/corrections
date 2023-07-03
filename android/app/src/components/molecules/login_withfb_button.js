import React, { Component } from "react";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import * as Icon from "@expo/vector-icons";

import { ButtonWithBackgroundBottom, ButtonWithBackgroundText } from "_atoms";
import { Colors, Mixins } from "_styles";

import { LoginManager,AccessToken } from 'react-native-fbsdk'

class LoginWithFBButton extends Component {

    handleFacebookLogin () {

     LoginManager.logInWithPermissions(['public_profile', 'email',]).then(
        function (result) {
        if (result.isCancelled) {
            console.log('Login cancelled')
        } else {
            AccessToken.getCurrentAccessToken().then((res)=>{
                console.log("AccessTOKEN123",{res})
            })
            console.log('Login success with permissions: ' + result.grantedPermissions.toString())
        }
        },
        function (error) {
        console.log('Login fail with error: ' + error)
        }
    )
    }

  render() {
    return (
      <ButtonWithBackgroundBottom
        disabled={this.props.loading || this.props.disabled}
        style={[styles.background, this.props.backgroundStyle]}
        onPress={this.handleFacebookLogin}
      >
        {this.props.loading && (
          <ActivityIndicator
            style={styles.item}
            size="small"
            color={Colors.WHITE}
          />
        )}
        {!this.props.loading && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              flex:1
            }}
          >
            
              <View style={{}}>
                <Icon.Entypo name="facebook" size={20} color="white" style={{marginRight:20, marginLeft:-20}} />
              </View>
              <View style={{ alignSelf: "center" }}>
                <ButtonWithBackgroundText style={styles.text}>
                  Continue with Facebook
                </ButtonWithBackgroundText>
              </View>

          </View>
        )}
      </ButtonWithBackgroundBottom>
    );
  }
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#3b5998",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    // justifyContent: 'space-between',
    alignItems: "center",
  },
  item: {},
  text: {
    color: Colors.WHITE,
    width: "180%",
  },
  icon: {
    color: Colors.WHITE,
    textAlign: "right",
  },
});

export default LoginWithFBButton;
