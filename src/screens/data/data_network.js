import React, { Component } from 'react';
import { BackHandler, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';

import { updateDataPurchase } from '_actions/data_actions';

import { Dictionary } from '_utils';
import { SharedStyle, FormStyle } from '_styles';
import { SubHeader, ScrollView, ProgressBar } from '_atoms';
import { PrimaryButton, SelectListItem } from '_molecules';
import { MainHeader } from '_organisms';

class DataNetwork extends Component {
    constructor(props) {
        super(props);

        const data_billers = this.props.navigation.getParam('billers');
        let networks = [
            {
                title: '9mobile',
                value: '9mobile',
                image: require('../../assets/images/shared/9mobile.png')
            },
            {
                title: 'Airtel',
                value: 'airtel',
                image: require('../../assets/images/shared/airtel.png')
            },
            {
                title: 'Glo',
                value: 'glo',
                image: require('../../assets/images/shared/glo.png')
            },
            {
                title: 'MTN',
                value: 'mtn',
                image: require('../../assets/images/shared/mtn.png')
            }
        ];

        networks.forEach((network) => {
            let biller = data_billers.find(data_biller => network.value === data_biller.name.replace(/ .*/, '').toLowerCase());
            if (biller) {
                network.biller_code = biller.billerCode;
            }
        });
        networks = networks.filter((network) => network.biller_code);

        this.state = {
            networks,
            network: null,
            network_value: ''
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
            this.props.navigation.goBack();

            return true;
        }
    }

    handleSubmit = () => {
        let { network } = this.state;
        this.props.updateDataPurchase({ network });

        this.props.navigation.navigate('DataPackage');
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.DATA} />
                <ScrollView {...this.props} hasButtomButtons={true}>
                    <SubHeader text={Dictionary.NETWORK_TO_BUY_FOR_SUB_HEADER} />
                    <ProgressBar progress={0.5} />
                    {this.state.networks.map((network, index) => {
                        return <SelectListItem
                            key={index}
                            image={network.image}
                            title={network.title}
                            onPress={() => this.setState({ network, network_value: network.value })}
                            selected={this.state.network_value === network.value}
                        />
                    })}
                    {!!this.state.network_value && (
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
        user: state.user
    };
};

const mapDispatchToProps = {
    updateDataPurchase
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(DataNetwork));