import {
    UPDATE_FUNDS_TRANSFER, RESET_FUNDS_TRANSFER,
    START_LOAD_BENEFICIARIES, LOAD_BENEFICIARIES, LOAD_BENEFICIARIES_FAILED,
    UPDATE_RECENT_TRANSFERS,
    UPDATE_ACCOUNT_TYPE
} from '../types/transfer_types';

import { Network } from '_services';

export const updateFundsTransfer = (funds_transfer) => {
    return dispatch => {
        dispatch({
            type: UPDATE_FUNDS_TRANSFER,
            funds_transfer
        });
    };
}

export const resetFundsTransfer = () => {
    return dispatch => {
        dispatch({
            type: RESET_FUNDS_TRANSFER
        });
    };
}

export const getCustomerBeneficiaries = (clientId, isIntra) => {
    return dispatch => {
        dispatch({
            type: START_LOAD_BENEFICIARIES
        });
        Network.getCustomerBeneficiaryData(clientId, isIntra)
            .then((result) => {
                dispatch({
                    beneficiaries: result.beneficiaries,
                    type: LOAD_BENEFICIARIES
                })
            }).catch((error) => {
                dispatch({
                    type: LOAD_BENEFICIARIES_FAILED,
                    error_message: error.message
                });
            });
    };
}

export const getTransferBeneficiaries = (bvn) => {
    return dispatch => {
        dispatch({
            type: START_LOAD_BENEFICIARIES
        });
        Network.getTransferBeneficiaryData(bvn)
            .then((result) => {
                dispatch({
                    beneficiaries: result.beneficiaries,
                    type: LOAD_BENEFICIARIES
                })
            }).catch((error) => {
                dispatch({
                    type: LOAD_BENEFICIARIES_FAILED,
                    error_message: error.message
                });
            });
    };
}

export const updateRecentTransfers = (beneficiary) => {
    return dispatch => {
        dispatch({
            type: UPDATE_RECENT_TRANSFERS,
            beneficiary
        });
    };
}


export const updateAccountType = (account_type) => {
    return dispatch => {
        dispatch({
            type: UPDATE_ACCOUNT_TYPE,
            account_type
        });
    };
}