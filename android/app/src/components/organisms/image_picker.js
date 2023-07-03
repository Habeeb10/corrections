import React, { Component } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import * as _ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import remoteConfig from '@react-native-firebase/remote-config';
import ImageEditor from "@react-native-community/image-editor";
import * as ImageManipulator from 'expo-image-manipulator';

import { Colors, Mixins, FormStyle } from '_styles';
import { TouchItem } from '_atoms';
import { PrimaryButton, SecondaryButton } from '_molecules';
import { env, Dictionary } from '_utils';
import { ScrollView } from 'react-native-gesture-handler';

class ImagePicker extends Component {
    state = {
        isPreviewing: false,
        imageData: null
    }

    cropImage = () => {
        return remoteConfig().getValue(`image_cropping_enabled_${env().target}`).asBoolean();
    }

    fromCamera = async () => {
        const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);
        const cameraPermission = await Permissions.askAsync(Permissions.CAMERA);

        if (status === 'granted' && cameraPermission.status === 'granted') {
            let result = await _ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.9,
                exif: false
            });


            if (!result.cancelled) {
            const manipResult=await ImageManipulator.manipulateAsync(result.uri,[],{compress:0.2,format:ImageManipulator.SaveFormat.JPEG});

                if (this.cropImage() && manipResult.width > 600 && manipResult.height > 800) {
                    ImageEditor.cropImage(manipResult.uri, {
                        offset: { x: 0, y: 0 },
                        size: { width: manipResult.width, height: manipResult.height },
                        displaySize: { width: 600, height: 800 },
                        resizeMode: 'contain',
                    }).then(url => {
                        manipResult.uri = url;
                        manipResult.width = 600;
                        manipResult.height = 800;

                        this.previewImage(manipResult);
                    });
                } else {
                    this.previewImage(manipResult);
                }
            }
        } else {
            this.props.onError(Dictionary.CAMERA_STORAGE_PERMISSION_ERROR);
        }
    }

    fromGallery = async () => {
        const { status } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY);

        if (status === 'granted') {
            let result = await _ImagePicker.launchImageLibraryAsync({
                // allowsEditing: true,
                allowsEditing:true,
                quality: 0.9,
               exif: false
            });

            if (!result.cancelled) {
                if (this.cropImage() && result.width > 600 && result.height > 800) {
                    ImageEditor.cropImage(result.uri, {
                        offset: { x: 0, y: 0 },
                        size: { width: result.width, height: result.height },
                        displaySize: { width: 600, height: 800 },
                        // resizeMode: 'contain',
                    }).then(url => {
                        result.uri = url;
                        result.width = 600;
                        result.height = 800;

                        this.previewImage(result);
                    });
                } else {
                    this.previewImage(result);
               }
            }
        } else {
            this.props.onError(Dictionary.STORAGE_PERMISSION_ERROR);
        }
    }

    previewImage = (imageData) => {
        this.setState({
            imageData,
            isPreviewing: true
        }, () => {
            if (this.props.onImagePreview) {
                this.props.onImagePreview(true);
            }
        });
    }

    handleRetry = () => {
        this.setState({
            imageData: null,
            isPreviewing: false
        }, () => {
            if (this.props.onImagePreview) {
                this.props.onImagePreview(false);
            }
        });
    }

    render() {
        return (
            <View style={[styles.container, this.props.style]}>
                {this.state.isPreviewing && (
                      
                    <View style={{justifyContent:"center",alignItems:"center",paddingHorizontal:10,paddingVertical:10}}>
                     
                        <Image style={styles.previewImage} source={{ uri: this.state.imageData.uri }} />
                        
                    
                    </View>
                   
                )}
                <View style={styles.buttonPanel}>
                    {!this.state.isPreviewing && (
                        <View style={styles.pane}>
                            <TouchItem style={styles.floatingButton} onPress={this.fromCamera} />
                            {this.props.onSkip && (
                                <View style={styles.buttons}>
                                    {!this.props.disableGallery && (
                                        <View style={FormStyle.formButton}>
                                            <PrimaryButton
                                                disabled={this.props.processing}
                                                title={Dictionary.FROM_GALLERY_BTN}
                                                icon="arrow-right"
                                                onPress={this.fromGallery} />
                                        </View>
                                    )}
                                    <View style={FormStyle.formButton}>
                                        <SecondaryButton
                                            disabled={this.props.processing}
                                            title={Dictionary.SKIP_BTN}
                                            icon="arrow-right"
                                            onPress={this.props.onSkip} />
                                    </View>
                                </View>
                            )}
                            {!this.props.onSkip && !this.props.disableGallery && (
                                <View style={styles.buttons}>
                                    <View style={FormStyle.formButton}>
                                        <PrimaryButton
                                            disabled={this.props.processing}
                                            title={Dictionary.SELECT_FROM_GALLERY_BTN}
                                            icon="arrow-right"
                                            onPress={this.fromGallery} />
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                    {this.state.isPreviewing && (
                        <View style={styles.pane}>
                            <View style={styles.buttons}>
                                <View style={FormStyle.formButton}>
                                    <SecondaryButton
                                        disabled={this.props.processing}
                                        title={Dictionary.RETRY_BTN}
                                        icon="arrow-right"
                                        onPress={this.handleRetry} />
                                </View>
                                <View style={FormStyle.formButton}>
                                    <PrimaryButton
                                        loading={this.props.processing}
                                        disabled={this.props.processing}
                                        title={Dictionary.CONTINUE_BTN}
                                        icon="arrow-right"
                                        onPress={() => this.props.onCompleted(this.state.imageData)} />
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    previewImage: {
        width: '100%',
        height: '80%',
        // resizeMode: 'cover'
    },
    pane: {
        flex: 1,
        width: '100%',
        alignItems: 'center'
    },
    buttonPanel: {
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        width: '100%'
    },
    floatingButton: {
        width: Mixins.scaleSize(65),
        height: Mixins.scaleSize(65),
        marginBottom: Mixins.scaleSize(50),
        backgroundColor: Colors.WHITE,
        borderRadius: Mixins.scaleSize(50),
        borderWidth: Mixins.scaleSize(5),
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 0,
        height: Mixins.scaleSize(70),
        backgroundColor: Colors.WHITE
    }
});

export default ImagePicker;
