import {
    UPDATE_DATA_PURCHASE, RESET_DATA_PURCHASE
} from '../types/data_types';

const initialState = {
    data_purchase: {}
};

export default (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_DATA_PURCHASE: {
            let data_purchase = { ...state.data_purchase, ...action.data_purchase }
            return {
                ...state,
                data_purchase
            }
        }
        case RESET_DATA_PURCHASE: {
            return {
                ...state,
                data_purchase: {}
            }
        }
        default: {
            return state;
        }
    }
};