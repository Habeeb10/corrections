import React, { Component } from 'react';
import { StyleSheet, Platform, Appearance, View, Text } from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

import { Colors, Mixins, Typography } from '_styles';
import { TouchItem } from '_atoms';

class _DateTimePicker extends Component {
    render() {
        if (this.props.show) {
            return (
                <View>
                    {Platform.OS === 'ios' && (
                        <View style={styles.buttonBar}>
                            <TouchItem
                                style={styles.button}
                                onPress={this.props.onClose}>
                                <Text style={styles.buttonText}>Done</Text>
                            </TouchItem>
                        </View>
                    )}
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={this.props.value ? moment(this.props.value, "DD/MM/YYYY").toDate() : this.props.defaultValue ? this.props.defaultValue : new Date()}
                        minimumDate={this.props.minimumDate}
                        maximumDate={this.props.maximumDate}
                        onChange={(event, date) => this.props.onChange(event, date)}
                        style={Platform.OS === 'ios' && Appearance.getColorScheme() === 'dark' ? { backgroundColor: Colors.BLACK } : {}}
                    />
                </View>
            );
        } else {
            return null;
        }
    }
}

const styles = StyleSheet.create({
    buttonBar: {
        backgroundColor: Appearance.getColorScheme() === 'dark' ? Colors.BLACK : Colors.LIGHT_BG,
        padding: Mixins.scaleSize(10)
    },
    button: {
        alignSelf: 'flex-end'
    },
    buttonText: {
        ...Typography.FONT_MEDIUM,
        color: Appearance.getColorScheme() === 'dark' ? Colors.WHITE : Colors.LIGHT_BLUE,
        fontSize: Mixins.scaleFont(16),
        lineHeight: Mixins.scaleSize(18),
        letterSpacing: Mixins.scaleSize(0.01)
    },
    optionText: {
        color: Colors.DARK_GREY
    },
    checkbox: {
        width: '10%'
    },
    blank: {
        width: Mixins.scaleSize(20),
        height: Mixins.scaleSize(20),
        backgroundColor: Colors.LIGHT_UNCHECKED_BG,
        borderRadius: Mixins.scaleSize(50)
    },
    modalBottom: {
        borderTopWidth: Mixins.scaleSize(0),
        marginBottom: Mixins.scaleSize(16)
    }
});

export default _DateTimePicker;
