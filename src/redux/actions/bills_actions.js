import {
    UPDATE_BILL_PAYMENT, RESET_BILL_PAYMENT,
    START_LOAD_BILLER_CATEGORIES, LOAD_BILLER_CATEGORIES, LOAD_BILLER_CATEGORIES_FAILED
} from '../types/bills_types';

import { Network } from '_services';

export const updateBillPayment = (bill_payment) => {
    return dispatch => {
        dispatch({
            type: UPDATE_BILL_PAYMENT,
            bill_payment
        });
    };
}

export const resetBillPayment = () => {
    return dispatch => {
        dispatch({
            type: RESET_BILL_PAYMENT
        });
    };
}

export const getBillerCategories = () => {
    return dispatch => {
        dispatch({
            type: START_LOAD_BILLER_CATEGORIES
        });
        Network.getBillerCategoryData()
            .then((result) => {
                dispatch({
                    categories: result.billscategories.billers,
                    type: LOAD_BILLER_CATEGORIES
                })
            }).catch((error) => {
                dispatch({
                    type: LOAD_BILLER_CATEGORIES_FAILED,
                    error_message: error.message
                });
            });
    };
};