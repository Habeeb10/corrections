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

class BillsBiller extends Component {
    constructor(props) {
        super(props);

        const { category } = this.props.bills.bill_payment;

        this.state = {
            category,
            billers: [],
            biller: null,
            biller_value: '',
            processing: false
        };
    }


    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        this.getCategoryBillers();
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

    getCategoryBillers = () => {
        this.setState({ processing: true }, () => {
            let code="";
            // if (condition) {
                
            // } else {
                
            // }
            Network.getCategoryBillers(this.state.category.slug)
                .then((result) => {
                    this.setState({ processing: false }, () => {
                        let billers = result.billscategories.billers;
                        if (!billers || !Array.isArray(billers) || billers.length < 1) {
                            this.props.showToast(result.data.message || Dictionary.GENERAL_ERROR);
                            this.handleBackButton();
                        } else {
                            billers.forEach((biller, index) => {
                                biller.index = index;
                            });
                            this.setState({
                                billers
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

    handleSelectedBller = (biller) => {
        this.setState({
            biller,
            biller_value: biller.billerCode
        }, () => {
            setTimeout(() => {
                this.scrollRef.scrollToEnd({ animated: true })
            }, 50);
        });
    }

    handleSubmit = () => {
        let { biller } = this.state;
        this.props.updateBillPayment({ biller });

        this.props.navigation.navigate('BillsPackage');
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.BILL_PAYMENT} />
                <ScrollView {...this.props} hasButtomButtons={true} setScrollRef={this.setScrollRef}>
                    <SubHeader text={Dictionary.BILL_PROVIDER_SUB_HEADER} />
                    <ProgressBar progress={0.4} />
                    {this.state.processing && (
                        <View style={SharedStyle.loaderContainer}>
                            <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                        </View>
                    )}
                    {!this.state.processing && (
                        <View>
                            {this.state.billers.map((biller, index) => {
                                return <SelectListItem
                                    key={index}
                                    title={biller.name}
                                    onPress={() => this.handleSelectedBller(biller)}
                                    selected={this.state.biller?.index === biller.index}
                                />
                            })}
                        </View>
                    )}
                    {!!this.state.biller_value && (
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

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(BillsBiller));