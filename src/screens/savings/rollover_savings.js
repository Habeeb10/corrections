import React, { Component } from 'react';
import { BackHandler, StyleSheet, View, Text, Platform } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import moment from 'moment';

import { showToast } from '_actions/toast_actions';
import { getUserSavings } from '_actions/savings_actions';

import { Dictionary } from '_utils';
import { Colors, SharedStyle, FormStyle } from '_styles';
import { ScrollView, SubHeader, TouchItem, FloatingLabelInput, InfoPanel } from '_atoms';
import { PrimaryButton, _DateTimePicker } from '_molecules';
import { MainHeader, SavingsSummary } from '_organisms';

import { Network } from '_services';
import { addNotification } from '_actions/notification_actions';
import { randomId } from '../../utils/util';

class RolloverSavings extends Component {
    constructor(props) {
        super(props);

        const savings = this.props.navigation.getParam('savings', {});

        this.state = {
            savings,
            processing: false,
            withdrawal_date: '',
            withdrawal_date_error: '',
            show_date_picker: false
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
            !this.state.processing && this.props.navigation.goBack();

            return true;
        }
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
            withdrawal_date: moment(date).format('DD/MM/YYYY'),
            withdrawal_date_error: ''
        });
    }

    closeDatePicker = () => {
        this.toggleSelectDate(false);
    }

    handleSubmit = () => {
        if (!this.state.withdrawal_date) {
            this.setState({ withdrawal_date_error: Dictionary.REQUIRED_FIELD });
            return;
        }

        this.setState({ processing: true }, () => {
            Network.rolloverSavingsPlan(this.state.savings.id, {
                withdrawal_date: moment(this.state.withdrawal_date, 'DD/MM/YYYY').format('YYYY/MM/DD')
            }).then((result) => {
                this.setState({ processing: false }, () => {
                    this.handleBackButton();
                    this.props.showToast(result.message, false);
                    this.props.getUserSavings();
                });
                this.props.addNotification({
                    "id": randomId(),
                    "is_read": false,
                    "title": 'Savings rollover',
                    "description": `Good Job! You have successfully rolled over your ${this.state.savings.savings.name} plan. You can now keep earning interest on your savings.`, 
                    "timestamp": moment().toString()
                })
            }).catch((error) => {
                this.setState({ processing: false }, () =>
                    this.props.showToast(error.message));
            });
        });
    }

    render() {
        let { savings } = this.state;
        let penal_charge = savings.penal_charge || 0;
        let penal_notice = Dictionary.ROLLOVER_PENALTY;
        penal_notice = penal_notice.replace("%s", penal_charge);

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={savings.name} />
                <ScrollView {...this.props} hasButtomButtons={true}>
                    <SubHeader text={Dictionary.ROLLOVER_SAVINGS_SUB_HEADER} />
                    <View style={styles.topContainer}>
                        <SavingsSummary savings={savings} />
                    </View>
                    <View style={[FormStyle.formContainer, styles.formContainer]}>
                        <View style={FormStyle.formItem}>
                            <TouchItem
                                onPress={() => this.toggleSelectDate(true)}>
                                <FloatingLabelInput
                                    pointerEvents="none"
                                    label={Dictionary.NEW_WITHDRAWAL_DATE_LABEL}
                                    value={this.state.withdrawal_date}
                                    multiline={false}
                                    autoCorrect={false}
                                    editable={false}
                                />
                            </TouchItem>
                            <Text style={FormStyle.formError}>{this.state.withdrawal_date_error}</Text>
                        </View>
                    </View>
                    <View style={SharedStyle.bottomPanel}>
                        {penal_charge > 0 && (
                            <InfoPanel text={penal_notice} />
                        )}
                        <View style={FormStyle.formButton}>
                            <PrimaryButton
                                loading={this.state.processing}
                                title={Dictionary.ROLLOVER_SAVINGS}
                                icon="arrow-right"
                                onPress={this.handleSubmit} />
                        </View>
                    </View>
                </ScrollView>
                <_DateTimePicker
                    show={this.state.show_date_picker}
                    value={this.state.withdrawal_date}
                    onChange={this.prcessSelectedDate}
                    onClose={this.closeDatePicker}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    topContainer: {
        backgroundColor: Colors.WHITE_FADE,
        elevation: 3
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        savings: state.savings
    };
};

const mapDispatchToProps = {
    showToast,
    getUserSavings,
    addNotification
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(RolloverSavings));