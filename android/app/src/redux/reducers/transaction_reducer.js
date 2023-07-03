import { START_LOAD_FEE_TYPES, LOAD_FEE_TYPES, LOAD_FEE_TYPES_FAILED } from '../types/transaction_types';

const initialState = {
    fee_types: [],
    loading_fee_types: false,
    fee_types_error: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case START_LOAD_FEE_TYPES: {
            return {
                ...state,
                loading_fee_types: true,
                fee_types_error: null
            }
        }
        case LOAD_FEE_TYPES: {
            let fee_types_data = [...action.fee_types];

            let fee_types = [];

            fee_types_data.forEach(fee_type => {
                fee_types.push({
                    id: fee_type.id,
                    slug: fee_type.slug
                });
            });

            return {
                ...state,
                fee_types,
                loading_fee_types: false,
                fee_types_error: null
            }
        }
        case LOAD_FEE_TYPES_FAILED: {
            return {
                ...state,
                loading_fee_types: false,
                fee_types_error: action.error_message
            }
        }
        default: {
            return state;
        }
    }
};