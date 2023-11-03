import React, { Component } from 'react';
import { BackHandler, ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { showToast } from '_actions/toast_actions';
import { getDocuments } from '_actions/document_actions';

import { Dictionary } from '_utils';
import { Colors, Mixins, Typography, SharedStyle } from '_styles';
import { SubHeader, ScrollView, ProgressBar } from '_atoms';
import { MainHeader, ImagePicker } from '_organisms';

import { Network } from '_services';

class LoanUploadID extends Component {
    state = {
        loading: false,
        image_preview: false,
        processing: false,
        document_id: null
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

        if (this.props.documents.items.length === 0) {
            this.getDocuments();
        } else {
            this.prepareIdentityUpload(this.props.documents.items);
        }
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

    getDocuments = () => {
        this.setState({ loading: true });
        Network.getDocumentTypes()
            .then((result) => {
                this.prepareIdentityUpload(result.data);
            }).catch((error) => {
                this.setState({
                    loading: false
                }, () => {
                    this.handleBackButton();
                    this.props.showToast(error.message);
                });
            });
    }

    prepareIdentityUpload = (documents) => {
        let identity = documents.find(doc => doc.additional_code === 'id');
        if (identity) {
            this.setState({
                loading: false,
                document_id: identity.id,
                document_data: identity.user_data
            });
        } else {
            this.setState({
                loading: false
            }, () => {
                this.props.showToast(Dictionary.GENERAL_ERROR);
                this.handleBackButton();
            });
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
                if (!this.state.document_data) {
                    // New document upload
                    Network.addUserDocument(this.state.document_id, fileData.data.url)
                        .then(() => {
                            this.setState({ processing: false }, () => {
                                this.props.getDocuments();
                                this.props.navigation.navigate('LoanUserSummary');
                            });
                        }).catch((error) => {
                            this.setState({ processing: false }, () => {
                                // Weird way sha... But
                                if (error.message === 'This document already exists on your profile') {
                                    this.props.getDocuments();
                                    this.props.navigation.navigate('LoanUserSummary');
                                } else {
                                    this.props.showToast(error.message)
                                }
                            });
                        });
                } else {
                    // Update to an existing user document
                    Network.updateUserDocument(this.state.document_data.id, this.state.document_id, fileData.data.url)
                        .then(() => {
                            this.setState({ processing: false }, () => {
                                this.props.getDocuments();
                                this.props.navigation.navigate('LoanUserSummary');
                            });
                        }).catch((error) => {
                            this.setState({ processing: false }, () => {
                                // Weird way sha... But
                                if (error.message === 'Can not modify a pending or approved document') {
                                    this.props.getDocuments();
                                    this.props.navigation.navigate('LoanUserSummary');
                                } else {
                                    this.props.showToast(error.message)
                                }
                            });
                        });
                }
            }).catch((error) => {
                this.setState({ processing: false }, () =>
                    this.props.showToast(error.message));
            });
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.LOAN_APPLICATION} />
                <ScrollView {...this.props}>
                    {this.state.loading && (
                        <View style={SharedStyle.loaderContainer}>
                            <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                        </View>
                    )}
                    {!this.state.loading && (
                        <View style={{ flex: 1 }}>
                            <SubHeader text={Dictionary.UPLOAD_ID_HEADER} />
                            <ProgressBar progress={0.55} />
                            <ImagePicker
                                onCompleted={this.handleProcessImage}
                                onImagePreview={(is_previewing) => this.handleImagePreview(is_previewing)}
                                onError={(error) => this.handleImageError(error)}
                                processing={this.state.processing} />
                            {!this.state.image_preview && (
                                <View style={styles.requirementsPanel}>
                                    <View style={styles.requirements}>
                                        <Text style={styles.requirementsHeader}>{Dictionary.ID_REQUIRED}</Text>
                                        <Text style={styles.requirementsText}>{Dictionary.ID_REQUIREMENTS}</Text>
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

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(LoanUploadID));