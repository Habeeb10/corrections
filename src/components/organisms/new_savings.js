import React, { Component } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { connect } from 'react-redux';
import * as Icon from '@expo/vector-icons';

import { showToast } from '_actions/toast_actions';
import { resetSavingsApplicationData, updateSavingsApplicationData } from '_actions/savings_actions';

import { Dictionary, Util } from '_utils';
import { Colors, Mixins, SharedStyle, Typography } from '_styles';
import { TouchItem } from '_atoms';
import { PrimaryButton, LockSavingsWarning } from '_molecules';

class NewSavings extends Component {
    /**
     * Understanding at development time is that Creditville only has two savings product... Regular and Savings
     * Hence the app is prepped for those two types. If that changes, then there's a need to update the product_images
     * And how the product_type is determined in render()
     */
    state = {
        savings_product: null,
        preferred_offer: null,
        expanded_product_id: null,
        lock_warning_visible: false,
        product_images: {
            regular: require('../../assets/images/savings/regular.png'),
            fixed: require('../../assets/images/savings/fixed.png')
        }
    }

    componentDidMount = () => {
        this.props.resetSavingsApplicationData();
    }

    showLockWarning = () => {
        this.setState({
            lock_warning_visible: true
        });
    }

    hideLockWarning = () => {
        this.setState({
            lock_warning_visible: false
        });
    }

    handleAddSavingsPlan = (savings_product, preferred_offer) => {
        this.setState({
            savings_product,
            preferred_offer
        }, () => {
            if (savings_product.lock_on_create) {
                this.showLockWarning();
            } else {
                this.confirmSelectedSavingsPlan();
            }
        });
    }

    confirmSelectedSavingsPlan = () => {
        const { savings_product, preferred_offer } = this.state;
        this.props.updateSavingsApplicationData({ savings_product, preferred_offer });

        this.hideLockWarning();
        this.props.onSelectOffer();
    }

    expandProduct = (product_id) => {
        this.setState({
            expanded_product_id: product_id
        });
    }

    render() {
        const { expanded_product_id } = this.state;
        let { savings_products } = this.props.savings;

        savings_products.forEach(product => {
            product.product_type = product.is_fixed ? 'fixed' : 'regular';
            product.product_offers = product.offers || [];
        });

        return (
            <View style={styles.products}>
                {savings_products.map((product, index) => {
                    return <>
                        <View key={index} style={[styles.product, styles[`${product.product_type}Option`]]}>
                            <View style={styles.productDetails}>
                                <View style={styles.productText}>
                                    <View style={{ flexDirection: 'row' }}>
                                        {!!product.lock_on_create && (
                                            <Icon.Fontisto
                                                name={'locked'}
                                                size={Mixins.scaleFont(20)}
                                                style={[{ marginRight: Mixins.scaleSize(10) }, styles[product.product_type]]} />
                                        )}
                                        <Text style={[styles.productTextHeader, styles[`${product.product_type}`]]} /* numberOfLines={1} */>
                                            {product.name.trim()}
                                        </Text>
                                    </View>
                                    <Text style={[styles.productTextDescription, styles[`${product.product_type}`]]} /* numberOfLines={3} */>
                                        {product.description.trim()}
                                    </Text>
                                </View>
                                <Image
                                    style={styles.productIcon}
                                    source={this.state.product_images[product.product_type]}
                                />
                            </View>
                            {product.product_offers?.length === 1 && product.product_offers.map((offer, index) => {
                                return <TouchItem
                                    key={index}
                                    onPress={() => this.handleAddSavingsPlan(product, offer)}
                                    style={[styles.offers, index === product.product_offers.length - 1 ? { marginBottom: Mixins.scaleSize(0) } : {}]}>
                                    <View style={SharedStyle.row}>
                                        <View style={SharedStyle.halfColumn}>
                                            <Text numberOfLines={1} style={styles.label}>{Dictionary.MINIMUM_AMOUNT}</Text>
                                            <Text numberOfLines={1} style={styles.value}>₦{Util.formatAmount(offer.minimumAmount)}</Text>
                                        </View>
                                        <View style={SharedStyle.halfColumn}>
                                            <Text numberOfLines={1} style={[styles.label, SharedStyle.right]}>{Dictionary.TENOR}</Text>
                                            <Text numberOfLines={1} style={[styles.value, SharedStyle.right]}>
                                                {offer.tenordescription}
                                                {/* {`${offer.min_tenor} ${Dictionary.TO} ${offer.max_tenor} ${offer.tenor_period}`} */}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={SharedStyle.row}>
                                        <View style={SharedStyle.halfColumn}>
                                            <Text numberOfLines={1} style={styles.label}>{Dictionary.INTEREST_RATE}</Text>
                                            <Text numberOfLines={1} style={styles.value}>
                                                {`${offer.interestRate} ${Dictionary.PER} ${offer.interest_period ? offer.interest_period.endsWith('s') ? offer.interest_period.slice(0, -1) : offer.interest_period:"year"}`}
                                            </Text>
                                        </View>
                                        <View style={SharedStyle.halfColumn}>
                                            <View style={styles.action}>
                                                <Text style={styles.actionText} numberOfLines={1}>Take this offer</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchItem>
                            })}
                            {expanded_product_id === product.id && product.product_offers.map((offer, index) => {
                                return <TouchItem
                                    key={index}
                                    onPress={() => this.handleAddSavingsPlan(product, offer)}
                                    style={[styles.offers, index === product.product_offers.length - 1 ? { marginBottom: Mixins.scaleSize(0) } : {}]}>
                                    <View style={SharedStyle.row}>
                                        <View style={SharedStyle.halfColumn}>
                                            <Text numberOfLines={1} style={styles.label}>{Dictionary.MINIMUM_AMOUNT}</Text>
                                            <Text numberOfLines={1} style={styles.value}>₦{Util.formatAmount(offer.minimumAmount)}</Text>
                                        </View>
                                        <View style={SharedStyle.halfColumn}>
                                            <Text numberOfLines={1} style={[styles.label, SharedStyle.right]}>{Dictionary.TENOR}</Text>
                                            <Text numberOfLines={1} style={[styles.value, SharedStyle.right]}>
                                                
                                                {`${offer.tenorStart} ${Dictionary.TO} ${offer.tenorEnd} ${offer.tenorPeriod}`}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={SharedStyle.row}>
                                        <View style={SharedStyle.halfColumn}>
                                            <Text numberOfLines={1} style={styles.label}>{Dictionary.INTEREST_RATE}</Text>
                                            <Text numberOfLines={1} style={styles.value}>
                                                {`${offer.interestRate} ${Dictionary.PER} ${offer.interest_period? offer.interest_period.endsWith('s') ? offer.interest_period.slice(0, -1) : offer.interest_period:"year"}`}
                                            </Text>
                                        </View>
                                        <View style={SharedStyle.halfColumn}>
                                            <View style={styles.action}>
                                                <Text style={styles.actionText} numberOfLines={1}>Take this offer</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchItem>
                            })}
                        </View>
                        {product.product_offers?.length > 1 && expanded_product_id !== product.id && (
                            <View style={styles.moreButton}>
                                <PrimaryButton
                                    title={Dictionary.SEE_MORE_BTN}
                                    icon="arrow-right"
                                    onPress={() => this.expandProduct(product.id)}
                                    backgroundStyle={styles[`${product.product_type}MoreButton`]} />
                            </View>
                        )}
                    </>
                })}
                {this.state.lock_warning_visible && (
                    <LockSavingsWarning
                        isVisible={this.state.lock_warning_visible}
                        onAgree={this.confirmSelectedSavingsPlan}
                        onDisagree={this.hideLockWarning}
                    />
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    products: {
        ...Mixins.margin(30, 16, 0, 16),
        flex: 1,
    },
    moreButton: {
        marginBottom: Mixins.scaleSize(30)
    },
    regularMoreButton: {
        backgroundColor: Colors.CV_YELLOW
    },
    fixedMoreButton: {
        backgroundColor: Colors.CV_GREEN
    },
    halalMoreButton: {
        backgroundColor: Colors.LIGHT_PURPLE
    },
    product: {
        borderRadius: Mixins.scaleSize(10),
        marginBottom: Mixins.scaleSize(20)
    },
    productDetails: {
        ...Mixins.padding(28, 16, 28, 16),
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    productText: {
        width: '85%'
    },
    productTextHeader: {
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(20),
        lineHeight: Mixins.scaleSize(23),
        letterSpacing: Mixins.scaleSize(0.01),
        marginBottom: Mixins.scaleSize(8)
    },
    productTextDescription: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01)
    },
    productIcon: {
        width: Mixins.scaleSize(40),
        height: Mixins.scaleSize(40),
        resizeMode: 'contain'
    },
    regularOption: {
        backgroundColor: Colors.LIGHTER_ORANGE_BG
    },
    regular: {
        color: Colors.CV_YELLOW
    },
    halalOption: {
        backgroundColor: Colors.LIGHTER_PURPLE_BG
    },
    halal: {
        color: Colors.LIGHT_PURPLE
    },
    fixedOption: {
        backgroundColor: Colors.LIGHTER_GREEN_BG
    },
    fixed: {
        color: Colors.CV_GREEN
    },
    offers: {
        ...SharedStyle.section,
        backgroundColor: Colors.WHITE
    },
    label: {
        ...SharedStyle.normalText,
        ...SharedStyle.label
    },
    value: {
        ...SharedStyle.normalText,
        ...SharedStyle.value,
        textTransform: 'lowercase'
    },
    action: {
        ...Mixins.padding(4, 14, 4, 14),
        alignSelf: 'flex-end',
        backgroundColor: Colors.LIGHTER_GREEN_BG,
        borderRadius: Mixins.scaleSize(100)
    },
    actionText: {
        ...SharedStyle.normalText,
        color: Colors.CV_GREEN
    }
});

const mapStateToProps = (state) => {
    return {
        savings: state.savings
    };
};

const mapDispatchToProps = {
    showToast,
    resetSavingsApplicationData,
    updateSavingsApplicationData
};

export default connect(mapStateToProps, mapDispatchToProps)(NewSavings);