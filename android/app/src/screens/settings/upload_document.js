import React, { Component } from 'react';
import { BackHandler, StyleSheet, View, Text } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { showToast } from '_actions/toast_actions';
import { getDocuments } from '_actions/document_actions';

import { Dictionary } from '_utils';
import { Colors, Mixins, Typography, SharedStyle } from '_styles';
import { SubHeader, ScrollView } from '_atoms';
import { MainHeader, ImagePicker } from '_organisms';

import { Network } from '_services';

class UploadDocument extends Component {
    constructor(props) {
        super(props);

        const { navigation } = this.props;
        const document = navigation.getParam('document');

        let header_text = Dictionary.UPLOAD_DOCUMENT_HEADER;
        header_text = header_text.replace("%s", document.code_description);

        this.state = {
            document,
            header_text,
            image_preview: false,
            processing: false
        }
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            !this.state.processing && this.props.navigation.goBack();

            return true;
        }
    }

    handleImageError = (error) => {
        this.props.showToast(error);
    }

    handleImagePreview = (is_previewing) => {
        this.setState({
            image_preview: is_previewing
        });
    }

    handleProcessImage = (imageData) => {
        this.setState({ processing: true });

        let localUri = imageData.uri;
        let filename = localUri.split('/').pop();

        // Infer the type of the image
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;

        let formData = new FormData();
        formData.append('file', { uri: localUri, name: filename, type });

        Network.uploadFile(formData)
            .then((fileData) => {
                if (!this.state.document.user_data) {
                    // New document upload
                    Network.addUserDocument(this.state.document.id, fileData.data.url)
                        .then((result) => {
                            this.setState({
                                processing: false
                            }, () => {
                                this.handleBackButton();
                                this.props.showToast(result.message, false);
                                this.props.getDocuments();
                            });
                        }).catch((error) => {
                            this.setState({ processing: false }, () =>
                                this.props.showToast(error.message));
                        });
                } else {
                    // Update to an existing user document
                    Network.updateUserDocument(this.state.document.user_data.id, this.state.document.id, fileData.data.url)
                        .then((result) => {
                            this.setState({
                                processing: false
                            }, () => {
                                this.handleBackButton();
                                this.props.showToast(result.message, false);
                                this.props.getDocuments();
                            });
                        }).catch((error) => {
                            this.setState({ processing: false }, () =>
                                this.props.showToast(error.message));
                        });
                }
            })
            .catch((error) => {
                this.setState({ processing: false }, () =>
                    this.props.showToast(error.message));
            });
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.DOCUMENTS_HEADER} />
                <ScrollView {...this.props}>
                    <View style={{ flex: 1 }}>
                        <SubHeader text={this.state.header_text} />
                        <ImagePicker
                            style={styles.pickerBackground}
                            onCompleted={this.handleProcessImage}
                            onImagePreview={(is_previewing) => this.handleImagePreview(is_previewing)}
                            onError={(error) => this.handleImageError(error)}
                            processing={this.state.processing} />
                        {this.state.document.additional_code === 'id' && !this.state.image_preview && (
                            <View style={styles.requirementsPanel}>
                                <View style={styles.requirements}>
                                    <Text style={styles.requirementsHeader}>{Dictionary.ID_REQUIRED}</Text>
                                    <Text style={styles.requirementsText}>{Dictionary.ID_REQUIREMENTS}</Text>
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
    pickerBackground: {
        backgroundColor: Colors.UNCHECKED_BG
    },
    requirementsPanel: {
        position: 'absolute',
        top: Mixins.scaleSize(90),
        width: '100%',
    },
    requirements: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: Mixins.scaleSize(8),
        ...Mixins.margin(16),
        ...Mixins.padding(12)
    },
    requirementsHeader: {
        ...Typography.FONT_MEDIUM,
        color: Colors.WHITE,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        opacity: 0.9
    },
    requirementsText: {
        ...Typography.FONT_REGULAR,
        color: Colors.WHITE,
        fontSize: Mixins.scaleFont(12),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        opacity: 0.8
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        documents: state.documents
    };
};

const mapDispatchToProps = {
    showToast,
    getDocuments
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(UploadDocument));