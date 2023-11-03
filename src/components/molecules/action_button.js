import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import * as Icon from '@expo/vector-icons';

import { ButtonWithBackgroundBottom, ButtonWithBackgroundText } from '_atoms';
import { Colors, Mixins, Typography } from '_styles';

class ActionButton extends Component {
    render() {

        return (
            <ButtonWithBackgroundBottom
                disabled={this.props.loading || this.props.disabled}
                style={[styles.background, this.props.backgroundStyle]}
                onPress={() => this.props.onPress()}>
                {this.props.loading && (<ActivityIndicator style={styles.item} size="small" color={Colors.CV_YELLOW} />)}
                {!this.props.loading && (
                    <View style={[styles.content, this.props.contentStyle]}>
                        {this.props.icon && (
                            <View style={styles.item}>
                                <Icon.SimpleLineIcons
                                    size={Mixins.scaleSize(15)}
                                    style={[styles.icon, { color: this.props.color }]}
                                    name={this.props.icon} />
                            </View>
                        )}
                        <View style={styles.item}>
                            <ButtonWithBackgroundText style={[styles.text, { color: this.props.color }]}>
                                {this.props.title}
                            </ButtonWithBackgroundText>
                        </View>
                    </View>
                )}
            </ButtonWithBackgroundBottom>
        );
    }
}

const styles = StyleSheet.create({
    background: {
        ...Mixins.padding(0)
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    text: {
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(14)
    },
    icon: {
        marginRight: Mixins.scaleSize(10)
    }
});

export default ActionButton;
