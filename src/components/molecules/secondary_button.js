import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import * as Icon from '@expo/vector-icons';

import { ButtonWithBackgroundBottom, ButtonWithBackgroundText } from '_atoms';
import { Colors, Mixins } from '_styles';

class SecondaryButton extends Component {
    render() {

        return (
            <ButtonWithBackgroundBottom disabled={this.props.loading || this.props.disabled} style={[styles.background]} onPress={() => this.props.onPress()}>
                {this.props.loading && (<ActivityIndicator style={styles.item} size="small" color={Colors.CV_YELLOW} />)}
                {!this.props.loading && (
                    <View style={styles.content}>
                        <View style={styles.item}>
                            <ButtonWithBackgroundText style={[styles.text, 
                                {width: !this.props.icon && this.props.center ? "100%" : "180%", textAlign: !this.props.icon && this.props.center ? "center" : "auto"}
                            ]}>
                                {this.props.title}
                            </ButtonWithBackgroundText>
                        </View>
                        {this.props.icon && (
                            <View style={styles.item}>
                                <Icon.SimpleLineIcons size={Mixins.scaleSize(15)} style={styles.icon} name={this.props.icon} />
                            </View>
                        )}
                    </View>
                )}
            </ButtonWithBackgroundBottom>
        );
    }
}

const styles = StyleSheet.create({
    background: {
        borderColor: Colors.CV_YELLOW,
        borderWidth: Mixins.scaleSize(1)
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    item: {
        flex: 1
    },
    text: {
        color: Colors.CV_YELLOW,
        width: '180%'
    },
    icon: {
        color: Colors.CV_YELLOW,
        textAlign: 'right'
    }
});

export default SecondaryButton;
