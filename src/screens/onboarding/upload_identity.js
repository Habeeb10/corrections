import React, { Component } from "react";
import {
  BackHandler,
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
} from "react-native";
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

class UploadID extends Component {
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
    //     this.prepareIdentityUpload(this.props.documents.items);
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
        this.prepareIdentityUpload(result.data);
      })
      .catch((error) => {
        this.setState(
          {
            loading: false,
          },
          () => {
            this.handleBackButton();
            this.props.showToast(error.message);
          }
        );
      });
  };

  prepareIdentityUpload = (documents) => {
    let identity = documents.find((doc) => doc.additional_code === "id");
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
    const bvn_data = navigation.getParam("bvn_data");
    const update_user = navigation.getParam("update_user");
    const redirectToDashboard = navigation.getParam("redirectToDashboard");
    if (update_user) {
      if (redirectToDashboard) {
        this.props.getUserProfile();
        this.props.navigation.navigate("Dashboard");
      } else {
        this.props.navigation.navigate("UploadUtility", {
          bvn_data: null,
          update_user,
        });
      }
    } else {
      this.props.navigation.navigate("UploadUtility", {
        bvn_data,
      });
    }

    // this.props.navigation.navigate('CreatePIN');
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
    formData.append("docType", "identity");

    const fileInfo = await this.getFileInfo(androidURI);

    const isLt1MB = this.isLessThanTheMB(fileInfo.size, 1);

    if (!isLt1MB) {
      this.props.showToast(`Image size must be smaller than 1MB!`);
      this.setState({ processing: false });
      return;
    }
    Network.uploadIdentity(formData)
      .then((fileData) => {
        console.log("filedata", fileData);
        this.setState({ processing: false });
        this.props.showToast("Upload successful!", false);
        this.handleSkip();
        Util.logEventData("onboarding_document_id");
        // Network.addUserDocument(this.state.document_id, fileData.data.url)
        //     .then(() => {
        //         this.setState({ processing: false });
        //         this.handleSkip();
        //         Util.logEventData('onboarding_document_id');
        //     }).catch((error) => {
        //         this.setState({ processing: false }, () => {
        //             if (error.http_status === 409) {
        //                 // Document already exists...
        //                 this.handleSkip();
        //             } else {
        //                 this.props.showToast(error.message)
        //             }
        //         });
        //     });
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
              <SubHeader text={Dictionary.UPLOAD_ID_HEADER} />
              <ImagePicker
                onSkip={this.handleSkip}
                onCompleted={this.handleProcessImage}
                onImagePreview={(is_previewing) =>
                  this.handleImagePreview(is_previewing)
                }
                onError={(error) => this.handleImageError(error)}
                processing={this.state.processing}
              />
              {!this.state.image_preview && (
                <View style={styles.requirementsPanel}>
                  <View style={styles.requirements}>
                    <Text style={styles.requirementsHeader}>
                      {Dictionary.ID_REQUIRED}
                    </Text>
                    <Text style={styles.requirementsText}>
                      {Dictionary.ID_REQUIREMENTS}
                    </Text>
                  </View>
                </View>
              )}
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
)(withNavigationFocus(UploadID));
