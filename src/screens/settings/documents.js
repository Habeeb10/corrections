import React, { Component } from 'react';
import { BackHandler, ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import * as Icon from '@expo/vector-icons';

import { showToast } from '_actions/toast_actions';
import { getDocuments } from '_actions/document_actions';

import { Dictionary } from '_utils';
import { Colors, Mixins, Typography, SharedStyle } from '_styles';
import { ScrollView, TouchItem } from '_atoms';
import { MainHeader } from '_organisms';

class Documents extends Component {
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        // this.props.getDocuments();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            !this.props.documents.loading && this.props.navigation.goBack();

            return true;
        }
    }

    selectDocument = (document) => {
        this.props.navigation.navigate('UploadDocument', { document });
    }

    render() {
        let { loading, documents, error_message } = this.props.user.user_data;
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.DOCUMENTS_HEADER} />
                <ScrollView {...this.props}>
                    {loading && items.length === 0 && (
                        <View style={SharedStyle.loaderContainer}>
                            <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                        </View>
                    )}
                    <View style={styles.documents}>
                        {documents.map(document => {
                            let statusText = !document ? null : document.status.toLowerCase();
                            let disabled = statusText === "pending" || statusText === "approved";
                            return <TouchItem
                                key={document.id}
                                style={styles.documentItem}
                                onPress={() => this.selectDocument(document)}
                                disabled={disabled}>
                                <Text style={styles.documentDescription}>{document.type}</Text>
                                <View style={styles.documentAction}>
                                    {!!statusText && (<Text style={[styles.documentStatus, styles[statusText]]}>{document.status}</Text>)}
                                    {!disabled && (<Icon.SimpleLineIcons style={{ marginLeft: Mixins.scaleSize(10) }}
                                        name="arrow-right"
                                        size={Mixins.scaleSize(15)}
                                        color={Colors.LIGHT_GREY}
                                    />)}
                                </View>
                            </TouchItem>
                        })}
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    documents: {
        ...Mixins.margin(32, 16, 32, 16)
    },
    documentItem: {
        ...Mixins.padding(16),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        /// elevation: 0.5,
        borderWidth: Mixins.scaleSize(2),
        borderRadius: Mixins.scaleSize(10),
        borderColor: Colors.FAINT_BORDER,
        marginBottom: Mixins.scaleSize(16)
    },
    documentDescription: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.DARK_GREY
    },
    documentAction: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    documentStatus: {
        ...Mixins.padding(5, 10, 5, 10),
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(12),
        lineHeight: Mixins.scaleSize(14),
        letterSpacing: Mixins.scaleSize(0.01),
        borderRadius: Mixins.scaleSize(5)
    },
    pending: {
        backgroundColor: Colors.WARNING_BG,
        color: Colors.WARNING
    },
    approved: {
        backgroundColor: Colors.SUCCESS_BG,
        color: Colors.SUCCESS
    },
    rejected: {
        backgroundColor: Colors.ERROR_BG,
        color: Colors.ERROR
    },
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

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Documents));