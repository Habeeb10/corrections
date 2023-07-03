import { BIOMETRIC_LOGIN, BIOMETRIC_TRANSACTION, APP_NOTIFICATIONS, APP_VERSION, APP_UPDATING, SET_DEEPLINK_PATH, CLEAR_DEEPLINK_PATH } from '../types/settings_types';

export const setBiometricLogin = (isEnabled) => {
    return dispatch => {
        dispatch({
            type: BIOMETRIC_LOGIN,
            isEnabled
        });
    };
};

export const setBiometricTransaction = (isEnabled) => {
    return dispatch => {
        dispatch({
            type: BIOMETRIC_TRANSACTION,
            isEnabled
        });
    };
};

export const setAppNotifications = (isEnabled) => {
    return dispatch => {
        dispatch({
            type: APP_NOTIFICATIONS,
            isEnabled
        });
    };
};

export const setAppVersion = (version) => {
    return dispatch => {
        dispatch({
            type: APP_VERSION,
            version
        });
    };
};

export const updatingApp = (status) => {
    return dispatch => {
        dispatch({
            type: APP_UPDATING,
            status
        });
    };
};

export const setDeepLinkPath = (path) => {
    return dispatch => {
        dispatch({
            type: SET_DEEPLINK_PATH,
            path
        });
    };
};
export const clearDeepLinkPath = () => {
    return dispatch => {
        dispatch({
            type: CLEAR_DEEPLINK_PATH,
        });
    };
};
