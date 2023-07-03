import React, { Component } from 'react';
import { BackHandler, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import { withNavigationFocus } from "react-navigation";
import Modal from "react-native-modal";
import * as Location from 'expo-location';
import * as Icon from '@expo/vector-icons';
import moment from 'moment';

import { showToast } from '_actions/toast_actions';
import { getUserProfile } from '_actions/user_actions';

import { Dictionary, Util } from '_utils';
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from '_styles';
import { SubHeader, ScrollView, TouchItem, ProgressBar } from '_atoms';
import { PrimaryButton } from '_molecules';
import { MainHeader } from '_organisms';

import { Network } from '_services';

class LoanUserSummary extends Component {
    constructor(props) {
        super(props);

        const {
            amount,
            loan_reason,
            loan_duration,
            personal_details,
            employment_details
        } = this.props.user.loan_application;

        this.state = {
            amount,
            loan_reason,
            loan_duration,
            personal_details,
            employment_details,
            location: null,
            processing: false
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            this.navigateTo('LoanEmploymentDetails');

            return true;
        }
    }

    navigateTo = (destination) => {
        this.props.navigation.navigate(destination);
        Util.logEventData('loan_edit_application');
    }

    handleSubmit = () => {
        this.setState({
            processing: true
        }, async () => {
            let { status } = await Location.requestPermissionsAsync();
            if (status === 'granted') {
                try {
                    let location = await Location.getCurrentPositionAsync({
                        enableHighAccuracy: true
                    })
                    if (!location) {
                        location = await Location.getLastKnownPositionAsync();
                    }
                    this.setState({ location }, () => this.submitLoanRequest());
                } catch (error) {
                    this.setState({ processing: false }, () => {
                        this.props.showToast(Dictionary.LOCATION_ERROR);
                    });
                }
            } else {
                this.setState({ processing: false }, () => {
                    this.props.showToast(Dictionary.LOCATION_PERMISSION_REQUIRED);
                });
            }
        });
    }

    submitLoanRequest = () => {
        let { amount, loan_reason, loan_duration, personal_details, employment_details } = this.state;
        Network.submitLoanRequest({
            no_of_dependent: personal_details.no_of_dependent,
            type_of_residence: personal_details.type_of_residence,
            address: `${personal_details.address}, ${personal_details.city}, ${personal_details.lga}, ${personal_details.state}`,
            educational_attainment: employment_details.educational_attainment,
            employment_status: employment_details.employment_status,
            sector_of_employment: employment_details.sector_of_employment,
            monthly_net_income: employment_details.monthly_net_income,
            work_email: employment_details.work_email,
            proposed_payday: moment().add(loan_duration, 'days').format('YYYY/MM/DD'),
            work_start_date: moment(employment_details.work_start_date, 'DD/MM/YYYY').format('YYYY/MM/DD'),
            purpose: loan_reason.code_description,
            requested_amount: Number(amount),
            gender: personal_details.gender,
            marital_status: personal_details.marital_status,
            longitude: Number(this.state.location.coords.longitude),
            latitude: Number(this.state.location.coords.latitude)
        }).then((result) => {
            this.setState({ processing: false }, () => {
                let loan_options = result.data;
                loan_options = loan_options.sort((a, b) => Number(a.loan_amount) - Number(b.loan_amount));

                this.props.navigation.navigate('LoanEligibility', { loan_options });
            });
        }).catch((error) => {
            this.setState({ processing: false }, () => {
                this.props.navigation.navigate('Error', {
                    event_name: 'loan_declined',
                    error_message: error.message
                });
            });
        });
    }

    render() {
        let {
            amount,
            loan_reason,
            loan_duration,
            personal_details,
            employment_details
        } = this.state;

        let { user_data } = this.props.user;
        let { address, city, lga, state, country } = user_data;

        let full_address = address || '- - -';
        full_address = city ? full_address + ` ${city}` : full_address;
        full_address = lga ? full_address + ` ${lga}` : full_address;
        full_address = state ? full_address + ` ${state}` : full_address;
        full_address = country ? full_address + ` ${country}` : full_address;

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.LOAN_APPLICATION} />
                <ScrollView {...this.props} hasButtomButtons={true}>
                    <SubHeader text={Dictionary.LOAN_CONFIRM_DETAILS_HEADER} />
                    <ProgressBar progress={0.6} />
                    <View style={FormStyle.formContainer}>
                        <View style={SharedStyle.section}>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.AMOUNT}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>₦{Util.formatAmount(amount)}</Text>
                                </View>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.APPLICATION_DATE}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>{moment().format('MMM D, YYYY')}</Text>
                                </View>
                            </View>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.LOAN_PURPOSE}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{loan_reason.code_description}</Text>
                                </View>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.REPAYMENT_DATE}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>
                                        {moment().add(loan_duration, 'days').format('MMM D, YYYY')}
                                    </Text>
                                </View>
                            </View>
                            <TouchItem
                                style={SharedStyle.sectionButton}
                                onPress={() => this.navigateTo('LoanAmount')}>
                                <Icon.Feather
                                    size={Mixins.scaleSize(18)}
                                    style={SharedStyle.sectionButtonIcon}
                                    name="edit" />
                                <Text style={SharedStyle.sectionButtonText}>{Dictionary.EDIT_BTN}</Text>
                            </TouchItem>
                        </View>
                        <View style={SharedStyle.section}>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.GENDER_LABEL}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{personal_details.gender}</Text>
                                </View>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.MARITAL_STATUS_LABEL}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>{personal_details.marital_status}</Text>
                                </View>
                            </View>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.CHILDREN}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{personal_details.no_of_dependent}</Text>
                                </View>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.TYPE_OF_RESIDENCE}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>{personal_details.type_of_residence}</Text>
                                </View>
                            </View>
                            <TouchItem
                                style={SharedStyle.sectionButton}
                                onPress={() => this.navigateTo('LoanPersonalDetails')}>
                                <Icon.Feather
                                    size={Mixins.scaleSize(18)}
                                    style={SharedStyle.sectionButtonIcon}
                                    name="edit" />
                                <Text style={SharedStyle.sectionButtonText}>{Dictionary.EDIT_BTN}</Text>
                            </TouchItem>
                        </View>
                        <View style={[SharedStyle.section, { marginBottom: Mixins.scaleSize(20) }]}>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.LEVEL_OF_EDUCATION}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{employment_details.educational_attainment}</Text>
                                </View>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.EMPLOYMENT_STATUS}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>{employment_details.employment_status}</Text>
                                </View>
                            </View>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.EMPLOYMENT_SECTOR}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{employment_details.sector_of_employment}</Text>
                                </View>
                                <View style={SharedStyle.halfColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label, SharedStyle.right]}>{Dictionary.EMPLOYMENT_START}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, SharedStyle.right]}>
                                        {moment(employment_details.work_start_date, 'DD/MM/YYYY').format('MMM D, YYYY')}
                                    </Text>
                                </View>
                            </View>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.fullColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.MONTHLY_INCOME}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value]}>{employment_details.monthly_net_income}</Text>
                                </View>
                            </View>
                            <View style={SharedStyle.row}>
                                <View style={SharedStyle.fullColumn}>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.label]}>{Dictionary.OFFICIAL_EMAIL}</Text>
                                    <Text numberOfLines={1} style={[SharedStyle.normalText, SharedStyle.value, { textTransform: 'lowercase' }]}>{employment_details.work_email}</Text>
                                </View>
                            </View>
                            <TouchItem
                                style={SharedStyle.sectionButton}
                                onPress={() => this.navigateTo('LoanEmploymentDetails')}>
                                <Icon.Feather
                                    size={Mixins.scaleSize(18)}
                                    style={SharedStyle.sectionButtonIcon}
                                    name="edit" />
                                <Text style={SharedStyle.sectionButtonText}>{Dictionary.EDIT_BTN}</Text>
                            </TouchItem>
                        </View>
                    </View>
                    <View style={SharedStyle.bottomPanel}>
                        <View style={FormStyle.formButton}>
                            <PrimaryButton
                                title={Dictionary.CONTINUE_BTN}
                                icon="arrow-right"
                                onPress={this.handleSubmit} />
                        </View>
                    </View>
                </ScrollView>
                <Modal
                    isVisible={this.state.processing}
                    useNativeDriver={true}
                    style={styles.loadingDialog}>
                    <View style={styles.loadingDialogContent}>
                        <ActivityIndicator style={styles.loaderSpinner} size={Mixins.scaleSize(50)} color={Colors.CV_YELLOW} />
                        <Text style={styles.loaderText}>{Dictionary.PROCESSING}</Text>
                        <Text style={styles.loaderText}>{Dictionary.HOLD_ON}</Text>
                    </View>
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    loadingDialog: {
        backgroundColor: Colors.WHITE,
        margin: 0
    },
    loadingDialogContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    loaderSpinner: {
        marginBottom: Mixins.scaleSize(40)
    },
    loaderText: {
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(25),
        lineHeight: Mixins.scaleSize(29),
        color: Colors.DARK_GREY
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        loans: state.loans
    };
};

const mapDispatchToProps = {
    showToast,
    getUserProfile
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(LoanUserSummary));