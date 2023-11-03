import React, { Component } from 'react';
import { BackHandler, ActivityIndicator, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { showToast } from '_actions/toast_actions';
import { updateBillPayment } from '_actions/bills_actions';

import { Dictionary } from '_utils';
import { SharedStyle, FormStyle, Colors } from '_styles';
import { SubHeader, ScrollView, ProgressBar } from '_atoms';
import { PrimaryButton, SelectListItem } from '_molecules';
import { MainHeader } from '_organisms';

import { Network } from '_services';

class BillsPackage extends Component {
    constructor(props) {
        super(props);

        const { bill_payment } = this.props.bills;
        let subheader = Dictionary.PACKAGE_TO_BUY_SUB_HEADER;
        subheader = subheader.replace("%s", bill_payment.biller.name);

        this.state = {
            subheader,
            biller: bill_payment.biller,
            packages: [],
            bill_package: null,
            package_name: '',
            processing: false
        };
    }


    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        this.getBillerPackages();
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

    setScrollRef = (scrollRef) => {
        this.scrollRef = scrollRef;
    }

    getBillerPackages = () => {
        this.setState({ processing: true }, () => {
            Network.getBillerItems(this.state.biller.billerCode)
                .then((result) => {
                    this.setState({ processing: false }, () => {
                        let packages = result.billscategories.billers||[];
                        if (!packages || !Array.isArray(packages) || packages.length < 1) {
                            this.props.showToast(result.data.message || Dictionary.GENERAL_ERROR);
                            this.handleBackButton();
                        } else {
                            packages.forEach((_package, index) => {
                                _package.index = index;
                            })
                            this.setState({
                                packages
                            });
                        }
                    });
                }).catch((error) => {
                    this.setState({ processing: false }, () => {
                        this.props.showToast(error.message);
                        this.handleBackButton();
                    });
                });
        });
    }

    handleSelectedPackage = (bill_package) => {
        this.setState({
            bill_package,
            package_name: bill_package.name
        }, () => {
            setTimeout(() => {
                this.scrollRef.scrollToEnd({ animated: true })
            }, 50);
        });
    }

    handleSubmit = () => {
        let { packages, bill_package } = this.state;
        this.props.updateBillPayment({ bill_package });

        this.props.navigation.navigate('BillsCustomer', { packages });
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.BILL_PAYMENT} />
                <ScrollView {...this.props} hasButtomButtons={true} setScrollRef={this.setScrollRef}>
                    <SubHeader text={this.state.subheader} />
                    <ProgressBar progress={0.6} />
                    {this.state.processing && (
                        <View style={SharedStyle.loaderContainer}>
                            <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                        </View>
                    )}
                    {!this.state.processing && (
                        <View>
                            {this.state.packages.map((bill_package, index) => {
                                return <SelectListItem
                                    key={index}
                                    title={bill_package.billerName}
                                    onPress={() => this.handleSelectedPackage(bill_package)}
                                    selected={this.state.bill_package?.index === bill_package.index}
                                />
                            })}
                        </View>
                    )}
                    {!!this.state.package_name && (
                        <View style={SharedStyle.bottomPanel}>
                            <View style={FormStyle.formButton}>
                                <PrimaryButton
                                    title={Dictionary.CONTINUE_BTN}
                                    icon="arrow-right"
                                    onPress={this.handleSubmit} />
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
        bills: state.bills
    };
};

const mapDispatchToProps = {
    showToast,
    updateBillPayment
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(BillsPackage));