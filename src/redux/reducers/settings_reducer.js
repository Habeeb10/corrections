import { BIOMETRIC_LOGIN, BIOMETRIC_TRANSACTION, APP_NOTIFICATIONS, APP_VERSION, APP_UPDATING , SET_DEEPLINK_PATH, CLEAR_DEEPLINK_PATH} from '../types/settings_types';

const initialState = {
    biometric_login: true,
    biometric_transaction: true,
    app_notifications: true,
    app_version: "",
    app_version_date: null,
    app_is_updating: false,
    deeplink_path: undefined,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case BIOMETRIC_LOGIN: {
            return {
                ...state,
                biometric_login: action.isEnabled
            }
        }
        case BIOMETRIC_TRANSACTION: {
            return {
                ...state,
                biometric_transaction: action.isEnabled
            }
        }
        case APP_NOTIFICATIONS: {
            return {
                ...state,
                app_notifications: action.isEnabled
            }
        }

        case APP_VERSION: {
            return {
                ...state,
                app_version: action.version.version_number,
                app_version_date: action.version.version_date,
            }
        }

        case APP_UPDATING: {
            return {
                ...state,
                app_is_updating: action.status,
            }
        }

        case SET_DEEPLINK_PATH: {
            return {
                ...state,
                deeplink_path: action.path,
            }
        }

        case CLEAR_DEEPLINK_PATH: {
            return {
                ...state,
                deeplink_path: undefined,
            }
        }
        default: {
            return state;
        }
    }
};