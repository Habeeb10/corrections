import { account_type_data } from '../../../src/data';
import {
    UPDATE_FUNDS_TRANSFER, RESET_FUNDS_TRANSFER,
    START_LOAD_BENEFICIARIES, LOAD_BENEFICIARIES, LOAD_BENEFICIARIES_FAILED,
    UPDATE_RECENT_TRANSFERS,
    UPDATE_ACCOUNT_TYPE
} from '../types/transfer_types';

const initialState = {
    funds_transfer: {},
    account_type: account_type_data.ACCOUNT_TYPE.TOUCH_GOLD,
    beneficiaries: [],
    loading_beneficiaries: false,
    beneficiaries_error: null,
    recent_transfers: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_FUNDS_TRANSFER: {
            let funds_transfer = { ...state.funds_transfer, ...action.funds_transfer }
            return {
                ...state,
                funds_transfer
            }
        }
        case RESET_FUNDS_TRANSFER: {
            return {
                ...state,
                funds_transfer: {}
            }
        }
        case START_LOAD_BENEFICIARIES: {
            return {
                ...state,
                loading_beneficiaries: true,
                beneficiaries_error: null
            }
        }
        case LOAD_BENEFICIARIES: {
            return {
                ...state,
                beneficiaries: [...action.beneficiaries],
                loading_beneficiaries: false,
                beneficiaries_error: null
            }
        }
        case LOAD_BENEFICIARIES_FAILED: {
            return {
                ...state,
                loading_beneficiaries: false,
                beneficiaries_error: action.error_message
            }
        }
        case UPDATE_RECENT_TRANSFERS: {
            const latest_beneficiary = action.beneficiary;
            let recent_transfers = [];
            recent_transfers.push(latest_beneficiary);

            // Add top most recent beneficiary that is not this new one
            let topmost = state.recent_transfers.find(beneficiary => latest_beneficiary.account_number !== beneficiary.account_number
                && latest_beneficiary.bank_code !== beneficiary.bank_code);

            recent_transfers.push(topmost);
            return {
                ...state,
                recent_transfers,
            }
        }

        case UPDATE_ACCOUNT_TYPE: {
            console.log("oitre",action)
            return {
                ...state,
                account_type: action.account_type.account_type,
                
            }
        }
        default: {
            return state;
        }
    }
};