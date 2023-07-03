import {
    UPDATE_DATA_PURCHASE, RESET_DATA_PURCHASE
} from '../types/data_types';

export const updateDataPurchase = (data_purchase) => {
    return dispatch => {
        dispatch({
            type: UPDATE_DATA_PURCHASE,
            data_purchase
        });
    };
}

export const resetDataPurchase = () => {
    return dispatch => {
        dispatch({
            type: RESET_DATA_PURCHASE
        });
    };
}