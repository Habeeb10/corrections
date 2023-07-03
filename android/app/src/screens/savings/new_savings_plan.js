import React, { Component } from 'react';
import { BackHandler, View } from 'react-native';
import { withNavigationFocus } from "react-navigation";

import { Dictionary } from '_utils';
import { SharedStyle } from '_styles';
import { SubHeader, ScrollView } from '_atoms';
import { MainHeader, NewSavings } from '_organisms';

class NewSavingsPlan extends Component {
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

    handleAddSavingsPlan = () => {
        this.props.navigation.navigate('SavingsAmount');
    }

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader
                    leftIcon="arrow-left"
                    onPressLeftIcon={this.handleBackButton}
                    title={Dictionary.NEW_SAVINGS} />
                <ScrollView {...this.props}>
                    <SubHeader text={Dictionary.CHOOSE_SAVINGS_PLAN} />
                    <NewSavings onSelectOffer={this.handleAddSavingsPlan} />
                </ScrollView>
            </View>
        );
    }
}

export default withNavigationFocus(NewSavingsPlan);