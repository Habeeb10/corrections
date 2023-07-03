import React, { Component } from 'react';
import { BackHandler, ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import moment from 'moment';

import { showToast } from '_actions/toast_actions';
import { getStateOptions, getLgaOptions } from '_actions/config_actions';
import { updateLoanApplicationData } from '_actions/user_actions';
import { getScoringOptions } from '_actions/loan_actions';
import { storeUserData } from '_actions/user_actions';

import { Dictionary } from '_utils';
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from '_styles';
import { SubHeader, FloatingLabelInput, TouchItem, ProgressBar } from '_atoms';
import { default as ScrollView } from '_atoms/scroll_view';
import { PrimaryButton } from '_molecules';
import { MainHeader, Dropdown } from '_organisms';

import { Network } from '_services';

class LoanPersonalDetails extends Component {
    constructor(props) {
        super(props);

        const { user_data } = this.props.user;
        const { personal_details } = this.props.user.loan_application;
        const { user_loan_profile } = this.props.loans;

        let date_of_birth = moment(user_data.dob).format('DD / MM / YYYY');
        let gender, marital_status, state, lga, no_of_dependent, type_of_residence, address, city, nearest_landmark;
        if (personal_details) {
            gender = personal_details.gender;
            marital_status = personal_details.marital_status;
            state = personal_details.state_id;
            lga = personal_details.lga_id;

            no_of_dependent = personal_details.no_of_dependent;
            type_of_residence = personal_details.type_of_residence;
            address = personal_details.address;
            city = personal_details.city;
            nearest_landmark = personal_details.nearest_landmark;
        }
        else {
            gender = user_data.gender;
            marital_status = user_data.marital_status;
            state = user_data.state;
            lga = user_data.lga;
            no_of_dependent = user_loan_profile ? user_loan_profile.personal_details.no_of_dependent : '';
            type_of_residence = user_loan_profile ? user_loan_profile.personal_details.type_of_residence : '';
            address = user_data.address;
            city = user_data.city;
            nearest_landmark = user_data.nearest_landmark;
        }

        this.state = {
            full_name: `${user_data.first_name} ${user_data.last_name}`,
            date_of_birth,
            blank_error: '',
            gender_options: this.getDataFromScoringOption('gender'),
            gender: gender ? this.getDropDownOption('gender', gender) : {},
            gender_error: '',
            marital_status: marital_status ? this.getDropDownOption('marital_status', marital_status) : '',
            marital_status_error: '',
            no_of_dependent: no_of_dependent ? this.getDropDownOption('no_of_dependent', no_of_dependent) : {},
            no_of_dependent_error: '',
            type_of_residence: type_of_residence ? this.getDropDownOption('type_of_residence', type_of_residence) : {},
            type_of_residence_error: '',
            address,
            address_error: '',
            city,
            city_error: '',
            state: state ? this.getStateOption(state) : '',
            state_error: '',
            lga: lga ? this.getLgaOption(lga) : '',
            lga_error: '',
            nearest_landmark,
            nearest_landmark_error: '',
            profile_change: false
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        if (this.props.loans.scoring_options.length < 1) {
            this.props.getScoringOptions();
        }

        if (this.props.config.states.length < 1) {
            this.props.getStateOptions();
        }

        if (this.props.config.lgas.length < 1) {
            this.props.getLgaOptions();
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            this.props.navigation.goBack();

            return true;
        }
    }

    getDataFromScoringOption = (key) => {
        let data = this.props.loans.scoring_options.find(item => {
            return item.key === key;
        });

        let options = data ? data.option : [];
        options = options.map(item => {
            return {
                label: item.value,
                value: item.value,
            }
        })

        return options;
    }

    getDropDownOption = (key, value) => {
        let options = this.getDataFromScoringOption(key);
        let preferred = options.filter((option) => {
            return option.label.toLowerCase() === value.toLowerCase();
        });

        return preferred.length > 0 ? preferred[0] : '';
    }

    getDataFromStateOptions = () => {
        let options = this.props.config.states;
        options = options.map(item => {
            return {
                label: item.code_description,
                value: item.id,
                ref_code: item.ref_code
            }
        });

        return options;
    }

    getStateOption = (state) => {
        let options = this.getDataFromStateOptions();
        let preferred = options.filter((option) => {
            return option.value === state || option.label.toLowerCase() === ('' + state).toLowerCase();
        });

        return preferred.length > 0 ? preferred[0] : '';
    }

    getDataFromLgaOptions = (init) => {
        let options = this.props.config.lgas;
        if (!init) {
            if (!this.state || !this.state.state || typeof this.state.state !== 'object') {
                return [];
            }
            options = options.filter((lga) => { return lga.link_id === this.state.state.ref_code });
        }

        options = options.map(item => {
            return {
                label: item.code_description,
                value: item.id,
            }
        })
        return options;
    }

    getLgaOption = (lga) => {
        let options = this.getDataFromLgaOptions(true);
        let preferred = options.filter((option) => {
            return option.value === lga || option.label.toLowerCase() === ('' + lga).toLowerCase();
        });

        return preferred.length > 0 ? preferred[0] : '';
    }

    presetGender = (gender) => {
        this.setState({
            gender,
            profile_change: true
        })
    }

    validate = () => {
        let is_valid = true;

        if (!this.state.gender) {
            this.setState({
                gender_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.marital_status) {
            this.setState({
                marital_status_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.no_of_dependent) {
            this.setState({
                no_of_dependent_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.type_of_residence) {
            this.setState({
                type_of_residence_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.address) {
            this.setState({
                address_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.city) {
            this.setState({
                city_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.state) {
            this.setState({
                state_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.lga) {
            this.setState({
                lga_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.nearest_landmark) {
            this.setState({
                nearest_landmark_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        return is_valid;
    }

    handleSubmit = () => {
        if (!this.validate()) {
            return;
        }

        let {
            full_name, gender, marital_status, no_of_dependent, type_of_residence,
            address, city, state, lga, nearest_landmark
        } = this.state;

        let personal_details = {
            full_name,
            gender: gender.value,
            marital_status: marital_status.value,
            no_of_dependent: no_of_dependent.value,
            type_of_residence: type_of_residence.value,
            address,
            city,
            state_id: state.value,
            state: state.label,
            lga_id: lga.value,
            lga: lga.label,
            nearest_landmark
        };

        this.props.updateLoanApplicationData({ personal_details });

        this.props.navigation.navigate('LoanEmploymentDetails');

        if (this.state.profile_change) {
            // 1. Update local address data
            let user_data = this.props.user.user_data;
            user_data.address = address;
            user_data.city = city;
            user_data.lga = lga.label;
            user_data.state = state.label;
            user_data.nearest_landmark = nearest_landmark;
            this.props.storeUserData(user_data);

            // 2. Update server info... Fire and Forget
            Network.updateUserProfile({
                address,
                city,
                state_id: state.value,
                lga_id: lga.value,
                nearest_landmark
            }).then(() => {
                console.log(`Profile updated with new personal details.`);
            }).catch((error) => {
                console.log(`Unable to update profile with new personal details... Reason: ${error.message}`);
            });
        }
    }

    render() {
        let initializing = this.props.initializing;
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.LOAN_APPLICATION} />
                {initializing && (
                    <View style={SharedStyle.loaderContainer}>
                        <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                    </View>
                )}
                {!initializing && (
                    <ScrollView {...this.props}>
                        <SubHeader text={Dictionary.LOAN_PERSONAL_DETAILS_HEADER} />
                        <ProgressBar progress={0.4} />
                        <View style={[FormStyle.formContainer, styles.formContainer]}>
                            <View style={FormStyle.formItem}>
                                <FloatingLabelInput
                                    label={Dictionary.YOUR_NAME_LABEL}
                                    value={this.state.full_name}
                                    multiline={false}
                                    autoCorrect={false}
                                    editable={false}
                                />
                                <Text style={FormStyle.formError}>{this.state.blank_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <FloatingLabelInput
                                    label={Dictionary.YOUR_DOB_LABEL}
                                    value={this.state.date_of_birth}
                                    multiline={false}
                                    autoCorrect={false}
                                    editable={false}
                                />
                                <Text style={FormStyle.formError}>{this.state.blank_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <View style={styles.gender}>
                                    <View style={styles.halfColumn}>
                                        <Text
                                            numberOfLines={1}
                                            style={[SharedStyle.normalText, styles.label]}>
                                            {Dictionary.YOUR_GENDER_LABEL}
                                        </Text>
                                    </View>
                                    <View style={[styles.halfColumn, styles.presets]}>
                                        {this.state.gender_options.map((gender, index) => {
                                            return <TouchItem
                                                key={index}
                                                onPress={() => this.presetGender(gender)}
                                                style={[
                                                    styles.preset,
                                                    this.state.gender.value === gender.value ? styles.activePreset : {}
                                                ]}>
                                                <Text
                                                    style={[
                                                        styles.presetText,
                                                        this.state.gender.value === gender.value ? styles.activePresetText : {}
                                                    ]}>
                                                    {gender.label}
                                                </Text>
                                            </TouchItem>
                                        })}
                                    </View>
                                </View>
                                <Text style={FormStyle.formError}>{this.state.gender_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <Dropdown
                                    options={this.getDataFromScoringOption('marital_status')}
                                    value={''}
                                    title={Dictionary.MARITAL_STATUS_LABEL}
                                    onChange={(obj) => {
                                        this.setState({
                                            marital_status: obj,
                                            marital_status_error: ''
                                        })
                                    }}>
                                    <FloatingLabelInput
                                        pointerEvents="none"
                                        label={Dictionary.MARITAL_STATUS_LABEL}
                                        value={this.state.marital_status.label || ''}
                                        multiline={false}
                                        autoCorrect={false}
                                        editable={false}
                                    />
                                </Dropdown>
                                <Text style={FormStyle.formError}>{this.state.marital_status_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <Dropdown
                                    options={this.getDataFromScoringOption('no_of_dependent')}
                                    value={''}
                                    title={Dictionary.CHILDREN_LABEL}
                                    onChange={(obj) => {
                                        this.setState({
                                            no_of_dependent: obj,
                                            no_of_dependent_error: ''
                                        })
                                    }}>
                                    <FloatingLabelInput
                                        pointerEvents="none"
                                        label={Dictionary.CHILDREN_LABEL}
                                        value={this.state.no_of_dependent.label || ''}
                                        multiline={false}
                                        autoCorrect={false}
                                        editable={false}
                                    />
                                </Dropdown>
                                <Text style={FormStyle.formError}>{this.state.no_of_dependent_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <Dropdown
                                    options={this.getDataFromScoringOption('type_of_residence')}
                                    value={''}
                                    title={Dictionary.RESIDENCE_TYPE_LABEL}
                                    onChange={(obj) => {
                                        this.setState({
                                            type_of_residence: obj,
                                            type_of_residence_error: ''
                                        })
                                    }}>
                                    <FloatingLabelInput
                                        pointerEvents="none"
                                        label={Dictionary.RESIDENCE_TYPE_LABEL}
                                        value={this.state.type_of_residence.label || ''}
                                        multiline={false}
                                        autoCorrect={false}
                                        editable={false}
                                    />
                                </Dropdown>
                                <Text style={FormStyle.formError}>{this.state.type_of_residence_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <FloatingLabelInput
                                    label={Dictionary.STREET_LABEL}
                                    value={this.state.address}
                                    multiline={false}
                                    autoCorrect={false}
                                    onChangeText={text => this.setState({
                                        address: text,
                                        address_error: '',
                                        profile_change: true
                                    })}
                                    editable={!this.state.processing}
                                />
                                <Text style={FormStyle.formError}>{this.state.address_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <FloatingLabelInput
                                    label={Dictionary.CITY_LABEL}
                                    value={this.state.city}
                                    multiline={false}
                                    autoCorrect={false}
                                    onChangeText={text => this.setState({
                                        city: text,
                                        city_error: '',
                                        profile_change: true
                                    })}
                                    editable={!this.state.processing}
                                />
                                <Text style={FormStyle.formError}>{this.state.city_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <Dropdown
                                    options={this.getDataFromStateOptions()}
                                    value={''}
                                    title={Dictionary.STATE_LABEL}
                                    onChange={(obj) => {
                                        this.setState({
                                            state: obj,
                                            state_error: '',
                                            lga: '',
                                            profile_change: true
                                        })
                                    }}>
                                    <FloatingLabelInput
                                        pointerEvents="none"
                                        label={Dictionary.STATE_LABEL}
                                        value={this.state.state.label || ''}
                                        multiline={false}
                                        autoCorrect={false}
                                        editable={false}
                                    />
                                </Dropdown>
                                <Text style={FormStyle.formError}>{this.state.state_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <Dropdown
                                    options={this.getDataFromLgaOptions()}
                                    value={''}
                                    title={Dictionary.LGA_LABEL}
                                    emptyListMessage={Dictionary.STATE_REQUIRED_FOR_LGA}
                                    onChange={(obj) => {
                                        this.setState({
                                            lga: obj,
                                            lga_error: '',
                                            profile_change: true
                                        })
                                    }}>
                                    <FloatingLabelInput
                                        pointerEvents="none"
                                        label={Dictionary.LGA_LABEL}
                                        value={this.state.lga.label || ''}
                                        multiline={false}
                                        autoCorrect={false}
                                        editable={false}
                                    />
                                </Dropdown>
                                <Text style={FormStyle.formError}>{this.state.lga_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <FloatingLabelInput
                                    label={Dictionary.LANDMARK_LABEL}
                                    value={this.state.nearest_landmark}
                                    multiline={false}
                                    autoCorrect={false}
                                    onChangeText={text => this.setState({
                                        nearest_landmark: text,
                                        nearest_landmark_error: '',
                                        profile_change: true
                                    })}
                                    editable={!this.state.processing}
                                />
                                <Text style={FormStyle.formError}>{this.state.nearest_landmark_error}</Text>
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
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({

    formContainer: {
        paddingBottom: Mixins.scaleSize(50)
    },
    presets: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Mixins.scaleSize(8),
        borderWidth: Mixins.scaleSize(1),
        borderRadius: Mixins.scaleSize(4),
        borderColor: Colors.INPUT_BORDER
    },
    preset: {
        ...Mixins.padding(16, 8, 16, 8),
        marginRight: Mixins.scaleSize(16),
        borderBottomWidth: Mixins.scaleSize(2),
        borderBottomColor: 'transparent'
    },
    activePreset: {
        borderBottomColor: Colors.CV_YELLOW
    },
    presetText: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.CV_BLUE
    },
    activePresetText: {
        ...Typography.FONT_MEDIUM,
        color: Colors.CV_YELLOW
    },
    presetLabel: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.LIGHT_GREY
    },
    gender: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    halfColumn: {
        width: '45%'
    },
    repaymentSummary: {
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(18),
        lineHeight: Mixins.scaleSize(20),
        color: Colors.DARK_GREY
    },
    durationSlider: {
        marginHorizontal: Mixins.scaleSize(-16)
    },
    durationOptions: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: Mixins.scaleSize(160),
        marginLeft: Mixins.scaleSize(16),
        marginBottom: Mixins.scaleSize(8),
        padding: Mixins.scaleSize(16),
        backgroundColor: Colors.LIGHT_BG,
        borderColor: Colors.FAINT_BORDER,
        borderWidth: Mixins.scaleSize(1),
        borderRadius: Mixins.scaleSize(10)
    },
    selectedDuration: {
        backgroundColor: Colors.LIGHTER_ORANGE_BG,
        borderColor: Colors.ORANGE_BORDER,
        elevation: 2
    },
    icon: {
        marginRight: Mixins.scaleSize(12)
    },
    blank: {
        width: Mixins.scaleSize(20),
        height: Mixins.scaleSize(20),
        backgroundColor: Colors.LIGHT_UNCHECKED_BG,
        borderRadius: Mixins.scaleSize(50)
    },
    durationHeader: {
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(20),
        lineHeight: Mixins.scaleSize(23),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.DARK_GREY
    },
    durationDescription: {
        ...Typography.DARK_GREY,
        fontSize: Mixins.scaleFont(12),
        lineHeight: Mixins.scaleSize(14),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.LIGHT_GREY
    },
    breakdown: {
        ...Mixins.padding(16, 16, 0, 16),
        borderWidth: Mixins.scaleSize(1),
        borderColor: Colors.INPUT_BORDER,
        backgroundColor: Colors.WHITE,
        borderRadius: Mixins.scaleSize(10),
        marginBottom: Mixins.scaleSize(30)
    },
    breakdownHeader: {
        ...Mixins.padding(0, 16, 16, 16),
        marginHorizontal: Mixins.scaleSize(-16),
        marginBottom: Mixins.scaleSize(16),
        borderBottomColor: Colors.FAINT_BORDER,
        borderBottomWidth: Mixins.scaleSize(1)
    },
    label: {
        color: Colors.LIGHT_GREY
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        config: state.config,
        loans: state.loans,
        initializing: state.config.loading_states || state.config.loading_lgas || state.loans.loading_scoring_options
    };
};

const mapDispatchToProps = {
    showToast,
    getStateOptions,
    getLgaOptions,
    getScoringOptions,
    updateLoanApplicationData,
    storeUserData
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(LoanPersonalDetails));