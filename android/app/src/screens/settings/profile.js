import React, { Component } from 'react';
import { BackHandler, ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { withNavigationFocus } from "react-navigation";
import * as Icon from '@expo/vector-icons';

import { getUserProfile } from '_actions/user_actions';
import { showToast, showToastNav } from "_actions/toast_actions";

import { Dictionary } from '_utils';
import { Colors, Mixins, SharedStyle, FormStyle } from '_styles';
import { ScrollView, TouchItem } from '_atoms';

import { MainHeader } from '_organisms';

class Profile extends Component {
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        // this.props.getUserProfile();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            !this.props.user.loading_profile && this.props.navigation.goBack();
            return true;
        }
    }

    handleEditProfile = () => {
       // this.props.showToast(Dictionary.COMMING_SOON_CLICK)
        this.props.navigation.navigate('EditProfile');
    }

    render() {
        let { loading_profile, user_data, profile_error } = this.props.user;
        let {  lga } = user_data;

        let full_address =  '- - -';
        if (user_data.address && user_data.address.length>0) {
            full_address = user_data.address[0].address1 ?  ` ${user_data.address[0].address1}` : full_address;
            full_address = user_data.address[0].city ? full_address + `, ${user_data.address[0].city}` : full_address;
            full_address = lga ? full_address + `, ${lga}` : full_address;
            full_address = user_data.address[0].state ? full_address + `, ${user_data.address[0].state}.` : full_address;
        }

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.PROFILE_HEADER} />
                {loading_profile && (
                    <View style={SharedStyle.loaderContainer}>
                        <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                    </View>
                )}
                {!loading_profile && !profile_error && (
                    <ScrollView {...this.props}>
                        <View style={FormStyle.formContainer}>
                            <View style={SharedStyle.section}>
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.FIRST_NAME_LABEL}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{user_data.firstName}</Text>
                                    </View>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.MOBILE_NUMBER_LABEL}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>{user_data.phoneNumber}</Text>
                                    </View>
                                </View>
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.LAST_NAME_LABEL}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{user_data.lastName}</Text>
                                    </View>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.BVN_LABEL}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>{user_data.bvn}</Text>
                                    </View>
                                </View>
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.fullColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.EMAIL_ADDRESS_LABEL}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, { textTransform: 'lowercase' }]}>{user_data.email || '- - -'}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={SharedStyle.section}>
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.GENDER_LABEL}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{user_data.gender || '- - -'}</Text>
                                    </View>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.MARITAL_STATUS_LABEL}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>{user_data.maritalStatus || '- - -'}</Text>
                                    </View>
                                </View>
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.fullColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.RESIDENTIAL_ADDRESS}</Text>
                                        <Text numberOfLines={2} style={[SharedStyle.normalText, SharedStyle.value]}>{full_address}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <TouchItem
                            style={styles.editButton}
                            onPress={this.handleEditProfile}>
                            <Icon.Feather
                                size={Mixins.scaleSize(18)}
                                style={SharedStyle.sectionButtonIcon}
                                name="edit" />
                            <Text style={SharedStyle.sectionButtonText}>{Dictionary.EDIT_DETAILS_BTN}</Text>
                        </TouchItem>
                    </ScrollView>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    editButton: {
        ...Mixins.margin(16),
        paddingVertical: Mixins.scaleSize(16),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};

const mapDispatchToProps = {
    getUserProfile,
    showToast
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Profile));