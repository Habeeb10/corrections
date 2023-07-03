import { STATUS_BAR_STYLE, SHOW_EXIT_DIALOG, HIDE_EXIT_DIALOG } from '../types/util_types';
import { AppConstants } from '_utils';

const initialState = {
    statusBarStyle: AppConstants.BLUE_STATUS_BAR,
    showExitDialog: false
};

export default (state = initialState, action) => {
    switch (action.type) {
        case STATUS_BAR_STYLE: {
            return {
                ...state,
                statusBarStyle: action.style
            }
        }
        case SHOW_EXIT_DIALOG: {
            return {
                ...state,
                showExitDialog: true
            }
        }
        case HIDE_EXIT_DIALOG: {
            return {
                ...state,
                showExitDialog: false
            }
        }
        default: {
            return state;
        }
    }
};