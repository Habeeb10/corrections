import React, { Component } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { connect } from 'react-redux';
import Carousel from 'react-native-snap-carousel';

import { setTourDone } from '_actions/user_actions';
import { setStatusBarStyle, resetStatusBarStyle } from '_actions/util_actions';

import { Dictionary } from '_utils';
import { Colors, Mixins, Typography, SharedStyle } from '_styles';
import { ScrollView } from '_atoms';
import { PrimaryButton, SecondaryButton } from '_molecules';
import { AppConstants } from '_utils';

class ProductTour extends Component {
    state = {
        active_slide: 0
    }

    componentDidMount = () => {
        this.props.setStatusBarStyle(AppConstants.TRANSLUCENT_STATUS_BAR);
    }

    componentWillUnmount = () => {
        this.props.resetStatusBarStyle();
    }

    tourDone = (redirect) => {
        this.props.setTourDone();
        this.props.navigation.navigate(redirect);
    }

    renderItems = ({ item }) => {
        return (
            <View>
                <Image style={styles.image} source={item.image} />
                <View style={styles.text}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.text}</Text>
                </View>
            </View>
        )
    };

    render() {
        return (
            <View style={SharedStyle.mainContainer}>
                <ScrollView {...this.props} hasNavBar={false} hasButtomButtons={true} noStatusBar={true}>
                    <Carousel
                        ref={(c) => { this._carousel = c; }}
                        data={slides}
                        renderItem={this.renderItems}
                        sliderWidth={Mixins.WINDOW_WIDTH}
                        itemWidth={Mixins.WINDOW_WIDTH}
                        onSnapToItem={(index) => this.setState({ active_slide: index })}
                        inactiveSlideScale={1}
                    />
                    <View style={[SharedStyle.bottomPanel, styles.buttons]}>
                        <View style={styles.button}>
                            <SecondaryButton title={Dictionary.SIGN_IN_BTN} icon="login" onPress={() => this.tourDone('Login')} />
                        </View>
                        <View style={styles.button}>
                            <PrimaryButton title={Dictionary.GET_STARTED_BTN} icon="arrow-right" onPress={() => this.tourDone('EnterMobile')} />
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const slides = [
    {
        key: 0,
        title: Dictionary.TOUR_ONE_TITLE,
        text: Dictionary.TOUR_ONE_DESCRIPTION,
        image: require('../../assets/images/tour/tour_1.png')
    },
    {
        key: 1,
        title: Dictionary.TOUR_TWO_TITLE,
        text: Dictionary.TOUR_TWO_DESCRIPTION,
        image: require('../../assets/images/tour/tour_2.png')
    },
    {
        key: 0,
        title: Dictionary.TOUR_THREE_TITLE,
        text: Dictionary.TOUR_THREE_DESCRIPTION,
        image: require('../../assets/images/tour/tour_3.png')
    }
];

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: Mixins.scaleSize(447),
        borderBottomLeftRadius: Mixins.scaleSize(40),
        borderBottomRightRadius: Mixins.scaleSize(40)
    },
    text: {
        ...Mixins.margin(0, 16, 0, 16)
    },
    title: {
        ...Mixins.margin(32, 0, 20, 0),
        ...Typography.FONT_MEDIUM,
        color: Colors.DARK_GREY,
        fontSize: Mixins.scaleFont(24)
    },
    description: {
        ...Typography.FONT_REGULAR,
        color: Colors.LIGHT_GREY,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01)
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    button: {
        flex: 1,
        marginHorizontal: Mixins.scaleSize(8)
    }
});

const mapStateToProps = (state) => {
    return {
        user: state.user
    };
};

const mapDispatchToProps = {
    setTourDone,
    setStatusBarStyle,
    resetStatusBarStyle
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductTour);