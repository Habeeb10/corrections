import React, { Component } from "react";
import {
  BackHandler,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import { Camera, Came } from "expo-camera";
import * as FaceDetector from "expo-face-detector";
// import {ImageManipulator} from "expo";
import * as ImageManipulator from "expo-image-manipulator";

import { showToast } from "_actions/toast_actions";
import { storeUserData } from "_actions/user_actions";
import { getUserProfile } from "_actions/user_actions";
import { PrimaryButton, SecondaryButton } from "_molecules";

import { Dictionary, Util } from "_utils";
import { Colors, SharedStyle, Mixins, FormStyle } from "_styles";
import { SubHeader, ScrollView, TouchItem } from "_atoms";
import { MainHeader, ImagePicker } from "_organisms";

import { Network } from "_services";

class OnboardSelfie extends Component {
  constructor(props) {
    super(props);
    this.camera;

    this.state = {
      image_preview: false,
      processing: false,
      isFacedCaptured: false,
      isPreviewing: false,
      imageData: null,
    };
  }
  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    this.__startCamera();
  }
  __startCamera = async () => {
    const { status } = await Camera.requestPermissionsAsync();
    if (status === "granted") {
      this.setState({
        isGranted: true,
      });
      // start the camera
      // setStartCamera(true)
    } else {
      Alert.alert("Access denied");
    }
  };

  handleFacesDetected = ({ faces }) => {
    if (faces.length > 0) {
      this.setState({
        isFacedCaptured: true,
      });
    } else {
      this.setState({
        isFacedCaptured: false,
      });
    }
  };

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      !this.state.processing && this.props.navigation.goBack();

      return true;
    }
  };

  handleImageError = (error) => {
    this.props.showToast(error);
  };

  handleImagePreview = (is_previewing) => {
    this.setState({
      image_preview: is_previewing,
    });
  };

  handleProcessImage = (imageData) => {
    this.setState({ processing: true });

    let localUri = imageData.uri;
    let filename = localUri.split("/").pop();

    // Infer the type of the image
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;

    let formData = new FormData();
    // formData.append("files", { uri: localUri, name: filename, type });
    formData.append("files", { uri: localUri, name: filename, type });
    formData.append("docType", "profile");

    Network.savePhoto(formData)
      .then((fileData) => {
        // Network.updateUserPicture(fileData.data.url)
        //     .then((result) => {
        console.log("API Response:", fileData);

        this.setState(
          {
            processing: false,
          },
          () => {
            // Update locally to prevent FLOUC
            let { user_data } = this.props.user;
            // user_data.photo_url = fileData.data.url;
            // this.props.storeUserData(user_data);

            // Double-tap from server
            this.props.getUserProfile();

            this.handleBackButton();
            // this.props.getUserProfile();
            Util.logEventData("onboarding_selfie");
          }
        );
        // }).catch((error) => {
        //     this.setState({ processing: false }, () =>
        //         this.props.showToast(error.message));
        // });
      })
      .catch((error) => {
        this.setState({ processing: false }, () =>
          this.props.showToast(error.message)
        );
      });
  };

  __takePicture = async () => {
    if (!this.camera) return;
    const photo = await this.camera.takePictureAsync();
    const manipResult = await ImageManipulator.manipulateAsync(photo.uri, [], {
      compress: 0.2,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    // console.log("her#r",manipResult)
    this.setState({
      isPreviewing: true,
      imageData: manipResult,
    });
  };

  handleRetry = () => {
    try {
      this.setState({
        isPreviewing: false,
        imageData: null,
      });
    } catch (error) {
      console.error("Error in handleRetry:", error);
    }
  };

  // handleRetry = () => {
  //   this.setState({
  //     isPreviewing: false,
  //     imageData: null,
  //   });
  // };

  render() {
    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.GET_STARTED_HEADER}
        />
        <ScrollView {...this.props}>
          <View style={{ flex: 1 }}>
            <SubHeader text={Dictionary.SELFIE_HEADER} />

            {this.state.isPreviewing && (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                }}
              >
                <Image
                  style={styles.previewImage}
                  source={{ uri: this.state.imageData.uri }}
                />
              </View>
            )}
            {this.state.isPreviewing && (
              <View style={styles.pane}>
                <View style={styles.buttons}>
                  <View style={FormStyle.formButton}>
                    <SecondaryButton
                      disabled={this.state.processing}
                      title={Dictionary.RETRY_BTN}
                      icon="arrow-right"
                      onPress={this.handleRetry}
                    />
                  </View>
                  <View style={FormStyle.formButton}>
                    <PrimaryButton
                      loading={this.state.processing}
                      disabled={this.state.processing}
                      title={Dictionary.CONTINUE_BTN}
                      icon="arrow-right"
                      onPress={() =>
                        this.handleProcessImage(this.state.imageData)
                      }
                    />
                  </View>
                </View>
              </View>
            )}

            {!this.state.isPreviewing && this.state.isGranted && (
              <View style={{ flex: 1 }}>
                <Camera
                  ref={(r) => {
                    this.camera = r;
                  }}
                  ratio={"4:3"}
                  style={{ flex: 1, width: "100%" }}
                  // other props
                  type="front"
                  onFacesDetected={this.handleFacesDetected}
                  faceDetectorSettings={{
                    mode: FaceDetector.Constants.Mode.fast,
                    detectLandmarks: FaceDetector.Constants.Landmarks.none,
                    runClassifications:
                      FaceDetector.Constants.Classifications.all,
                    minDetectionInterval: 500,
                    tracking: false,
                  }}
                />

                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    flexDirection: "row",
                    flex: 1,
                    width: "100%",
                    padding: 20,
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      alignSelf: "center",
                      flex: 1,
                      alignItems: "center",
                    }}
                  >
                    {this.state.isFacedCaptured ? (
                      <TouchableOpacity
                        onPress={() => this.__takePicture()}
                        style={{
                          width: 70,
                          height: 70,
                          bottom: 0,
                          borderRadius: 50,
                          backgroundColor: "#fff",
                        }}
                      />
                    ) : (
                      <Text
                        style={{ color: Colors.CV_RED, fontWeight: "bold" }}
                      >
                        Place A Face to the Camera...
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  floatingButton: {
    alignSelf: "center",
    width: Mixins.scaleSize(65),
    height: Mixins.scaleSize(65),
    marginBottom: Mixins.scaleSize(50),
    backgroundColor: Colors.CV_RED,
    borderRadius: Mixins.scaleSize(50),
    borderWidth: Mixins.scaleSize(5),
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "80%",
    // resizeMode: 'cover'
  },

  pane: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  buttonPanel: {
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 0,
    height: Mixins.scaleSize(70),
    backgroundColor: Colors.WHITE,
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = {
  showToast,
  storeUserData,
  getUserProfile,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(OnboardSelfie));
