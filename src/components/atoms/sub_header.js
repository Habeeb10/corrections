import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors, Mixins, Typography } from '_styles';

class SubHeader extends Component {

    render() {
        return (
            <View style={styles.background}>
                <Text style={styles.text}>{this.props.text}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    background: {
        ...Mixins.padding(16),
        backgroundColor: Colors.CV_BLUE
    },
    text: {
        ...Typography.FONT_BOLD,
        fontSize: Mixins.scaleFont(18),
        lineHeight: Mixins.scaleSize(23),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.HEADER_GREY
    }
});

export default SubHeader;
