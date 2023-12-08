// import React, { Component } from 'react';
// import { BackHandler, ActivityIndicator, StyleSheet, View, Text } from 'react-native';
// import { withNavigationFocus } from "react-navigation";
// import { connect } from 'react-redux';
// import * as Icon from '@expo/vector-icons';

// import { showToast } from '_actions/toast_actions';
// import { getDocuments } from '_actions/document_actions';

// import { Dictionary } from '_utils';
// import { Colors, Mixins, Typography, SharedStyle } from '_styles';
// import { ScrollView, TouchItem } from '_atoms';
// import { MainHeader } from '_organisms';

// class Documents extends Component {
//     componentDidMount() {
//         BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
//         // this.props.getDocuments();
//     }

//     componentWillUnmount() {
//         BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
//     }

//     handleBackButton = () => {
//         if (this.props.isFocused) {
//             !this.props.documents.loading && this.props.navigation.goBack();

//             return true;
//         }
//     }

//     selectDocument = (document) => {
//         this.props.navigation.navigate('UploadDocument', { document });
//     }

//     render() {
//         let { loading, documents, error_message } = this.props.user.user_data;
//         return (
//             <View style={SharedStyle.mainContainer}>
//                 <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.DOCUMENTS_HEADER} />
//                 <ScrollView {...this.props}>
//                     {loading && items.length === 0 && (
//                         <View style={SharedStyle.loaderContainer}>
//                             <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
//                         </View>
//                     )}
//                     <View style={styles.documents}>
//                         {documents.map(document => {
//                             let statusText = !document ? null : document.status.toLowerCase();
//                             let disabled = statusText === "pending" || statusText === "approved";
//                             return <TouchItem
//                                 key={document.id}
//                                 style={styles.documentItem}
//                                 onPress={() => this.selectDocument(document)}
//                                 disabled={disabled}>
//                                 <Text style={styles.documentDescription}>{document.type}</Text>
//                                 <View style={styles.documentAction}>
//                                     {!!statusText && (<Text style={[styles.documentStatus, styles[statusText]]}>{document.status}</Text>)}
//                                     {!disabled && (<Icon.SimpleLineIcons style={{ marginLeft: Mixins.scaleSize(10) }}
//                                         name="arrow-right"
//                                         size={Mixins.scaleSize(15)}
//                                         color={Colors.LIGHT_GREY}
//                                     />)}
//                                 </View>
//                             </TouchItem>
//                         })}
//                     </View>
//                 </ScrollView>
//             </View>
//         );
//     }
// }

// const styles = StyleSheet.create({
//     documents: {
//         ...Mixins.margin(32, 16, 32, 16)
//     },
//     documentItem: {
//         ...Mixins.padding(16),
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         /// elevation: 0.5,
//         borderWidth: Mixins.scaleSize(2),
//         borderRadius: Mixins.scaleSize(10),
//         borderColor: Colors.FAINT_BORDER,
//         marginBottom: Mixins.scaleSize(16)
//     },
//     documentDescription: {
//         ...Typography.FONT_REGULAR,
//         fontSize: Mixins.scaleFont(14),
//         lineHeight: Mixins.scaleSize(16),
//         letterSpacing: Mixins.scaleSize(0.01),
//         color: Colors.DARK_GREY
//     },
//     documentAction: {
//         flexDirection: 'row',
//         alignItems: 'center'
//     },
//     documentStatus: {
//         ...Mixins.padding(5, 10, 5, 10),
//         ...Typography.FONT_REGULAR,
//         fontSize: Mixins.scaleFont(12),
//         lineHeight: Mixins.scaleSize(14),
//         letterSpacing: Mixins.scaleSize(0.01),
//         borderRadius: Mixins.scaleSize(5)
//     },
//     pending: {
//         backgroundColor: Colors.WARNING_BG,
//         color: Colors.WARNING
//     },
//     approved: {
//         backgroundColor: Colors.SUCCESS_BG,
//         color: Colors.SUCCESS
//     },
//     rejected: {
//         backgroundColor: Colors.ERROR_BG,
//         color: Colors.ERROR
//     },
// });

// const mapStateToProps = (state) => {
//     return {
//         user: state.user,
//         documents: state.documents
//     };
// };

// const mapDispatchToProps = {
//     showToast,
//     getDocuments
// };

// export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Documents));

import * as Icon from "@expo/vector-icons";
import { getDocuments } from "_actions/document_actions";
import { showToast } from "_actions/toast_actions";
import { ScrollView, TouchItem } from "_atoms";
import { PrimaryButton } from "_molecules";
import { ImagePicker, MainHeader } from "_organisms";
import { Colors, Mixins, SharedStyle, Typography } from "_styles";
import { Dictionary } from "_utils";
import React, { Component } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { withNavigationFocus } from "react-navigation";
import { connect } from "react-redux";

class Documents extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      document: {},
    };
  }
  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
    // this.props.getDocuments();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton = () => {
    if (this.props.isFocused) {
      !this.props.documents.loading && this.props.navigation.goBack();

      return true;
    }
  };

  selectDocument = (document) => {
    console.log("pressed");
    this.props.navigation.navigate("UploadDocument", { document });
  };

  openModal = () => {
    this.setState({ modalVisible: true });
  };
  closeModal = () => {
    this.setState({ modalVisible: false });
  };
  handleItemPress = (item) => {
    this.setState({ selectedDocument: item }); // Store the selected document
    console.log("ggjgjgjggj", this.state.selectedDocument);
    this.openModal();
  };

  render() {
    const { loading, documents, error_message } = this.props.user.user_data;
    const { document } = this.state;
    const statusText = !document ? null : document?.status?.toLowerCase();
    console.log(document);
    return (
      <View style={SharedStyle.mainContainer}>
        <MainHeader
          leftIcon="arrow-left"
          title={Dictionary.DOCUMENTS_HEADER}
          onPressLeftIcon={this.handleBackButton}
        />
        <ScrollView {...this.props}>
          {loading && items.length === 0 && (
            <View style={SharedStyle.loaderContainer}>
              <ActivityIndicator color={Colors.CV_YELLOW} size="large" />
            </View>
          )}
          <View style={styles.documents}>
            {documents.map((document) => {
              const statusText = !document
                ? null
                : document.status.toLowerCase();
              const disabled =
                statusText === "pending" ||
                statusText === "reject" ||
                statusText === "approved";
              return (
                <TouchItem
                  key={document.id}
                  style={styles.documentItem}
                  onPress={() => {
                    console.log(document.status, "jjjj");

                    this.openModal();
                    this.setState({
                      document,
                    });
                  }}
                  // disabled={disabled}
                >
                  <View>
                    <Text style={styles.documentDescription}>
                      {document.type}
                    </Text>
                    {statusText === "approved" ? (
                      <Text style={styles.view}>Click to view</Text>
                    ) : (
                      <Text style={styles.view}>Click to re-upload</Text>
                    )}
                  </View>

                  <View style={styles.documentAction}>
                    {!!statusText && (
                      <Text style={[styles.documentStatus, styles[statusText]]}>
                        {document.status}
                      </Text>
                    )}
                    {!disabled && (
                      <Icon.SimpleLineIcons
                        color={Colors.LIGHT_GREY}
                        name="arrow-right"
                        size={Mixins.scaleSize(15)}
                        style={{ marginLeft: Mixins.scaleSize(10) }}
                      />
                    )}
                  </View>
                </TouchItem>
              );
            })}
          </View>
        </ScrollView>

        <Modal
          // transparent={true}
          animationIn={"slideInUp"}
          backdropOpacity={0.5}
          isVisible={this.state.modalVisible}
          style={{ margin: 0, width: "100%", bottom: 0, height: 300 }}
          onBackdropPress={() => this.closeModal()}
        >
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: Mixins.scaleSize(480),
              borderTopLeftRadius: Mixins.scaleSize(10),
              borderTopRightRadius: Mixins.scaleSize(10),
              backgroundColor: "white",
              bottom: 0,
              paddingHorizontal: Mixins.scaleSize(18),
              paddingTop: Mixins.scaleSize(18),
              height: 500,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: Mixins.scaleSize(25),
              }}
            >
              <Text
                style={{
                  ...Typography.FONT_BOLD,
                  fontSize: Mixins.scaleFont(20),
                  color: "#174375",
                }}
              >
                {document?.type}
              </Text>

              <Text style={[styles.documentStatus, styles[statusText]]}>
                {document?.status}
              </Text>
            </View>
            {statusText === "rejected" && (
              <View style={{ ...Mixins.margin(20, 0, 15, 0) }}>
                <Text
                  style={{
                    ...Typography.FONT_MEDIUM,
                    fontSize: Mixins.scaleFont(14),
                    color: "#28374C",
                  }}
                >
                  Reason for rejection
                </Text>
                <Text
                  style={{
                    ...Typography.FONT_REGULAR,
                    fontSize: Mixins.scaleFont(14),
                    color: "#28374C",
                  }}
                >
                  Inconsistent Data
                </Text>
              </View>
            )}

            <Image
              resizeMode="cover"
              source={{ uri: document?.fileDownLoadUrl }}
              style={{ borderRadius: 10, height: 260, marginBottom: 30 }}
            />
            {statusText !== "approved" && (
              <View
                style={{
                  borderRadius: 10,
                  borderStyle: "dashed",
                  borderColor: Colors.GREY,
                  borderWidth: 2,
                  ...Mixins.margin(20, 0, 0, 0),
                  flexDirection: "row",
                  alignSelf: "center",
                  paddingHorizontal: 6,
                  paddingVertical: 10,
                  // height: 200,
                }}
              >
                <Image
                  resizeMode="contain"
                  source={require("../../assets/images/upload.png")}
                  style={{ height: 40, width: 40, marginRight: 2 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      ...Typography.FONT_BOLD,
                      fontSize: Mixins.scaleFont(14),
                    }}
                  >
                    Tap to Upload a file
                  </Text>
                  <Text>SVG, PNG, JPG, GIF | 10MB max.</Text>
                </View>
                <View style={{ height: 50, width: 100 }}>
                  <PrimaryButton
                    title={"Reupload"}
                    // onPress={this.handleTransactionAuthorization}
                    onPress={() => {
                      this.closeModal();
                      this.selectDocument(document);
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  view: {
    ...Typography.FONT_REGULAR,
    fontSize: Mixins.scaleFont(12),
    marginTop: Mixins.scaleSize(4),
  },
  packageContainer: {
    width: "100%",
    height: Mixins.scaleSize(55),
    borderColor: Colors.GREY,
    borderWidth: 1,
    borderRadius: Mixins.scaleSize(3),
    marginBottom: Mixins.scaleSize(10),
    paddingHorizontal: Mixins.scaleSize(5),
    flexDirection: "row",
    justifyContent: "space-between",
    // alignItems: "center",
  },

  documents: {
    ...Mixins.margin(32, 16, 32, 16),
  },
  documentItem: {
    ...Mixins.padding(16),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    /// elevation: 0.5,
    borderWidth: Mixins.scaleSize(2),
    borderRadius: Mixins.scaleSize(10),
    borderColor: Colors.FAINT_BORDER,
    marginBottom: Mixins.scaleSize(16),
  },
  documentDescription: {
    ...Typography.FONT_REGULAR,
    fontSize: Mixins.scaleFont(14),
    lineHeight: Mixins.scaleSize(16),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.DARK_GREY,
  },
  documentAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  documentStatus: {
    ...Mixins.padding(5, 10, 5, 10),
    ...Typography.FONT_REGULAR,
    fontSize: Mixins.scaleFont(12),
    lineHeight: Mixins.scaleSize(14),
    letterSpacing: Mixins.scaleSize(0.01),
    borderRadius: Mixins.scaleSize(5),
  },
  pending: {
    backgroundColor: Colors.WARNING_BG,
    color: Colors.WARNING,
  },
  approved: {
    backgroundColor: Colors.SUCCESS_BG,
    color: Colors.SUCCESS,
  },
  rejected: {
    backgroundColor: Colors.ERROR_BG,
    color: Colors.ERROR,
  },
  pickerBackground: {
    backgroundColor: Colors.UNCHECKED_BG,
  },
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
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(Documents));
