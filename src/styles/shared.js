import { StyleSheet, Platform } from 'react-native';

import * as Colors from './colors';
import * as Mixins from './mixins';
import * as Typography from './typography';

export default StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.WHITE
    },
    loaderContainer: {
        flex: 1,
        backgroundColor: Colors.WHITE,
        alignItems: 'center',
        justifyContent: 'center'
    },
    bottomPanel: {
        ...Mixins.padding(8),
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingBottom: Platform.OS === 'ios' ? Mixins.scaleSize(20) : Mixins.scaleSize(12)
    },
    normalText: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01)
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0
    },
    modalContent: {
        ...Mixins.padding(0, 16, 16, 16),
        alignItems: 'center'
    },
    modalSlider: {
        width: Mixins.scaleSize(50),
        height: Mixins.scaleSize(5),
        marginBottom: Mixins.scaleSize(12),
        backgroundColor: Colors.WHITE,
        borderRadius: Mixins.scaleSize(80),
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalPanel: {
        backgroundColor: Colors.WHITE,
        flex: 1,
        width: '100%',
        borderRadius: Mixins.scaleSize(8)
    },
    modalPanelCenter: {
        // justifyContent:"center",
        // alignItems:"center",
        //  paddingVertical:20,
         backgroundColor: Colors.WHITE,
        flex: 1,
        width: '100%',
        borderRadius: Mixins.scaleSize(8)
    },
    modalTop: {
        ...Mixins.padding(24, 16, 24, 16),
        ...Typography.FONT_BOLD,
        fontSize: Mixins.scaleFont(16),
        lineHeight: Mixins.scaleSize(19),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.DARK_GREY,
        borderBottomColor: Colors.FAINT_BORDER,
        borderBottomWidth: Mixins.scaleSize(1)
    },

    modalTopCenter: {
        ...Mixins.padding(24, 16, 24, 16),
        ...Typography.FONT_BOLD,
        fontSize: Mixins.scaleFont(16),
        lineHeight: Mixins.scaleSize(19),
        letterSpacing: Mixins.scaleSize(0.01),
        textAlign:"center",
        color: Colors.CV_BLUE,
        
    },
    modalTitleImage:{
        alignSelf:"center",
        width: Mixins.scaleSize(100),
        height: Mixins.scaleSize(100)
    },
    modalMiddle: {
        ...Mixins.padding(32, 16, 32, 16),
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    modalBottom: {
        marginHorizontal: Mixins.scaleSize(16),
        borderTopColor: Colors.FAINT_BORDER,
        borderTopWidth: Mixins.scaleSize(1)
    },
    modalUpgradeBottom: {
        marginHorizontal: Mixins.scaleSize(16),
        // paddingHorizontal:Mixins.scaleSize(16)
        marginBottom:Mixins.scaleSize(40),
        
    
    },
    pinLabel: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.LIGHT_GREY,
        marginBottom: Mixins.scaleSize(20)
    },
    pinError: {
        ...Typography.FONT_REGULAR,
        fontSize: Mixins.scaleFont(11),
        color: Colors.ERROR,
        position: 'absolute',
        top: Mixins.scaleSize(5),
        width: '100%',
        textAlign: 'center',
        paddingLeft: Mixins.scaleSize(16)
    },
    biometricText: {
        justifyContent: 'space-between'
    },
    biometricMainText: {
        ...Typography.FONT_MEDIUM,
        color: Colors.WHITE_GRAY,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01)
    },
    biometricSubText: {
        ...Typography.FONT_REGULAR,
        color: Colors.LIGHT_GREY,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01)
    },
    biometricIcon: {
        width: Mixins.scaleSize(60),
        height: Mixins.scaleSize(60),
        backgroundColor: Colors.CV_YELLOW_LIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Mixins.scaleSize(60)
    },
    biometricIconImage: {
        width: Mixins.scaleSize(27.6),
        height: Mixins.scaleSize(36)
    },
    authModalContent: {
        height: Mixins.scaleSize(280)
    },
    upgradeModalContent: {
        
       
        height: Mixins.scaleSize(350)
    },
    sectionLabel: {
        ...Typography.FONT_REGULAR,
        color: Colors.LIGHT_GREY,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01)
    },
    section: {
        ...Mixins.padding(20, 16, 0, 16),
        marginBottom: Mixins.scaleSize(32),
        borderColor: Colors.INPUT_BORDER,
        borderWidth: Mixins.scaleSize(1),
        borderRadius: Mixins.scaleSize(10),
        shadowOffset: { width: 0, height: 0 },
        shadowColor: Colors.SHADOW,
        shadowOpacity: 0.02
    },
    shadow: {
        shadowOffset: { width: 0, height: 0 },
        shadowColor: Colors.SHADOW,
        shadowOpacity: 0.05
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Mixins.scaleSize(20)
    },
    fullColumn: {
        width: '100%'
    },
    halfColumn: {
        width: '50%'
    },
    triColumn: {
        width: '33%'
    },
    label: {
        color: Colors.LIGHT_GREY,
        marginBottom: Mixins.scaleSize(5)
    },
    value: {
        color: Colors.DARK_GREY,
        textTransform: 'capitalize'
    },
    right: {
        textAlign: 'right'
    },
    sectionButton: {
        marginHorizontal: Mixins.scaleSize(-16),
        paddingVertical: Mixins.scaleSize(16),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopColor: Colors.FAINT_BORDER,
        borderTopWidth: Mixins.scaleSize(1)
    },
    sectionButtonIcon: {
        color: Colors.CV_YELLOW,
        marginRight: Mixins.scaleSize(10)
    },
    sectionButtonText: {
        ...Typography.FONT_MEDIUM,
        fontSize: Mixins.scaleFont(14),
        lineHeight: Mixins.scaleSize(16),
        letterSpacing: Mixins.scaleSize(0.01),
        color: Colors.CV_YELLOW
    },
    balanceLabel: {
        ...Typography.FONT_REGULAR,
        color: Colors.LIGHT_GREY,
        fontSize: Mixins.scaleFont(12),
        lineHeight: Mixins.scaleSize(14),
        letterSpacing: Mixins.scaleSize(0.01),
        textAlign: 'left'
    },
    balanceValue: {
        ...Typography.FONT_BOLD,
        color: Colors.CV_YELLOW,
    },
    upgradeImage: {
        width: 217,
        height: 217
    }
});
