import { Dimensions, PixelRatio, Platform } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

export const WINDOW_WIDTH = Dimensions.get('window').width;
export const WINDOW_HEIGHT = Dimensions.get('window').height;

// Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 375;

export const scaleSize = size => (WINDOW_WIDTH / guidelineBaseWidth) * size;

export const scaleFont = size => size * PixelRatio.getFontScale();

function dimensions(top, right = top, bottom = top, left = right, property) {
    let styles = {};

    styles[`${property}Top`] = scaleSize(top);
    styles[`${property}Right`] = scaleSize(right);
    styles[`${property}Bottom`] = scaleSize(bottom);
    styles[`${property}Left`] = scaleSize(left);

    return styles;
}

export function margin(top, right, bottom, left) {
    return dimensions(top, right, bottom, left, 'margin');
}

export function padding(top, right, bottom, left) {
    return dimensions(top, right, bottom, left, 'padding');
}

export function boxShadow(color, offset = { height: 2, width: 2 },
    radius = 8, opacity = 0.2) {
    return {
        shadowColor: color,
        shadowOffset: offset,
        shadowOpacity: opacity,
        shadowRadius: radius,
        elevation: radius,
    };
}

export const STATUS_BAR_HEIGHT = Platform.select({
    ios: getStatusBarHeight(),
    android: getStatusBarHeight() > 24 ? 0 : getStatusBarHeight()
});

export const DRAW_HEIGHT = WINDOW_HEIGHT - STATUS_BAR_HEIGHT;

export const DRAW_HEIGHT_WITH_NAV = DRAW_HEIGHT - scaleSize(50);