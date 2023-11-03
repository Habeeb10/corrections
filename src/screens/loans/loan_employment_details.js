import React, { Component } from 'react';
import { BackHandler, ActivityIndicator, StyleSheet, Text, View, Platform } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import moment from 'moment';

import { showToast } from '_actions/toast_actions';
import { getScoringOptions } from '_actions/loan_actions';
import { updateLoanApplicationData } from '_actions/user_actions';
import { getStateOptions, getLgaOptions } from '_actions/config_actions';
import { getUserNextOfKin } from '_actions/next_of_kin_actions';
import { getDocuments } from '_actions/document_actions';

import { Dictionary, Util } from '_utils';
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from '_styles';
import { SubHeader, FloatingLabelInput, TouchItem, ProgressBar } from '_atoms';
import { default as ScrollView } from '_atoms/scroll_view';
import { PrimaryButton, _DateTimePicker } from '_molecules';
import { MainHeader, Dropdown } from '_organisms';

class LoanEmploymentDetails extends Component {
    constructor(props) {
        super(props);

        const { employment_details } = this.props.user.loan_application;
        const { user_loan_profile } = this.props.loans;

        let educational_attainment, employment_status, sector_of_employment, work_start_date, working_period, monthly_net_income, work_email;
        if (employment_details) {
            educational_attainment = employment_details.educational_attainment;
            employment_status = employment_details.employment_status;
            sector_of_employment = employment_details.sector_of_employment;
            work_start_date = employment_details.work_start_date;
            working_period = employment_details.working_period;
            monthly_net_income = employment_details.monthly_net_income;
            work_email = employment_details.work_email
        } else if (user_loan_profile?.employment_details) {
            educational_attainment = user_loan_profile.employment_details.educational_attainment;
            employment_status = user_loan_profile.employment_details.employment_status;
            sector_of_employment = user_loan_profile.employment_details.sector_of_employment;
            work_start_date = moment(user_loan_profile.employment_details.work_start_date).format('DD/MM/YYYY');
            working_period = user_loan_profile.employment_details.working_period;
            monthly_net_income = user_loan_profile.employment_details.monthly_net_income;
            work_email = user_loan_profile.employment_details.work_email
        }

        this.state = {
            educational_attainment: educational_attainment ? this.getDropDownOption('education_attainment', educational_attainment) : '',
            educational_attainment_error: '',
            employment_status: employment_status ? this.getDropDownOption('employment_status', employment_status) : '',
            employment_status_error: '',
            sector_of_employment: sector_of_employment ? this.getDropDownOption('sector_of_employment', sector_of_employment) : '',
            sector_of_employment_error: '',
            work_start_date: work_start_date ? moment(work_start_date, 'DD/MM/YYYY').format('DD/MM/YYYY') : '',
            work_start_date_error: '',
            working_period: working_period ? this.getDropDownOption('working_period', working_period) : '',
            working_period_error: '',
            monthly_net_income: monthly_net_income ? this.getDropDownOption('monthly_net_income', monthly_net_income) : '',
            monthly_net_income_error: '',
            work_email,
            work_email_error: '',
            show_date_picker: false
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        if (this.props.loans.scoring_options.length < 1) {
            this.props.getScoringOptions();
        }

        // Double Tap NOK
        if (!this.props.next_of_kin.next_of_kin.first_name) {
            this.props.getUserNextOfKin();
        }

        // Double Tap Documents
        this.props.getDocuments();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.isFocused && this.props.isFocused) {
            // Double Tap NOK
            if (!this.props.next_of_kin.next_of_kin.first_name) {
                this.props.getUserNextOfKin();
            }

            // Double Tap Documents
            this.props.getDocuments();
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
            return option.value === value;
        });

        return preferred.length > 0 ? preferred[0] : '';
    }

    toggleSelectDate = (show_date_picker) => {
        this.setState({ show_date_picker });
    }

    prcessSelectedDate = (event, date) => {
        if (Platform.OS === 'android') {
            this.closeDatePicker();
            if (event.type === 'set') {
                this.setSelectedDate(date);
            }
        } else {
            this.setSelectedDate(date);
        }
    }

    setSelectedDate = (date) => {
        this.setState({
            work_start_date: moment(date).format('DD/MM/YYYY'),
            work_start_date_error: ''
        });
    }

    closeDatePicker = () => {
        this.toggleSelectDate(false);
    }

    validate = () => {
        let is_valid = true;

        if (!this.state.educational_attainment) {
            this.setState({
                educational_attainment_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.employment_status) {
            this.setState({
                employment_status_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.sector_of_employment) {
            this.setState({
                sector_of_employment_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.work_start_date) {
            this.setState({
                work_start_date_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.working_period) {
            this.setState({
                working_period_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.monthly_net_income) {
            this.setState({
                monthly_net_income_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        if (!this.state.work_email || !Util.isValidEmail(this.state.work_email)) {
            this.setState({
                work_email_error: Dictionary.REQUIRED_FIELD,
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
            educational_attainment: educational_attainment, employment_status, sector_of_employment, work_start_date,
            working_period, monthly_net_income, work_email
        } = this.state;

        let employment_details = {
            educational_attainment: educational_attainment.value,
            employment_status: employment_status.value,
            sector_of_employment: sector_of_employment.value,
            work_start_date,
            working_period: working_period.value,
            monthly_net_income: monthly_net_income.value,
            work_email
        };

        this.props.updateLoanApplicationData({ employment_details });

        let has_kin = this.props.next_of_kin.next_of_kin.first_name;

        let identity = this.props.documents.items.find(doc => doc.additional_code === 'id');
        let has_id = identity && identity.user_data;
        if (identity.user_data && identity.user_data.status) {
            // Double check the status of the uploaded document
            let status = identity.user_data.status.toLowerCase();
            has_id = status === 'pending' || status === 'approved';
        }

        if (!has_kin) {
            this.props.navigation.navigate('EditNextOfKin', {
                title: Dictionary.LOAN_APPLICATION,
                progress: 0.55,
                redirect: has_id ? 'LoanUserSummary' : 'LoanUploadID'
            });
        } else if (!has_id) {
            this.props.navigation.navigate('LoanUploadID');
        } else {
            this.props.navigation.navigate('LoanUserSummary');
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
                        <SubHeader text={Dictionary.LOAN_EMPLOYMENT_DETAILS_HEADER} />
                        <ProgressBar progress={0.5} />
                        <View style={[FormStyle.formContainer, styles.formContainer]}>
                            <View style={FormStyle.formItem}>
                                <Dropdown
                                    options={this.getDataFromScoringOption('education_attainment')}
                                    value={''}
                                    title={Dictionary.YOUR_EDUCATION_LABEL}
                                    onChange={(obj) => {
                                        this.setState({
                                            educational_attainment: obj,
                                            educational_attainment_error: ''
                                        })
                                    }}>
                                    <FloatingLabelInput
                                        pointerEvents="none"
                                        label={Dictionary.YOUR_EDUCATION_LABEL}
                                        value={this.state.educational_attainment.label || ' '}
                                        multiline={false}
                                        autoCorrect={false}
                                        editable={false}
                                        isDropdown={true}
                                    />
                                </Dropdown>
                                <Text style={FormStyle.formError}>{this.state.educational_attainment_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <Dropdown
                                    options={this.getDataFromScoringOption('employment_status')}
                                    value={''}
                                    title={Dictionary.YOUR_EMPLOYMENT_STATUS_LABEL}
                                    onChange={(obj) => {
                                        this.setState({
                                            employment_status: obj,
                                            employment_status_error: ''
                                        })
                                    }}>
                                    <FloatingLabelInput
                                        pointerEvents="none"
                                        label={Dictionary.YOUR_EMPLOYMENT_STATUS_LABEL}
                                        value={this.state.employment_status.label || ' '}
                                        multiline={false}
                                        autoCorrect={false}
                                        editable={false}
                                        isDropdown={true}
                                    />
                                </Dropdown>
                                <Text style={FormStyle.formError}>{this.state.employment_status_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <Dropdown
                                    options={this.getDataFromScoringOption('sector_of_employment')}
                                    value={''}
                                    title={Dictionary.YOUR_EMPLOYMENT_SECTOR_LABEL}
                                    onChange={(obj) => {
                                        this.setState({
                                            sector_of_employment: obj,
                                            sector_of_employment_error: ''
                                        })
                                    }}>
                                    <FloatingLabelInput
                                        pointerEvents="none"
                                        label={Dictionary.YOUR_EMPLOYMENT_SECTOR_LABEL}
                                        value={this.state.sector_of_employment.label || ' '}
                                        multiline={false}
                                        autoCorrect={false}
                                        editable={false}
                                        isDropdown={true}
                                    />
                                </Dropdown>
                                <Text style={FormStyle.formError}>{this.state.sector_of_employment_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <TouchItem
                                    onPress={() => this.toggleSelectDate(true)}>
                                    <FloatingLabelInput
                                        pointerEvents="none"
                                        label={Dictionary.YOUR_EMPLOYMENT_START_LABEL}
                                        value={this.state.work_start_date || ' '}
                                        multiline={false}
                                        autoCorrect={false}
                                        editable={false}
                                        isDropdown={true}
                                    />
                                </TouchItem>
                                <Text style={FormStyle.formError}>{this.state.work_start_date_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <Dropdown
                                    options={this.getDataFromScoringOption('working_period')}
                                    value={''}
                                    title={Dictionary.YOUR_EMPLOYMENT_DURATION_LABEL}
                                    onChange={(obj) => {
                                        this.setState({
                                            working_period: obj,
                                            working_period_error: ''
                                        })
                                    }}>
                                    <FloatingLabelInput
                                        pointerEvents="none"
                                        label={Dictionary.YOUR_EMPLOYMENT_DURATION_LABEL}
                                        value={this.state.working_period.label || ' '}
                                        multiline={false}
                                        autoCorrect={false}
                                        editable={false}
                                        isDropdown={true}
                                    />
                                </Dropdown>
                                <Text style={FormStyle.formError}>{this.state.working_period_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <Dropdown
                                    options={this.getDataFromScoringOption('monthly_net_income')}
                                    value={''}
                                    title={Dictionary.YOUR_SALARY_LABEL}
                                    onChange={(obj) => {
                                        this.setState({
                                            monthly_net_income: obj,
                                            monthly_net_income_error: ''
                                        })
                                    }}>
                                    <FloatingLabelInput
                                        pointerEvents="none"
                                        label={Dictionary.YOUR_SALARY_LABEL}
                                        value={this.state.monthly_net_income.label || ' '}
                                        multiline={false}
                                        autoCorrect={false}
                                        editable={false}
                                        isDropdown={true}
                                    />
                                </Dropdown>
                                <Text style={FormStyle.formError}>{this.state.monthly_net_income_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <FloatingLabelInput
                                    label={Dictionary.YOUR_WORK_EMAIL_LABEL}
                                    value={this.state.work_email}
                                    keyboardType={'email-address'}
                                    multiline={false}
                                    autoCorrect={false}
                                    onChangeText={text => this.setState({
                                        work_email: text,
                                        work_email_error: ''
                                    })}
                                    editable={!this.state.processing}
                                />
                                <Text style={FormStyle.formError}>{this.state.work_email_error}</Text>
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
                <_DateTimePicker
                    show={this.state.show_date_picker}
                    value={this.state.work_start_date}
                    maximumDate={new Date()}
                    onChange={this.prcessSelectedDate}
                    onClose={this.closeDatePicker}
                />
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Mixins.scaleSize(16)
    },
    column: {
        width: '45%'
    },
    text: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01)
    },
    label: {
        color: Colors.LIGHT_GREY
    },
    value: {
        color: Colors.DARK_GREY
    },
    right: {
        textAlign: 'right'
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        next_of_kin: state.next_of_kin,
        documents: state.documents,
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
    getUserNextOfKin,
    getDocuments,
    updateLoanApplicationData
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(LoanEmploymentDetails));