import React, { Component } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View, Text } from 'react-native';
import { withNavigationFocus } from "react-navigation";
import { connect } from 'react-redux';
import remoteConfig from '@react-native-firebase/remote-config';

import { getLoanProducts } from '_actions/loan_actions';

import { env, Dictionary } from '_utils';
import { SharedStyle, Mixins, Colors, FormStyle } from '_styles';
import { SubHeader, ScrollView, ProgressBar } from '_atoms';
import { PrimaryButton, SelectListItem } from '_molecules';
import { MainHeader } from '_organisms';

class LoanRequirements extends Component {
    constructor(props) {
        super(props);

        const no_loan = remoteConfig().getValue(`no_loan_msg_${env().target}`).asString();

        this.state = {
            no_loan,
            requirements: [
                {
                    title: Dictionary.PERSONAL_INFO_TITLE,
                    description: Dictionary.PERSONAL_INFO_DESCRIPTION,
                    image: require('../../assets/images/loans/personal_requirement_icon.png')
                },
                {
                    title: Dictionary.EMPLOYMENT_INFO_TITLE,
                    description: Dictionary.EMPLOYMENT_INFO_DESCRIPTION,
                    image: require('../../assets/images/loans/employment_requirement_icon.png')
                },
                {
                    title: Dictionary.DEBIT_CARD_INFO_TITLE,
                    description: Dictionary.DEBIT_CARD_INFO_DESCRIPTION,
                    image: require('../../assets/images/loans/debit_requirement_icon.png')
                },
                {
                    title: Dictionary.GUARANTOR_INFO_TITLE,
                    description: Dictionary.GUARANTOR_INFO_DESCRIPTION,
                    image: require('../../assets/images/loans/guarantor_requirement_icon.png')
                }
            ]
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        if (this.props.loan_products.length < 1) {
            this.props.getLoanProducts();
        }
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

    render() {
        const { loading, loan_products } = this.props;
        let tenor_presets = [];
        if (loan_products?.length > 0) {
            tenor_presets = loan_products.forEach(product => {
                product.tenors.forEach(tenor => {
                    tenor_presets.push(tenor);
                });
            });
        }

        return (
            <View style={SharedStyle.mainContainer}>
                <MainHeader leftIcon="arrow-left" onPressLeftIcon={this.handleBackButton} title={Dictionary.LOAN_APPLICATION} />
                {loading && (
                    <View style={SharedStyle.loaderContainer}>
                        <ActivityIndicator size="large" color={Colors.CV_YELLOW} />
                    </View>
                )}
                {!loading && tenor_presets?.length === 0 && (
                    <View style={SharedStyle.loaderContainer}>
                        <Text style={styles.noLoans}>{this.state.no_loan || Dictionary.NO_LOAN_PRODUCTS}</Text>
                    </View>
                )}
                {!loading && tenor_presets.length > 0 && (
                    <ScrollView {...this.props}>
                        <SubHeader text={Dictionary.LOAN_REQUIREMENTS_HEADER} />
                        <ProgressBar progress={0.1} />
                        <View style={styles.content}>
                            {this.state.requirements.map((requirement, index) => {
                                return <SelectListItem
                                    key={index}
                                    image={requirement.image}
                                    title={requirement.title}
                                    description={requirement.description}
                                />
                            })}
                        </View>
                        <View style={SharedStyle.bottomPanel}>
                            <View style={FormStyle.formButton}>
                                <PrimaryButton
                                    title={Dictionary.CONTINUE_BTN}
                                    icon="arrow-right"
                                    onPress={() => this.props.navigation.navigate('LoanAmount')} />
                            </View>
                        </View>
                    </ScrollView>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingBottom: Mixins.scaleSize(50)
    },
    noLoans: {
        ...SharedStyle.normalText,
        ...Mixins.padding(0, 16),
        textAlign: 'center'

    }
});

const mapStateToProps = (state) => {
    return {
        loading: state.loans.loading_loan_products,
        loan_products: state.loans.loan_products
    };
};

const mapDispatchToProps = {
    getLoanProducts
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(LoanRequirements));