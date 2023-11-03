import { STATUS_BAR_STYLE, SHOW_EXIT_DIALOG, HIDE_EXIT_DIALOG } from '../types/util_types';
import { AppConstants } from '_utils';

export const setStatusBarStyle = (style) => {
    return dispatch => {
        dispatch({
            type: STATUS_BAR_STYLE,
            style
        });
    };
};

export const resetStatusBarStyle = () => {
    return dispatch => {
        dispatch({
            type: STATUS_BAR_STYLE,
            style: AppConstants.BLUE_STATUS_BAR
        });
    };
};

export const showExitDialog = () => {
    return dispatch => {
        dispatch({
            type: SHOW_EXIT_DIALOG
        });
    };
};

export const hideExitDialog = () => {
    return dispatch => {
        dispatch({
            type: HIDE_EXIT_DIALOG
        });
    };
};