import {
    UPDATE_AIRTIME_PURCHASE, RESET_AIRTIME_PURCHASE
} from '../types/airtime_types';

const initialState = {
    airtime_purchase: {}
};

export default (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_AIRTIME_PURCHASE: {
            let airtime_purchase = { ...state.airtime_purchase, ...action.airtime_purchase }
            return {
                ...state,
                airtime_purchase
            }
        }
        case RESET_AIRTIME_PURCHASE: {
            return {
                ...state,
                airtime_purchase: {}
            }
        }
        default: {
            return state;
        }
    }
};