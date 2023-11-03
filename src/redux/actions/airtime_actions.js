import {
    UPDATE_AIRTIME_PURCHASE, RESET_AIRTIME_PURCHASE
} from '../types/airtime_types';

export const updateAirtimePurchase = (airtime_purchase) => {
    return dispatch => {
        dispatch({
            type: UPDATE_AIRTIME_PURCHASE,
            airtime_purchase
        });
    };
}

export const resetAirtimePurchase = () => {
    return dispatch => {
        dispatch({
            type: RESET_AIRTIME_PURCHASE
        });
    };
}