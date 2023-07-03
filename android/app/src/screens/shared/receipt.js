import React, { Component } from 'react';
import { StyleSheet, BackHandler, View, Text, Image, ActivityIndicator } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import * as Icon from '@expo/vector-icons';
import moment from 'moment';
import ViewShot, { captureRef } from "react-native-view-shot";
import Share from 'react-native-share';

import { showToast } from '_actions/toast_actions';

import { Dictionary, Util } from '_utils';
import { Colors, Mixins, Typography, SharedStyle, FormStyle } from '_styles';
import { TouchItem, ScrollView } from '_atoms';
import { Network } from '_services';

class Receipt extends Component {
    constructor(props) {
        super(props);

        const navigation = this.props.navigation;
        const transaction_data = navigation.getParam('transaction_data');
        const transaction_payload = navigation.getParam('transaction_payload');
        const allow_back = navigation.getParam('allow_back');

        this.state = {
            transaction_data,
            transaction_payload,
            allow_back,
            snapshot: null,
            sharing: false,
            receipt_data: {},
            receipt_data_loading: false
        };
    }

    componentDidMount() {
        this.getBeneficiaryData(Number(this.state.transaction_data?.id ?? this.state.transaction_data?.transactionID))
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton = () => {
        if (this.props.isFocused) {
            if (this.state.allow_back) {
                this.props.navigation.goBack();
            } else {
                this.props.navigation.navigate('Dashboard');
            }

            return true;
        }
    }

    handleShareReceipt = async () => {
        if (!this.state.snapshot) {
            const snapshot = await captureRef(this.refs.receiptRef, {
                format: 'jpg',
                quality: 0.9
            });
            this.setState({ snapshot });
        }

        this.setState({ sharing: true }, async () => {
            try {
                await Share.open({ url: this.state.snapshot });
            } catch (error) {
                console.log(error.message);
            } finally {
                this.setState({ sharing: false })
            }
        });
    }

    getBeneficiaryData = (id) => {
        this.setState({receipt_data_loading: true}, () => {
            Network.getReceipt(id).then((result) => {
                let { receipt } = result;
                this.setState({
                    receipt_data_loading: false,
                    receipt_data: receipt
                })
            }).catch((error) => {
                this.setState({receipt_data_loading: false})
                //this.props.showToast(error.message);
            })
        })
    }

    render() {
        let { transaction_data,transaction_payload, receipt_data, receipt_data_loading } = this.state;
        let { wallet } = this.props;
        // const hasRecipient = transaction_data.recipient && (
        //     transaction_data.recipient.institution_name ||
        //     transaction_data.recipient.customer_id ||
        //     transaction_data.recipient.customer_name
        // );

        const hasRecipient = transaction_data.BeneficiaryAccountName ?true:false;

        const TranxType = transaction_data?.debitCreditType ?? "Debit";
        return (
            <View style={SharedStyle.mainContainer}> 
                <ScrollView {...this.props}>
                    <ViewShot ref="receiptRef" style={{ backgroundColor: Colors.WHITE }}>
                        <View style={styles.header}>
                            <Image
                                style={styles.logo}
                                source={require('../../assets/images/logo.png')}
                            />
                            <TouchItem
                                //style={styles.button}
                                disabled={this.state.sharing}
                                onPress={this.handleBackButton}>
                                <Icon.Feather
                                    size={Mixins.scaleSize(24)}
                                    style={{ color: Colors.PRIMARY_BLUE,}}
                                    name="x" />
                            </TouchItem>
                        </View>
                        <View style={styles.body}>
                            <View style={FormStyle.formItem}>
                                <Text style={styles.label}>{Dictionary.TRANSACTION_RECEIPT}</Text>
                            </View>
                            <View style={styles.container}>
                                <View style={styles.alignRow}>
                                    <View style={styles.initials}>
                                        <Text style={styles.initialsText}>{this.props.user.user_data.lastName.substring(0, 1)}</Text>
                                    </View>
                                    <View>
                                        <Text / >
                                        <Text numberOfLines={1} style={[styles.value, {textAlign: "left"}]}>{`${this.props.user.user_data.lastName} ${this.props.user.user_data.firstName}`}</Text>
                                        {/* <Text numberOfLines={1} style={styles.value}>{moment(new Date()).format('MMMM Do YYYY h:mm A')}</Text> */}
                                        <Text numberOfLines={1} style={styles.value}>
                                            {transaction_data.createdOn ? moment(transaction_data?.createdOn, 'YYYY-MM-DD HH:mm:ss').format('MMMM Do YYYY h:mm A') : moment(new Date()).format('MMMM Do YYYY h:mm A')}
                                        </Text>
                                    </View>
                                    {receipt_data_loading && (
                                        <View 
                                            style={[
                                                SharedStyle.mainContainer,
                                                { alignItems: "center", justifyContent: "center", backgroundColor: Colors.RECEIPT_BG }
                                            ]}
                                        >
                                            <ActivityIndicator color={Colors.PRIMARY_BLUE} />
                                        </View>
                                    )}
                                </View>
                                <View style={styles.row}>
                                    <View style={styles.tranxTypeLabelColumn}>
                                        <Text numberOfLines={1} style={styles.label}>{Dictionary.TRANSACTION_TYPE}</Text>
                                    </View>
                                    <View style={styles.tranxTypeValueColumn}>
                                        {/* {transaction_data && (
                                            <Text numberOfLines={1} style={styles.value}>
                                                {transaction_data.debitCreditType.toLowerCase() === "dt" ? "Debit": "Credit"}
                                            </Text>
                                        )} */}
                                        <Text numberOfLines={1} style={styles.value}>
                                            {TranxType.toLowerCase() === "cr" ? "Credit": "Debit"}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.row}>
                                    <View style={styles.labelColumn}>
                                        <Text numberOfLines={1} style={styles.label}>{"Amount"}</Text>
                                    </View>
                                    <View style={styles.valueColumn}>
                                        <Text numberOfLines={1} style={styles.value}>₦{Util.formatAmount(Math.abs(transaction_data?.Amount)||Math.abs(transaction_data?.amount))}</Text>
                                    </View>
                                </View>
                                {receipt_data?.BeneficiaryName && <View style={styles.row}>
                                    <View style={[styles.tranxTypeLabelColumn]}>
                                        <Text numberOfLines={1} style={styles.label}>{Dictionary.BENEFICIARY_NAME_LABEL}</Text>
                                    </View>
                                    <View style={styles.tranxTypeValueColumn}>
                                        <Text numberOfLines={1} style={styles.value}>{receipt_data?.BeneficiaryName}</Text>
                                    </View>
                                </View>}
                                {receipt_data?.BeneficiaryAccountNumber && <View style={styles.row}>
                                    <View style={[styles.tranxTypeLabelColumn]}>
                                        <Text numberOfLines={1} style={styles.label}>{Dictionary.BENEFICIARY_ACCOUNT_LABEL}</Text>
                                    </View>
                                    <View style={styles.tranxTypeValueColumn}>
                                        <Text numberOfLines={1} style={styles.value}>{receipt_data?.BeneficiaryAccountNumber}</Text>
                                    </View>
                                </View>}
                               {receipt_data?.BeneficiaryBank && <View style={styles.row}>
                                    <View style={[styles.tranxTypeLabelColumn]}>
                                        <Text numberOfLines={1} style={styles.label}>{Dictionary.BENEFICIARY_BANK_LABEL}</Text>
                                    </View>
                                    <View style={styles.tranxTypeValueColumn}>
                                        <Text numberOfLines={1} style={styles.value}>{receipt_data?.BeneficiaryBank}</Text>
                                    </View>
                                </View>}
                                <View style={styles.row}>
                                    <View style={[styles.tranxTypeLabelColumn]}>
                                        <Text numberOfLines={1} style={styles.label}>{Dictionary.SOURCE_ACCOUNT}</Text>
                                    </View>
                                    <View style={styles.tranxTypeValueColumn}>
                                        <Text numberOfLines={1} style={styles.value}>{Util.maskToken(this.props.user.user_data.nuban)}</Text>
                                    </View>
                                </View>
                                <View style={styles.row}>
                                    <View style={[styles.labelColumn]}>
                                        <Text numberOfLines={1} style={styles.label}>{Dictionary.NARRATION}</Text>
                                    </View>
                                    <View style={styles.valueColumn}>
                                        <Text numberOfLines={2} style={styles.value}>{transaction_data?.notes || transaction_data?.Narration || '- - -'}</Text>
                                    </View>
                                </View>
                                <View style={[styles.row, transaction_data?.pin ? {} : styles.lastRow]}>
                                    <View style={styles.labelColumn}>
                                        <Text numberOfLines={1} style={styles.label}>{Dictionary.REFERENCE}</Text>
                                    </View>
                                    <View style={styles.valueColumn}>
                                        <Text numberOfLines={2} style={[styles.value, { ...Typography.FONT_MEDIUM }]}>{transaction_data?.referenceNumber || '- - -'}</Text>
                                        <Text numberOfLines={1} style={styles.value}>{Dictionary.SUCCESSFUL}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ViewShot>
                    <View style={styles.generated}>
                        <Text style={styles.value}>{Dictionary.GENERATED}</Text>
                    </View>
                    <View style={{}}>
                        <TouchItem
                            style={styles.share}
                            disabled={this.state.sharing}
                            onPress={this.handleShareReceipt}>
                            <Text style={[SharedStyle.normalText, styles.shareText]}>{Dictionary.SHARE_BTN}</Text>
                        </TouchItem>
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        ...Mixins.padding(28, 16, 16, 16),
        //...Mixins.boxShadow(Colors.BLACK),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        /// elevation: 15,
        //borderWidth: Mixins.scaleSize(2),
        backgroundColor: Colors.WHITE,
    },
    title: {
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(24),
        lineHeight: Mixins.scaleSize(28),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.DARK_GREY
    },
    logo: {
        width: Mixins.scaleSize(194),
        height: Mixins.scaleSize(51),
        resizeMode: 'contain'
    },
    body: {
        ...Mixins.padding(28, 16, 0, 16)
    },
    container: {
        // borderColor: Colors.INPUT_BORDER,
        // borderWidth: Mixins.scaleSize(3),
        ...Mixins.boxShadow(Colors.RECEIPT_BG),
        backgroundColor: Colors.RECEIPT_BG,
        borderRadius: Mixins.scaleSize(10),
        marginBottom: Mixins.scaleSize(12)
    },
    row: {
        ...Mixins.margin(10, 20, 10, 20),
        //...Mixins.padding(20, 15, 20, 15),
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomColor: Colors.DIVIDER,
        borderBottomWidth: Mixins.scaleSize(1),
    },
    initials: {
        width: Mixins.scaleSize(64),
        height: Mixins.scaleSize(64),
        borderRadius: Mixins.scaleSize(10),
        borderColor: Colors.INPUT_BORDER,
        borderWidth: Mixins.scaleSize(1),
        backgroundColor: Colors.WHITE,
        marginRight: Mixins.scaleSize(10)
    },
    initialsText: {
        ...Typography.FONT_REGULAR,
        fontWeight: "500",
        fontSize: 48,
        color: "#D0D5DD",
        textTransform: "uppercase",
        textAlign: "center"
    },
    lastRow: {
        borderBottomWidth: Mixins.scaleSize(0)
    },
    labelColumn: {
        width: '30%',
        marginBottom: Mixins.scaleSize(20)
    },
    valueColumn: {
        width: '70%'
    },
    tranxTypeLabelColumn: {
        width: '40%',
        marginBottom: Mixins.scaleSize(20)
    },
    tranxTypeValueColumn: {
        width: '60%'
    },
    label: {
        ...SharedStyle.normalText,
        color: Colors.PRIMARY_BLUE,
        fontWeight: "700",
    },
    value: {
        ...Typography.FONT_REGULAR,
        ...SharedStyle.right,
        color: Colors.DARK_GREY,
        fontWeight: "400",
        fontSize: 12,
        marginBottom: Mixins.scaleSize(5),
        textTransform: 'none'
    },
    buttons: {
        ...Mixins.margin(0, 16, 16, 16),
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    button: {
        paddingVertical: Mixins.scaleSize(16),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%'
    },
    buttonIcon: {
        color: Colors.CV_YELLOW,
        marginRight: Mixins.scaleSize(10)
    },
    buttonText: {
        ...Typography.FONT_MEDIUM,
        color: Colors.CV_YELLOW
    },
    alignRow: {
        ...Mixins.padding(20, 15, 20, 15),
        flexDirection: 'row',
        // justifyContent: 'space-between',
        // borderBottomColor: Colors.DIVIDER,
        // borderBottomWidth: Mixins.scaleSize(1),
    },
    generated: {
        alignSelf: "center",
        ...Mixins.margin(15, 0, 10, 0),
    },
    share: {
        alignSelf: "center",
        ...Mixins.margin(15, 0, 15, 0),
        width: Mixins.scaleSize(278),
        height: Mixins.scaleSize(44),
        borderColor: "#072C50",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: Colors.DARK_BLUE
    },
    shareText: {
        ...Typography.FONT_MEDIUM,
        color: Colors.WHITE,
        fontSize: 16
    },
});

const mapStateToProps = (state) => {
    return {
        user: state.user,
        wallet: state.wallet.wallet_data
    };
};

const mapDispatchToProps = {
    showToast
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(Receipt));