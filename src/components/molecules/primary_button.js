import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import * as Icon from '@expo/vector-icons';

import { ButtonWithBackgroundBottom, ButtonWithBackgroundText } from '_atoms';
import { Colors, Mixins } from '_styles';

class PrimaryButton extends Component {
    render() {

        return (
            <ButtonWithBackgroundBottom disabled={this.props.loading || this.props.disabled} style={[styles.background, this.props.backgroundStyle]} onPress={() => this.props.onPress()}>
                {this.props.loading && (<ActivityIndicator style={styles.item} size="small" color={Colors.WHITE} />)}
                {!this.props.loading && (
                    <View style={[styles.content,this.props.centerText?{justifyContent:"center"}:{}]}>
                        {this.props.hasLeftIcon && <Icon.FontAwesome size={Mixins.scaleSize(15)} style={[styles.icon, {
                            marginRight: 5
                        }]} name={this.props.leftIcon} />}
                        <View style={!this.props.centerText?styles.item:{}}>
                            <ButtonWithBackgroundText style={styles.text}>
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
        backgroundColor: Colors.CV_YELLOW
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
        color: Colors.WHITE,
        width: '180%',
    },
    icon: {
        color: Colors.WHITE,
        textAlign: 'right'
    }
});

export default PrimaryButton;
