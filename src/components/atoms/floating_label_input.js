import React, { Component } from 'react';
import { View, TextInput, Animated } from 'react-native';
import { Colors, Mixins, Typography, FormStyle } from '_styles';

class FloatingLabelInput extends Component {
    state = {
        isFocused: false,
    };

    handleFocus = () => {
        this.setState({ isFocused: true })
        this.props.onFocus && this.props.onFocus()
    };
    handleBlur = () => {
        this.setState({ isFocused: false })
        this.props.onBlur && this.props.onBlur()
    };

    UNSAFE_componentWillMount() {
        this._animatedIsFocused = new Animated.Value(!this.props.value ? 0 : 1);
    }

    componentDidUpdate() {
        Animated.timing(this._animatedIsFocused, {
            toValue: (!!this.state.isFocused || !!this.props.value) ? 1 : 0,
            duration: 200,
            useNativeDriver: false
        }).start();
    }

    render() {
        const { label, isDropdown, createPin, transfer, enterMobile, ...props } = this.props;
        const labelStyle = {
            ...Typography.FONT_REGULAR,
            letterSpacing: Mixins.scaleSize(0.01),
            color: Colors.LIGHT_GREY,
            position: 'absolute',
            left: Mixins.scaleSize(8),
            top: this._animatedIsFocused.interpolate({
                inputRange: [0, 1],
                outputRange: [Mixins.scaleSize(18), Mixins.scaleSize(8)],
            }),
            lineHeight: this._animatedIsFocused.interpolate({
                inputRange: [0, 1],
                outputRange: [Mixins.scaleSize(19), Mixins.scaleSize(13)],
            }),
            fontSize: this._animatedIsFocused.interpolate({
                inputRange: [0, 1],
                outputRange: [Mixins.scaleFont(16), Mixins.scaleFont(11)],
            })
        };
        return (
            <View>
                <Animated.Text numberOfLines={1} style={[labelStyle, isDropdown ? { paddingRight: Mixins.scaleSize(40) } : {}]}>{label}</Animated.Text>
                <TextInput
                    {...props}
                    style={[FormStyle.inputBox, props.style]}
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                    blurOnSubmit
                    maxLength={createPin ? 4 : enterMobile ? 11 : 1000}
                    keyboardType={createPin ? "numeric" :  transfer ? "number-pad" : "default"}
                />
            </View>
        );
    }
}

export default FloatingLabelInput;
