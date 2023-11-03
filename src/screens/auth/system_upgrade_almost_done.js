import React, { Component } from "react";
import { BackHandler, Text, View, Image, StyleSheet } from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";

import { showToast } from "_actions/toast_actions";

import { Dictionary, Util, ResponseCodes } from "_utils";
import { SharedStyle, FormStyle, Mixins, Colors } from "_styles";
import { SubHeader, ScrollView, FloatingLabelInput } from "_atoms";
import { MainHeader } from "_organisms";
import { PrimaryButton } from "_molecules";

import { Network } from "_services";

class SystemUpgradeAlmostDone extends Component {
  constructor(props) {
    super(props);

    const { navigation } = this.props;
    const bvn_data = navigation.getParam("bvn_data");
    const phone_number = navigation.getParam("phone_number") ?? "";
    const otp = navigation.getParam("otp") ?? "";

    this.state = {
      bvn_data,
      phone_number,
      otp
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      !this.state.processing && this.props.navigation.goBack();

      return true;
    }
  };

  handleSubmit = () => {
    this.props.navigation.navigate('ResetPassword',
    {
        phone_number: this.state.phone_number,
        otp: this.state.otp,   
        is_system_upgrade:true,
        bvn_data: this.state.bvn_data
    });
  };

  render() {
    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={""}
          backgroundStyle={{
            backgroundColor: Colors.WHITE,
            ...Mixins.boxShadow(Colors.WHITE),
          }}
          textColor="#090A0A"
        />
        <ScrollView {...this.props}>
          <View style={styles.panelContainerStyle}>
            <Image
              style={SharedStyle.upgradeImage}
              source={require("../../assets/images/shared/cybersecurity.png")}
            />

            <Text style={[SharedStyle.modalTopCenter, {fontSize: 18}]}>
              {Dictionary.ALMOST_DONE}
            </Text>

            <Text style={SharedStyle.biometricMainText}>
              {Dictionary.ALMOST_DONE_TEXT}
            </Text>

            <View style={styles.panelContentStyle}>
              <View style={styles.butonTransparantStyle}>
                <Image
                  style={styles.imgIconStyle}
                  source={require("../../assets/images/shared/icon_user.png")}
                />

                <Text style={styles.textTransStyle}>Change Password & PIN</Text>
              </View>
            </View>
          </View>
          <View style={SharedStyle.bottomPanel}>
            <View style={FormStyle.formButton}>
              <PrimaryButton
                loading={this.state.processing}
                title={Dictionary.CONTINUE_BTN}
                icon="arrow-right"
                onPress={this.handleSubmit}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  panelContainerStyle: {
    marginTop: Mixins.scaleSize(20),
    alignItems: "center",
    paddingHorizontal: Mixins.scaleSize(30)
  },
  panelContentStyle: {
    width: "100%",
    marginTop: Mixins.scaleSize(30)
  },
  imgIconStyle: {
    width: Mixins.scaleSize(32),
    height: Mixins.scaleSize(32),
    marginRight: Mixins.scaleSize(10)
  },

  butonTransparantStyle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Mixins.scaleSize(20)
  },
  textTransStyle: {
    fontWeight: "bold",
    fontSize: Mixins.scaleSize(12)
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(SystemUpgradeAlmostDone));
