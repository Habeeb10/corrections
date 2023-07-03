import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import * as Icon from '@expo/vector-icons';

import { Colors, Mixins, Typography } from '_styles';

class Criteria extends Component {

    render() {
        return (
            <View>
                {this.props.violated && (
                    <View style={styles.container}>
                        <View style={[styles.blank, styles.icon]}></View>
                        <Text style={[styles.text, styles.strike]}>{this.props.text}</Text>
                    </View>
                )}
                {!this.props.violated && (
                    <View style={styles.container}>
                        <Icon.Ionicons style={styles.icon} name={'ios-checkmark-circle'} size={Mixins.scaleFont(15)} color={Colors.SUCCESS} />
                        <Text style={styles.text}>{this.props.text}</Text>
                    </View>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Mixins.scaleSize(10)
    },
    icon: {
        marginRight: Mixins.scaleSize(10)
    },
    blank: {
        width: Mixins.scaleSize(13),
        height: Mixins.scaleSize(13),
        backgroundColor: Colors.UNCHECKED_BG,
        borderRadius: Mixins.scaleSize(50)
    },
    text: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.LIGHT_GREY
    },
    strike: {
        textDecorationLine: 'line-through'
    }
});

export default Criteria;
