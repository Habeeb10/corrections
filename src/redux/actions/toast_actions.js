import { SHOW_TOAST, SHOW_TOAST_NAV, HIDE_TOAST } from '../types/toast_types';

export const showToast = (message, isError = true, timeout = 3000) => {
    return (dispatch) => {
        let timeoutRef = setTimeout(() => {
            dispatch(hideToast());
        }, timeout);

        dispatch({
            type: SHOW_TOAST,
            message,
            isError,
            timeout: timeoutRef
        });
    };
};

export const showToastNav = (message, navOptions = {}, isError = true, timeout = 7000) => {
    return (dispatch) => {
        let timeoutRef = setTimeout(() => {
            dispatch(hideToast());
        }, timeout);

        dispatch({
            type: SHOW_TOAST_NAV,
            message,
            navOptions,
            isError,
            timeout: timeoutRef
        });
    };
};

export function hideToast() {
    return dispatch => {
        dispatch({
            type: HIDE_TOAST
        });
    };
}