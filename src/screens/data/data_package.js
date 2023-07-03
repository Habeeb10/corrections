import React, { Component } from 'react';
import { BackHandler, View, ActivityIndicator } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { showToast } from '_actions/toast_actions';
import { updateDataPurchase } from '_actions/data_actions';

import { Dictionary } from '_utils';
import { Colors, SharedStyle, FormStyle } from '_styles';
import { SubHeader, ScrollView, ProgressBar } from '_atoms';
import { PrimaryButton, SelectListItem } from '_molecules';
import { MainHeader } from '_organisms';

import { Network } from '_services';

class DataPackage extends Component {
    constructor(props) {
        super(props);

        const { data_purchase } = this.props.data;
        let subheader = Dictionary.PACKAGE_TO_BUY_SUB_HEADER;
        subheader = subheader.replace("%s", data_purchase.network.title);

        this.state = {
            subheader,
            network: data_purchase.network,
            packages: [],
            data_package: null,
            package_name: '',
            processing: false
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        this.getDataPackages();
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

    getDataPackages = () => {
        this.setState({ processing: true }, () => {
            Network.getBillerItems(this.state.network.biller_code)
                .then((result) => {
                    this.setState({ processing: false }, () => {
                        let packages = result.billscategories.billers;
                        if (!packages || !Array.isArray(packages) || packages.length < 1) {
                            this.props.showToast(result.message || Dictionary.GENERAL_ERROR);
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

    handleSelectedPackage = (data_package) => {
        this.setState({
            data_package,
            package_name: data_package.biller_name
        }, () => {
            setTimeout(() => {
                this.scrollRef.scrollToEnd({ animated: true })
            }, 50);
        });
    }

    handleSubmit = () => {
        let { data_package } = this.state;
        this.props.updateDataPurchase({ data_package });

        this.props.navigation.navigate('DataSummary');
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.DATA} />
                <ScrollView {...this.props} hasButtomButtons={true} setScrollRef={this.setScrollRef}>
                    <SubHeader text={this.state.subheader} />
                    <ProgressBar progress={0.8} />
                    {this.state.processing && (
                        <View style={SharedStyle.loaderContainer}>
                            <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                        </View>
                    )}
                    {!this.state.processing && (
                        <View>
                            {this.state.packages.map((data_package, index) => {
                                return <SelectListItem
                                    key={index}
                                    title={data_package.billerName}
                                    onPress={() => this.handleSelectedPackage(data_package)}
                                    selected={this.state.data_package?.index === data_package.index}
                                />
                            })}
                        </View>
                    )}
                    {!!this.state.data_package && (
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
            </View >
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user,
        data: state.data
    };
};

const mapDispatchToProps = {
    showToast,
    updateDataPurchase
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(DataPackage));