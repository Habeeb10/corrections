import {
    START_LOAD_LOAN_PRODUCTS, LOAD_LOAN_PRODUCTS, LOAD_LOAN_PRODUCTS_FAILED,
    START_LOAD_SCORING_OPTIONS, LOAD_SCORING_OPTIONS, LOAD_SCORING_OPTIONS_FAILED,
    START_LOAD_LOAN_REASONS, LOAD_LOAN_REASONS, LOAD_LOAN_REASONS_FAILED,
    START_LOAD_USER_LOANS, LOAD_USER_LOANS, LOAD_USER_LOANS_FAILED
} from '../types/loan_types';

import { Network } from '_services';

export const getLoanProducts = () => {
    return dispatch => {
        dispatch({
            type: START_LOAD_LOAN_PRODUCTS
        });

        Network.getLoanProductOptions()
            .then((result) => {
                dispatch({
                    options: result.data,
                    type: LOAD_LOAN_PRODUCTS
                })
            })
            .catch((error) => {
                dispatch({
                    type: LOAD_LOAN_PRODUCTS_FAILED,
                    error_message: error.message
                });
            });
    };
};

export const getScoringOptions = () => {
    return dispatch => {
        dispatch({
            type: START_LOAD_SCORING_OPTIONS
        });

        Network.getLoanScoringOptions()
            .then((result) => {
                dispatch({
                    options: result.data,
                    type: LOAD_SCORING_OPTIONS
                })
            })
            .catch((error) => {
                dispatch({
                    type: LOAD_SCORING_OPTIONS_FAILED,
                    error_message: error.message
                });
            });
    };
};

export const getLoanReasons = () => {
    return dispatch => {
        dispatch({
            type: START_LOAD_LOAN_REASONS
        });

        Network.getLoanPurposes()
            .then((result) => {
                dispatch({
                    options: result.data,
                    type: LOAD_LOAN_REASONS
                })
            })
            .catch((error) => {
                dispatch({
                    type: LOAD_LOAN_REASONS_FAILED,
                    error_message: error.message
                });
            });
    };
};

export const getUserLoans = () => {
    return dispatch => {
        dispatch({
            type: START_LOAD_USER_LOANS
        });

        Network.getUserLoanData()
            .then((result) => {
                dispatch({
                    user_loans: result.data,
                    type: LOAD_USER_LOANS
                })
            })
            .catch((error) => {
                dispatch({
                    type: LOAD_USER_LOANS_FAILED,
                    error_message: error.message
                });
            });
    };
};