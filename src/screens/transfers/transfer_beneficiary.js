import React, { Component } from 'react';
import { BackHandler, ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import * as Icon from '@expo/vector-icons';

import { showToast } from '_actions/toast_actions';
import { getBankOptions } from '_actions/config_actions';
import { updateFundsTransfer } from '_actions/transfer_actions';

import { Dictionary, Util } from '_utils';
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from '_styles';
import { SubHeader, ScrollView, FloatingLabelInput, TouchItem, RecentTransaction, ProgressBar } from '_atoms';
import { MainHeader, Dropdown, ActionSheet } from '_organisms';
import { PrimaryButton } from '_molecules';

import { Network } from '_services';
import { account_type_data } from '../../../src/data';
import { ResponseCodes } from '_utils';

class TransferBeneficiary extends Component {
    state = {
        account_number: '',
        account_number_error: '',
        bank: '',
        bank_error: '',
        account_name: '',
        processing: false,
        show_beneficiary_list: false,
        recent_transactions: this.props.transfers.recent_transfers
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        if (this.props.config.banks.length === 0) {
            this.props.getBankOptions();
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            let working = this.props.config.loading_banks || this.state.processing;
            !working && this.props.navigation.goBack();

            return true;
        }
    }

    getDataFromBankConfig = () => {
        let options = this.props.config.banks.map(bank => {
            return {
                label: bank.name,
                value: bank.additional_code,
                link_id: bank.link_id
            }
        })

        return options;
    }

    getDropDownOption = (value) => {
        let options = this.getDataFromBankConfig();
        let preferred = options.filter((option) => {
            return option.additional_code === value;
        });

        return preferred.length > 0 ? preferred[0] : '';
    }

    getBeneficiaryOptions = () => {
        let options = this.props.transfers.beneficiaries.map(beneficiary => {
            return {
                ...beneficiary,
                label: beneficiary.name,
                subtitle: beneficiary.account_number,
                imageUrl: beneficiary.url
            }
        });

        return options;
    }

    handleSelectBeneficiary = () => {
        if (!this.state.processing) {
            this.setState({
                show_beneficiary_list: true
            });
        }
    }

    assertSelectedBeneficiary = (beneficiary) => {
        let bankName = Dictionary.TOUCHGOLD_BANK
        let { id: beneficiary_id, name: account_name,accountNumber: account_number,beneficiaryBvn,bankCode ,bank } = beneficiary;
      //let bank_code="999333";
    //   , bank:Dictionary.TOUCHGOLD_BANK, beneficiary_id: null,ChannelCode:result.ChannelCode||1
        // let bank = this.getDropDownOption(this.state.bank.value);
        this.props.updateFundsTransfer({ account_number, account_name, bank:{label:bank === "TouchGold Bank" ? bankName : bank,value:bankCode||""}, beneficiary_id , bankCode,BankVerificationNumber:beneficiaryBvn,ChannelCode:1,DestinationInstitutionCode:bankCode});
         this.props.navigation.navigate('TransferNarration');
    }

    validate = () => {
        let is_valid = true;

        if (!this.state.account_number || this.state.account_number.length != 10) {
            this.setState({
                account_number_error: Dictionary.ENTER_VALID_NUBAN,
            });

            is_valid = false;
        }

        if (!this.state.bank) {
            this.setState({
                bank_error: Dictionary.REQUIRED_FIELD,
            });

            is_valid = false;
        }

        return is_valid;
    }

    handleSubmitIntraBank=()=>{
        if (!this.state.account_number) {
            this.setState({
                account_number_error: Dictionary.ENTER_VALID_NUBAN,
            });

            return;
        }

        let { account_number } = this.state;

        this.setState({ processing: true }, () => {
            
            Network.doIntraBankNameEnquiry(account_number)
                .then((result) => {
                    this.setState({ processing: false }, () => {
                        if (result.resp.code!=ResponseCodes.SUCCESS_CODE) {
                            this.props.showToast(Dictionary.GENERAL_ERROR)
                        } else {
                            let account_name = Util.toTitleCase(result.name);
                            this.props.updateFundsTransfer({ account_number, account_name, bank:Dictionary.TOUCHGOLD_BANK, beneficiary_id: null,ChannelCode:result.ChannelCode||1});
                            this.props.navigation.navigate('TransferConfirmBeneficiary', {
                                bankCode: result.bankCode
                            });
                        }
                    });
                }).catch((error) => {
                    this.setState({ processing: false }, () => {
                        this.props.showToast(error.message||"Cannot perform enquiry")
                    });
                });
        });
    }

    handleSubmit = () => {
        if (!this.validate()) {
            return;
        }

        

        let { account_number, bank } = this.state;
        // account_number="0051762787";
       
        this.setState({ processing: true }, () => {
            const payload={
                // BankCode:"999998",
                DestinationInstitutionCode:bank.value,
                ChannelCode:"1",
                AccountNumber:account_number
            }
            Network.doNameEnquiry(payload)
                .then((result) => {
                    this.setState({ processing: false }, () => {
                        if (result.resp.code!=ResponseCodes.SUCCESS_CODE) {
                            this.props.showToast(Dictionary.GENERAL_ERROR)
                        } else {
                            let account_name = Util.toTitleCase(result.nameEnquiry.accountName);
                            this.props.updateFundsTransfer({KYCLevel:result.nameEnquiry.kycLevel||1,SessionID:result.nameEnquiry.sessionId,DestinationInstitutionCode:bank.value||"999998", account_number, account_name, bank, beneficiary_id: null ,BankVerificationNumber:result.nameEnquiry.bvn||"",ChannelCode:payload.ChannelCode});
                            this.props.navigation.navigate('TransferConfirmBeneficiary');
                        }
                    });
                }).catch((error) => {
                    this.setState({ processing: false }, () => {
                        this.props.showToast(error.message||"Cannot perform enquiry")
                    });
                });
        });
    }

    render() {
        let loading = this.props.config.loading_banks;
        let transfer_beneficiaries = this.props.transfers.beneficiaries;
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.TRANSFERS} />
                <ScrollView {...this.props}>
                    {loading && (
                        <View style={SharedStyle.loaderContainer}>
                            <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                        </View>
                    )}
                    {!loading && (
                        <View style={{ flex: 1 }}>
                            <SubHeader text={Dictionary.TRANSFER_BENEFICIARY_SUB_HEADER} />
                            <ProgressBar progress={0.4} />
                            <View style={FormStyle.formContainer}>
                                <View style={FormStyle.formItem}>
                                    <FloatingLabelInput
                                        label={this.props.transfers.account_type==account_type_data.ACCOUNT_TYPE.OTHERS ?Dictionary.ACCOUNT_NUMBER_LABEL:Dictionary.TOUCHGOLD_ACCOUNT_NUMBER_LABEL}
                                        value={this.state.account_number}
                                        keyboardType={'number-pad'}
                                        multiline={false}
                                        autoCorrect={false}
                                        maxLength={this.props.transfers.account_type==account_type_data.ACCOUNT_TYPE.OTHERS ?10:13}
                                        onChangeText={text => this.setState({
                                            account_number: text.replace(/\D/g, ''),
                                            account_number_error: '',
                                            account_name: ''
                                        })}
                                        editable={!this.state.processing}
                                    />
                                    <Text style={FormStyle.formError}>{this.state.account_number_error}</Text>
                                </View>
                                {this.props.transfers.account_type==account_type_data.ACCOUNT_TYPE.OTHERS &&(
                                <View style={FormStyle.formItem}>
                                    <Dropdown
                                        options={this.getDataFromBankConfig()}
                                        value={''}
                                        title={Dictionary.BANK_LABEL}
                                        onChange={(obj) => {
                                            this.setState({
                                                bank: obj,
                                                bank_error: '',
                                                account_name: ''
                                            })
                                        }}>
                                        <FloatingLabelInput
                                            pointerEvents="none"
                                            label={Dictionary.BANK_LABEL}
                                            value={this.state.bank.label || ''}
                                            multiline={false}
                                            autoCorrect={false}
                                            editable={false}
                                        />
                                    </Dropdown>
                                    <Text style={FormStyle.formError}>{this.state.bank_error}</Text>
                                </View>
                                )}
                                {transfer_beneficiaries.length > 0 && (
                                    <View style={FormStyle.formItem}>
                                        <View style={[FormStyle.formButton, styles.formButton]}>
                                            <TouchItem
                                                style={styles.beneficiaryButton}
                                                onPress={this.handleSelectBeneficiary}
                                                disabled={this.state.processing}>
                                                <Icon.SimpleLineIcons
                                                    size={Mixins.scaleSize(15)}
                                                    style={styles.buttonIcon}
                                                    name="user-follow" />
                                                <Text style={styles.buttonText}>{Dictionary.SELECT_BENEFICIARY}</Text>
                                            </TouchItem>
                                        </View>
                                    </View>
                                )}

                                
                                {/* {this.state.recent_transactions.length > 0 && (
                                    <View>
                                        <View style={FormStyle.formItem}>
                                            <Text style={FormStyle.sectionLabel}>{Dictionary.RECENT_TRANSACTIONS}</Text>
                                        </View>
                                        <View style={FormStyle.formItem}>
                                            {this.state.recent_transactions.map((transaction, index) => {
                                                let isEven = index % 2 === 0;
                                                return <RecentTransaction
                                                    key={index}
                                                    initialsBackgroundColor={isEven ? Colors.LIGHT_GREEN_BG : Colors.LIGHT_ORANGE_BG}
                                                    initialsTextColor={isEven ? Colors.CV_GREEN : Colors.CV_YELLOW}
                                                    customerName={transaction.account_name}
                                                    customerId={transaction.bank_name}
                                                    onPress={() => {
                                                        this.setState({
                                                            account_number: transaction.account_number,
                                                            account_name: transaction.account_name,
                                                            bank: this.getDropDownOption(transaction.bank_code)
                                                        }, () => this.handleSubmit());
                                                    }}
                                                />
                                            })}
                                        </View>
                                    </View>
                                )} */}
                            </View>
                        </View>
                    )}
                    {!loading && (
                        <View style={SharedStyle.bottomPanel}>
                            <View style={FormStyle.formButton}>
                                <PrimaryButton
                                    loading={this.state.processing}
                                    title={Dictionary.CONTINUE_BTN}
                                    icon="arrow-right"
                                    onPress={this.props.transfers.account_type==account_type_data.ACCOUNT_TYPE.OTHERS? this.handleSubmit:this.handleSubmitIntraBank} />
                            </View>
                        </View>
                    )}
                </ScrollView>
                <ActionSheet
                    options={this.getBeneficiaryOptions()}
                    title={Dictionary.SELECT_BENEFICIARY}
                    show={this.state.show_beneficiary_list}
                    onChange={(beneficiary) => this.assertSelectedBeneficiary(beneficiary)}
                    close={() => this.setState({
                        show_beneficiary_list: false
                    })} />
            </View>
        );
    }
}

const styles = StyleSheet.create({

    formButton: {
        marginHorizontal: Mixins.scaleSize(0),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    beneficiaryButton: {
        paddingVertical: Mixins.scaleSize(10),
        flexDirection: 'row',
        alignItems: 'center'
    },
    buttonIcon: {
        marginRight: Mixins.scaleSize(10),
        color: Colors.CV_YELLOW
    },
    buttonText: {
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.CV_YELLOW
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        config: state.config,
        transfers: state.transfers
    };
};

const mapDispatchToProps = {
    showToast,
    getBankOptions,
    updateFundsTransfer
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(TransferBeneficiary));