import { SHOW_TOAST, SHOW_TOAST_NAV, HIDE_TOAST } from '../types/toast_types';

const initialState = {
    show: false,
    message: '',
    isError: true,
    timeout: null,
    action: null,
    actionText: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case SHOW_TOAST: {
            if (state.timeout) {
                clearTimeout(state.timeout);
            }

            return {
                ...state,
                show: true,
                message: action.message,
                isError: action.isError,
                timeout: action.timeout,
                action: null,
                actionText: null
            }
        }
        case SHOW_TOAST_NAV: {
            return {
                ...state,
                show: true,
                message: action.message,
                isError: action.isError,
                timeout: action.timeout,
                action: action.navOptions.action,
                actionText: action.navOptions.actionText
            }
        }
        case HIDE_TOAST: {
            if (state.timeout) {
                clearTimeout(state.timeout);
            }

            return {
                ...state,
                show: false,
                message: '',
                isError: true,
                timeout: null,
                action: null,
                actionText: null
            }
        }
        default: {
            return state;
        }
    }
};