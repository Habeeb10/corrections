import { StyleSheet } from 'react-native';

import * as Colors from './colors';
import * as Mixins from './mixins';
import * as Typography from './typography';

export default StyleSheet.create({
    formContainer: {
        ...Mixins.margin(40, 16, 0, 16)
    },
    formItem: {
        marginBottom: Mixins.scaleSize(16)
    },
    formError: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(11),
        color: Colors.ERROR,
        textAlign: 'right'
    },
    sectionLabel: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.LIGHT_GREY
    },
    formButtons: {
        ...Mixins.margin(10, 8, 70, 8),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    formButton: {
        flex: 1,
        marginHorizontal: Mixins.scaleSize(8)
    },
    inputLabel: {
        ...Mixins.margin(8, 16, 4, 16),
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.DARK_GREY
    },
    inputBox: {
        ...Typography.FONT_REGULAR,
        ...Mixins.padding(28, 8, 8, 8),
        marginBottom: Mixins.scaleSize(0),
        height: Mixins.scaleSize(60),
        fontSize: Mixins.scaleFont(16),
        color: Colors.DARK_GREY,
        borderWidth: Mixins.scaleSize(1),
        borderRadius: Mixins.scaleSize(4),
        borderColor: Colors.INPUT_BORDER
    },
    pinContainer: {
        alignSelf: 'center'
    },
    pinBox: {
        borderWidth: Mixins.scaleSize(1),
        borderRadius: Mixins.scaleSize(3),
        borderColor: Colors.INPUT_BORDER
    },
    activePinBox: {
        borderColor: Colors.LIGHT_GREY
    },
    pinMask: {
        width: Mixins.scaleSize(10),
        height: Mixins.scaleSize(10),
        borderRadius: Mixins.scaleSize(25),
        backgroundColor: Colors.DARK_GREY
    },
    switchContainer: {
        width: Mixins.scaleSize(40),
        height: Mixins.scaleSize(20),
        borderRadius: Mixins.scaleSize(50),
        padding: Mixins.scaleSize(4)
    },
    switchCircle: {
        width: Mixins.scaleSize(12),
        height: Mixins.scaleSize(12),
        borderRadius: Mixins.scaleSize(10),
        /// elevation: 2,
        borderWidth: Mixins.scaleSize(2),
        borderColor: Colors.FAINT_BORDER
    }
});
