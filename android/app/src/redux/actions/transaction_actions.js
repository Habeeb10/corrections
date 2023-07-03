import { START_LOAD_FEE_TYPES, LOAD_FEE_TYPES, LOAD_FEE_TYPES_FAILED } from '../types/transaction_types';

import { Network } from '_services';

export const getTransactionFeeTypes = () => {
    return dispatch => {
        dispatch({
            type: START_LOAD_FEE_TYPES
        });

        Network.getTransactionFeeTypesData()
            .then((result) => {
                dispatch({
                    fee_types: result.data,
                    type: LOAD_FEE_TYPES
                })
            })
            .catch((error) => {
                dispatch({
                    type: LOAD_FEE_TYPES_FAILED,
                    error_message: error.message
                });
            });
    };
};