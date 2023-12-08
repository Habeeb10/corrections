import React, { Component } from "react";
import { BackHandler, ActivityIndicator, StyleSheet, View } from "react-native";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";
import * as FileSystem from "expo-file-system";

import { showToast } from "_actions/toast_actions";
import { getDocuments } from "_actions/document_actions";
import { getUserProfile } from "_actions/user_actions";

import { Dictionary, Util } from "_utils";
import { Colors, Mixins, Typography, SharedStyle } from "_styles";
import { SubHeader, ScrollView } from "_atoms";
import { MainHeader, ImagePicker } from "_organisms";

import { Network } from "_services";

class UploadUtility extends Component {
  state = {
    loading: false,
    image_preview: false,
    processing: false,
    document_id: null,
  };

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);

    // if (this.props.documents.items.length === 0) {
    //     this.getDocuments();
    // } else {
    //     this.prepareUtilityUpload(this.props.documents.items);
    // }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      let working = this.state.loading || this.state.processing;
      !working && this.props.navigation.goBack();

      return true;
    }
  };

  getFileInfo = async (fileURI) => {
    const fileInfo = await FileSystem.getInfoAsync(fileURI);
    return fileInfo;
  };

  isLessThanTheMB = (fileSize, smallerThanSizeMB) => {
    const isOk = fileSize / 1024 / 1024 < smallerThanSizeMB;
    return isOk;
  };

  getDocuments = () => {
    this.setState({ loading: true });
    Network.getDocumentTypes()
      .then((result) => {
        this.prepareUtilityUpload(result.data);
      })
      .catch((error) => {
        this.setState(
          {
            loading: false,
          },
          () => {
            this.props.navigation.navigate("Login");
            this.props.showToast(error.message);
          }
        );
      });
  };

  prepareUtilityUpload = (documents) => {
    let identity = documents.find((doc) => doc.additional_code === "utility");
    if (identity) {
      this.setState({
        loading: false,
        document_id: identity.id,
      });
    } else {
      this.setState(
        {
          loading: false,
        },
        () => {
          this.handleSkip();
        }
      );
    }
  };

  handleSkip = () => {
    const { navigation } = this.props;
    const update_user = navigation.getParam("update_user");
    const bvn_data = navigation.getParam("bvn_data");
    if (update_user) {
      //this.props.showToast("Upload is successfull", false);
      this.props.getUserProfile();
      this.props.navigation.navigate("Dashboard");
    } else {
      this.props.navigation.navigate("CreatePIN", {
        bvn_data,
      });
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

  handleProcessImage = async (imageData) => {
    this.setState({ processing: true });

    let localUri = imageData.uri;
    let filename = localUri.split("/").pop();
    let androidURI = localUri.includes("file:///")
      ? localUri
      : localUri.replace("file:/", "file:///");

    // Infer the type of the image
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;

    let formData = new FormData();
    formData.append("files", { uri: localUri, name: filename, type });
    formData.append("docType", "utility");

    const fileInfo = await this.getFileInfo(androidURI);

    const isLt1MB = this.isLessThanTheMB(fileInfo.size, 1);

    if (!isLt1MB) {
      this.props.showToast(`Image size must be smaller than 1MB!`);
      this.setState({ processing: false });
      return;
    }

    Network.uploadUtility(formData)
      .then((fileData) => {
        console.log("myfile", fileData);
        this.setState({ processing: false });
        this.handleSkip();
        Util.logEventData("onboarding_document_utility");
      })
      .catch((error) => {
        this.setState({ processing: false }, () =>
          this.props.showToast(error.message)
        );
      });
  };

  render() {
    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          onPressLeftIcon={this.handleBackButton}
          title={Dictionary.GET_STARTED_HEADER}
        />
        <ScrollView {...this.props}>
          {this.state.loading && (
            <View style={SharedStyle.loaderContainer}>
              <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
            </View>
          )}
          {!this.state.loading && (
            <View style={{ flex: 1 }}>
              <SubHeader text={Dictionary.SIGN_UP_UPLOAD_UTILITY_HEADER} />
              <ImagePicker
                onSkip={this.handleSkip}
                onCompleted={this.handleProcessImage}
                onImagePreview={(is_previewing) =>
                  this.handleImagePreview(is_previewing)
                }
                onError={(error) => this.handleImageError(error)}
                processing={this.state.processing}
              />
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  requirementsPanel: {
    position: "absolute",
    top: Mixins.scaleSize(90),
    width: "100%",
  },
  requirements: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: Mixins.scaleSize(8),
    ...Mixins.margin(16),
    ...Mixins.padding(12),
  },
  requirementsHeader: {
    ...Typography.FONT_MEDIUM,
    color: Colors.WHITE,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
    opacity: 0.9,
  },
  requirementsText: {
    ...Typography.FONT_REGULAR,
    color: Colors.WHITE,
    fontSize: Mixins.scaleFont(12),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
    opacity: 0.8,
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    documents: state.documents,
  };
};

const mapDispatchToProps = {
  showToast,
  getDocuments,
  getUserProfile,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(UploadUtility));
