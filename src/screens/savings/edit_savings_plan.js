import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator, BackHandler, Text, View, Image } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import SwitchToggle from '@dooboo-ui/native-switch-toggle';
import * as Icon from '@expo/vector-icons';
import moment from 'moment';

import { showToast } from '_actions/toast_actions';
import { getUserSavings, getSavingsFrequencies } from '_actions/savings_actions';
import { getUserCards } from '_actions/payment_actions';

import { Dictionary, Util } from '_utils';
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from '_styles';
import { FloatingLabelInput, TouchItem } from '_atoms';
import { default as ScrollView } from '_atoms/scroll_view';
import { PrimaryButton } from '_molecules';
import { MainHeader, Dropdown } from '_organisms';

import { Network } from '_services';
import { addNotification } from '_actions/notification_actions';
import { randomId } from '../../utils/util';

class EditSavingsPlan extends Component {
    constructor(props) {
        super(props);

        const savings = this.props.navigation.getParam('savings');

        this.state = {
            savings,
            title: Dictionary.EDIT_SAVINGS_PLAN.replace("%s", savings.name),
            name: savings.name,
            name_error: '',
            periodic_amount: "" + savings.periodic_amount,
            periodic_amount_error: '',
            target: "" + savings.target,
            target_error: '',
            frequency: savings.frequency ? this.getFrequencyOption(savings.frequency) : {},
            card: {},
            status: savings.status,
            processing: false,
            auth_screen_visible: false,
            pin_error: ''
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

        if (this.props.savings.saving_frequencies.length === 0) {
            this.props.getSavingsFrequencies();
        }

        if (this.props.payment.cards === 0) {
            this.props.getUserCards();
        }

        this.getPaymentOption();
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

    getFrequencyOption = (frequency) => {
        let options = this.getDataFromFrequencyOptions();
        let preferred = options.filter((option) => {
            return option.name.toLowerCase().trim() === frequency.toLowerCase().trim();
        });

        return preferred.length > 0 ? preferred[0] : '';
    }

    getDataFromFrequencyOptions = () => {
        let options = this.props.savings.saving_frequencies;
        options = options.map(item => {
            return {
                id: item.id,
                name: item.name,
                description: item.description
            }
        });

        return options;
    }

    presetFrequency = (frequency) => {
        if (!this.state.processing) {
            this.setState({ frequency });
        }
    }

    getPaymentOption = () => {
        let card = this.state.savings.card;
        if (card) {
            let options = this.getDataFromPaymentOptions();
            let preferred = options.filter((option) => {
                return option.card_type.toLowerCase().trim() === card.card_type.toLowerCase().trim()
                    && option.card_exp_month.toLowerCase().trim() === card.card_exp_month.toLowerCase().trim()
                    && option.card_exp_year.toLowerCase().trim() === card.card_exp_year.toLowerCase().trim()
                    && option.card_last4.toLowerCase().trim() === card.card_last4.toLowerCase().trim()
                    && option.bank_name.toLowerCase().trim() === card.bank.toLowerCase().trim();
            });

            let preferred_card = preferred.length > 0 ? preferred[0] : {};
            this.setState({
                card: preferred_card
            });
        } else {
            this.setState({
                card: {
                    description: '- - -'
                }
            });
        }
    }

    getDataFromPaymentOptions = () => {
        let options = this.props.payment.cards;
        options = options.map(item => {
            return {
                ...item,
                label: `* * * * ${item.card_last4}`,
                subtitle: item.bank_name,
                imageUrl: item.logo_url,
                description: `* * * * ${item.card_last4}`
            }
        });

        return options;
    }

    handleStatusChange = () => {
        if (!this.state.processing) {
            this.setState({
                status: this.state.status === 1 ? 0 : this.state.status === 0 ? 1 : 0
            });
        }
    }

    validate = () => {
        let is_valid = true;
        if (!this.state.name) {
            this.setState({ name_error: Dictionary.REQUIRED_FIELD });
            is_valid = false;
        }

        if (!Util.isValidAmount(this.state.periodic_amount)) {
            this.setState({ periodic_amount_error: Dictionary.ENTER_VALID_AMOUNT });
            is_valid = false;
        }

        if (!Util.isValidAmount(this.state.target)) {
            this.setState({ target_error: Dictionary.ENTER_VALID_AMOUNT });
            is_valid = false;
        }

        return is_valid;
    }

    handleSubmit = () => {
        if (!this.validate()) {
            return;
        } else {
            this.setState({ processing: true }, () => {
                let { savings, name, periodic_amount, target, frequency, status, card } = this.state;
                let payload = {
                    name,
                    periodic_amount,
                    target,
                    status
                };

                if (frequency) {
                    payload.frequency_id = frequency.id;
                }
                if (card) {
                    payload.card_id = card.id
                }

                Network.updateSavingsPlan(savings.id, payload).then((result) => {
                    this.setState({ processing: false }, () => {
                        this.handleBackButton();
                        this.props.showToast(result.message, false);
                        this.props.getUserSavings();
                    });
                    this.props.addNotification({
                        "id": randomId(),
                        "is_read": false,
                        "title": 'Savings plan update',
                        "description": `Your savings plan has been updated.`, 
                        "timestamp": moment().toString()
                    })
                }).catch((error) => {
                    this.setState({ processing: false }, () =>
                        this.props.showToast(error.message));
                });
            });
        }
    }

    render() {
        let { loading } = this.props;
        let { savings } = this.state;
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={this.state.title} />
                {loading && (
                    <View style={SharedStyle.loaderContainer}>
                        <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                    </View>
                )}
                {!loading && (
                    <ScrollView {...this.props} hasButtomButtons={true}>
                        <View style={FormStyle.formContainer}>
                            <View style={FormStyle.formItem}>
                                <FloatingLabelInput
                                    label={Dictionary.PLAN_NAME}
                                    value={this.state.name}
                                    multiline={false}
                                    autoCorrect={false}
                                    onChangeText={text => this.setState({
                                        name: text,
                                        name_error: ''
                                    })}
                                />
                                <Text style={FormStyle.formError}>{this.state.name_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <FloatingLabelInput
                                    label={Dictionary.AMOUNT_LABEL}
                                    value={this.state.periodic_amount}
                                    keyboardType={'number-pad'}
                                    multiline={false}
                                    autoCorrect={false}
                                    onChangeText={text => this.setState({
                                        periodic_amount: text.replace(/\D/g, ''),
                                        periodic_amount_error: ''
                                    })}
                                />
                                <Text style={FormStyle.formError}>{this.state.periodic_amount_error}</Text>
                            </View>
                            <View style={FormStyle.formItem}>
                                <FloatingLabelInput
                                    label={Dictionary.GOAL_AMOUNT}
                                    value={this.state.target}
                                    keyboardType={'number-pad'}
                                    multiline={false}
                                    autoCorrect={false}
                                    onChangeText={text => this.setState({
                                        target: text.replace(/\D/g, ''),
                                        target_error: ''
                                    })}
                                />
                                <Text style={FormStyle.formError}>{this.state.target_error}</Text>
                            </View>
                            {!!savings.card && (
                                <View style={FormStyle.formItem}>
                                    <View style={SharedStyle.row}>
                                        <Text
                                            numberOfLines={1}
                                            style={[SharedStyle.normalText, SharedStyle.label, styles.label]}>
                                            {Dictionary.FREQUENCY}
                                        </Text>
                                        <View style={styles.boxed}>
                                            {this.props.savings.saving_frequencies.map((frequency, index) => {
                                                return <TouchItem
                                                    key={index}
                                                    onPress={() => this.presetFrequency(frequency)}
                                                    style={[
                                                        styles.preset,
                                                        this.state.frequency.id === frequency.id ? styles.activePreset : {}
                                                    ]}>
                                                    <Text
                                                        style={[
                                                            styles.presetText,
                                                            this.state.frequency.id === frequency.id ? styles.activePresetText : {}
                                                        ]}>
                                                        {frequency.name}
                                                    </Text>
                                                </TouchItem>
                                            })}
                                        </View>
                                    </View>
                                </View>
                            )}
                            <View style={FormStyle.formItem}>
                                <View style={SharedStyle.row}>
                                    <Text
                                        numberOfLines={1}
                                        style={[SharedStyle.normalText, SharedStyle.label, styles.label]}>
                                        {Dictionary.PLAN_STATUS}
                                    </Text>
                                    <View style={[styles.boxed, styles.paddedBox]}>
                                        <Text numberOfLines={1} style={[styles.presetText]}>
                                            {this.state.status === 1 ? Dictionary.ACTIVE_PLAN : Dictionary.INACTIVE_PLAN}
                                        </Text>
                                        <SwitchToggle
                                            containerStyle={FormStyle.switchContainer}
                                            circleStyle={FormStyle.switchCircle}
                                            switchOn={this.state.status === 1}
                                            onPress={this.handleStatusChange}
                                            backgroundColorOn={Colors.GREEN}
                                            backgroundColorOff={Colors.LIGHT_GREY}
                                            circleColorOff={Colors.WHITE}
                                            circleColorOn={Colors.WHITE}
                                            duration={50} />
                                    </View>
                                </View>
                            </View>
                            {!!savings.card && (
                                <View style={FormStyle.formItem}>
                                    <View style={SharedStyle.row}>
                                        <Text
                                            numberOfLines={1}
                                            style={[SharedStyle.normalText, SharedStyle.label, styles.label]}>
                                            {Dictionary.PAYMENT_METHOD}
                                        </Text>
                                        <View style={{ width: '60%' }}>
                                            <Dropdown
                                                options={this.getDataFromPaymentOptions()}
                                                value={' '}
                                                title={Dictionary.PAYMENT_METHOD}
                                                hideCaret={'true'}
                                                onChange={(obj) => {
                                                    this.setState({
                                                        card: obj
                                                    })
                                                }}>
                                                <View style={[styles.boxed, styles.paddedBox, SharedStyle.fullColumn]}>
                                                    <Image
                                                        style={styles.cardIcon}
                                                        source={{ uri: this.state.card.logo_url }}
                                                    />
                                                    <View style={styles.cardDetails}>
                                                        <Text
                                                            numberOfLines={1}
                                                            style={[SharedStyle.normalText, SharedStyle.value]}>
                                                            {this.state.card.description}
                                                        </Text>
                                                        <Icon.SimpleLineIcons style={{ marginLeft: Mixins.scaleSize(16) }}
                                                            name="arrow-right"
                                                            size={Mixins.scaleSize(12)}
                                                            color={Colors.LIGHT_GREY}
                                                        />
                                                    </View>
                                                </View>
                                            </Dropdown>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>
                        <View style={SharedStyle.bottomPanel}>
                            <View style={FormStyle.formButton}>
                                <PrimaryButton
                                    title={Dictionary.SAVE_BTN}
                                    loading={this.state.processing}
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
    label: {
        width: '40%'
    },
    boxed: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: Mixins.scaleSize(1),
        borderRadius: Mixins.scaleSize(4),
        borderColor: Colors.INPUT_BORDER,
        width: '60%'
    },
    preset: {
        ...Mixins.padding(16, 8, 16, 8),
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
    paddedBox: {
        ...Mixins.padding(14, 10, 14, 10)
    },
    cardIcon: {
        width: Mixins.scaleSize(30),
        height: Mixins.scaleSize(20),
        resizeMode: 'contain'
    },
    cardDetails: {
        flexDirection: 'row',
        alignItems: 'center'
    }
});

const mapStateToProps = (state) => {
    return {
        savings: state.savings,
        payment: state.payment,
        loading: state.payment.loading_cards || state.savings.loading_saving_frequencies
    };
};

const mapDispatchToProps = {
    showToast,
    getUserSavings,
    getSavingsFrequencies,
    getUserCards,
    addNotification
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(EditSavingsPlan));