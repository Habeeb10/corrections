import { START_LOAD_NOK, LOAD_NOK, LOAD_NOK_FAILED } from '../types/next_of_kin_types';

const initialState = {
    loading: false,
    next_of_kin: {},
    next_of_kin_error: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case START_LOAD_NOK: {
            return {
                ...state,
                loading: true,
                next_of_kin_error: null
            }
        }
        case LOAD_NOK: {
            return {
                ...state,
                next_of_kin: action.next_of_kin,
                loading: false,
                next_of_kin_error: null
            }
        }
        case LOAD_NOK_FAILED: {
            return {
                ...state,
                loading: false,
                next_of_kin_error: action.next_of_kin_error
            }
        }
        default: {
            return state;
        }
    }
};