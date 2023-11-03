import React, { Component } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { showToast } from '_actions/toast_actions';
import { getUserProfile } from '_actions/user_actions';

import { Dictionary } from '_utils';
import { Colors, SharedStyle } from '_styles';
import { SubHeader, ScrollView } from '_atoms';
import { MainHeader, ImagePicker } from '_organisms';

import { Network } from '_services';

class UploadSelfie extends Component {
    state = {
        image_preview: false,
        processing: false
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
        formData.append('files', { uri: localUri, name: filename, type });

        Network.savePhoto(formData)
            .then((fileData) => {
               
                  
                        this.setState({
                            processing: false
                        }, () => {
                            this.handleBackButton();
                            this.props.showToast("Profile picture updated successfully", false);
                            this.props.getUserProfile();
                        });
                 
            }).catch((error) => {
                this.setState({ processing: false }, () =>
                    this.props.showToast(error.message));
            });
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.PROFILE_HEADER} />
                <ScrollView {...this.props}>
                    <View style={{ flex: 1 }}>
                        <SubHeader text={Dictionary.SELFIE_HEADER} />
                        <ImagePicker
                            disableGallery={true}
                            onCompleted={this.handleProcessImage}
                            onImagePreview={(is_previewing) => this.handleImagePreview(is_previewing)}
                            onError={(error) => this.handleImageError(error)}
                            processing={this.state.processing} />
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.WHITE
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};

const mapDispatchToProps = {
    showToast,
    getUserProfile
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(UploadSelfie));