import React, { Component } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { connect } from 'react-redux';
import { withNavigationFocus } from "react-navigation";
import * as Icon from '@expo/vector-icons';

import { getUserNextOfKin } from '_actions/next_of_kin_actions';

import { Dictionary } from '_utils';
import { Colors, Mixins, SharedStyle, FormStyle } from '_styles';
import { ScrollView, TouchItem } from '_atoms';

import { MainHeader } from '_organisms';

class NextOfKIN extends Component {
    componentDidMount() {
        // this.props.getUserNextOfKin();
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            !this.props.next_of_kin.loading && this.props.navigation.goBack();
            return true;
        }
    }

    handleEditProfile = () => {
        this.props.navigation.navigate('EditNextOfKin');
    }

    render() {
        let { loading, next_of_kin, next_of_kin_error } = this.props.next_of_kin;
        let { loading_profile, user_data, profile_error } = this.props.user;
        let { address, city, lga, state, country } = next_of_kin;
        let {nextOfKin}=user_data;

        let full_address = nextOfKin.address || '- - -';
        full_address = nextOfKin.city ? full_address + `, ${nextOfKin.city}` : full_address;
        full_address = nextOfKin.lga ? full_address + `, ${nextOfKin.lga}` : full_address;
        full_address = nextOfKin.state ? full_address + `, ${nextOfKin.state}` : full_address;
        full_address = nextOfKin.country ? full_address + `, ${nextOfKin.country}.` : full_address;

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.NEXT_OF_KIN_HEADER} />
                <ScrollView {...this.props}>
                    {loading && (
                        <View style={SharedStyle.loaderContainer}>
                            <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                        </View>
                    )}
                    {!loading && !next_of_kin_error && (
                        <View style={FormStyle.formContainer}>
                            <View style={SharedStyle.section}>
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.NAME_LABEL}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{nextOfKin.name || '- - -'}</Text>
                                    </View>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.MOBILE_NUMBER_LABEL}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>{nextOfKin.phoneNumber || '- - -'}</Text>
                                    </View>
                                </View>
                                <View style={SharedStyle.row}>
                                <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.EMAIL_ADDRESS_LABEL}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, { textTransform: 'lowercase' }]}>{nextOfKin.email || '- - -'}</Text>
                                    </View>
                                    <View style={SharedStyle.halfColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.RELATIONSHIP_LABEL}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>{nextOfKin.relationShip || '- - -'}</Text>
                                    </View>
                                </View>
                                {/* <View style={SharedStyle.row}>
                                    <View style={SharedStyle.fullColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.EMAIL_ADDRESS_LABEL}</Text>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, { textTransform: 'lowercase' }]}>{nextOfKin.email || '- - -'}</Text>
                                    </View>
                                </View> */}
                                <View style={SharedStyle.row}>
                                    <View style={SharedStyle.fullColumn}>
                                        <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.RESIDENTIAL_ADDRESS}</Text>
                                        <Text numberOfLines={2} style={[SharedStyle.normalText, SharedStyle.value]}>{full_address}</Text>
                                    </View>
                                </View>
                                <TouchItem
                                    style={SharedStyle.sectionButton}
                                    onPress={this.handleEditProfile}>
                                    <Icon.Feather
                                        size={Mixins.scaleSize(18)}
                                        style={SharedStyle.sectionButtonIcon}
                                        name="edit" />
                                    <Text style={SharedStyle.sectionButtonText}>{Dictionary.EDIT_DETAILS_BTN}</Text>
                                </TouchItem>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user,
        next_of_kin: state.next_of_kin
    };
};

const mapDispatchToProps = {
    getUserNextOfKin
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(NextOfKIN));