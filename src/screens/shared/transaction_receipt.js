import React, { Component } from "react";
import Modal from "react-native-modal";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import * as Icon from "@expo/vector-icons";
import { connect } from "react-redux";
import moment from "moment";
import ViewShot, { captureRef } from "react-native-view-shot";
import Share from "react-native-share";

import { Dictionary, Util } from "_utils";
import { Mixins, SharedStyle, FormStyle, Colors, Typography } from "_styles";
import { TouchItem, ScrollView } from "_atoms";

import { Network } from "_services";
import { showToast } from "_actions/toast_actions";

const { height } = Dimensions.get("screen");

class TransactionReceipt extends Component {
  constructor(props) {
    super(props);

    this.state = {
      snapshot: null,
      sharing: false,
      receipt_data: this.props.fromTransferPage ? this.props.transaction_data : {},
      receipt_data_loading: false,
      scrollHeight: Mixins.DRAW_HEIGHT,
      scrollWithTabHeight: Mixins.DRAW_HEIGHT_WITH_NAV,
      isReceiptMounted: true,
    };
  }

  componentDidUpdate() {
    if (this.props.modal_visible && this.state.isReceiptMounted) {
      this.getBeneficiaryData(
        Number(
          this.props.transaction_data?.id ||
            //this.props.transaction_data?.transactionID
            this.props.transaction_data?.ID
        )
      );
    }
  }

  handleShareReceipt = async () => {
    if (!this.state.snapshot) {
      const snapshot = await captureRef(this.refs.receiptRef, {
        format: "jpg",
        quality: 0.9,
      });
      this.setState({ snapshot });
    }

    this.setState({ sharing: true }, async () => {
      try {
        await Share.open({ url: this.state.snapshot });
      } catch (error) {
        console.log(error.message);
      } finally {
        this.setState({ sharing: false });
      }
    });
  };

  getBeneficiaryData = (id) => {
    if (!id) return;

    this.setState(
      { receipt_data_loading: true, isReceiptMounted: false },
      () => {
        Network.getReceipt(id)
          .then((result) => {
            let { receipt } = result;
            this.setState({
              receipt_data_loading: false,
              receipt_data: receipt,
            });
          })
          .catch((error) => {
            this.setState({ receipt_data_loading: false });
            //this.props.showToast(error.message);
          });
      }
    );
  };

  CloseModal = () => {
    this.props.onCloseModal();
    this.setState({ isReceiptMounted: true });
  };

  render() {
    const {
      modal_visible,
      onCloseModal,
      transaction_data,
      transaction_payload,
      props,
    } = this.props;

    let { receipt_data, receipt_data_loading } = this.state;
    const hasRecipient = transaction_data.beneficiaryAccountName ? true : false;
    const status = receipt_data?.status ?? transaction_data?.status;

    const TranxType = transaction_data?.debitCreditType ?? "Debit";
    const BeneficiaryName = receipt_data?.BeneficiaryName ?? receipt_data?.BeneficiaryAccountName

    return (
      <View>
        <Modal
          isVisible={modal_visible}
          animationIn={"slideInUp"}
          onBackdropPress={this.CloseModal}
          onBackButtonPress={this.CloseModal}
          animationInTiming={300}
          animationOutTiming={500}
          backdropTransitionInTiming={300}
          backdropTransitionOutTiming={500}
          useNativeDriver={true}
          style={{ margin: 0 }}
        >
          <View
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: height * 0.8,
              borderTopLeftRadius: Mixins.scaleSize(20),
              borderTopRightRadius: Mixins.scaleSize(20),
              backgroundColor: "white",
              ...Mixins.padding(10),
            }}
          >
            <View style={SharedStyle.mainContainer}>
              <ScrollView {...props}>
                <ViewShot
                  ref="receiptRef"
                  style={{ backgroundColor: Colors.WHITE }}
                >
                  <View style={styles.header}>
                    <Image
                      style={styles.logo}
                      source={require("../../assets/images/logo.png")}
                    />
                    <TouchItem
                      disabled={this.state.sharing}
                      onPress={this.CloseModal}
                    >
                      <Icon.Feather
                        size={Mixins.scaleSize(24)}
                        style={{ color: Colors.PRIMARY_BLUE }}
                        name="x"
                      />
                    </TouchItem>
                  </View>

                  <View style={styles.body}>
                    <View style={styles.container}>
                      <View style={styles.alignRow}>
                        <View style={styles.initials}>
                          <Text style={styles.initialsText}>
                            {this.props.user.user_data.lastName.substring(0, 1)}
                          </Text>
                        </View>
                        <View>
                          <Text />
                          <Text
                            numberOfLines={1}
                            style={[styles.value, { textAlign: "left" }]}
                          >{`${this.props.user.user_data.lastName} ${this.props.user.user_data.firstName}`}</Text>
                          <Text numberOfLines={1} style={styles.value}>
                            {transaction_data.createdOn
                              ? moment(
                                  transaction_data?.createdOn,
                                  "YYYY-MM-DD HH:mm:ss"
                                ).format("MMMM Do YYYY h:mm A")
                              : receipt_data.transactionDate
                              ? moment(
                                  receipt_data?.transactionDate,
                                  "YYYY-MM-DD HH:mm:ss"
                                ).format("MMMM Do YYYY h:mm A")
                              : moment(new Date()).format(
                                  "MMMM Do YYYY h:mm A"
                                )}
                          </Text>
                        </View>

                        {receipt_data_loading && (
                          <View
                            style={[
                              SharedStyle.mainContainer,
                              {
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: Colors.RECEIPT_BG,
                              },
                            ]}
                          >
                            <ActivityIndicator color={Colors.CV_YELLOW} />
                          </View>
                        )}
                      </View>

                      {!receipt_data_loading && !!status && (
                        <View style={styles.status}>
                          <View style={styles.tranxTypeLabelColumn}>
                            <Text numberOfLines={1} style={styles.label}>
                              {"Status"}
                            </Text>
                            <View
                              style={[
                                styles.statusPill,
                                {
                                  backgroundColor:
                                    status === "Paid" || status === "SUCCESS"
                                      ? "#38AA43"
                                      : "#F9D857",
                                },
                              ]}
                            >
                              <Text numberOfLines={1} style={styles.statusText}>
                                {(status === "Paid" || status === "SUCCESS") &&
                                  "✓"}{" "}
                                {status}
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}

                      <View style={styles.row}>
                        <View style={styles.tranxTypeLabelColumn}>
                          <Text numberOfLines={1} style={styles.label}>
                            {Dictionary.TRANSACTION_TYPE}
                          </Text>
                        </View>
                        <View style={styles.tranxTypeValueColumn}>
                          <Text numberOfLines={1} style={styles.value}>
                            {TranxType.toLowerCase() === "cr"
                              ? "Credit"
                              : "Debit"}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.row}>
                        <View style={styles.labelColumn}>
                          <Text numberOfLines={1} style={styles.label}>
                            {"Amount"}
                          </Text>
                        </View>
                        <View style={styles.valueColumn}>
                          <Text numberOfLines={1} style={styles.value}>
                            ₦
                            {Util.formatAmount(
                              Math.abs(transaction_data?.Amount) ||
                                Math.abs(transaction_data?.amount)
                            )}
                          </Text>
                        </View>
                      </View>

                      {hasRecipient && (
                        <View style={styles.row}>
                          <View style={[styles.tranxTypeLabelColumn]}>
                            <Text numberOfLines={1} style={styles.label}>
                              {Dictionary.BENEFICIARY_NAME_LABEL}
                            </Text>
                          </View>
                          <View style={styles.tranxTypeValueColumn}>
                            <Text numberOfLines={1} style={styles.value}>
                              {transaction_data?.beneficiaryAccountName}
                            </Text>
                          </View>
                        </View>
                      )}

                      {hasRecipient && (
                        <View style={styles.row}>
                          <View style={[styles.tranxTypeLabelColumn]}>
                            <Text numberOfLines={1} style={styles.label}>
                              {Dictionary.BENEFICIARY_ACCOUNT_LABEL}
                            </Text>
                          </View>
                          <View style={styles.tranxTypeValueColumn}>
                            <Text numberOfLines={1} style={styles.value}>
                              {transaction_data?.beneficiaryAccountNumber}
                            </Text>
                          </View>
                        </View>
                      )}

                      {BeneficiaryName && (
                        <View style={styles.row}>
                          <View style={[styles.tranxTypeLabelColumn]}>
                            <Text numberOfLines={1} style={styles.label}>
                              {Dictionary.BENEFICIARY_NAME_LABEL}
                            </Text>
                          </View>
                          <View style={styles.tranxTypeValueColumn}>
                            <Text numberOfLines={1} style={styles.value}>
                              {BeneficiaryName}
                            </Text>
                          </View>
                        </View>
                      )}

                      {receipt_data?.BeneficiaryAccountNumber && (
                        <View style={styles.row}>
                          <View style={[styles.tranxTypeLabelColumn]}>
                            <Text numberOfLines={1} style={styles.label}>
                              {Dictionary.BENEFICIARY_ACCOUNT_LABEL}
                            </Text>
                          </View>
                          <View style={styles.tranxTypeValueColumn}>
                            <Text numberOfLines={1} style={styles.value}>
                              {receipt_data?.BeneficiaryAccountNumber}
                            </Text>
                          </View>
                        </View>
                      )}

                      {receipt_data?.BankName && (
                        <View style={styles.row}>
                          <View style={[styles.tranxTypeLabelColumn]}>
                            <Text numberOfLines={1} style={styles.label}>
                              {Dictionary.BENEFICIARY_BANK_LABEL}
                            </Text>
                          </View>
                          <View style={styles.tranxTypeValueColumn}>
                            <Text numberOfLines={1} style={styles.value}>
                              {receipt_data?.BankName}
                            </Text>
                          </View>
                        </View>
                      )}

                      <View style={styles.row}>
                        <View style={[styles.tranxTypeLabelColumn]}>
                          <Text numberOfLines={1} style={styles.label}>
                            {Dictionary.SOURCE_ACCOUNT}
                          </Text>
                        </View>
                        <View style={styles.tranxTypeValueColumn}>
                          <Text numberOfLines={1} style={styles.value}>
                            {Util.maskToken(this.props.user.user_data.nuban)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.row}>
                        <View style={[styles.labelColumn]}>
                          <Text numberOfLines={1} style={styles.label}>
                            {Dictionary.NARRATION}
                          </Text>
                        </View>
                        {transaction_payload ? (
                          <View style={styles.valueColumn}>
                            <Text numberOfLines={2} style={styles.value}>
                              {transaction_payload?.notes ||
                                transaction_payload?.Narration ||
                                "- - -"}
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.valueColumn}>
                            <Text numberOfLines={2} style={styles.value}>
                              {transaction_data?.notes ||
                                transaction_data?.Narration ||
                                "- - -"}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View
                        style={[
                          styles.row,
                          transaction_data?.pin ? {} : styles.lastRow,
                        ]}
                      >
                        <View style={styles.labelColumn}>
                          <Text numberOfLines={1} style={styles.label}>
                            {Dictionary.REFERENCE}
                          </Text>
                        </View>
                        <View style={styles.valueColumn}>
                          <Text
                            numberOfLines={2}
                            style={[
                              styles.value,
                              { ...Typography.FONT_MEDIUM },
                            ]}
                          >
                            {transaction_data?.referenceNumber
                              ? transaction_data?.referenceNumber
                              : receipt_data.referenceNumber
                              ? receipt_data.referenceNumber
                              : "- - -"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </ViewShot>

                <View style={styles.generated}>
                  <Text style={styles.value}>{Dictionary.GENERATED}</Text>
                </View>

                <View>
                  <TouchItem
                    style={styles.share}
                    disabled={this.state.sharing}
                    onPress={this.handleShareReceipt}
                  >
                    <Text style={[SharedStyle.normalText, styles.shareText]}>
                      {Dictionary.SHARE_BTN}
                    </Text>
                  </TouchItem>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    ...Mixins.padding(0, 16, 0, 16),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.WHITE,
  },
  title: {
    ...Typography.FONT_MEDIUM,
    fontSize: Mixins.scaleFont(24),
    lineHeight: Mixins.scaleSize(28),
    letterSpacing: Mixins.scaleSize(0.01),
    color: Colors.DARK_GREY,
  },
  logo: {
    width: Mixins.scaleSize(104),
    height: Mixins.scaleSize(51),
    resizeMode: "contain",
  },
  body: {
    ...Mixins.padding(16, 16, 0, 16),
  },
  container: {
    ...Mixins.boxShadow(Colors.RECEIPT_BG),
    backgroundColor: Colors.RECEIPT_BG,
    borderRadius: Mixins.scaleSize(10),
    marginBottom: Mixins.scaleSize(12),
  },
  row: {
    ...Mixins.margin(10, 20, 5, 20),
    paddingBottom: Mixins.scaleSize(5),
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: Colors.DIVIDER,
    borderBottomWidth: Mixins.scaleSize(1),
  },
  status: {
    ...Mixins.margin(10, 20, 10, 20),
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusPill: {
    width: Mixins.scaleSize(85),
    height: Mixins.scaleSize(20),
    ...Mixins.margin(4, 0, 0, 0),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    ...Typography.FONT_REGULAR,
    fontWeight: "400",
    color: Colors.WHITE,
  },
  initials: {
    width: Mixins.scaleSize(64),
    height: Mixins.scaleSize(64),
    borderRadius: Mixins.scaleSize(10),
    borderColor: Colors.INPUT_BORDER,
    borderWidth: Mixins.scaleSize(1),
    backgroundColor: Colors.WHITE,
    marginRight: Mixins.scaleSize(10),
  },
  initialsText: {
    ...Typography.FONT_REGULAR,
    fontWeight: "500",
    fontSize: 48,
    color: "#D0D5DD",
    textTransform: "uppercase",
    textAlign: "center",
  },
  lastRow: {
    borderBottomWidth: Mixins.scaleSize(0),
  },
  labelColumn: {
    width: "30%",
    marginBottom: Mixins.scaleSize(10),
  },
  valueColumn: {
    width: "70%",
  },
  tranxTypeLabelColumn: {
    width: "40%",
    marginBottom: Mixins.scaleSize(10),
  },
  tranxTypeValueColumn: {
    width: "60%",
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
    textTransform: "none",
  },
  buttons: {
    ...Mixins.margin(0, 16, 16, 16),
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    paddingVertical: Mixins.scaleSize(16),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "50%",
  },
  buttonIcon: {
    color: Colors.CV_YELLOW,
    marginRight: Mixins.scaleSize(10),
  },
  buttonText: {
    ...Typography.FONT_MEDIUM,
    color: Colors.CV_YELLOW,
  },
  alignRow: {
    ...Mixins.padding(15),
    flexDirection: "row",
  },
  generated: {
    alignSelf: "center",
    ...Mixins.margin(15, 0, 10, 0),
  },
  share: {
    alignSelf: "center",
    ...Mixins.margin(0, 0, 10, 0),
    width: Mixins.scaleSize(278),
    height: Mixins.scaleSize(44),
    borderColor: Colors.CV_YELLOW,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: Colors.CV_YELLOW,
  },
  shareText: {
    ...Typography.FONT_MEDIUM,
    color: Colors.WHITE,
    fontSize: 16,
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    wallet: state.wallet,
  };
};

const mapDispatchToProps = {
  showToast,
};

export default connect(mapStateToProps, mapDispatchToProps)(TransactionReceipt);
